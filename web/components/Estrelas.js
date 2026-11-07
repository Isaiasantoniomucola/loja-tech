'use client';
import { useState } from 'react';

// Mostra uma avaliação (0 a 5, aceita decimais) como estrelas.
export function Estrelas({ valor = 0, tamanho = 16 }) {
  const pct = (Math.max(0, Math.min(5, Number(valor))) / 5) * 100;
  return (
    <span className="estrelas" role="img" aria-label={`${Number(valor).toFixed(1)} de 5 estrelas`} style={{ fontSize: tamanho }}>
      <span className="estrelas-fundo">★★★★★</span>
      <span className="estrelas-cheio" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  );
}

// Estrelas clicáveis para o cliente escolher a nota.
export function EstrelasEntrada({ valor, aoMudar }) {
  const [sobre, setSobre] = useState(0);
  const ativo = sobre || valor;
  return (
    <div className="estrelas-entrada" onMouseLeave={() => setSobre(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          className={n <= ativo ? 'cheia' : ''}
          aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
          onMouseEnter={() => setSobre(n)}
          onClick={() => aoMudar(n)}
        >★</button>
      ))}
    </div>
  );
}
