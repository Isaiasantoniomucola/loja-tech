'use client';
import { useEffect, useState } from 'react';
import { pedir } from '../../../lib/api';
import { useLoja } from '../../../lib/contextos';
import { Estrelas } from '../../../components/Estrelas';

export default function AdminAvaliacoes() {
  const { sessao } = useLoja();
  const token = sessao.token;
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');

  const carregar = () => pedir('/admin/avaliacoes', { token }).then(setLista).catch((e) => setErro(e.message));
  useEffect(() => { carregar(); }, []);

  const apagar = async (a) => {
    if (!confirm('Apagar esta avaliação?')) return;
    try { await pedir(`/admin/avaliacoes/${a.id}`, { metodo: 'DELETE', token }); carregar(); } catch (e) { setErro(e.message); }
  };

  return (
    <>
      <h1>Avaliações</h1>
      {erro && <p className="erro">{erro}</p>}
      {lista === null && !erro && <p className="vazio">A carregar...</p>}
      {lista && lista.length === 0 && <p className="vazio">Ainda não há avaliações de clientes.</p>}
      {(lista || []).map((a) => (
        <div className="adm-card" key={a.id}>
          <div className="linha"><strong>{a.produto}</strong><button className="perigo" onClick={() => apagar(a)}>Apagar</button></div>
          <Estrelas valor={a.estrelas} />
          <p style={{ margin: '6px 0' }}>{a.comentario || <em>Sem comentário</em>}</p>
          <small>{a.cliente} — {new Date(a.criado_em).toLocaleString('pt-PT')}</small>
        </div>
      ))}
    </>
  );
}
