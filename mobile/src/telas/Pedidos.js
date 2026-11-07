import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { pedir, formatarPreco } from '../api';
import { cores } from '../tema';
import { useLoja } from '../contexto/LojaContexto';

const COR_ESTADO = {
  pendente: { backgroundColor: cores.solClaro, color: cores.solTexto },
  pago: { backgroundColor: cores.principalClaro, color: cores.principalEscuro },
  enviado: { backgroundColor: cores.azulClaro, color: cores.azul },
  entregue: { backgroundColor: cores.verdeClaro, color: '#0D5A38' },
  cancelado: { backgroundColor: cores.coralClaro, color: '#8D2412' },
};
const NOMES_ESTADO = { pendente: 'Pendente', pago: 'Pago', enviado: 'Enviado', entregue: 'Entregue', cancelado: 'Cancelado' };

export default function Pedidos() {
  const { sessao, setSessao } = useLoja();
  const [pedidos, setPedidos] = useState(null);
  const [erro, setErro] = useState('');

  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(() => {
    if (!sessao) return Promise.resolve();
    return pedir('/pedidos', { token: sessao.token })
      .then((lista) => { setPedidos(lista); setErro(''); })
      .catch((e) => setErro(e.message));
  }, [sessao]);

  // Recarrega sempre que o ecrã fica visível (o estado do pedido pode ter mudado)
  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const atualizar = async () => { setAtualizando(true); await carregar(); setAtualizando(false); };

  if (!sessao) return <View style={estilos.centro}><Text>Inicie sessão para ver os seus pedidos.</Text></View>;
  if (!pedidos && !erro) return <ActivityIndicator style={{ marginTop: 40 }} color={cores.principal} />;

  return (
    <FlatList
      style={{ backgroundColor: cores.fundo }}
      contentContainerStyle={estilos.conteudo}
      data={pedidos || []}
      refreshing={atualizando}
      onRefresh={atualizar}
      keyExtractor={(p) => String(p.id)}
      ListHeaderComponent={
        <View style={estilos.topo}>
          <Text style={{ fontWeight: '700' }}>Olá, {sessao.usuario.nome}</Text>
          <Pressable onPress={() => setSessao(null)}><Text style={{ color: cores.principal, fontWeight: '700' }}>Sair</Text></Pressable>
        </View>
      }
      ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30 }}>{erro || 'Ainda não fez nenhum pedido.'}</Text>}
      renderItem={({ item }) => (
        <View style={estilos.pedido}>
          <View style={estilos.linha}><Text style={{ fontWeight: '800' }}>Pedido #{item.id}</Text><Text style={[estilos.estado, COR_ESTADO[item.estado]]}>{NOMES_ESTADO[item.estado] || item.estado}</Text></View>
          <Text style={{ color: '#666', marginVertical: 4 }}>{new Date(item.criado_em).toLocaleString('pt-PT')}</Text>
          {item.itens.map((i, k) => <Text key={k}>{i.quantidade}× {i.titulo}{i.modelo ? ` (${i.modelo})` : ''}</Text>)}
          <Text style={{ fontWeight: '800', color: cores.principal, marginTop: 6 }}>Total: {formatarPreco(item.total)}</Text>
          <View style={[estilos.pagamento, item.estado === 'pendente' && estilos.pagamentoPendente]}>
            <Text style={{ fontWeight: '700' }}>{item.metodoNome}</Text>
            {item.referencia ? <Text style={{ marginTop: 4 }}>Entidade <Text style={{ fontWeight: '700' }}>{item.entidade}</Text>  ·  Referência <Text style={{ fontWeight: '700' }}>{item.referencia}</Text></Text> : null}
            {item.estado === 'pendente' ? <Text style={{ marginTop: 4 }}>{item.instrucoes}</Text> : null}
            {item.estado === 'pago' ? <Text style={{ marginTop: 4 }}>Pagamento confirmado. Obrigado!</Text> : null}
          </View>
        </View>
      )}
    />
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  conteudo: { padding: 12, width: '100%', maxWidth: 720, alignSelf: 'center' },
  topo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  pedido: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: cores.borda },
  linha: { flexDirection: 'row', justifyContent: 'space-between' },
  estado: { paddingHorizontal: 12, paddingVertical: 3, borderRadius: 999, overflow: 'hidden', fontWeight: '700', fontSize: 12 },
  pagamento: { backgroundColor: cores.fundo, borderRadius: 10, padding: 10, marginTop: 10 },
  pagamentoPendente: { backgroundColor: cores.solClaro, borderWidth: 1, borderColor: '#F0D27A' },
});
