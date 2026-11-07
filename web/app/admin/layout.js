'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLoja } from '../../lib/contextos';
import { IconeAdmin } from '../../components/Icones';

const ligacoes = [
  ['/admin', 'Resumo'],
  ['/admin/produtos', 'Produtos'],
  ['/admin/categorias', 'Categorias'],
  ['/admin/banners', 'Banners'],
  ['/admin/pedidos', 'Pedidos'],
  ['/admin/avaliacoes', 'Avaliações'],
  ['/admin/clientes', 'Clientes'],
];

export default function LayoutAdmin({ children }) {
  const { sessao, pronto } = useLoja();
  const caminho = usePathname();

  if (!pronto) return null;
  if (!sessao || sessao.usuario.papel !== 'admin')
    return (
      <div className="vazio">
        <IconeAdmin tamanho={52} />
        <h2>Área reservada a administradores</h2>
        <p>Inicie sessão com uma conta de administrador.</p>
        <Link href="/entrar?proximo=/admin" className="botao">Entrar</Link>
      </div>
    );

  return (
    <div className="admin">
      <aside>
        <nav className="admin-menu" aria-label="Administração">
          <strong>Administração</strong>
          {ligacoes.map(([href, nome]) => (
            <Link key={href} href={href} className={caminho === href ? 'ativa' : ''} aria-current={caminho === href ? 'page' : undefined}>{nome}</Link>
          ))}
          <hr />
          <Link href="/">Ver a loja</Link>
        </nav>
      </aside>
      <section className="admin-conteudo">{children}</section>
    </div>
  );
}
