// Métodos de pagamento disponíveis e instruções para o cliente.
const METODOS = {
  multicaixa_express: 'Multicaixa Express',
  multicaixa: 'Multicaixa (caixa automático / TPA)',
  presencial: 'Pagamento presencial',
};

const entidade = () => process.env.MULTICAIXA_ENTIDADE || '00000';

// Referência de 9 dígitos derivada do número do pedido, ex.: "000 001 048"
function gerarReferencia(id) {
  const base = String(id).padStart(6, '0') + String((id * 37 + 11) % 1000).padStart(3, '0');
  return base.replace(/(\d{3})(?=\d)/g, '$1 ');
}

// Recebe uma linha de "pedidos" e devolve os dados de pagamento para mostrar ao cliente.
function descreverPagamento(p) {
  const metodoNome = METODOS[p.metodo_pagamento] || p.metodo_pagamento;
  const ref = p.referencia;
  let instrucoes;
  if (p.metodo_pagamento === 'multicaixa_express')
    instrucoes = 'Abra a app Multicaixa Express, escolha Pagamentos › Pagamento por Referência e introduza a entidade, a referência e o montante indicados.';
  else if (p.metodo_pagamento === 'multicaixa')
    instrucoes = 'Num caixa automático ou TPA Multicaixa escolha Pagamentos › Pagamento por Referência e introduza a entidade, a referência e o montante indicados.';
  else instrucoes = 'Pague no momento da entrega ou ao levantar o pedido na loja.';
  return { metodoNome, entidade: ref ? entidade() : null, instrucoes };
}

module.exports = { METODOS, gerarReferencia, descreverPagamento };
