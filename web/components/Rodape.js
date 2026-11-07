import Link from 'next/link';
import { MarcaLogo } from './Icones';

export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="contentor">
        <div className="rodape-grelha">
          <div>
            <span className="logo"><MarcaLogo /><span>Loja Tech</span></span>
            <p>Computadores, telemóveis, auscultadores, consolas, câmaras e relógios inteligentes, com preços em Kwanzas.</p>
          </div>
          <div>
            <h3>Formas de pagamento</h3>
            <ul>
              <li>Multicaixa Express</li>
              <li>Multicaixa (caixa automático ou TPA)</li>
              <li>Pagamento presencial</li>
            </ul>
          </div>
          <div>
            <h3>A sua conta</h3>
            <ul>
              <li><Link href="/entrar">Entrar</Link></li>
              <li><Link href="/registo">Criar conta</Link></li>
              <li><Link href="/pedidos">Os meus pedidos</Link></li>
              <li><Link href="/carrinho">Carrinho</Link></li>
            </ul>
          </div>
        </div>
        <div className="rodape-fim">© {new Date().getFullYear()} Loja Tech. Todos os direitos reservados.</div>
      </div>
    </footer>
  );
}
