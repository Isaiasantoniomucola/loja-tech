import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProvedorLoja } from './src/contexto/LojaContexto';
import Intro from './src/telas/Intro';
import Inicio from './src/telas/Inicio';
import Produto from './src/telas/Produto';
import Carrinho from './src/telas/Carrinho';
import Entrar from './src/telas/Entrar';
import Pedidos from './src/telas/Pedidos';
import { cores } from './src/tema';

const Pilha = createNativeStackNavigator();

export default function App() {
  return (
    <ProvedorLoja>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Pilha.Navigator screenOptions={{ headerTintColor: cores.escuro, headerShadowVisible: false, headerStyle: { backgroundColor: '#fff' }, headerTitleStyle: { fontWeight: '800' }, contentStyle: { backgroundColor: cores.fundo } }}>
          <Pilha.Screen name="Intro" component={Intro} options={{ headerShown: false }} />
          <Pilha.Screen name="Inicio" component={Inicio} options={{ title: 'Loja Tech', headerBackVisible: false }} />
          <Pilha.Screen name="Produto" component={Produto} options={{ title: 'Detalhes' }} />
          <Pilha.Screen name="Carrinho" component={Carrinho} options={{ title: 'Carrinho' }} />
          <Pilha.Screen name="Entrar" component={Entrar} options={{ title: 'Conta' }} />
          <Pilha.Screen name="Pedidos" component={Pedidos} options={{ title: 'Os meus pedidos' }} />
        </Pilha.Navigator>
      </NavigationContainer>
    </ProvedorLoja>
  );
}
