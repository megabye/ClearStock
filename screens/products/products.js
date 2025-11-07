import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import styles from '../../components/css'; 
import { FAB } from '@rneui/themed';
import * as banco from '../../sql/banco'; 

const formatPrice = (priceFloat) => {
  if (priceFloat === null || priceFloat === undefined) return 'R$ 0,00';
  return priceFloat.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const ProductItem = ({ item, navigation }) => (
  <TouchableOpacity
    style={localStyles.itemContainer}
    activeOpacity={0.5}
    onPress={() => navigation.navigate('Ver Produto', { productId: item.id_produto })}
  >
    <View style={localStyles.itemHeader}>
      <Text style={localStyles.itemTitle}>{item.nome_produto}</Text>
      <Text style={localStyles.itemPrice}>{formatPrice(item.preco_atual)}</Text>
    </View>
    <Text style={localStyles.itemDescription}>{item.descricao}</Text>
    <Text style={localStyles.itemStock}>Estoque: {item.quantidade_estoque}</Text>
  </TouchableOpacity>
);

export default function ProdutosScreen({ navigation }) {
  const [visible, setVisible] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const allProducts = await banco.getProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error("Erro ao carregar produtos na tela:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={localStyles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando produtos...</Text>
      </View>
    );
  }

  return (
    <View style={localStyles.list}> 
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductItem item={item} navigation={navigation} />}
        keyExtractor={(item) => item.id_produto.toString()}
        ListEmptyComponent={<Text style={localStyles.emptyText}>Nenhum produto cadastrado.</Text>}
        contentContainerStyle={{ paddingBottom: 80 }} 
      />

      <FAB
        visible={visible}
        icon={{ name: 'add', color: 'white' }}
        style={styles.fab} 
        onPress={() => navigation.navigate('Novo Produto')}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  itemContainer: {
    padding: 16,
    backgroundColor: '#fff',
    margin: 5,
    borderRadius: 5,
  },
  list: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingVertical: 5,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemStock: {
    fontSize: 14,
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});
