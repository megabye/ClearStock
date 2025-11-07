import React, { useEffect, useState } from 'react'; 
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as banco from './sql/banco';
import { View, ActivityIndicator } from 'react-native'; 

import HomeScreen from './screens/home';
import ProdutosScreen from './screens/products';
import ClientesScreen from './screens/clientes';
import RelatoriosScreen from './screens/relatorios';
import VendasScreen from './screens/vendas';
import Config from './screens/config';
import AddProduct from './screens/modal_add_product';
import EditProduct from './screens/modal_edit_product';
import View_Products from './screens/product_view';

const Stack = createStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  
  useEffect(() => {
    async function initializeDatabase() {
      try {
        
        await banco.createTable();
        console.log("Banco de dados pronto.");
      } catch (e) {
        console.error("Erro ao inicializar banco de dados:", e);
      } finally {
        setDbInitialized(true);
      }
    }
    
    initializeDatabase();
  }, []); 
  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Group>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Produtos" component={ProdutosScreen} />
          <Stack.Screen name="Clientes" component={ClientesScreen} />
          <Stack.Screen name="Relatórios" component={RelatoriosScreen} />
          <Stack.Screen name="Vendas" component={VendasScreen} />
          <Stack.Screen name="Configurações" component={Config} />
        </Stack.Group>
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="Novo Produto" component={AddProduct} options={{ headerShown: false }} />
          <Stack.Screen name="Editar Produto" component={EditProduct} options={{ headerShown: false }} />
          <Stack.Screen name="Ver Produto" component={View_Products} options={{ headerShown: false }} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}