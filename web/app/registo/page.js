'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { pedir } from '../../lib/api';
import { useLoja } from '../../lib/contextos';

export default function PaginaRegisto() {
  const { setSessao } = useLoja();
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aEnviar, setAEnviar] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setErro('');
    setAEnviar(true);
    try {
      setSessao(await pedir('/auth/registo', { metodo: 'POST', corpo: { nome, email, senha } }));
      router.push('/');
    } catch (err) { setErro(err.message); } finally { setAEnviar(false); }
  };

  return (
    <div className="aut">
      <div className="aut-lateral">
        <h2>Crie a sua conta</h2>
        <p>Com a conta pode finalizar compras, acompanhar os pedidos e avaliar os produtos.</p>
      </div>
      <form className="aut-form" onSubmit={enviar}>
        <h1>Criar conta</h1>
        <label className="campo"><span>Nome completo</span>
          <input autoComplete="name" minLength={2} maxLength={120} required value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>
        <label className="campo"><span>Email</span>
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="campo"><span>Senha (mínimo 6 caracteres)</span>
          <input type="password" autoComplete="new-password" minLength={6} maxLength={72} required value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>
        {erro && <div className="erro" role="alert">{erro}</div>}
        <button type="submit" disabled={aEnviar}>{aEnviar ? 'A criar conta...' : 'Criar conta'}</button>
        <p className="alternativa">Já tem conta? <Link href="/entrar">Entrar</Link></p>
      </form>
    </div>
  );
}
