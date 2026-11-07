'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { pedir } from '../../../lib/api';
import CartaoProduto from '../../../components/CartaoProduto';
import { IconeCategoria } from '../../../components/Icones';

export default function PaginaCategoria() {
  const { id } = useParams();
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => { pedir('/categorias').then(setCategorias).catch((e) => setErro(e.message)); }, []);
  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    pedir(`/produtos?categoria=${encodeURIComponent(id)}`)
      .then((lista) => { if (!cancelado) { setProdutos(lista); setErro(''); } })
      .catch((e) => { if (!cancelado) setErro(e.message); })
      .finally(() => { if (!cancelado) setCarregando(false); });
    return () => { cancelado = true; };
  }, [id]);

  const atual = categorias.find((c) => String(c.id) === String(id));

  return (
    <>
      <nav className="migalhas" aria-label="Localização">
        <Link href="/">Início</Link>
        <span aria-current="page">{atual ? atual.titulo : 'Categoria'}</span>
      </nav>
      <div className="cat-barra" aria-label="Categorias">
        {categorias.map((c) => (
          <Link key={c.id} href={`/categoria/${c.id}`} className={`cat-chip ${String(c.id) === String(id) ? 'ativa' : ''}`}>
            <IconeCategoria titulo={c.titulo} imagem={c.imagem} tamanho={20} />{c.titulo}
          </Link>
        ))}
      </div>
      <div className="sec-titulo">
        <h1 style={{ margin: 0 }}>{atual ? atual.titulo : 'Categoria'}</h1>
        {!carregando && <span>{produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'}</span>}
      </div>
      {erro && <p className="erro" role="alert">{erro}</p>}
      {carregando ? <p className="vazio">A carregar...</p>
        : produtos.length === 0 ? <p className="vazio">{erro ? '' : 'Ainda não há produtos nesta categoria.'}</p>
        : <div className="grelha">{produtos.map((p) => <CartaoProduto key={p.id} produto={p} />)}</div>}
    </>
  );
}
