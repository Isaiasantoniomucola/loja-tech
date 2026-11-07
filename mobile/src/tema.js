// Identidade visual da Loja Tech (igual à do site): Atlântico · Maré · Sol
export const cores = {
  principal: '#0A6C74',
  principalEscuro: '#085760',
  principalClaro: '#E2F1F2',
  mare: '#0C2A31',
  sol: '#FFC83D',
  solClaro: '#FFF3CC',
  solTexto: '#6B4A00',
  escuro: '#14262B',
  suave: '#566B70',
  fundo: '#F1F5F6',
  painel: '#EDF4F5',
  borda: '#D9E4E6',
  branco: '#FFFFFF',
  coral: '#C9412B',
  coralClaro: '#FCE8E3',
  verde: '#17794F',
  verdeClaro: '#DDF3E8',
  azulClaro: '#E3EBF8',
  azul: '#274C8F',
  estrela: '#F2A900',
};

const normalizar = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const EMOJIS = { computadores: '💻', telemoveis: '📱', auscultadores: '🎧', consolas: '🎮', camaras: '📷', 'relogios inteligentes': '⌚' };
// Emoji da categoria (ou undefined se for uma categoria nova criada pelo admin)
export const emojiCategoria = (titulo) => EMOJIS[normalizar(titulo)];
