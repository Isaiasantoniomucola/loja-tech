'use client';
import { useEffect, useState } from 'react';
import { pedir, enviarImagem, urlImagem } from '../../../lib/api';
import Preco from '../../../components/Preco';
import { useLoja } from '../../../lib/contextos';

const vazio = { id: null, titulo: '', descricao: '', preco: '', avaliacao: 0, recomendado: false, categoriaId: '', imagens: [], modelosTexto: '' };

export default function AdminProdutos() {
  const { sessao } = useLoja();
  const token = sessao.token;
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [f, setF] = useState(null); // formulário (null = fechado)
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const [aEnviar, setAEnviar] = useState(false);

  const carregar = () => pedir('/produtos').then(setProdutos).catch((e) => setMsg({ tipo: 'erro', texto: e.message }));
  useEffect(() => { carregar(); pedir('/categorias').then(setCategorias).catch(() => {}); }, []);

  const editar = (p) => setF({ ...p, categoriaId: p.categoriaId, modelosTexto: p.modelos.join(', ') });
  const nomeCategoria = (id) => categorias.find((c) => c.id === id)?.titulo || '—';

  const carregarImagens = async (ficheiros) => {
    setAEnviar(true);
    try {
      const novas = [];
      for (const ficheiro of ficheiros) novas.push(await enviarImagem(ficheiro, token));
      setF((atual) => ({ ...atual, imagens: [...atual.imagens, ...novas] }));
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }); } finally { setAEnviar(false); }
  };

  const guardar = async (e) => {
    e.preventDefault();
    setMsg({ tipo: '', texto: '' });
    const corpo = {
      titulo: f.titulo, descricao: f.descricao, preco: Number(f.preco), avaliacao: Number(f.avaliacao),
      recomendado: f.recomendado, categoriaId: Number(f.categoriaId), imagens: f.imagens,
      modelos: f.modelosTexto.split(',').map((m) => m.trim()).filter(Boolean),
    };
    try {
      if (f.id) await pedir(`/admin/produtos/${f.id}`, { metodo: 'PUT', corpo, token });
      else await pedir('/admin/produtos', { metodo: 'POST', corpo, token });
      setMsg({ tipo: 'sucesso', texto: 'Produto guardado com sucesso.' });
      setF(null);
      carregar();
    } catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
  };

  const apagar = async (p) => {
    if (!confirm(`Apagar "${p.titulo}"?`)) return;
    try { await pedir(`/admin/produtos/${p.id}`, { metodo: 'DELETE', token }); setMsg({ tipo: 'sucesso', texto: 'Produto apagado.' }); carregar(); }
    catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
  };

  return (
    <>
      <div className="cabeca-admin"><h1>Produtos</h1><button onClick={() => setF({ ...vazio, categoriaId: categorias[0]?.id || '' })}>+ Novo produto</button></div>
      {msg.texto && <p className={msg.tipo}>{msg.texto}</p>}

      {f && (
        <form className="admin-formulario" onSubmit={guardar}>
          <h3>{f.id ? 'Editar produto' : 'Novo produto'}</h3>
          <label>Título<input required value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} /></label>
          <label>Descrição<textarea rows={3} value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} /></label>
          <div className="duas-colunas">
            <label>Preço (Kz)<input required type="number" min="0" step="1" value={f.preco} onChange={(e) => setF({ ...f, preco: e.target.value })} /></label>
            <label>Avaliação inicial (0 a 5)<input type="number" min="0" max="5" step="0.1" value={f.avaliacao} onChange={(e) => setF({ ...f, avaliacao: e.target.value })} /></label>
          </div>
          <label>Categoria
            <select required value={f.categoriaId} onChange={(e) => setF({ ...f, categoriaId: e.target.value })}>
              <option value="">Escolha...</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
            </select>
          </label>
          <label>Modelos / opções (separados por vírgula)
            <input value={f.modelosTexto} onChange={(e) => setF({ ...f, modelosTexto: e.target.value })} placeholder="Preto, Azul, Rosa" />
          </label>
          <label className="caixa"><input type="checkbox" checked={f.recomendado} onChange={(e) => setF({ ...f, recomendado: e.target.checked })} /> Mostrar em "Recomendados"</label>

          <strong>Imagens (a primeira é a principal)</strong>
          <div className="miniaturas">
            {f.imagens.map((src, i) => (
              <div key={src + i} className="miniatura-admin">
                <img src={urlImagem(src)} alt="" />
                <button type="button" onClick={() => setF({ ...f, imagens: f.imagens.filter((_, k) => k !== i) })}>✕</button>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" multiple disabled={aEnviar} onChange={(e) => carregarImagens([...e.target.files])} />
          {aEnviar && <small>A enviar imagens...</small>}
          {f.imagens.length === 0 && !aEnviar && <small>Adicione pelo menos uma imagem.</small>}

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button type="submit" disabled={aEnviar || f.imagens.length === 0}>Guardar</button>
            <button type="button" className="botao-claro" onClick={() => setF(null)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="tabela">
        <table>
          <thead><tr><th></th><th>Título</th><th>Categoria</th><th>Preço</th><th>Recomendado</th><th></th></tr></thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id}>
                <td><img src={p.imagens[0]} alt="" /></td>
                <td>{p.titulo}</td>
                <td>{nomeCategoria(p.categoriaId)}</td>
                <td><Preco valor={p.preco} /></td>
                <td><span className={`badge ${p.recomendado ? 'sim' : ''}`}>{p.recomendado ? 'Sim' : 'Não'}</span></td>
                <td><div className="acoes"><button className="botao-claro" onClick={() => editar(p)}>Editar</button><button className="perigo" onClick={() => apagar(p)}>Apagar</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
