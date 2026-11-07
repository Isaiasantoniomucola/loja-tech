'use client';
import { useEffect, useState } from 'react';
import { pedir } from '../../../lib/api';
import { useLoja } from '../../../lib/contextos';

export default function AdminClientes() {
  const { sessao } = useLoja();
  const [clientes, setClientes] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => { pedir('/admin/clientes', { token: sessao.token }).then(setClientes).catch((e) => setErro(e.message)); }, [sessao]);

  return (
    <>
      <h1>Clientes</h1>
      {erro && <p className="erro">{erro}</p>}
      <div className="tabela">
        <table>
          <thead><tr><th>Nome</th><th>Email</th><th>Pedidos</th><th>Registado em</th></tr></thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id}><td>{c.nome}</td><td>{c.email}</td><td>{c.pedidos}</td><td>{new Date(c.criado_em).toLocaleDateString('pt-PT')}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
