'use client';
import { useEffect, useState } from 'react';
import { pedir, enviarImagem, urlImagem } from '../../../lib/api';
import { useLoja } from '../../../lib/contextos';

export default function AdminCategorias() {
  const { sessao } = useLoja();
  const token = sessao.token;
  const [categorias, setCategorias] = useState([]);
  const [f, setF] = useState(null);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });

  const carregar = () => pedir('/categorias').then(setCategorias).catch((e) => setMsg({ tipo: 'erro', texto: e.message }));
  useEffect(() => { carregar(); }, []);

  const guardar = async (e) => {
    e.preventDefault();
    const corpo = { titulo: f.titulo, imagem: f.imagem };
    try {
      if (f.id) await pedir(`/admin/categorias/${f.id}`, { metodo: 'PUT', corpo, token });
      else await pedir('/admin/categorias', { metodo: 'POST', corpo, token });
      setF(null); setMsg({ tipo: 'sucesso', texto: 'Categoria guardada.' }); carregar();
    } catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
  };
  const apagar = async (c) => {
    if (!confirm(`Apagar a categoria "${c.titulo}"?`)) return;
    try { await pedir(`/admin/categorias/${c.id}`, { metodo: 'DELETE', token }); setMsg({ tipo: 'sucesso', texto: 'Categoria apagada.' }); carregar(); }
    catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
  };
  const carregarImagem = async (ficheiro) => {
    if (!ficheiro) return;
    try { setF({ ...f, imagem: await enviarImagem(ficheiro, token) }); } catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
  };

  return (
    <>
      <div className="cabeca-admin"><h1>Categorias</h1><button onClick={() => setF({ id: null, titulo: '', imagem: '' })}>+ Nova categoria</button></div>
      {msg.texto && <p className={msg.tipo}>{msg.texto}</p>}
      {f && (
        <form className="admin-formulario" onSubmit={guardar}>
          <h3>{f.id ? 'Editar categoria' : 'Nova categoria'}</h3>
          <label>Título<input required value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} /></label>
          <strong>Ícone</strong>
          {f.imagem && <img src={urlImagem(f.imagem)} alt="" width="56" height="56" style={{ objectFit: 'contain' }} />}
          <input type="file" accept="image/*" onChange={(e) => carregarImagem(e.target.files[0])} />
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button type="submit" disabled={!f.imagem}>Guardar</button>
            <button type="button" className="botao-claro" onClick={() => setF(null)}>Cancelar</button>
          </div>
        </form>
      )}
      <div className="tabela">
        <table>
          <thead><tr><th></th><th>Título</th><th></th></tr></thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id}>
                <td><img src={c.imagem} alt="" width="40" height="40" style={{ objectFit: 'contain' }} /></td>
                <td>{c.titulo}</td>
                <td><div className="acoes"><button className="botao-claro" onClick={() => setF({ id: c.id, titulo: c.titulo, imagem: c.imagem })}>Editar</button><button className="perigo" onClick={() => apagar(c)}>Apagar</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
