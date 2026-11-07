import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { pedir } from '../api';
import { cores } from '../tema';
import { useLoja } from '../contexto/LojaContexto';

export default function Entrar({ navigation }) {
  const { setSessao } = useLoja();
  const [modoRegisto, setModoRegisto] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const enviar = async () => {
    try {
      const dados = modoRegisto
        ? await pedir('/auth/registo', { metodo: 'POST', corpo: { nome, email, senha } })
        : await pedir('/auth/entrar', { metodo: 'POST', corpo: { email, senha } });
      setSessao(dados);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  };

  return (
    <View style={estilos.tela}>
      <Text style={estilos.titulo}>{modoRegisto ? 'Criar conta' : 'Entrar'}</Text>
      {modoRegisto && <TextInput style={estilos.entrada} placeholder="Nome completo" value={nome} onChangeText={setNome} />}
      <TextInput style={estilos.entrada} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={estilos.entrada} placeholder="Senha (mínimo 6 caracteres)" secureTextEntry value={senha} onChangeText={setSenha} />
      <Pressable style={estilos.botao} onPress={enviar}>
        <Text style={estilos.botaoTexto}>{modoRegisto ? 'Criar conta' : 'Entrar'}</Text>
      </Pressable>
      <Pressable onPress={() => setModoRegisto(!modoRegisto)}>
        <Text style={estilos.alternar}>{modoRegisto ? 'Já tenho conta. Entrar' : 'Ainda não tenho conta. Criar conta'}</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center', width: '100%', maxWidth: 480, alignSelf: 'center' },
  titulo: { fontSize: 26, fontWeight: '800', marginBottom: 20 },
  entrada: { borderWidth: 1, borderColor: cores.borda, borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 16 },
  botao: { backgroundColor: cores.principal, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 6 },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
  alternar: { color: cores.principal, textAlign: 'center', marginTop: 18, fontWeight: '600' },
});
