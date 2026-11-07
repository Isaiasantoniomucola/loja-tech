const router = require('express').Router();
const db = require('../db');
const autenticacao = require('../middlewares/autenticacao');
const limitarTentativas = require('../middlewares/limitarTentativas');

const limiteAvaliacoes = limitarTentativas({ max: 30 }); // 30 avaliações por minuto por IP

const base = (req) => `${req.protocol}://${req.get('host')}`;
const comUrl = (req, caminho) => (caminho.startsWith('http') ? caminho : base(req) + caminho);
const arredondar = (n) => Math.round(Number(n) * 10) / 10;
// "Maria da Silva Costa" -> "Maria C."
const abreviar = (nome) => {
  const partes = String(nome).trim().split(/\s+/);
  return partes.length > 1 ? `${partes[0]} ${partes[partes.length - 1][0].toUpperCase()}.` : partes[0];
};

router.get('/banners', async (req, res) => {
  const [linhas] = await db.query('SELECT id, imagem_url FROM banners ORDER BY id');
  res.json(linhas.map((b) => ({ id: b.id, imagem: comUrl(req, b.imagem_url) })));
});

router.get('/categorias', async (req, res) => {
  const [linhas] = await db.query('SELECT id, titulo, imagem_url FROM categorias ORDER BY id');
  res.json(linhas.map((c) => ({ id: c.id, titulo: c.titulo, imagem: comUrl(req, c.imagem_url) })));
});

async function montarProdutos(req, linhas) {
  if (!linhas.length) return [];
  const ids = linhas.map((p) => p.id);
  const [imgs] = await db.query('SELECT produto_id, imagem_url FROM produto_imagens WHERE produto_id IN (?) ORDER BY ordem', [ids]);
  const [mods] = await db.query('SELECT produto_id, nome FROM produto_modelos WHERE produto_id IN (?) ORDER BY id', [ids]);
  const [avs] = await db.query('SELECT produto_id, AVG(estrelas) AS media, COUNT(*) AS total FROM avaliacoes WHERE produto_id IN (?) GROUP BY produto_id', [ids]);
  return linhas.map((p) => {
    const av = avs.find((a) => a.produto_id === p.id);
    return {
      id: p.id,
      categoriaId: p.categoria_id,
      titulo: p.titulo,
      descricao: p.descricao,
      preco: Number(p.preco),
      // média dos clientes se existir; caso contrário, a avaliação inicial do produto
      avaliacao: av ? arredondar(av.media) : Number(p.avaliacao),
      totalAvaliacoes: av ? Number(av.total) : 0,
      recomendado: !!p.recomendado,
      imagens: imgs.filter((i) => i.produto_id === p.id).map((i) => comUrl(req, i.imagem_url)),
      modelos: mods.filter((m) => m.produto_id === p.id).map((m) => m.nome),
    };
  });
}

// /api/produtos?categoria=1&recomendados=1&q=portátil
router.get('/produtos', async (req, res) => {
  const { categoria, recomendados, q } = req.query;
  const filtros = [];
  const valores = [];
  if (categoria !== undefined) {
    if (!Number.isInteger(Number(categoria))) return res.status(400).json({ erro: 'Categoria inválida.' });
    filtros.push('categoria_id = ?'); valores.push(Number(categoria));
  }
  if (recomendados === '1') filtros.push('recomendado = 1');
  if (q) { filtros.push('titulo LIKE ?'); valores.push(`%${String(q).slice(0, 100)}%`); }
  const onde = filtros.length ? 'WHERE ' + filtros.join(' AND ') : '';
  const [linhas] = await db.query(`SELECT * FROM produtos ${onde} ORDER BY id`, valores);
  res.json(await montarProdutos(req, linhas));
});

router.get('/produtos/:id', async (req, res) => {
  const [linhas] = await db.query('SELECT * FROM produtos WHERE id = ?', [req.params.id]);
  if (!linhas.length) return res.status(404).json({ erro: 'Produto não encontrado.' });
  res.json((await montarProdutos(req, linhas))[0]);
});

// ---------- Avaliações por estrelas ----------
async function resumoAvaliacoes(produtoId) {
  const [lista] = await db.query(
    `SELECT a.id, a.estrelas, a.comentario, a.criado_em, u.nome
       FROM avaliacoes a JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.produto_id = ? ORDER BY a.id DESC`, [produtoId]);
  const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  lista.forEach((a) => { distribuicao[a.estrelas] += 1; });
  const total = lista.length;
  const media = total ? arredondar(lista.reduce((s, a) => s + a.estrelas, 0) / total) : null;
  return {
    media, total, distribuicao,
    avaliacoes: lista.map((a) => ({ id: a.id, estrelas: a.estrelas, comentario: a.comentario, criadoEm: a.criado_em, autor: abreviar(a.nome) })),
  };
}

router.get('/produtos/:id/avaliacoes', async (req, res) => {
  res.json(await resumoAvaliacoes(req.params.id));
});

// Corpo: { estrelas: 1..5, comentario? } — se o cliente já avaliou, a avaliação é atualizada.
router.post('/produtos/:id/avaliacoes', autenticacao, limiteAvaliacoes, async (req, res) => {
  const estrelas = parseInt(req.body?.estrelas, 10);
  const comentario = String(req.body?.comentario || '').trim().slice(0, 500) || null;
  if (!(estrelas >= 1 && estrelas <= 5)) return res.status(400).json({ erro: 'Escolha entre 1 e 5 estrelas.' });
  const [p] = await db.query('SELECT id FROM produtos WHERE id = ?', [req.params.id]);
  if (!p.length) return res.status(404).json({ erro: 'Produto não encontrado.' });
  await db.query(
    `INSERT INTO avaliacoes (produto_id, usuario_id, estrelas, comentario) VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE estrelas = VALUES(estrelas), comentario = VALUES(comentario), criado_em = CURRENT_TIMESTAMP`,
    [req.params.id, req.usuario.id, estrelas, comentario]);
  res.status(201).json(await resumoAvaliacoes(req.params.id));
});

module.exports = router;
