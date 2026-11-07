'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { pedir } from '../../lib/api';
import { useLoja } from '../../lib/contextos';

function FormularioEntrar() {
  const { setSessao } = useLoja();
  const router = useRouter();
  const proximoPedido = useSearchParams().get('proximo');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aEnviar, setAEnviar] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setErro('');
    setAEnviar(true);
    try {
      const dados = await pedir('/auth/entrar', { metodo: 'POST', corpo: { email, senha } });
      setSessao(dados);
      router.push(proximoPedido || (dados.usuario.papel === 'admin' ? '/admin' : '/'));
    } catch (err) { setErro(err.message); } finally { setAEnviar(false); }
  };

  return (
    <div className="aut">
      <div className="aut-lateral">
        <h2>Bem-vindo de volta</h2>
        <p>Entre para finalizar compras, ver as referências de pagamento, acompanhar os seus pedidos e avaliar produtos.</p>
      </div>
      <form className="aut-form" onSubmit={enviar}>
        <h1>Entrar</h1>
        <label className="campo"><span>Email</span>
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="campo"><span>Senha</span>
          <input type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>
        {erro && <div className="erro" role="alert">{erro}</div>}
        <button type="submit" disabled={aEnviar}>{aEnviar ? 'A entrar...' : 'Entrar'}</button>
        <p className="alternativa">Ainda não tem conta? <Link href="/registo">Criar conta</Link></p>
      </form>
    </div>
  );
}

export default function PaginaEntrar() {
  return <Suspense fallback={null}><FormularioEntrar /></Suspense>;
}
