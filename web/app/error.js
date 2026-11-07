'use client';

export default function Erro({ reset }) {
  return (
    <div className="vazio">
      <h2>Algo correu mal</h2>
      <p>Ocorreu um erro inesperado. Tente novamente.</p>
      <button onClick={() => reset()}>Tentar de novo</button>
    </div>
  );
}
