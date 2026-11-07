import React, { useState } from 'react';
import { Alert, FlatList, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { pedir, formatarPreco, METODOS_PAGAMENTO } from '../api';
import { cores } from '../tema';
import { useLoja } from '../contexto/LojaContexto';

export default function Carrinho({ navigation }) {
  const { carrinho, alterarQuantidade, limparCarrinho, total, sessao, pronto } = useLoja();
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [metodo, setMetodo] = useState('multicaixa_express');
  const [aEnviar, setAEnviar] = useState(false);

  const finalizar = async () => {
    if (!sessao) return navigation.navigate('Entrar');
    if (!endereco.trim()) return Alert.alert('Atenção', 'Indique o endereço de entrega.');
    if (!/^\+?\d[\d\s]{7,}$/.test(telefone.trim())) return Alert.alert('Atenção', 'Indique um número de telefone válido (ex.: 923 000 000).');
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
      const texto = r.referencia
        ? `Entidade: ${r.entidade}\nReferência: ${r.referencia}\nMontante: ${formatarPreco(r.total)}\n\n${r.instrucoes}`
        : r.instrucoes;
      Alert.alert(`Pedido #${r.id} realizado`, texto);
      navigation.replace('Pedidos');
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setAEnviar(false);
    }
  };

  if (!pronto) return null; // evita mostrar "carrinho vazio" antes de ler o carrinho guardado
  if (carrinho.length === 0)
    return <View style={estilos.vazio}><Text style={{ fontSize: 18 }}>O seu carrinho está vazio</Text></View>;

  const rodape = (
    <View style={estilos.rodape}>
      <View style={estilos.linha}><Text style={{ fontSize: 16 }}>Total</Text><Text style={{ fontSize: 20, fontWeight: '800', color: cores.principal }}>{formatarPreco(total)}</Text></View>
      <TextInput style={estilos.entrada} placeholder="Endereço de entrega" maxLength={255} value={endereco} onChangeText={setEndereco} />
      <TextInput style={estilos.entrada} placeholder="Telefone (ex.: 923 000 000)" keyboardType="phone-pad" maxLength={30} value={telefone} onChangeText={setTelefone} />
      <Text style={{ fontWeight: '700', marginTop: 4 }}>Forma de pagamento</Text>
      {METODOS_PAGAMENTO.map((m) => (
        <Pressable key={m.id} onPress={() => setMetodo(m.id)} style={[estilos.metodo, metodo === m.id && estilos.metodoAtivo]}>
          <View style={[estilos.radio, metodo === m.id && estilos.radioAtivo]} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700' }}>{m.nome}</Text>
            <Text style={{ color: '#666', fontSize: 12 }}>{m.descricao}</Text>
          </View>
        </Pressable>
      ))}
      <Pressable style={[estilos.botao, aEnviar && { opacity: 0.5 }]} onPress={finalizar} disabled={aEnviar}>
        <Text style={estilos.botaoTexto}>{sessao ? 'Finalizar compra' : 'Entrar para comprar'}</Text>
      </Pressable>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: cores.fundo }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        data={carrinho}
        keyExtractor={(i) => `${i.produtoId}-${i.modelo}`}
        ListFooterComponent={rodape}
        renderItem={({ item }) => (
          <View style={estilos.item}>
            <Image source={{ uri: item.imagem }} style={estilos.imagem} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700' }}>{item.titulo}</Text>
              {item.modelo ? <Text style={{ color: '#666' }}>{item.modelo}</Text> : null}
              <Text style={{ color: cores.principal, fontWeight: '700' }}>{formatarPreco(item.preco * item.quantidade)}</Text>
            </View>
            <View style={estilos.quantidade}>
              <Pressable onPress={() => alterarQuantidade(item, -1)}><Text style={estilos.mais}>−</Text></Pressable>
              <Text style={{ fontWeight: '700' }}>{item.quantidade}</Text>
              <Pressable onPress={() => alterarQuantidade(item, 1)}><Text style={estilos.mais}>+</Text></Pressable>
            </View>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  conteudo: { padding: 12, width: '100%', maxWidth: 720, alignSelf: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: cores.borda },
  imagem: { width: 70, height: 70, marginRight: 10, backgroundColor: cores.painel, borderRadius: 10 },
  quantidade: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: cores.borda, borderRadius: 10 },
  mais: { fontSize: 20, paddingHorizontal: 10, color: cores.principal },
  rodape: { backgroundColor: '#fff', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: cores.borda, marginTop: 4 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entrada: { borderWidth: 1, borderColor: cores.borda, borderRadius: 10, padding: 10, marginVertical: 6, fontSize: 16 },
  metodo: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderColor: cores.borda, borderRadius: 12, padding: 12, marginTop: 8 },
  metodoAtivo: { borderColor: cores.principal, backgroundColor: cores.principalClaro },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#aaa' },
  radioAtivo: { borderColor: cores.principal, backgroundColor: cores.principal },
  botao: { backgroundColor: cores.principal, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
