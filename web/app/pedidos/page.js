'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { pedir, formatarPreco } from '../../lib/api';
import { useLoja } from '../../lib/contextos';
import Preco from '../../components/Preco';
import { IconePacote, IconeVerificar, ICONES_PAGAMENTO } from '../../components/Icones';

const NOMES_ESTADO = { pendente: 'Pendente', pago: 'Pago', enviado: 'Enviado', entregue: 'Entregue', cancelado: 'Cancelado' };
const PASSOS = [['pendente', 'Pedido feito'], ['pago', 'Pago'], ['enviado', 'Enviado'], ['entregue', 'Entregue']];

function Copiar({ texto, rotulo }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try { await navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 1800); } catch { /* sem permissão */ }
  };
  return <button type="button" className="copiar" onClick={copiar} aria-label={`Copiar ${rotulo}`}>{copiado ? 'Copiado' : 'Copiar'}</button>;
}

function ListaPedidos() {
  const { sessao, pronto } = useLoja();
  const novo = useSearchParams().get('novo');
  const [pedidos, setPedidos] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!pronto || !sessao) return;
    pedir('/pedidos', { token: sessao.token }).then(setPedidos).catch((e) => setErro(e.message));
  }, [pronto, sessao]);

  if (!pronto) return null;
  if (!sessao)
    return (
      <div className="vazio">
        <IconePacote tamanho={52} />
        <h2>Entre para ver os seus pedidos</h2>
        <Link href="/entrar?proximo=/pedidos" className="botao">Entrar</Link>
      </div>
    );

  return (
    <>
      <h1>Os meus pedidos</h1>
      {novo && <p className="sucesso" role="status"><IconeVerificar tamanho={18} style={{ verticalAlign: 'text-bottom', marginRight: 6 }} />Pedido #{novo} realizado com sucesso. Siga as instruções de pagamento abaixo.</p>}
      {erro && <p className="erro" role="alert">{erro}</p>}
      {!pedidos && !erro && <p className="vazio">A carregar...</p>}
      {pedidos && pedidos.length === 0 && (
        <div className="vazio">
          <IconePacote tamanho={52} />
          <h2>Ainda não fez nenhum pedido</h2>
          <Link href="/" className="botao">Ver produtos</Link>
        </div>
      )}
      {pedidos?.map((p) => {
        const Icone = ICONES_PAGAMENTO[p.metodo_pagamento];
        const passoAtual = PASSOS.findIndex(([e]) => e === p.estado);
        return (
          <article className="ped-card" key={p.id}>
            <div className="ped-topo">
              <div>
                <h2>Pedido #{p.id}</h2>
                <small>{new Date(p.criado_em).toLocaleString('pt-PT')} · {p.endereco}</small>
              </div>
              <span className={`estado estado-${p.estado}`}>{NOMES_ESTADO[p.estado] || p.estado}</span>
            </div>

            {p.estado !== 'cancelado' && (
              <ol className="passos" aria-label="Progresso do pedido">
                {PASSOS.map(([e, nome], k) => <li key={e} className={`passo ${k <= passoAtual ? 'feito' : ''}`}>{nome}</li>)}
              </ol>
            )}

            <ul className="ped-itens">
              {p.itens.map((i, k) => (
                <li key={k}><span>{i.quantidade}× {i.titulo}{i.modelo ? ` (${i.modelo})` : ''}</span><span>{formatarPreco(i.preco_unitario)}</span></li>
              ))}
            </ul>
            <div className="ped-total"><span>Total</span><Preco valor={p.total} /></div>

            <div className={`pagamento-box ${p.estado === 'pendente' ? 'pendente' : ''}`}>
              <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{Icone && <Icone tamanho={20} />}{p.metodoNome}</strong>
              {p.referencia && p.estado === 'pendente' && (
                <div className="ref-grelha">
                  <div className="ref-campo"><small>Entidade</small><strong>{p.entidade}</strong><Copiar texto={String(p.entidade)} rotulo="entidade" /></div>
                  <div className="ref-campo"><small>Referência</small><strong>{p.referencia}</strong><Copiar texto={p.referencia.replace(/\s/g, '')} rotulo="referência" /></div>
                  <div className="ref-campo"><small>Montante</small><strong>{formatarPreco(p.total)}</strong><Copiar texto={String(Math.round(p.total))} rotulo="montante" /></div>
                </div>
              )}
              {p.estado === 'pendente' && <p>{p.instrucoes}</p>}
              {p.estado === 'pago' && <p>Pagamento confirmado. Obrigado!</p>}
              {p.estado === 'cancelado' && <p>Este pedido foi cancelado.</p>}
            </div>
          </article>
        );
      })}
    </>
  );
}

export default function PaginaPedidos() {
  return <Suspense fallback={null}><ListaPedidos /></Suspense>;
}
