import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const OURO = '#F2A900';
const CINZA = '#D3DFE1';

// Mostra uma avaliação (0 a 5, aceita decimais) como estrelas.
export function Estrelas({ valor = 0, tamanho = 16 }) {
  return (
    <View style={{ flexDirection: 'row' }} accessibilityLabel={`${Number(valor).toFixed(1)} de 5 estrelas`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const preenchido = Math.max(0, Math.min(1, Number(valor) - i));
        const estilo = { width: tamanho, fontSize: tamanho, lineHeight: tamanho * 1.15, textAlign: 'center' };
        return (
          <View key={i} style={{ width: tamanho, height: tamanho * 1.15 }}>
            <Text style={[estilo, { color: CINZA }]}>★</Text>
            <View style={{ position: 'absolute', left: 0, top: 0, width: preenchido * tamanho, overflow: 'hidden' }}>
              <Text style={[estilo, { color: OURO }]}>★</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Estrelas tocáveis para o cliente escolher a nota.
export function EstrelasEntrada({ valor, aoMudar }) {
  return (
    <View style={estilos.linha}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => aoMudar(n)} hitSlop={6} accessibilityLabel={`${n} estrelas`}>
          <Text style={[estilos.estrela, { color: n <= valor ? OURO : CINZA }]}>★</Text>
        </Pressable>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', gap: 6 },
  estrela: { fontSize: 38 },
});
