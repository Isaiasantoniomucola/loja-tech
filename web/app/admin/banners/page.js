'use client';
import { useEffect, useState } from 'react';
import { pedir, enviarImagem, urlImagem } from '../../../lib/api';
import { useLoja } from '../../../lib/contextos';

export default function AdminBanners() {
  const { sessao } = useLoja();
  const token = sessao.token;
  const [banners, setBanners] = useState([]);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });

  const carregar = () => pedir('/banners').then(setBanners).catch((e) => setMsg({ tipo: 'erro', texto: e.message }));
  useEffect(() => { carregar(); }, []);

  const adicionar = async (ficheiro) => {
    if (!ficheiro) return;
    try {
      const imagem = await enviarImagem(ficheiro, token);
      await pedir('/admin/banners', { metodo: 'POST', corpo: { imagem }, token });
      setMsg({ tipo: 'sucesso', texto: 'Banner adicionado.' });
      carregar();
    } catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
  };
  const apagar = async (b) => {
    if (!confirm('Apagar este banner?')) return;
    try { await pedir(`/admin/banners/${b.id}`, { metodo: 'DELETE', token }); carregar(); }
    catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
  };

  return (
    <>
      <h1>Banners</h1>
      {msg.texto && <p className={msg.tipo}>{msg.texto}</p>}
      <div className="admin-formulario"><strong>Adicionar banner</strong><input type="file" accept="image/*" onChange={(e) => { adicionar(e.target.files[0]); e.target.value = ''; }} /></div>
      <div className="grelha">
        {banners.map((b) => (
          <div key={b.id} className="cartao">
            <div className="cartao-imagem"><img src={urlImagem(b.imagem)} alt="Banner" /></div>
            <div className="cartao-corpo"><button className="perigo" onClick={() => apagar(b)}>Apagar</button></div>
          </div>
        ))}
      </div>
    </>
  );
}
