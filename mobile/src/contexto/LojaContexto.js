import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pedir } from '../api';

// Chaves próprias da Loja Tech: outros projetos em localhost:3000 partilham o mesmo localStorage
// e podem ter uma "sessao"/"carrinho" com outro formato. Os dados lidos são sempre validados.
const CHAVE_CARRINHO = 'lojatech:carrinho';
const CHAVE_SESSAO = 'lojatech:sessao';

const sessaoValida = (s) =>
  !!s && typeof s.token === 'string' && !!s.usuario && typeof s.usuario.nome === 'string' && typeof s.usuario.email === 'string';
const itemValido = (i) =>
  !!i && Number.isInteger(i.produtoId) && typeof i.titulo === 'string' && Number.isFinite(i.preco) && Number.isInteger(i.quantidade) && i.quantidade > 0;

const Contexto = createContext(null);
export const useLoja = () => useContext(Contexto);

export function ProvedorLoja({ children }) {
  const [carrinho, setCarrinho] = useState([]);
  const [sessao, setSessao] = useState(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [c, s] = await Promise.all([AsyncStorage.getItem(CHAVE_CARRINHO), AsyncStorage.getItem(CHAVE_SESSAO)]);
        const carrinhoGuardado = c ? JSON.parse(c) : [];
        setCarrinho(Array.isArray(carrinhoGuardado) ? carrinhoGuardado.filter(itemValido) : []);
        const sessaoGuardada = s ? JSON.parse(s) : null;
        setSessao(sessaoValida(sessaoGuardada) ? sessaoGuardada : null);
      } catch {
        // dados corrompidos: começa vazio
      }
      setPronto(true);
    })();
  }, []);
  // Ao abrir: atualiza preços/títulos do carrinho, remove produtos apagados e valida a sessão.
  useEffect(() => {
    if (!pronto) return;
    pedir('/produtos')
      .then((lista) => setCarrinho((atual) => atual.flatMap((i) => {
        const p = lista.find((x) => x.id === i.produtoId);
        return p ? [{ ...i, titulo: p.titulo, preco: p.preco, imagem: p.imagens[0] || i.imagem }] : [];
      })))
      .catch(() => {});
    if (sessao) pedir('/auth/eu', { token: sessao.token }).catch((e) => { if (/^Sessão/.test(e.message)) setSessao(null); });
  }, [pronto]);

  useEffect(() => { if (pronto) AsyncStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho)).catch(() => {}); }, [carrinho, pronto]);
  useEffect(() => { if (pronto) AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao)).catch(() => {}); }, [sessao, pronto]);

  const chave = (i) => `${i.produtoId}-${i.modelo}`;
  const adicionar = (item) =>
    setCarrinho((atual) => {
      const ex = atual.find((i) => chave(i) === chave(item));
      return ex
        ? atual.map((i) => (chave(i) === chave(item) ? { ...i, quantidade: Math.min(99, i.quantidade + item.quantidade) } : i))
        : [...atual, item];
    });
  const alterarQuantidade = (item, delta) =>
    setCarrinho((atual) =>
      atual.map((i) => (chave(i) === chave(item) ? { ...i, quantidade: Math.min(99, i.quantidade + delta) } : i)).filter((i) => i.quantidade > 0));
  const limparCarrinho = () => setCarrinho([]);
  const total = carrinho.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const quantidadeTotal = carrinho.reduce((s, i) => s + i.quantidade, 0);

  return (
    <Contexto.Provider value={{ carrinho, adicionar, alterarQuantidade, limparCarrinho, total, quantidadeTotal, sessao, setSessao, pronto }}>
      {children}
    </Contexto.Provider>
  );
}
