import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FAB } from '@rneui/themed';
import styles from '../../components/css';
import * as banco from '../../sql/banco';

const formatPrice = (priceFloat) => {
  if (priceFloat === null || priceFloat === undefined) return 'R$ 0,00';
  return priceFloat.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
};

const VendaItem = ({ item, navigation }) => (
  <TouchableOpacity
    style={localStyles.itemContainer}
    activeOpacity={0.6}
    onPress={() =>
      navigation.navigate('Ver Venda', { vendaId: item.id_venda })
    }>
    <View style={localStyles.itemHeader}>
      <Text style={localStyles.itemTitle}>Venda #{item.id_venda}</Text>
      <Text style={localStyles.itemPrice}>{formatPrice(item.valor_total)}</Text>
    </View>

    <Text style={localStyles.itemDescription}>
      Cliente: {item.nome_cliente || 'Não informado'}
    </Text>

    <Text style={localStyles.itemInfo}>
      Data: {formatDate(item.data_venda)} • Pago: {item.pago}
    </Text>
  </TouchableOpacity>
);

export default function VendasScreen({ navigation }) {
  const [visible, setVisible] = useState(true);
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const allVendas = await banco.getVendasComCliente();
      setVendas(allVendas);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={localStyles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando vendas...</Text>
      </View>
    );
  }

  return (
    <View style={localStyles.list}>
      <FlatList
        data={vendas}
        renderItem={({ item }) => (
          <VendaItem item={item} navigation={navigation} />
        )}
        keyExtractor={(item) => item.id_venda.toString()}
        ListEmptyComponent={
          <Text style={localStyles.emptyText}>Nenhuma venda registrada.</Text>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <FAB
        visible={visible}
        icon={{ name: 'add', color: 'white' }}
        style={styles.fab}
        color="#007bff"
        onPress={() => navigation.navigate('Nova Venda')}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingVertical: 5,
  },
  itemContainer: {
    padding: 16,
    backgroundColor: '#fff',
    margin: 5,
    borderRadius: 10,
    marginHorizontal: 10,
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
    marginBottom: 5,
  },
  itemInfo: {
    fontSize: 13,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});
