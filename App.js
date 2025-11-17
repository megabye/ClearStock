import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, 
DrawerItem } from '@react-navigation/drawer';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as banco from './sql/banco';

// Telas principais
import ProdutosScreen from './screens/products/products';
import ClientesScreen from './screens/clientes/clientes';
import VendasScreen from './screens/vendas/vendas';

// Modais
import AddProduct from './screens/products/modal_add_product';
import EditProduct from './screens/products/modal_edit_product';
import View_Products from './screens/products/product_view';

import AddCliente from './screens/clientes/modal_add_cliente';
import EditCliente from './screens/clientes/modal_edit_cliente';
import ViewCliente from './screens/clientes/cliente_view';

import AddVenda from './screens/vendas/modal_add_venda';
import EditVenda from './screens/vendas/modal_edit_venda';
import ViewVenda from './screens/vendas/venda_view';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();


function HeaderWithMenu({ navigation, title = 'Painel' }) {
  return (
    <SafeAreaView style={{ backgroundColor: '#fff' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 15,
          paddingHorizontal: 15,
        }}
      >
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <FontAwesome5 name="bars" size={22} color="#007AFF" />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <FontAwesome5 name="store" size={20} color="#007AFF" />
        </View>

        <View style={{ width: 22 }} />
      </View>
    </SafeAreaView>
  );
}


function MainTabs({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <HeaderWithMenu navigation={navigation} />

      <Tab.Navigator
        initialRouteName="Vendas"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          tabBarLabelPosition: 'below-icon', 
          tabBarShowLabel: true, 
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center', 
            height: '100%',
            flex: 1
          },
          tabBarIconStyle: {
            justifyContent: 'center',
            alignItems: 'center', 
            flex: 1
          },
          tabBarLabelStyle: {
            marginTop: -10, 
            fontSize: 12, 
          },
          tabBarStyle: {
            position: 'absolute',
            bottom: 25,
            left: 20,
            right: 20,
            height: 75,
            borderRadius: 40,
            marginHorizontal: 20,
            paddingTop: 5,
            paddingBottom: 15,
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 6,
            elevation: 5, 
          },
          tabBarIcon: ({ color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Vendas':
                iconName = 'shopping-cart';
                break;
              case 'Produtos':
                iconName = 'boxes';
                break;
              case 'Clientes':
                iconName = 'users';
                break;
              case 'Relatórios':
                iconName = 'chart-bar';
                break;
              default:
                iconName = 'circle';
            }
            return <FontAwesome5 name={iconName} size={20} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Vendas" component={VendasScreen} />
        <Tab.Screen name="Produtos" component={ProdutosScreen} />
        <Tab.Screen name="Clientes" component={ClientesScreen} />
      </Tab.Navigator>
    </View>
  );
}

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: '#ddd',
          marginTop: 10,
          paddingTop: 5,
        }}
      />

      <DrawerItem
        label="Sair"
        labelStyle={{ color: '#E53935', fontWeight: '600' }}
        icon={({ size }) => (
          <FontAwesome5 name="door-open" size={size} color="#E53935" />
        )}
        onPress={() => {
          console.log('Usuário saiu');
        }}
      />
    </DrawerContentScrollView>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#007AFF',
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      <Drawer.Screen
        name="Principal"
        component={MainTabs}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesome5 name="th-large" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    async function initializeDatabase() {
      try {
        await banco.createTable();
        console.log('Banco de dados pronto.');
      } catch (e) {
        console.error('Erro ao inicializar banco de dados:', e);
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
      <Stack.Navigator>
        <Stack.Screen
          name="MainDrawer"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />

        <Stack.Group screenOptions={{ presentation: 'modal', animation: 'slide_from_right'}}>
          <Stack.Screen name="Novo Produto" component={AddProduct} options={{ headerShown: false }} />
          <Stack.Screen name="Editar Produto" component={EditProduct} options={{ headerShown: false }} />
          <Stack.Screen name="Ver Produto" component={View_Products} options={{ headerShown: false }} />

          <Stack.Screen name="Novo Cliente" component={AddCliente} options={{ headerShown: false }} />
          <Stack.Screen name="Editar Cliente" component={EditCliente} options={{ headerShown: false }} />
          <Stack.Screen name="Ver Cliente" component={ViewCliente} options={{ headerShown: false }} />

          <Stack.Screen name="Nova Venda" component={AddVenda} options={{ headerShown: false }} />
          <Stack.Screen name="Editar Venda" component={EditVenda} options={{ headerShown: false }} />
          <Stack.Screen name="Ver Venda" component={ViewVenda} options={{ headerShown: false }} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
    
  );
}
