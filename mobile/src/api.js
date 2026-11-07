import { API_URL } from './config';

// Preços em Kwanzas (ex.: 85500 -> "85.500 Kz")
export const formatarPreco = (v) => `${Math.round(Number(v)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} Kz`;

export const METODOS_PAGAMENTO = [
  { id: 'multicaixa_express', nome: 'Multicaixa Express', descricao: 'Pague na app Multicaixa Express com a referência do pedido.' },
  { id: 'multicaixa', nome: 'Multicaixa', descricao: 'Pague num caixa automático ou TPA Multicaixa com a referência.' },
  { id: 'presencial', nome: 'Pagamento presencial', descricao: 'Pague na entrega ou ao levantar o pedido na loja.' },
];

export async function pedir(caminho, { metodo = 'GET', corpo, token } = {}) {
  let resposta;
  try {
    resposta = await fetch(`${API_URL}/api${caminho}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new Error('Não foi possível ligar ao servidor. Verifique a ligação à internet e o IP em src/config.js.');
  }
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || 'Ocorreu um erro. Tente novamente.');
  return dados;
}
