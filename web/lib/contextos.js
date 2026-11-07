'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { pedir } from './api';

const Contexto = createContext(null);
export const useLoja = () => useContext(Contexto);

// Chaves próprias da Loja Tech: outros projetos em localhost:3000 partilham o mesmo localStorage
// e podem ter uma "sessao"/"carrinho" com outro formato. Os dados lidos são sempre validados.
const CHAVE_CARRINHO = 'lojatech:carrinho';
const CHAVE_SESSAO = 'lojatech:sessao';

const sessaoValida = (s) =>
  !!s && typeof s.token === 'string' && !!s.usuario && typeof s.usuario.nome === 'string' && typeof s.usuario.email === 'string';
const itemValido = (i) =>
  !!i && Number.isInteger(i.produtoId) && typeof i.titulo === 'string' && Number.isFinite(i.preco) && Number.isInteger(i.quantidade) && i.quantidade > 0;

const ler = (chave, padrao) => {
  try { return JSON.parse(localStorage.getItem(chave)) ?? padrao; } catch { return padrao; }
};
const escrever = (chave, valor) => {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* armazenamento cheio ou bloqueado */ }
};

export function ProvedorLoja({ children }) {
  const [carrinho, setCarrinho] = useState([]);
  const [sessao, setSessao] = useState(null); // { usuario, token }
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const c = ler(CHAVE_CARRINHO, []);
    setCarrinho(Array.isArray(c) ? c.filter(itemValido) : []);
    const s = ler(CHAVE_SESSAO, null);
    setSessao(sessaoValida(s) ? s : null);
    setPronto(true);
  }, []);
  // Ao abrir: atualiza preços/títulos do carrinho (podem ter mudado), remove produtos apagados e valida a sessão.
  useEffect(() => {
    if (!pronto) return;
    pedir('/produtos')
      .then((lista) => setCarrinho((atual) => atual.flatMap((i) => {
        const p = lista.find((x) => x.id === i.produtoId);
        return p ? [{ ...i, titulo: p.titulo, preco: p.preco, imagem: p.imagens[0] || i.imagem }] : [];
      })))
      .catch(() => {});
    if (sessao) pedir('/auth/eu', { token: sessao.token }).catch((e) => { if (/^Sessão/.test(e.message)) setSessao(null); });
  }, [pronto]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (pronto) escrever(CHAVE_CARRINHO, carrinho); }, [carrinho, pronto]);
  useEffect(() => { if (pronto) escrever(CHAVE_SESSAO, sessao); }, [sessao, pronto]);

  const chave = (i) => `${i.produtoId}-${i.modelo}`;

  const adicionar = (item) =>
    setCarrinho((atual) => {
      const existente = atual.find((i) => chave(i) === chave(item));
      if (existente) return atual.map((i) => (chave(i) === chave(item) ? { ...i, quantidade: Math.min(99, i.quantidade + item.quantidade) } : i));
      return [...atual, item];
    });
  const alterarQuantidade = (item, delta) =>
    setCarrinho((atual) =>
      atual
        .map((i) => (chave(i) === chave(item) ? { ...i, quantidade: Math.min(99, i.quantidade + delta) } : i))
        .filter((i) => i.quantidade > 0));
  const remover = (item) => setCarrinho((atual) => atual.filter((i) => chave(i) !== chave(item)));
  const limparCarrinho = () => setCarrinho([]);
  const total = carrinho.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const quantidadeTotal = carrinho.reduce((s, i) => s + i.quantidade, 0);

  return (
    <Contexto.Provider value={{ carrinho, adicionar, alterarQuantidade, remover, limparCarrinho, total, quantidadeTotal, sessao, setSessao, pronto }}>
      {children}
    </Contexto.Provider>
  );
}
