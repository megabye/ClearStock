import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ButtonWI } from '../../components/button_w_i';
import * as banco from '../../sql/banco';

export default function View_Venda({ navigation }) {
  const route = useRoute();
  const id_from_venda = route.params?.vendaId;

  const [venda, setVenda] = useState(null);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega dados da venda
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const dadosVenda = await banco.getOneVenda(id_from_venda);
      const dadosItens = await banco.getItensByVenda(id_from_venda);
      if (dadosVenda.length > 0) {
        setVenda(dadosVenda[0]);
      }
      setItens(dadosItens);
    } catch (error) {
      console.error('Erro ao carregar venda:', error);
      Alert.alert('Erro', 'Não foi possível carregar a venda.');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const data = new Date(dataStr);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Deletar com devolução de estoque (Segurança de dados)
  const deleteVenda = async (id_venda) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza? O estoque dos produtos será devolvido.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Devolver estoque
              for (const item of itens) {
                const prodRow = await banco.getOneProduct(item.id_produto);
                const prodDoBanco =
                  Array.isArray(prodRow) && prodRow.length > 0
                    ? prodRow[0]
                    : null;

                if (prodDoBanco) {
                  const qtdParaDevolver = parseInt(item.quantidade) || 0;
                  const estoqueAtual = prodDoBanco.quantidade_estoque || 0;
                  await banco.updateStorage(
                    estoqueAtual + qtdParaDevolver,
                    item.id_produto
                  );
                }
              }

              // 2. Deletar registros
              await banco.deleteItemsByVenda(id_venda);
              await banco.deleteVenda(id_venda);

              Alert.alert('Sucesso!', 'Venda excluída e estoque estornado.', [
                { text: 'Voltar', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Erro ao deletar venda:', error);
              Alert.alert('Erro', 'Não foi possível excluir a venda.');
            }
          },
        },
      ]
    );
  };

  // Componente visual para o Status (Badge)
  const StatusBadge = ({ pago }) => {
    const isPago = pago === 'Sim';
    return (
      <View
        style={[
          localStyles.badge,
          { backgroundColor: isPago ? '#e8f5e9' : '#ffebee' },
        ]}>
        <Feather
          name={isPago ? 'check-circle' : 'alert-circle'}
          size={16}
          color={isPago ? '#2e7d32' : '#c62828'}
        />
        <Text
          style={[
            localStyles.badgeText,
            { color: isPago ? '#2e7d32' : '#c62828' },
          ]}>
          {isPago ? 'PAGO' : 'PENDENTE'}
        </Text>
      </View>
    );
  };

  if (loading || !venda) {
    return (
      <View style={localStyles.center}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={{ marginTop: 10, color: '#666' }}>
          Carregando detalhes...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* CABEÇALHO */}
        <View style={localStyles.headerContainer}>
          <View>
            <Text style={localStyles.headerTitle}>Venda #{venda.id_venda}</Text>
            <Text style={localStyles.headerDate}>
              {formatarData(venda.data_venda)}
            </Text>
          </View>
          <StatusBadge pago={venda.pago} />
        </View>

        {/* CARTÃO DE INFORMAÇÕES */}
        <View style={localStyles.card}>
          <Text style={localStyles.sectionLabel}>DADOS DO CLIENTE</Text>

          <View style={localStyles.infoRow}>
            <View style={localStyles.iconBox}>
              <Feather name="user" size={20} color="#1976d2" />
            </View>
            <View>
              <Text style={localStyles.infoValue}>{venda.nome_cliente}</Text>
              <Text style={localStyles.infoLabel}>Cliente</Text>
            </View>
          </View>

          <View style={localStyles.separator} />

          <View style={localStyles.infoRow}>
            <View style={localStyles.iconBox}>
              <Feather name="phone" size={20} color="#1976d2" />
            </View>
            <View>
              <Text style={localStyles.infoValue}>
                {venda.telefone_cliente || 'Não informado'}
              </Text>
              <Text style={localStyles.infoLabel}>Telefone</Text>
            </View>
          </View>

          <View style={localStyles.separator} />

          <View style={localStyles.infoRow}>
            <View style={localStyles.iconBox}>
              <Feather name="credit-card" size={20} color="#1976d2" />
            </View>
            <View>
              <Text style={localStyles.infoValue}>
                {venda.metodo_pagamento || 'Não informado'}
              </Text>
              <Text style={localStyles.infoLabel}>Método de Pagamento</Text>
            </View>
          </View>
        </View>

        {/* LISTA DE ITENS (Estilo Cupom Fiscal) */}
        <View style={[localStyles.card, { paddingVertical: 0 }]}>
          <View style={{ padding: 16, paddingBottom: 8 }}>
            <Text style={localStyles.sectionLabel}>RESUMO DO PEDIDO</Text>
          </View>

          {itens.map((item, index) => (
            <View key={index} style={localStyles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={localStyles.itemNome}>{item.nome_produto}</Text>
                <Text style={localStyles.itemQtd}>
                  {item.quantidade} un x R$ {item.preco_unitario.toFixed(2)}
                </Text>
              </View>
              <Text style={localStyles.itemTotal}>
                R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
              </Text>
            </View>
          ))}

          {/* TOTAL */}
          <View style={localStyles.totalContainer}>
            <Text style={localStyles.totalLabel}>TOTAL GERAL</Text>
            <Text style={localStyles.totalValue}>
              R$ {venda.valor_total.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>

        {/* BOTÕES DE AÇÃO */}
        <View style={localStyles.actionsContainer}>
          <ButtonWI
            title="Editar"
            iconName="edit-3"
            onPress={() =>
              navigation.navigate('Editar Venda', { vendaId: venda.id_venda })
            }
            styleButton={{ flex: 1, marginRight: 8 }}
          />
          <ButtonWI
            title="Excluir"
            iconName="trash-2"
            color="#fff"
            onPress={() => deleteVenda(venda.id_venda)}
            styleButton={{
              flex: 1,
              marginLeft: 8,
              backgroundColor: '#ffebee',
              borderWidth: 1,
              borderColor: '#ffcdd2',
            }}
            textStyle={{ color: '#c62828' }} // Texto vermelho para perigo
            iconColor="#c62828"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1976d2',
  },
  headerDate: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // Sombra suave
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9e9e9e',
    marginBottom: 12,
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoLabel: {
    fontSize: 13,
    color: '#757575',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
    marginLeft: 52, // Alinhado com o texto, pulando o ícone
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  itemNome: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  itemQtd: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  totalContainer: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2e7d32',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
});
