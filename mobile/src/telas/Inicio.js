import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { pedir } from '../api';
import { cores, emojiCategoria } from '../tema';
import { useLoja } from '../contexto/LojaContexto';
import CartaoProduto from '../componentes/CartaoProduto';

export default function Inicio({ navigation }) {
  const { quantidadeTotal, sessao } = useLoja();
  const { width } = useWindowDimensions();
  const colunas = width >= 900 ? 4 : width >= 600 ? 3 : 2; // telemóvel, tablet pequeno, tablet grande
  const [banners, setBanners] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [atualizando, setAtualizando] = useState(false);
  const [contador, setContador] = useState(0); // incrementa para recarregar (puxar para atualizar)

  useEffect(() => {
    Promise.all([pedir('/banners'), pedir('/categorias')])
      .then(([b, c]) => { setBanners(b); setCategorias(c); })
      .catch((e) => setErro(e.message));
  }, [contador]);

  useEffect(() => {
    let cancelado = false; // ignora respostas antigas se a pesquisa mudar entretanto
    const temporizador = setTimeout(() => {
      let caminho = '/produtos?recomendados=1';
      if (busca.trim()) caminho = `/produtos?q=${encodeURIComponent(busca.trim())}`;
      else if (categoriaAtiva !== null) caminho = `/produtos?categoria=${categoriaAtiva}`;
      setCarregando(true);
      pedir(caminho)
        .then((lista) => { if (!cancelado) { setProdutos(lista); setErro(''); } })
        .catch((e) => { if (!cancelado) setErro(e.message); })
        .finally(() => { if (!cancelado) { setCarregando(false); setAtualizando(false); } });
    }, 300);
    return () => { cancelado = true; clearTimeout(temporizador); };
  }, [busca, categoriaAtiva, contador]);

  const pesquisando = busca.trim().length > 0;
  const titulo = pesquisando ? 'Resultados' : categoriaAtiva !== null ? categorias.find((c) => c.id === categoriaAtiva)?.titulo : 'Recomendados para si';

  const cabecalho = (
    <View>
      <View style={estilos.barra}>
        <TextInput
          style={estilos.pesquisa}
          placeholder="Pesquisar produtos..."
          placeholderTextColor={cores.suave}
          value={busca}
          onChangeText={setBusca}
          returnKeyType="search"
          accessibilityLabel="Pesquisar produtos"
        />
        <Pressable onPress={() => navigation.navigate(sessao ? 'Pedidos' : 'Entrar')} style={estilos.acao} accessibilityLabel={sessao ? 'Os meus pedidos' : 'Entrar'}>
          <Text style={estilos.acaoIcone}>👤</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Carrinho')} style={estilos.acao} accessibilityLabel={`Carrinho, ${quantidadeTotal} itens`}>
          <Text style={estilos.acaoIcone}>🛒</Text>
          {quantidadeTotal > 0 && <View style={estilos.selo}><Text style={estilos.seloTexto}>{quantidadeTotal}</Text></View>}
        </Pressable>
      </View>

      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}

      {!pesquisando && (
        <>
          <View style={estilos.hero}>
            <Text style={estilos.heroTitulo}>Tecnologia ao seu alcance, paga como preferir.</Text>
            <Text style={estilos.heroTexto}>Pague com Multicaixa Express, Multicaixa ou na entrega.</Text>
          </View>

          {banners.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {banners.map((b) => <Image key={b.id} source={{ uri: b.imagem }} style={estilos.banner} resizeMode="cover" />)}
            </ScrollView>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }} contentContainerStyle={{ paddingVertical: 4 }}>
            {categorias.map((c) => {
              const ativa = categoriaAtiva === c.id;
              const emoji = emojiCategoria(c.titulo);
              return (
                <Pressable key={c.id} onPress={() => setCategoriaAtiva(ativa ? null : c.id)} style={[estilos.categoria, ativa && estilos.categoriaAtiva]} accessibilityRole="button" accessibilityState={{ selected: ativa }}>
                  {emoji ? <Text style={estilos.categoriaEmoji}>{emoji}</Text> : <Image source={{ uri: c.imagem }} style={{ width: 28, height: 28 }} resizeMode="contain" />}
                  <Text style={[estilos.categoriaTexto, ativa && { color: '#fff' }]}>{c.titulo}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      )}
      <Text style={estilos.seccao}>{titulo}</Text>
    </View>
  );

  return (
    <FlatList
      style={{ backgroundColor: cores.fundo }}
      contentContainerStyle={{ padding: 12, width: '100%', maxWidth: 1100, alignSelf: 'center' }}
      data={produtos}
      key={colunas}
      refreshing={atualizando}
      onRefresh={() => { setAtualizando(true); setContador((c) => c + 1); }}
      numColumns={colunas}
      keyExtractor={(p) => String(p.id)}
      ListHeaderComponent={cabecalho}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={carregando ? <ActivityIndicator color={cores.principal} style={{ marginTop: 30 }} /> : erro ? null : <Text style={estilos.vazio}>Nenhum produto encontrado.</Text>}
      renderItem={({ item }) => <CartaoProduto produto={item} colunas={colunas} aoAbrir={() => navigation.navigate('Produto', { id: item.id })} />}
    />
  );
}

const estilos = StyleSheet.create({
  barra: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pesquisa: { flex: 1, backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 11, borderWidth: 1.5, borderColor: cores.borda, fontSize: 15, color: cores.escuro },
  acao: { marginLeft: 6, padding: 8 },
  acaoIcone: { fontSize: 22 },
  selo: { position: 'absolute', top: 0, right: 0, backgroundColor: cores.sol, borderRadius: 10, minWidth: 18, alignItems: 'center' },
  seloTexto: { color: '#2B1D00', fontSize: 11, fontWeight: '800', paddingHorizontal: 4 },
  erro: { backgroundColor: cores.coralClaro, color: '#8D2412', padding: 12, borderRadius: 10, marginBottom: 10 },
  hero: { backgroundColor: cores.mare, borderRadius: 18, padding: 22, marginBottom: 14 },
  heroTitulo: { color: '#fff', fontSize: 25, fontWeight: '800', lineHeight: 29 },
  heroTexto: { color: '#B9D3D7', marginTop: 8, fontSize: 14, lineHeight: 20 },
  banner: { width: 320, height: 150, borderRadius: 14, marginRight: 10 },
  categoria: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16, marginRight: 8, borderWidth: 1.5, borderColor: cores.borda },
  categoriaAtiva: { backgroundColor: cores.principal, borderColor: cores.principal },
  categoriaEmoji: { fontSize: 18 },
  categoriaTexto: { fontWeight: '700', color: cores.escuro },
  seccao: { fontSize: 21, fontWeight: '800', color: cores.escuro, marginTop: 16, marginBottom: 8 },
  vazio: { textAlign: 'center', marginTop: 30, color: cores.suave },
});
