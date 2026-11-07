const db = require('./db');
const { descreverPagamento } = require('./pagamento');

// Anexa a cada pedido os seus itens (1 consulta para todos) e os dados de pagamento.
async function anexarItens(pedidos) {
  if (!pedidos.length) return pedidos;
  const [itens] = await db.query(
    `SELECT i.pedido_id, i.produto_id, pr.titulo, i.modelo, i.quantidade, i.preco_unitario
       FROM pedido_itens i JOIN produtos pr ON pr.id = i.produto_id
      WHERE i.pedido_id IN (?) ORDER BY i.id`, [pedidos.map((p) => p.id)]);
  for (const p of pedidos) {
    p.total = Number(p.total);
    p.itens = itens
      .filter((i) => i.pedido_id === p.id)
      .map(({ pedido_id, ...i }) => ({ ...i, preco_unitario: Number(i.preco_unitario) }));
    Object.assign(p, descreverPagamento(p));
  }
  return pedidos;
}

module.exports = { anexarItens };
