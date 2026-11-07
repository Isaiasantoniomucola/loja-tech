'use client';
import { useEffect, useState } from 'react';
import { pedir, formatarPreco } from '../../../lib/api';
import { useLoja } from '../../../lib/contextos';

const ESTADOS = ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'];

export default function AdminPedidos() {
  const { sessao } = useLoja();
  const token = sessao.token;
  const [pedidos, setPedidos] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [msg, setMsg] = useState({ tipo: '', texto: '' });

  const carregar = () => pedir('/admin/pedidos', { token }).then(setPedidos).catch((e) => setMsg({ tipo: 'erro', texto: e.message }));
  useEffect(() => { carregar(); }, []);

  const mudarEstado = async (p, estado) => {
    try { await pedir(`/admin/pedidos/${p.id}/estado`, { metodo: 'PATCH', corpo: { estado }, token }); carregar(); }
    catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
  };

  const lista = pedidos === null ? [] : filtro ? pedidos.filter((p) => p.estado === filtro) : pedidos;

  return (
    <>
      <div className="cabeca-admin">
        <h1>Pedidos</h1>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="">Todos os estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>
      {msg.texto && <p className={msg.tipo}>{msg.texto}</p>}
      {pedidos === null && !msg.texto && <p className="vazio">A carregar...</p>}
      {pedidos !== null && lista.length === 0 && <p className="vazio">Sem pedidos.</p>}
      {lista.map((p) => (
        <div className="adm-card" key={p.id}>
          <div className="linha">
            <strong>Pedido #{p.id} — {p.cliente_nome} ({p.cliente_email})</strong>
            <select value={p.estado} onChange={(e) => mudarEstado(p, e.target.value)}>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <small>{new Date(p.criado_em).toLocaleString('pt-PT')} — {p.endereco} — Tel: {p.telefone}</small>
          <div style={{ margin: '8px 0' }}>
            <strong>Pagamento:</strong> {p.metodoNome}
            {p.referencia && <> — Entidade {p.entidade} · Referência {p.referencia}</>}
          </div>
          <ul>{p.itens.map((i, k) => <li key={k}>{i.quantidade}× {i.titulo}{i.modelo ? ` (${i.modelo})` : ''} — {formatarPreco(i.preco_unitario)}</li>)}</ul>
          <strong>Total: <span className="preco">{formatarPreco(p.total)}</span></strong>
        </div>
      ))}
    </>
  );
}
