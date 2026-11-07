'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useLoja } from '../lib/contextos';
import { IconePesquisa, IconeCarrinho, IconeUtilizador, IconeSair, IconePacote, IconeAdmin, MarcaLogo } from './Icones';

export default function Cabecalho() {
  const { quantidadeTotal, sessao, setSessao } = useLoja();
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState(false);
  const router = useRouter();
  const caminho = usePathname();
  const caixa = useRef(null);

  useEffect(() => { setAberto(false); }, [caminho]);
  useEffect(() => {
    if (!aberto) return undefined;
    const fora = (e) => { if (caixa.current && !caixa.current.contains(e.target)) setAberto(false); };
    const tecla = (e) => { if (e.key === 'Escape') setAberto(false); };
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', tecla);
    return () => { document.removeEventListener('mousedown', fora); document.removeEventListener('keydown', tecla); };
  }, [aberto]);

  const pesquisar = (e) => {
    e.preventDefault();
    const q = busca.trim();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : '/');
  };

  const primeiroNome = sessao ? sessao.usuario.nome.split(' ')[0] : '';

  return (
    <>
      <div className="aviso-topo">
        <div className="contentor">Pague com Multicaixa Express, Multicaixa ou na entrega.</div>
      </div>
      <header className="cabecalho">
        <div className="contentor cab-linha">
          <Link href="/" className="logo" aria-label="Loja Tech, página inicial">
            <MarcaLogo /><span>Loja Tech</span>
          </Link>

          <form className="pesquisa" role="search" onSubmit={pesquisar}>
            <IconePesquisa tamanho={20} />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar produtos..." aria-label="Pesquisar produtos" maxLength={100} />
            <button type="submit">Pesquisar</button>
          </form>

          <nav className="cab-acoes" aria-label="Conta e carrinho">
            {sessao ? (
              <div className="conta" ref={caixa}>
                <button className="cab-acao" style={{ background: aberto ? undefined : 'none' }} aria-expanded={aberto} aria-haspopup="menu" onClick={() => setAberto((v) => !v)}>
                  <IconeUtilizador /><span className="rotulo">{primeiroNome}</span>
                </button>
                {aberto && (
                  <div className="conta-menu" role="menu">
                    <div className="conta-nome">{sessao.usuario.email}</div>
                    {sessao.usuario.papel === 'admin' && <Link href="/admin" role="menuitem"><IconeAdmin tamanho={20} />Administração</Link>}
                    <Link href="/pedidos" role="menuitem"><IconePacote tamanho={20} />Os meus pedidos</Link>
                    <hr />
                    <button role="menuitem" onClick={() => { setSessao(null); setAberto(false); router.push('/'); }}><IconeSair tamanho={20} />Sair</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/entrar" className="cab-acao"><IconeUtilizador /><span className="rotulo">Entrar</span></Link>
            )}
            <Link href="/carrinho" className="cab-acao" aria-label={`Carrinho, ${quantidadeTotal} ${quantidadeTotal === 1 ? 'item' : 'itens'}`}>
              <IconeCarrinho /><span className="rotulo">Carrinho</span>
              {quantidadeTotal > 0 && <span className="selo">{quantidadeTotal}</span>}
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
