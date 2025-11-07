import React from 'react';
import { View, Text, Alert } from 'react-native';
import { MyButton } from '../components/button';
import * as banco from '../sql/banco';
import styles from '../components/css';

export default function HomeScreen({ navigation }) {

  return (
    <View style={styles.container_home}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>ClearStock</Text>
        <Text style={styles.subtitle}>Bem-vindo(a)!</Text>
      </View>

      <View style={styles.grid}>
        <MyButton title="Produtos" iconName="pump-soap" onPress={() => navigation.navigate('Produtos')} />
        <MyButton title="Clientes" iconName="user" onPress={() => navigation.navigate('Clientes')} />
        <MyButton title="Vendas" iconName="shopping-cart" onPress={() => navigation.navigate('Vendas')} />
        <MyButton title="Relatórios" iconName="chart-pie" onPress={() => navigation.navigate('Relatórios')} />
      
      <View style={styles.fullWidthButton}>
          <MyButton
            title="Configurações"
            iconName="cogs"
            onPress={() => navigation.navigate('Configurações')}
            style={{ width: '100%' }}
          />
        </View>
      </View>

      <Text style={styles.footer}>Versão 1.0.0</Text>
    </View>
  );
}
