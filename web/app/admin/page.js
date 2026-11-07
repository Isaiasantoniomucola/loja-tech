'use client';
import { useEffect, useState } from 'react';
import { pedir } from '../../lib/api';
import { useLoja } from '../../lib/contextos';
import Preco from '../../components/Preco';

export default function Resumo() {
  const { sessao } = useLoja();
  const [r, setR] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    pedir('/admin/resumo', { token: sessao.token }).then(setR).catch((e) => setErro(e.message));
  }, [sessao]);

  if (erro) return <p className="erro" role="alert">{erro}</p>;
  if (!r) return <p className="vazio">A carregar...</p>;

  return (
    <>
      <h1>Resumo</h1>
      <div className="indicadores">
        <div className="indicador destaque"><small>Vendas (sem cancelados)</small><strong><Preco valor={r.vendas} /></strong></div>
        <div className="indicador"><small>Pedidos</small><strong>{r.pedidos}</strong></div>
        <div className={`indicador ${r.pedidosPendentes > 0 ? 'alerta' : ''}`}><small>Pedidos pendentes</small><strong>{r.pedidosPendentes}</strong></div>
        <div className="indicador"><small>Produtos</small><strong>{r.produtos}</strong></div>
        <div className="indicador"><small>Categorias</small><strong>{r.categorias}</strong></div>
        <div className="indicador"><small>Clientes</small><strong>{r.clientes}</strong></div>
      </div>
    </>
  );
}
