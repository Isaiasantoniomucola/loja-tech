import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { cores } from '../tema';

const METODOS = ['Multicaixa Express', 'Multicaixa (caixa automático ou TPA)', 'Pagamento presencial'];

export default function Intro({ navigation }) {
  return (
    <ScrollView style={{ backgroundColor: cores.mare }} contentContainerStyle={estilos.tela}>
      <View style={estilos.conteudo}>
        <View style={estilos.marca}><Text style={estilos.marcaEmoji}>🏷️</Text></View>
        <Text style={estilos.nome}>Loja Tech</Text>
        <Text style={estilos.titulo}>Tecnologia ao seu alcance, paga como preferir.</Text>
        <Text style={estilos.texto}>Computadores, telemóveis, consolas e muito mais, com preços em Kwanzas.</Text>

        <View style={estilos.caixa}>
          <Text style={estilos.caixaTitulo}>Como pagar</Text>
          {METODOS.map((m) => <Text key={m} style={estilos.caixaItem}>•  {m}</Text>)}
        </View>

        <Pressable style={estilos.botao} onPress={() => navigation.replace('Inicio')} accessibilityRole="button">
          <Text style={estilos.botaoTexto}>Começar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  conteudo: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  marca: { width: 64, height: 64, borderRadius: 18, backgroundColor: cores.principal, alignItems: 'center', justifyContent: 'center' },
  marcaEmoji: { fontSize: 32 },
  nome: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 14 },
  titulo: { color: '#fff', fontSize: 34, fontWeight: '800', lineHeight: 38, marginTop: 28 },
  texto: { color: '#B9D3D7', fontSize: 16, lineHeight: 23, marginTop: 14 },
  caixa: { marginTop: 28, padding: 16, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)' },
  caixaTitulo: { color: '#fff', fontWeight: '700', marginBottom: 8 },
  caixaItem: { color: '#B9D3D7', fontSize: 15, lineHeight: 24 },
  botao: { backgroundColor: cores.sol, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 28 },
  botaoTexto: { color: '#2B1D00', fontWeight: '800', fontSize: 16 },
});
