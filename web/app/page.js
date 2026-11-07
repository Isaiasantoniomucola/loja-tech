'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { pedir } from '../lib/api';
import CartaoProduto from '../components/CartaoProduto';
import Hero from '../components/Hero';
import { IconeCategoria, IconePesquisa } from '../components/Icones';

function Inicio() {
  const parametros = useSearchParams();
  const q = parametros.get('q') || '';
  const [banners, setBanners] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    Promise.all([pedir('/banners'), pedir('/categorias')])
      .then(([b, c]) => { setBanners(b); setCategorias(c); })
      .catch((e) => setErro(e.message));
  }, []);

  useEffect(() => {
    let cancelado = false; // ignora respostas antigas se a pesquisa mudar
    setCarregando(true);
    const caminho = q ? `/produtos?q=${encodeURIComponent(q)}` : '/produtos?recomendados=1';
    pedir(caminho)
      .then((lista) => { if (!cancelado) { setProdutos(lista); setErro(''); } })
      .catch((e) => { if (!cancelado) setErro(e.message); })
      .finally(() => { if (!cancelado) setCarregando(false); });
    return () => { cancelado = true; };
  }, [q]);

  return (
    <>
      {erro && <p className="erro" role="alert">{erro}</p>}

      {!q && (
        <>
          <Hero produtos={produtos} />
          {banners.length > 0 && (
            <div className="banners">{banners.map((b) => <img key={b.id} src={b.imagem} alt="Promoção" />)}</div>
          )}
          <div className="sec-titulo" id="categorias" style={{ scrollMarginTop: 90, marginTop: 0 }}><h2>Comprar por categoria</h2></div>
          <div className="cat-grelha">
            {categorias.map((c) => (
              <Link key={c.id} href={`/categoria/${c.id}`} className="cat-tile">
                <span className="cat-icone"><IconeCategoria titulo={c.titulo} imagem={c.imagem} /></span>
                <span className="cat-nome">{c.titulo}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="sec-titulo" id="recomendados" style={{ scrollMarginTop: 90, marginTop: q ? 0 : undefined }}>
        <h2>{q ? `Resultados para "${q}"` : 'Recomendados para si'}</h2>
        {!carregando && q && <span>{produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'}</span>}
      </div>
      {carregando ? <p className="vazio">A carregar...</p>
        : produtos.length === 0 ? (
          erro ? null : (
            <div className="vazio">
              <IconePesquisa tamanho={40} />
              <h2>Nenhum produto encontrado</h2>
              <p>{q ? 'Experimente outra palavra ou veja as categorias.' : 'Ainda não há produtos recomendados.'}</p>
              {q && <Link href="/" className="botao">Ver todos os recomendados</Link>}
            </div>
          )
        ) : <div className="grelha">{produtos.map((p) => <CartaoProduto key={p.id} produto={p} />)}</div>}
    </>
  );
}

export default function PaginaInicial() {
  return <Suspense fallback={<p className="vazio">A carregar...</p>}><Inicio /></Suspense>;
}
