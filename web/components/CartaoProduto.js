import Link from 'next/link';
import { Estrelas } from './Estrelas';
import Preco from './Preco';

export default function CartaoProduto({ produto }) {
  return (
    <Link href={`/produto/${produto.id}`} className="cartao">
      <div className="cartao-imagem"><img src={produto.imagens[0]} alt="" loading="lazy" /></div>
      <div className="cartao-corpo">
        <h3>{produto.titulo}</h3>
        <div className="avaliacao-linha">
          <Estrelas valor={produto.avaliacao} />
          <small>{produto.avaliacao.toFixed(1)}{produto.totalAvaliacoes > 0 ? ` (${produto.totalAvaliacoes})` : ''}</small>
        </div>
        <Preco valor={produto.preco} />
      </div>
    </Link>
  );
}
