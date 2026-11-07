'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { pedir, METODOS_PAGAMENTO } from '../../../lib/api';
import { useLoja } from '../../../lib/contextos';
import { Estrelas, EstrelasEntrada } from '../../../components/Estrelas';
import Preco from '../../../components/Preco';
import { ICONES_PAGAMENTO } from '../../../components/Icones';

export default function PaginaProduto() {
  const { id } = useParams();
  const router = useRouter();
  const { adicionar, sessao } = useLoja();
  const [produto, setProduto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [imagem, setImagem] = useState(0);
  const [modelo, setModelo] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);
  const [erro, setErro] = useState('');
  const [resumo, setResumo] = useState(null);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [msgAv, setMsgAv] = useState({ tipo: '', texto: '' });
  const [aEnviarAv, setAEnviarAv] = useState(false);

  useEffect(() => {
    pedir(`/produtos/${id}`)
      .then((p) => { setProduto(p); setModelo(p.modelos[0] || null); })
      .catch((e) => setErro(e.message));
    pedir(`/produtos/${id}/avaliacoes`).then(setResumo).catch(() => {});
    pedir('/categorias').then(setCategorias).catch(() => {});
  }, [id]);

  if (erro) return <p className="erro" role="alert">{erro}</p>;
  if (!produto) return <p className="vazio">A carregar...</p>;

  const categoria = categorias.find((c) => c.id === produto.categoriaId);

  const adicionarAoCarrinho = (irParaCarrinho) => {
    adicionar({ produtoId: produto.id, titulo: produto.titulo, imagem: produto.imagens[0], preco: produto.preco, modelo, quantidade });
    if (irParaCarrinho) router.push('/carrinho');
    else { setAdicionado(true); setTimeout(() => setAdicionado(false), 4000); }
  };

  const enviarAvaliacao = async (e) => {
    e.preventDefault();
    setMsgAv({ tipo: '', texto: '' });
    if (!nota) return setMsgAv({ tipo: 'erro', texto: 'Escolha de 1 a 5 estrelas.' });
    setAEnviarAv(true);
    try {
      const r = await pedir(`/produtos/${id}/avaliacoes`, { metodo: 'POST', token: sessao.token, corpo: { estrelas: nota, comentario } });
      setResumo(r);
      setProduto((p) => ({ ...p, avaliacao: r.media, totalAvaliacoes: r.total }));
      setNota(0); setComentario('');
      setMsgAv({ tipo: 'sucesso', texto: 'Obrigado pela sua avaliação!' });
    } catch (err) { setMsgAv({ tipo: 'erro', texto: err.message }); } finally { setAEnviarAv(false); }
  };

  return (
    <>
      <nav className="migalhas" aria-label="Localização">
        <Link href="/">Início</Link>
        {categoria && <Link href={`/categoria/${categoria.id}`}>{categoria.titulo}</Link>}
        <span aria-current="page">{produto.titulo}</span>
      </nav>

      <div className="prod">
        <div>
          <div className="galeria-fundo"><img className="galeria-principal" src={produto.imagens[imagem]} alt={produto.titulo} /></div>
          {produto.imagens.length > 1 && (
            <div className="miniaturas">
              {produto.imagens.map((src, i) => (
                <button key={src} type="button" className={i === imagem ? 'ativa' : ''} onClick={() => setImagem(i)} aria-label={`Ver imagem ${i + 1}`} aria-pressed={i === imagem}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1>{produto.titulo}</h1>
          <div className="avaliacao-linha">
            <Estrelas valor={produto.avaliacao} tamanho={20} />
            <strong>{produto.avaliacao.toFixed(1)}</strong>
            <a href="#avaliacoes" style={{ color: 'var(--atlantico)', fontWeight: 600 }}>
              {produto.totalAvaliacoes > 0 ? `${produto.totalAvaliacoes} ${produto.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}` : 'Sem avaliações de clientes'}
            </a>
          </div>

          <div className="etiqueta-preco"><Preco valor={produto.preco} /></div>
          <p className="prod-descricao">{produto.descricao}</p>

          {produto.modelos.length > 0 && (
            <>
              <span className="rotulo-campo">Modelo / opção</span>
              <div className="modelos" role="group" aria-label="Modelo ou opção">
                {produto.modelos.map((m) => (
                  <button key={m} type="button" className={`modelo ${m === modelo ? 'ativo' : ''}`} aria-pressed={m === modelo} onClick={() => setModelo(m)}>{m}</button>
                ))}
              </div>
            </>
          )}

          <span className="rotulo-campo">Quantidade</span>
          <div className="quantidade">
            <button type="button" aria-label="Diminuir quantidade" onClick={() => setQuantidade((q) => Math.max(1, q - 1))}>−</button>
            <strong aria-live="polite">{quantidade}</strong>
            <button type="button" aria-label="Aumentar quantidade" onClick={() => setQuantidade((q) => Math.min(99, q + 1))}>+</button>
          </div>

          <div className="prod-acoes">
            <button onClick={() => adicionarAoCarrinho(false)}>Adicionar ao carrinho</button>
            <button className="botao-sol" onClick={() => adicionarAoCarrinho(true)}>Comprar agora</button>
          </div>
          {adicionado && <p className="sucesso" role="status">Adicionado ao carrinho. <Link href="/carrinho" style={{ fontWeight: 700, textDecoration: 'underline' }}>Ver carrinho</Link></p>}

          <div className="como-pagar">
            <strong>Como pagar</strong>
            <ul>
              {METODOS_PAGAMENTO.map((m) => {
                const Icone = ICONES_PAGAMENTO[m.id];
                return <li key={m.id}><Icone tamanho={20} />{m.nome}</li>;
              })}
            </ul>
          </div>
        </div>
      </div>

      <section className="avaliacoes" id="avaliacoes" aria-labelledby="titulo-avaliacoes">
        <div>
          <h2 id="titulo-avaliacoes">Avaliações dos clientes</h2>
          {resumo && resumo.total > 0 && (
            <>
              <div className="media-grande">
                <strong>{resumo.media.toFixed(1)}</strong>
                <div><Estrelas valor={resumo.media} tamanho={18} /><small>{resumo.total} {resumo.total === 1 ? 'avaliação' : 'avaliações'}</small></div>
              </div>
              <div className="distribuicao">
                {[5, 4, 3, 2, 1].map((n) => (
                  <div className="linha-estrela" key={n}>
                    <span>{n} ★</span>
                    <div className="trilho"><div style={{ width: `${(resumo.distribuicao[n] / resumo.total) * 100}%` }} /></div>
                    <span>{resumo.distribuicao[n]}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {sessao ? (
            <form className="avaliar" onSubmit={enviarAvaliacao}>
              <strong>Deixe a sua avaliação</strong>
              <EstrelasEntrada valor={nota} aoMudar={setNota} />
              <label className="sr-only" htmlFor="comentario">Comentário</label>
              <textarea id="comentario" rows={3} maxLength={500} placeholder="Escreva um comentário (opcional)" value={comentario} onChange={(e) => setComentario(e.target.value)} />
              {msgAv.texto && <div className={msgAv.tipo} role="status">{msgAv.texto}</div>}
              <button type="submit" disabled={aEnviarAv}>{aEnviarAv ? 'A enviar...' : 'Enviar avaliação'}</button>
              <small>Se já avaliou este produto, a sua avaliação anterior é atualizada.</small>
            </form>
          ) : (
            <p className="aviso"><Link href={`/entrar?proximo=/produto/${id}`} style={{ fontWeight: 700, textDecoration: 'underline' }}>Entre na sua conta</Link> para avaliar este produto.</p>
          )}
        </div>

        <div>
          {resumo && resumo.avaliacoes.length === 0 && <p className="vazio" style={{ padding: '24px 0' }}>Ainda não há avaliações. Seja o primeiro!</p>}
          {resumo?.avaliacoes.map((a) => (
            <div className="comentario" key={a.id}>
              <div className="comentario-topo"><strong>{a.autor}</strong><small>{new Date(a.criadoEm).toLocaleDateString('pt-PT')}</small></div>
              <Estrelas valor={a.estrelas} />
              {a.comentario && <p>{a.comentario}</p>}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
