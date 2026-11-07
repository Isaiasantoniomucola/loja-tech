export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Preços em Kwanzas (ex.: 85500 -> "85.500 Kz")
export const formatarPreco = (valor) =>
  `${Math.round(Number(valor)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} Kz`;

export const METODOS_PAGAMENTO = [
  { id: 'multicaixa_express', nome: 'Multicaixa Express', descricao: 'Pague na app Multicaixa Express com a referência do pedido.' },
  { id: 'multicaixa', nome: 'Multicaixa', descricao: 'Pague num caixa automático ou TPA Multicaixa com a referência.' },
  { id: 'presencial', nome: 'Pagamento presencial', descricao: 'Pague na entrega ou ao levantar o pedido na loja.' },
];

const SEM_LIGACAO = 'Não foi possível ligar ao servidor. Verifique a sua ligação e se a API está a correr.';

export async function pedir(caminho, { metodo = 'GET', corpo, token } = {}) {
  let resposta;
  try {
    resposta = await fetch(`${API}/api${caminho}`, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: corpo ? JSON.stringify(corpo) : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new Error(SEM_LIGACAO);
  }
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || 'Ocorreu um erro. Tente novamente.');
  return dados;
}

// Converte "/imagens/x.png" em URL completo do servidor
export const urlImagem = (caminho) => (!caminho ? '' : caminho.startsWith('http') ? caminho : `${API}${caminho}`);

// Envia uma imagem (apenas administradores). Devolve o caminho "/imagens/xxxx.png".
export async function enviarImagem(ficheiro, token) {
  const corpo = new FormData();
  corpo.append('imagem', ficheiro);
  let r;
  try {
    r = await fetch(`${API}/api/admin/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: corpo });
  } catch {
    throw new Error(SEM_LIGACAO);
  }
  const dados = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(dados.erro || 'Falha ao enviar a imagem.');
  return dados.imagem;
}
