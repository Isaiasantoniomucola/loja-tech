import Link from 'next/link';

export default function NaoEncontrada() {
  return (
    <div className="vazio">
      <h2>Página não encontrada</h2>
      <p>A página que procura não existe ou foi movida.</p>
      <Link href="/" className="botao">Voltar à loja</Link>
    </div>
  );
}
