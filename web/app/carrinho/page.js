'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLoja } from '../../lib/contextos';
import { pedir, METODOS_PAGAMENTO } from '../../lib/api';
import Preco from '../../components/Preco';
import { IconeCarrinho, ICONES_PAGAMENTO } from '../../components/Icones';

export default function PaginaCarrinho() {
  const { carrinho, alterarQuantidade, remover, limparCarrinho, total, sessao, pronto } = useLoja();
  const router = useRouter();
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [metodo, setMetodo] = useState('multicaixa_express');
  const [erro, setErro] = useState('');
  const [aEnviar, setAEnviar] = useState(false);

  if (!pronto) return null; // evita mostrar "carrinho vazio" antes de ler o carrinho guardado
  if (carrinho.length === 0)
    return (
      <div className="vazio">
        <IconeCarrinho tamanho={52} />
        <h2>O seu carrinho está vazio</h2>
        <p>Escolha um produto e adicione-o ao carrinho para continuar.</p>
        <Link href="/" className="botao">Ver produtos</Link>
      </div>
    );

  const finalizar = async () => {
    setErro('');
    if (!sessao) return router.push('/entrar?proximo=/carrinho');
    if (!endereco.trim()) return setErro('Indique o endereço de entrega.');
    if (!/^\+?\d[\d\s]{7,}$/.test(telefone.trim())) return setErro('Indique um número de telefone válido (ex.: 923 000 000).');
    setAEnviar(true);
    try {
      const r = await pedir('/pedidos', {
        metodo: 'POST',
        token: sessao.token,
        corpo: {
          endereco, telefone, metodoPagamento: metodo,
          itens: carrinho.map((i) => ({ produtoId: i.produtoId, modelo: i.modelo, quantidade: i.quantidade })),
        },
      });
      limparCarrinho();
      router.push(`/pedidos?novo=${r.id}`);
    } catch (e) {
      setErro(e.message);
    } finally {
      setAEnviar(false);
    }
  };

  return (
    <>
      <div className="sec-titulo" style={{ marginTop: 0 }}>
        <h1 style={{ margin: 0 }}>Carrinho</h1>
        <span>{carrinho.length} {carrinho.length === 1 ? 'produto' : 'produtos'}</span>
      </div>

      <div className="car-grid">
        <div className="car-itens">
          {carrinho.map((i) => (
            <div className="car-item" key={`${i.produtoId}-${i.modelo}`}>
              <div className="car-img"><img src={i.imagem} alt="" /></div>
              <div>
                <h3><Link href={`/produto/${i.produtoId}`}>{i.titulo}</Link></h3>
                {i.modelo && <small>{i.modelo}</small>}
                <small><Preco valor={i.preco} /> cada</small>
                <button className="link remover" onClick={() => remover(i)}>Remover</button>
              </div>
              <div className="quantidade">
                <button aria-label={`Diminuir quantidade de ${i.titulo}`} onClick={() => alterarQuantidade(i, -1)}>−</button>
                <strong>{i.quantidade}</strong>
                <button aria-label={`Aumentar quantidade de ${i.titulo}`} onClick={() => alterarQuantidade(i, 1)}>+</button>
              </div>
              <div className="car-subtotal"><Preco valor={i.preco * i.quantidade} /></div>
            </div>
          ))}
        </div>

        <aside className="car-resumo" aria-label="Resumo e pagamento">
          <h2>Resumo</h2>
          <div className="car-total"><span>Total</span><Preco valor={total} /></div>

          <h2>Entrega</h2>
          <label className="campo"><span>Endereço</span>
            <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, bairro, município, cidade" maxLength={255} autoComplete="street-address" />
          </label>
          <label className="campo"><span>Telefone</span>
            <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="923 000 000" maxLength={30} autoComplete="tel" />
          </label>

          <h2>Forma de pagamento</h2>
          <div className="metodos" role="radiogroup" aria-label="Forma de pagamento">
            {METODOS_PAGAMENTO.map((m) => {
              const Icone = ICONES_PAGAMENTO[m.id];
              return (
                <label key={m.id} className={`metodo-pagamento ${metodo === m.id ? 'ativo' : ''}`}>
                  <input type="radio" name="metodo" value={m.id} checked={metodo === m.id} onChange={() => setMetodo(m.id)} />
                  <span className="metodo-icone"><Icone tamanho={20} /></span>
                  <span className="texto"><strong>{m.nome}</strong><small>{m.descricao}</small></span>
                </label>
              );
            })}
          </div>

          {!sessao && <p className="aviso">Para finalizar a compra, <Link href="/entrar?proximo=/carrinho" style={{ fontWeight: 700, textDecoration: 'underline' }}>entre na sua conta</Link>.</p>}
          {erro && <p className="erro" role="alert">{erro}</p>}
          <button className="botao-largo" style={{ marginTop: 16 }} onClick={finalizar} disabled={aEnviar}>
            {aEnviar ? 'A enviar...' : sessao ? 'Finalizar compra' : 'Entrar para comprar'}
          </button>
        </aside>
      </div>
    </>
  );
}
