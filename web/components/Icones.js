// Ícones próprios (linha, 24px) — consistentes entre si e nítidos em qualquer ecrã.
const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false };
const criar = (filhos) =>
  function Icone({ tamanho = 24, ...resto }) {
    return <svg {...base} width={tamanho} height={tamanho} {...resto}>{filhos}</svg>;
  };

export const IconePesquisa = criar(<><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>);
export const IconeCarrinho = criar(<><path d="M3 4h2.2l2 11h10.4l2-8H6.2" /><circle cx="9" cy="19.5" r="1.4" /><circle cx="17" cy="19.5" r="1.4" /></>);
export const IconeUtilizador = criar(<><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></>);
export const IconeSair = criar(<><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="M15 8l4 4-4 4M19 12H9" /></>);
export const IconePacote = criar(<><path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z" /><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9" /></>);
export const IconeAdmin = criar(<><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" /></>);
export const IconeVerificar = criar(<path d="M5 12.5l4.5 4.5L19 7.5" />);

// Categorias
export const IconeComputador = criar(<><rect x="4" y="5" width="16" height="11" rx="1.6" /><path d="M2 19.5h20" /></>);
export const IconeTelemovel = criar(<><rect x="7" y="2.5" width="10" height="19" rx="2.4" /><path d="M10.5 18.5h3" /></>);
export const IconeAuscultadores = criar(<><path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="14" width="4.5" height="7" rx="1.6" /><rect x="16.5" y="14" width="4.5" height="7" rx="1.6" /></>);
export const IconeConsola = criar(<><path d="M7 8h10a4.5 4.5 0 0 1 4.4 5.4l-.8 4a2.2 2.2 0 0 1-3.8 1L15 16.5H9l-1.8 1.9a2.2 2.2 0 0 1-3.8-1l-.8-4A4.5 4.5 0 0 1 7 8z" /><path d="M8.5 10.7v3M7 12.2h3" /><circle cx="15.4" cy="11.4" r=".7" /><circle cx="17.4" cy="13.2" r=".7" /></>);
export const IconeCamara = criar(<><path d="M4 8h3l1.5-2.5h7L17 8h3a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 4 8z" /><circle cx="12" cy="13.2" r="3.6" /></>);
export const IconeRelogio = criar(<><rect x="7" y="6.5" width="10" height="11" rx="3" /><path d="M9 6.5l.8-3.5h4.4l.8 3.5M9 17.5l.8 3.5h4.4l.8-3.5M12 10v2.4l1.6 1" /></>);

// Pagamento
export const IconeMulticaixaExpress = criar(<><rect x="7" y="2.5" width="10" height="19" rx="2.4" /><path d="M9.8 12.4l1.7 1.7 3-3.3" /></>);
export const IconeMulticaixa = criar(<><rect x="2.5" y="5.5" width="19" height="13" rx="2.2" /><path d="M2.5 10h19M6 15h4" /></>);
export const IconePresencial = criar(<><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>);

const MAPA_CATEGORIAS = {
  computadores: IconeComputador,
  telemoveis: IconeTelemovel,
  auscultadores: IconeAuscultadores,
  consolas: IconeConsola,
  camaras: IconeCamara,
  'relogios inteligentes': IconeRelogio,
};
const normalizar = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Usa o ícone desenhado quando a categoria é conhecida; senão, a imagem enviada pelo admin.
export function IconeCategoria({ titulo, imagem, tamanho = 28 }) {
  const Desenhado = MAPA_CATEGORIAS[normalizar(titulo)];
  if (Desenhado) return <Desenhado tamanho={tamanho} />;
  return imagem ? <img src={imagem} alt="" width={tamanho} height={tamanho} style={{ objectFit: 'contain' }} /> : <IconePacote tamanho={tamanho} />;
}

export const ICONES_PAGAMENTO = {
  multicaixa_express: IconeMulticaixaExpress,
  multicaixa: IconeMulticaixa,
  presencial: IconePresencial,
};

// Marca: etiqueta de preço dourada sobre fundo atlântico
export function MarcaLogo({ tamanho = 34 }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="#0a6c74" />
      <path d="M8.6 11h9.6a2 2 0 0 1 1.4.6l5.3 5.3a2 2 0 0 1 0 2.8l-4.7 4.7a2 2 0 0 1-2.8 0L8 19.1a2 2 0 0 1-.6-1.4V12.2A1.2 1.2 0 0 1 8.6 11z" fill="#ffc83d" />
      <circle cx="12.2" cy="15.2" r="1.7" fill="#0a6c74" />
    </svg>
  );
}
