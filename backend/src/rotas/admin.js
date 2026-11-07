const router = require('express').Router();
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const db = require('../db');
const autenticacao = require('../middlewares/autenticacao');
const somenteAdmin = require('../middlewares/somenteAdmin');
const { anexarItens } = require('../pedidosUtil');
const { ErroValidacao } = require('../erros');
const limitarTentativas = require('../middlewares/limitarTentativas');

router.use(autenticacao, somenteAdmin);

// ---------- Upload de imagens ----------
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', '..', 'public', 'imagens'),
    filename: (req, file, cb) => cb(null, crypto.randomBytes(8).toString('hex') + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    /\.(png|jpe?g|webp|gif)$/i.test(file.originalname) && /^image\/(png|jpeg|webp|gif)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(new ErroValidacao('Só são permitidas imagens (png, jpg, webp, gif).')),
});
router.post('/upload', limitarTentativas({ max: 60 }), (req, res) => {
  upload.single('imagem')(req, res, (err) => {
    if (err) {
      const erro = err instanceof ErroValidacao ? err.message : err.code === 'LIMIT_FILE_SIZE' ? 'A imagem excede 5 MB.' : 'Falha ao enviar a imagem.';
      return res.status(400).json({ erro });
    }
    if (!req.file) return res.status(400).json({ erro: 'Nenhum ficheiro enviado.' });
    res.status(201).json({ imagem: `/imagens/${req.file.filename}` });
  });
});

// Guarda só o caminho (/imagens/x.png) quando a imagem é do próprio servidor
const limparUrl = (u) => String(u || '').replace(/^https?:\/\/[^/]+(?=\/imagens\/)/, '');

// ---------- Resumo ----------
router.get('/resumo', async (req, res) => {
  const [[p]] = await db.query('SELECT COUNT(*) n FROM produtos');
  const [[c]] = await db.query('SELECT COUNT(*) n FROM categorias');
  const [[u]] = await db.query("SELECT COUNT(*) n FROM usuarios WHERE papel = 'cliente'");
  const [[o]] = await db.query('SELECT COUNT(*) n FROM pedidos');
  const [[v]] = await db.query("SELECT COALESCE(SUM(total),0) t FROM pedidos WHERE estado <> 'cancelado'");
  const [[pend]] = await db.query("SELECT COUNT(*) n FROM pedidos WHERE estado = 'pendente'");
  res.json({ produtos: p.n, categorias: c.n, clientes: u.n, pedidos: o.n, pedidosPendentes: pend.n, vendas: Number(v.t) });
});

// ---------- Produtos ----------
// Corpo: { titulo, descricao, preco, avaliacao, recomendado, categoriaId, imagens: [url], modelos: [nome] }
async function validarProduto(b) {
  const titulo = String(b.titulo || '').trim();
  if (!titulo || titulo.length > 150) return 'Indique o título (até 150 caracteres).';
  const preco = Number(b.preco);
  if (b.preco === '' || b.preco === null || b.preco === undefined || !Number.isFinite(preco) || preco < 0 || preco > 9999999999)
    return 'Indique um preço válido (em Kz).';
  const av = Number(b.avaliacao ?? 0);
  if (!(av >= 0 && av <= 5)) return 'A avaliação inicial deve estar entre 0 e 5.';
  if (String(b.descricao || '').length > 5000) return 'A descrição é demasiado longa (máximo 5000 caracteres).';
  const imagens = Array.isArray(b.imagens) ? b.imagens.filter(Boolean) : [];
  if (imagens.length < 1 || imagens.length > 10) return 'Adicione de 1 a 10 imagens.';
  const modelos = Array.isArray(b.modelos) ? b.modelos.map((m) => String(m).trim()).filter(Boolean) : [];
  if (modelos.length > 20 || modelos.some((m) => m.length > 80)) return 'Modelos: no máximo 20, com até 80 caracteres cada.';
  const [c] = await db.query('SELECT id FROM categorias WHERE id = ?', [b.categoriaId]);
  if (!c.length) return 'Escolha uma categoria válida.';
  return null;
}
async function gravarRelacoes(con, produtoId, b) {
  await con.query('DELETE FROM produto_imagens WHERE produto_id = ?', [produtoId]);
  await con.query('DELETE FROM produto_modelos WHERE produto_id = ?', [produtoId]);
  const imagens = b.imagens.map(limparUrl).filter(Boolean);
  const modelos = [...new Set(b.modelos.map((m) => String(m).trim()).filter(Boolean))];
  for (let i = 0; i < imagens.length; i++)
    await con.query('INSERT INTO produto_imagens (produto_id, imagem_url, ordem) VALUES (?,?,?)', [produtoId, imagens[i], i]);
  for (const m of modelos) await con.query('INSERT INTO produto_modelos (produto_id, nome) VALUES (?,?)', [produtoId, m]);
}

router.post('/produtos', async (req, res) => {
  const b = { ...req.body, modelos: req.body?.modelos || [] };
  const erro = await validarProduto(b);
  if (erro) return res.status(400).json({ erro });
  const con = await db.getConnection();
  try {
    await con.beginTransaction();
    const [r] = await con.query(
      'INSERT INTO produtos (categoria_id, titulo, descricao, preco, avaliacao, recomendado) VALUES (?,?,?,?,?,?)',
      [b.categoriaId, b.titulo.trim(), b.descricao || '', b.preco, b.avaliacao ?? 0, b.recomendado ? 1 : 0]);
    await gravarRelacoes(con, r.insertId, b);
    await con.commit();
    res.status(201).json({ id: r.insertId });
  } catch (e) { await con.rollback(); throw e; } finally { con.release(); }
});

router.put('/produtos/:id', async (req, res) => {
  const b = { ...req.body, modelos: req.body?.modelos || [] };
  const erro = await validarProduto(b);
  if (erro) return res.status(400).json({ erro });
  const con = await db.getConnection();
  try {
    await con.beginTransaction();
    const [existe] = await con.query('SELECT id FROM produtos WHERE id = ?', [req.params.id]);
    if (!existe.length) { await con.rollback(); return res.status(404).json({ erro: 'Produto não encontrado.' }); }
    await con.query(
      'UPDATE produtos SET categoria_id=?, titulo=?, descricao=?, preco=?, avaliacao=?, recomendado=? WHERE id=?',
      [b.categoriaId, b.titulo.trim(), b.descricao || '', b.preco, b.avaliacao ?? 0, b.recomendado ? 1 : 0, req.params.id]);
    await gravarRelacoes(con, req.params.id, b);
    await con.commit();
    res.json({ id: Number(req.params.id) });
  } catch (e) { await con.rollback(); throw e; } finally { con.release(); }
});

router.delete('/produtos/:id', async (req, res) => {
  const [usado] = await db.query('SELECT COUNT(*) n FROM pedido_itens WHERE produto_id = ?', [req.params.id]);
  if (usado[0].n > 0)
    return res.status(409).json({ erro: 'Este produto já tem pedidos e não pode ser apagado. Pode retirá-lo dos recomendados.' });
  await db.query('DELETE FROM produtos WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// ---------- Categorias ----------
function validarCategoria(b) {
  const titulo = String(b?.titulo || '').trim();
  if (!titulo || titulo.length > 80) return 'Indique o título (até 80 caracteres).';
  if (!b?.imagem) return 'Indique o ícone da categoria.';
  return null;
}
router.post('/categorias', async (req, res) => {
  const erro = validarCategoria(req.body);
  if (erro) return res.status(400).json({ erro });
  const [r] = await db.query('INSERT INTO categorias (titulo, imagem_url) VALUES (?,?)', [req.body.titulo.trim(), limparUrl(req.body.imagem)]);
  res.status(201).json({ id: r.insertId });
});
router.put('/categorias/:id', async (req, res) => {
  const erro = validarCategoria(req.body);
  if (erro) return res.status(400).json({ erro });
  const [r] = await db.query('UPDATE categorias SET titulo = ?, imagem_url = ? WHERE id = ?', [req.body.titulo.trim(), limparUrl(req.body.imagem), req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ erro: 'Categoria não encontrada.' });
  res.json({ ok: true });
});
router.delete('/categorias/:id', async (req, res) => {
  const [usado] = await db.query('SELECT COUNT(*) n FROM produtos WHERE categoria_id = ?', [req.params.id]);
  if (usado[0].n > 0) return res.status(409).json({ erro: 'Esta categoria ainda tem produtos. Mova ou apague-os primeiro.' });
  await db.query('DELETE FROM categorias WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// ---------- Banners ----------
router.post('/banners', async (req, res) => {
  if (!req.body?.imagem) return res.status(400).json({ erro: 'Indique a imagem.' });
  const [r] = await db.query('INSERT INTO banners (imagem_url) VALUES (?)', [limparUrl(req.body.imagem)]);
  res.status(201).json({ id: r.insertId });
});
router.delete('/banners/:id', async (req, res) => {
  await db.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// ---------- Pedidos ----------
const ESTADOS = ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'];

router.get('/pedidos', async (req, res) => {
  const [pedidos] = await db.query(
    `SELECT p.*, u.nome AS cliente_nome, u.email AS cliente_email
       FROM pedidos p JOIN usuarios u ON u.id = p.usuario_id ORDER BY p.id DESC`);
  res.json(await anexarItens(pedidos));
});

router.patch('/pedidos/:id/estado', async (req, res) => {
  const { estado } = req.body || {};
  if (!ESTADOS.includes(estado)) return res.status(400).json({ erro: `Estado inválido. Use: ${ESTADOS.join(', ')}.` });
  const [r] = await db.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ erro: 'Pedido não encontrado.' });
  res.json({ ok: true, estado });
});

// ---------- Avaliações (moderação) ----------
router.get('/avaliacoes', async (req, res) => {
  const [linhas] = await db.query(
    `SELECT a.id, a.estrelas, a.comentario, a.criado_em, u.nome AS cliente, pr.titulo AS produto
       FROM avaliacoes a JOIN usuarios u ON u.id = a.usuario_id JOIN produtos pr ON pr.id = a.produto_id
      ORDER BY a.id DESC`);
  res.json(linhas);
});
router.delete('/avaliacoes/:id', async (req, res) => {
  await db.query('DELETE FROM avaliacoes WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// ---------- Clientes ----------
router.get('/clientes', async (req, res) => {
  const [linhas] = await db.query(
    `SELECT u.id, u.nome, u.email, u.criado_em, COUNT(p.id) AS pedidos
       FROM usuarios u LEFT JOIN pedidos p ON p.usuario_id = u.id
      WHERE u.papel = 'cliente' GROUP BY u.id ORDER BY u.id DESC`);
  res.json(linhas);
});

module.exports = router;
