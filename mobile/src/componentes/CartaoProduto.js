import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../tema';
import { formatarPreco } from '../api';
import { Estrelas } from './Estrelas';

export default function CartaoProduto({ produto, aoAbrir, colunas = 2 }) {
  return (
    <Pressable
      style={({ pressed }) => [estilos.cartao, { maxWidth: `${100 / colunas}%` }, pressed && { borderColor: cores.principal }]}
      onPress={aoAbrir}
      accessibilityRole="button"
      accessibilityLabel={`${produto.titulo}, ${formatarPreco(produto.preco)}`}
    >
      <View style={estilos.painel}>
        <Image source={{ uri: produto.imagens[0] }} style={estilos.imagem} resizeMode="contain" />
      </View>
      <View style={estilos.corpo}>
        <Text style={estilos.titulo} numberOfLines={2}>{produto.titulo}</Text>
        <View style={estilos.avaliacao}>
          <Estrelas valor={produto.avaliacao} tamanho={13} />
          <Text style={estilos.nota}>{produto.avaliacao.toFixed(1)}{produto.totalAvaliacoes > 0 ? ` (${produto.totalAvaliacoes})` : ''}</Text>
        </View>
        <Text style={estilos.preco}>{formatarPreco(produto.preco)}</Text>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: { flex: 1, backgroundColor: cores.branco, borderRadius: 14, margin: 6, borderWidth: 1, borderColor: cores.borda, overflow: 'hidden' },
  painel: { backgroundColor: cores.painel, padding: 12 },
  imagem: { width: '100%', height: 110 },
  corpo: { padding: 12, gap: 4 },
  titulo: { fontWeight: '700', fontSize: 14, color: cores.escuro, minHeight: 36 },
  avaliacao: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nota: { color: cores.suave, fontSize: 12 },
  preco: { color: cores.escuro, fontWeight: '800', fontSize: 17, marginTop: 2 },
});
