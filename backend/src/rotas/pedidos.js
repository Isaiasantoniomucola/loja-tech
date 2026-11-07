const router = require('express').Router();
const db = require('../db');
const autenticacao = require('../middlewares/autenticacao');
const { METODOS, gerarReferencia, descreverPagamento } = require('../pagamento');
const { anexarItens } = require('../pedidosUtil');
const { ErroValidacao } = require('../erros');
const limitarTentativas = require('../middlewares/limitarTentativas');

const limitePedidos = limitarTentativas({ max: 30 }); // 30 pedidos por minuto por IP

router.use(autenticacao);

// Corpo: { endereco, telefone, metodoPagamento, itens: [{ produtoId, modelo, quantidade }] }
// O preço é sempre lido da base de dados (nunca confiado ao cliente).
router.post('/', limitePedidos, async (req, res) => {
  const { metodoPagamento, itens } = req.body || {};
  const endereco = String(req.body?.endereco || '').trim();
  const telefone = String(req.body?.telefone || '').trim();
  if (endereco.length < 5 || endereco.length > 255) return res.status(400).json({ erro: 'Indique o endereço de entrega (5 a 255 caracteres).' });
  if (telefone.length > 30 || !/^\+?\d[\d\s]{7,}$/.test(telefone)) return res.status(400).json({ erro: 'Indique um número de telefone válido.' });
  if (!METODOS[metodoPagamento]) return res.status(400).json({ erro: 'Escolha um método de pagamento válido.' });
  if (!Array.isArray(itens) || !itens.length) return res.status(400).json({ erro: 'O carrinho está vazio.' });
  if (itens.length > 50) return res.status(400).json({ erro: 'Demasiados itens no pedido (máximo 50).' });
  if (itens.some((i) => !Number.isInteger(Number(i.quantidade)) || Number(i.quantidade) < 1 || Number(i.quantidade) > 99))
    return res.status(400).json({ erro: 'A quantidade de cada produto deve ser entre 1 e 99.' });

  const con = await db.getConnection();
  try {
    await con.beginTransaction();
    let total = 0;
    const linhas = [];
    for (const it of itens) {
      const qtd = Number(it.quantidade);
      const [p] = await con.query('SELECT id, titulo, preco FROM produtos WHERE id = ?', [it.produtoId]);
      if (!p.length) throw new ErroValidacao('Um dos produtos do carrinho já não existe. Atualize o carrinho.');
      // se o produto tem modelos/opções, o escolhido tem de existir
      const [mods] = await con.query('SELECT nome FROM produto_modelos WHERE produto_id = ?', [p[0].id]);
      const modelo = it.modelo ? String(it.modelo) : null;
      if (mods.length && !mods.some((m) => m.nome === modelo))
        throw new ErroValidacao(`Escolha um modelo/opção válido para "${p[0].titulo}". Retire-o do carrinho e adicione-o de novo.`);
      total += Number(p[0].preco) * qtd;
      linhas.push([p[0].id, mods.length ? modelo : null, qtd, p[0].preco]);
    }
    total = Math.round(total * 100) / 100;
    const [ped] = await con.query(
      'INSERT INTO pedidos (usuario_id, total, endereco, telefone, metodo_pagamento) VALUES (?,?,?,?,?)',
      [req.usuario.id, total, endereco, telefone, metodoPagamento]);
    for (const l of linhas)
      await con.query('INSERT INTO pedido_itens (pedido_id, produto_id, modelo, quantidade, preco_unitario) VALUES (?,?,?,?,?)', [ped.insertId, ...l]);
    const referencia = metodoPagamento === 'presencial' ? null : gerarReferencia(ped.insertId);
    if (referencia) await con.query('UPDATE pedidos SET referencia = ? WHERE id = ?', [referencia, ped.insertId]);
    await con.commit();
    res.status(201).json({
      id: ped.insertId, total, estado: 'pendente', metodoPagamento, referencia,
      ...descreverPagamento({ metodo_pagamento: metodoPagamento, referencia, total }),
    });
  } catch (e) {
    await con.rollback();
    if (e instanceof ErroValidacao) return res.status(400).json({ erro: e.message });
    throw e; // erro inesperado: resposta 500 genérica (sem expor detalhes da base de dados)
  } finally {
    con.release();
  }
});

router.get('/', async (req, res) => {
  const [pedidos] = await db.query('SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY id DESC', [req.usuario.id]);
  res.json(await anexarItens(pedidos));
});

module.exports = router;
