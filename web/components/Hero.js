import Link from 'next/link';
import Preco from './Preco';

// Montra de abertura: os 3 primeiros recomendados, cada um com a sua etiqueta de preço.
export default function Hero({ produtos }) {
  return (
    <section className="hero" aria-labelledby="hero-titulo">
      <div>
        <h1 id="hero-titulo">Tecnologia ao seu alcance, paga como preferir.</h1>
        <p>Computadores, telemóveis, consolas e muito mais. Pague com Multicaixa Express, Multicaixa ou na entrega.</p>
        <div className="hero-botoes">
          <a href="#recomendados" className="botao botao-sol">Ver recomendados</a>
          <a href="#categorias" className="botao botao-claro">Ver categorias</a>
        </div>
      </div>
      <div className="montra">
        {[0, 1, 2].map((i) => {
          const p = produtos[i];
          if (!p) return <div key={i} className="montra-item montra-vazia" aria-hidden="true" />;
          return (
            <Link key={p.id} href={`/produto/${p.id}`} className="montra-item" aria-label={`${p.titulo}, ver produto`}>
              <img src={p.imagens[0]} alt="" />
              <span className="etiqueta"><small>{p.titulo}</small><Preco valor={p.preco} /></span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
