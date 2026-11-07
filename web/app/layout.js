import './globals.css';
import { ProvedorLoja } from '../lib/contextos';
import Cabecalho from '../components/Cabecalho';
import Rodape from '../components/Rodape';

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0a6c74' };

export const metadata = {
  title: 'Loja Tech',
  description: 'Computadores, telemóveis, auscultadores, consolas, câmaras e relógios inteligentes. Pague com Multicaixa Express, Multicaixa ou na entrega.',
};

export default function LayoutRaiz({ children }) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Figtree:wght@400;500;600;700;800&display=swap" />
      </head>
      <body>
        <ProvedorLoja>
          <Cabecalho />
          <main className="contentor">{children}</main>
          <Rodape />
        </ProvedorLoja>
      </body>
    </html>
  );
}
