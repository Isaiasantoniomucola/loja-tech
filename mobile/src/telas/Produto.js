import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { pedir, formatarPreco } from '../api';
import { cores } from '../tema';
import { useLoja } from '../contexto/LojaContexto';
import { Estrelas, EstrelasEntrada } from '../componentes/Estrelas';

export default function Produto({ route, navigation }) {
  const { adicionar, sessao } = useLoja();
  const [produto, setProduto] = useState(null);
  const [imagem, setImagem] = useState(0);
  const [modelo, setModelo] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [resumo, setResumo] = useState(null);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [aEnviarAv, setAEnviarAv] = useState(false);
  const id = route.params.id;

  useEffect(() => {
    pedir(`/produtos/${id}`)
      .then((p) => { setProduto(p); setModelo(p.modelos[0] || null); })
      .catch((e) => Alert.alert('Erro', e.message));
    pedir(`/produtos/${id}/avaliacoes`).then(setResumo).catch(() => {});
  }, [id]);

  if (!produto) return <ActivityIndicator style={{ marginTop: 40 }} color={cores.principal} />;

  const adicionarAoCarrinho = () => {
    adicionar({ produtoId: produto.id, titulo: produto.titulo, imagem: produto.imagens[0], preco: produto.preco, modelo, quantidade });
    Alert.alert('Carrinho', 'Produto adicionado ao carrinho!', [
      { text: 'Continuar a comprar' },
      { text: 'Ver carrinho', onPress: () => navigation.navigate('Carrinho') },
    ]);
  };

  const enviarAvaliacao = async () => {
    if (!nota) return Alert.alert('Avaliação', 'Escolha de 1 a 5 estrelas.');
    setAEnviarAv(true);
    try {
      const r = await pedir(`/produtos/${id}/avaliacoes`, { metodo: 'POST', token: sessao.token, corpo: { estrelas: nota, comentario } });
      setResumo(r);
      setProduto((p) => ({ ...p, avaliacao: r.media, totalAvaliacoes: r.total }));
      setNota(0); setComentario('');
      Alert.alert('Obrigado!', 'A sua avaliação foi guardada.');
    } catch (e) { Alert.alert('Erro', e.message); } finally { setAEnviarAv(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ backgroundColor: '#fff' }} contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Image source={{ uri: produto.imagens[imagem] }} style={estilos.principal} resizeMode="contain" />
        {produto.imagens.length > 1 && (
          <ScrollView horizontal style={{ marginTop: 10 }}>
            {produto.imagens.map((src, i) => (
              <Pressable key={src} onPress={() => setImagem(i)}>
                <Image source={{ uri: src }} style={[estilos.miniatura, i === imagem && { borderColor: cores.principal }]} resizeMode="contain" />
              </Pressable>
            ))}
          </ScrollView>
        )}
        <Text style={estilos.titulo}>{produto.titulo}</Text>
        <View style={estilos.linha}>
          <Estrelas valor={produto.avaliacao} tamanho={20} />
          <Text style={{ fontWeight: '700' }}>{produto.avaliacao.toFixed(1)}</Text>
          <Text style={{ color: '#666' }}>{produto.totalAvaliacoes > 0 ? `(${produto.totalAvaliacoes})` : '(sem avaliações de clientes)'}</Text>
        </View>
        <View style={estilos.etiqueta}><Text style={estilos.preco}>{formatarPreco(produto.preco)}</Text></View>
        <Text style={estilos.descricao}>{produto.descricao}</Text>

        {produto.modelos.length > 0 && (
          <>
            <Text style={estilos.rotulo}>Modelo / Opção</Text>
            <View style={estilos.modelos}>
              {produto.modelos.map((m) => (
                <Pressable key={m} onPress={() => setModelo(m)} style={[estilos.modelo, m === modelo && estilos.modeloAtivo]}>
                  <Text style={m === modelo ? { color: '#fff' } : null}>{m}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <View style={estilos.quantidade}>
          <Pressable onPress={() => setQuantidade((q) => Math.max(1, q - 1))}><Text style={estilos.mais}>−</Text></Pressable>
          <Text style={{ fontWeight: '700', fontSize: 16 }}>{quantidade}</Text>
          <Pressable onPress={() => setQuantidade((q) => Math.min(99, q + 1))}><Text style={estilos.mais}>+</Text></Pressable>
        </View>

        <Pressable style={estilos.botao} onPress={adicionarAoCarrinho}>
          <Text style={estilos.botaoTexto}>Adicionar ao carrinho</Text>
        </Pressable>

        <Text style={estilos.seccao}>Avaliações dos clientes</Text>
        {resumo && resumo.total > 0 && (
          <View style={estilos.resumo}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 40, fontWeight: '800' }}>{resumo.media.toFixed(1)}</Text>
              <Estrelas valor={resumo.media} tamanho={16} />
              <Text style={{ color: '#666', marginTop: 2 }}>{resumo.total} {resumo.total === 1 ? 'avaliação' : 'avaliações'}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 18 }}>
              {[5, 4, 3, 2, 1].map((n) => (
                <View key={n} style={estilos.barraLinha}>
                  <Text style={{ width: 28 }}>{n} ★</Text>
                  <View style={estilos.barra}><View style={[estilos.barraCheia, { width: `${(resumo.distribuicao[n] / resumo.total) * 100}%` }]} /></View>
                  <Text style={{ width: 24, textAlign: 'right' }}>{resumo.distribuicao[n]}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {sessao ? (
          <View style={estilos.avaliar}>
            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Deixe a sua avaliação</Text>
            <EstrelasEntrada valor={nota} aoMudar={setNota} />
            <TextInput style={estilos.entrada} placeholder="Escreva um comentário (opcional)" multiline maxLength={500} value={comentario} onChangeText={setComentario} />
            <Pressable style={[estilos.botao, aEnviarAv && { opacity: 0.5 }]} onPress={enviarAvaliacao} disabled={aEnviarAv}><Text style={estilos.botaoTexto}>{aEnviarAv ? 'A enviar...' : 'Enviar avaliação'}</Text></Pressable>
            <Text style={{ color: '#666', fontSize: 12, marginTop: 6 }}>Se já avaliou este produto, a avaliação anterior é atualizada.</Text>
          </View>
        ) : (
          <Pressable onPress={() => navigation.navigate('Entrar')}><Text style={{ color: cores.principal, fontWeight: '700', marginVertical: 10 }}>Entre na sua conta para avaliar este produto</Text></Pressable>
        )}

        {resumo && resumo.avaliacoes.length === 0 && <Text style={{ color: '#666', marginTop: 8 }}>Ainda não há avaliações. Seja o primeiro!</Text>}
        {resumo?.avaliacoes.map((a) => (
          <View key={a.id} style={estilos.comentario}>
            <View style={estilos.linhaEntre}><Text style={{ fontWeight: '700' }}>{a.autor}</Text><Text style={{ color: '#666', fontSize: 12 }}>{new Date(a.criadoEm).toLocaleDateString('pt-PT')}</Text></View>
            <Estrelas valor={a.estrelas} tamanho={14} />
            {a.comentario ? <Text style={{ marginTop: 4 }}>{a.comentario}</Text> : null}
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  conteudo: { padding: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  principal: { width: '100%', height: 260, backgroundColor: cores.painel, borderRadius: 14 },
  miniatura: { width: 60, height: 60, marginRight: 8, borderWidth: 2, borderColor: 'transparent', borderRadius: 8, backgroundColor: cores.painel },
  titulo: { fontSize: 24, fontWeight: '800', marginTop: 14, color: cores.escuro },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  linhaEntre: { flexDirection: 'row', justifyContent: 'space-between' },
  etiqueta: { alignSelf: 'flex-start', backgroundColor: cores.sol, paddingVertical: 8, paddingLeft: 18, paddingRight: 26, borderTopRightRadius: 30, borderBottomRightRadius: 30, marginVertical: 12 },
  preco: { fontSize: 26, fontWeight: '800', color: '#2B1D00' },
  descricao: { color: '#444', lineHeight: 20 },
  rotulo: { fontWeight: '700', marginTop: 16 },
  modelos: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  modelo: { borderWidth: 1, borderColor: cores.borda, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, marginBottom: 8 },
  modeloAtivo: { backgroundColor: cores.principal, borderColor: cores.principal },
  quantidade: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, borderColor: cores.borda, borderRadius: 10, marginTop: 12 },
  mais: { fontSize: 22, paddingHorizontal: 16, paddingVertical: 4, color: cores.principal },
  botao: { backgroundColor: cores.principal, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 16, minHeight: 48 },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
  seccao: { fontSize: 20, fontWeight: '800', marginTop: 28, marginBottom: 12 },
  resumo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  barraLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 2 },
  barra: { flex: 1, height: 8, backgroundColor: '#eceef2', borderRadius: 99, overflow: 'hidden' },
  barraCheia: { height: 8, backgroundColor: cores.estrela },
  avaliar: { backgroundColor: cores.fundo, padding: 14, borderRadius: 14, marginBottom: 12 },
  entrada: { backgroundColor: '#fff', borderWidth: 1, borderColor: cores.borda, borderRadius: 10, padding: 10, marginTop: 10, minHeight: 70, textAlignVertical: 'top' },
  comentario: { borderTopWidth: 1, borderColor: cores.borda, paddingVertical: 12 },
});
