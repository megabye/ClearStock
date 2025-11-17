import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { ButtonWI } from '../../components/button_w_i';
import * as banco from '../../sql/banco';

export default function View_Products({ navigation }) {
  const route = useRoute();
  const id_from_product = route.params?.productId;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantidade, setQuantidade] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const allProduct = await banco.getOneProduct(id_from_product);
      if (allProduct.length > 0) {
        setProduct(allProduct[0]);
        setQuantidade(allProduct[0].quantidade_estoque);
      }
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatestoragef = async (simbol) => {
    let qtd = quantidade;
    if (simbol === '+') qtd += 1;
    else if (simbol === '-') qtd = Math.max(qtd - 1, 0);

    setQuantidade(qtd);
    await banco.updateStorage(qtd, id_from_product);
    setProduct({ ...product, quantidade_estoque: qtd });
  };

  const deleteProduct = async (nome_produto, id_produto) => {
    Alert.alert(
      `Excluir ${nome_produto}?`,
      "Esta ação não pode ser desfeita.", 
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await banco.deletedProduct(id_produto); 
              Alert.alert( "Removido", "Produto deletado com sucesso!",
                [{ text: "OK", onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error("Erro ao deletar produto:", error);
            }
          }
        }
      ]
    );
  };

  if (loading || !product) {
    return (
      <View style={localStyles.center}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={{ marginTop: 10, color: '#666' }}>Buscando dados...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        
        <View style={{ marginBottom: 20 }}>
          <Text style={localStyles.headerTitle}>{product.nome_produto}</Text>
          <Text style={localStyles.headerSubtitle}>ID: #{product.id_produto}</Text>
        </View>

        {/* CARD DE ESTOQUE (Destaque) */}
        <View style={localStyles.card}>
            <View style={localStyles.cardHeader}>
                <Feather name="layers" size={18} color="#1976d2" />
                <Text style={localStyles.cardTitle}>GERENCIAR ESTOQUE</Text>
            </View>
            
            <View style={localStyles.stockContainer}>
                <TouchableOpacity 
                    style={[localStyles.stockBtn, { backgroundColor: '#ffebee' }]} 
                    onPress={() => updatestoragef('-')}>
                    <Feather name="minus" size={24} color="#c62828" />
                </TouchableOpacity>

                <View style={{ alignItems: 'center' }}>
                    <Text style={localStyles.stockValue}>{quantidade}</Text>
                    <Text style={localStyles.stockLabel}>Unidades</Text>
                </View>

                <TouchableOpacity 
                    style={[localStyles.stockBtn, { backgroundColor: '#e8f5e9' }]} 
                    onPress={() => updatestoragef('+')}>
                    <Feather name="plus" size={24} color="#2e7d32" />
                </TouchableOpacity>
            </View>
        </View>

        {/* CARD DE DETALHES */}
        <View style={localStyles.card}>
            <Text style={localStyles.sectionLabel}>DETALHES DO ITEM</Text>
            
            <View style={localStyles.infoRow}>
                <View style={localStyles.iconBox}>
                    <Feather name="align-left" size={20} color="#1976d2" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={localStyles.infoValue}>
                        {product.descricao || 'Sem descrição'}
                    </Text>
                    <Text style={localStyles.infoLabel}>Descrição</Text>
                </View>
            </View>

            <View style={localStyles.separator} />

            <View style={localStyles.infoRow}>
                <View style={localStyles.iconBox}>
                    <Feather name="dollar-sign" size={20} color="#1976d2" />
                </View>
                <View>
                    <Text style={[localStyles.infoValue, { color: '#2e7d32' }]}>
                         R$ {product.preco_atual.toFixed(2).replace('.', ',')}
                    </Text>
                    <Text style={localStyles.infoLabel}>Preço Unitário</Text>
                </View>
            </View>
        </View>

        {/* AÇÕES */}
        <View style={localStyles.actionsContainer}>
             <ButtonWI 
                title="Editar" 
                iconName="edit-3" 
                onPress={() => navigation.navigate('Editar Produto', {productId: product.id_produto})}
                styleButton={{ flex: 1, marginRight: 8 }}
            />
            <ButtonWI 
                title="Excluir" 
                iconName="trash-2" 
                color="#c62828"
                onPress={() => deleteProduct(product.nome_produto, product.id_produto)}
                styleButton={{ flex: 1, marginLeft: 8, backgroundColor: '#ffebee', borderWidth: 1, borderColor: '#ef9a9a' }}
                textStyle={{ color: '#c62828' }}
                iconColor="#c62828"
            />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1976d2' },
  headerSubtitle: { fontSize: 14, color: '#777', marginTop: 4 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  cardTitle: { fontSize: 12, fontWeight: 'bold', color: '#1976d2', marginLeft: 8, letterSpacing: 1 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#9e9e9e', marginBottom: 12, letterSpacing: 1 },

  stockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
  },
  stockBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  stockValue: { fontSize: 36, fontWeight: 'bold', color: '#333' },
  stockLabel: { fontSize: 12, color: '#777', textTransform: 'uppercase' },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoValue: { fontSize: 16, fontWeight: '600', color: '#333' },
  infoLabel: { fontSize: 13, color: '#757575' },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12, marginLeft: 52 },

  actionsContainer: { flexDirection: 'row', marginTop: 10 },
});