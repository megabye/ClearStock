import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import * as banco from '../../sql/banco';
import { Feather } from '@expo/vector-icons';
import { ButtonWI } from '../../components/button_w_i';

export default function EditVenda({ navigation }) {
  const route = useRoute();
  const id_venda = route.params?.vendaId;

  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clienteFiltro, setClienteFiltro] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [pago, setPago] = useState('Não');
  const [metodoPagamento, setMetodoPagamento] = useState('');
  const [filtro, setFiltro] = useState('');
  const [itens, setItens] = useState([]);
  const [itensOriginais, setItensOriginais] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [c, p] = await Promise.all([
          banco.getClientes(),
          banco.getProducts(),
        ]);
        setClientes(c);
        setProdutos(p);

        const vendaRows = await banco.getOneVenda(id_venda);
        const venda =
          Array.isArray(vendaRows) && vendaRows.length > 0
            ? vendaRows[0]
            : null;

        if (!venda) {
          Alert.alert('Erro', 'Venda não encontrada.');
          navigation.goBack();
          return;
        }

        setPago(venda.pago || 'Não');
        setMetodoPagamento(venda.metodo_pagamento || '');

        const cli = c.find((x) => x.id_cliente == venda.id_cliente) || null;
        setClienteSelecionado(cli);

        const itensRows = await banco.getItensByVenda(id_venda);
        const itensFormatados = itensRows.map((it) => {
          const prodNoBanco = p.find((pp) => pp.id_produto == it.id_produto);
          const estoqueAtualBanco = prodNoBanco
            ? prodNoBanco.quantidade_estoque
            : 0;
          const qtdNaVenda = parseInt(it.quantidade) || 0;

          return {
            id_produto: it.id_produto,
            nome_produto:
              it.nome_produto || (prodNoBanco ? prodNoBanco.nome_produto : ''),
            quantidade: String(it.quantidade),
            estoque_maximo: estoqueAtualBanco + qtdNaVenda,
          };
        });

        setItens(itensFormatados);
        setItensOriginais(
          itensRows.map((it) => ({
            ...it,
            quantidade: parseInt(it.quantidade),
          }))
        );
      } catch (error) {
        console.error('Erro load EditVenda:', error);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id_venda]);

  useEffect(() => {
    let total = 0;
    itens.forEach((item) => {
      const prod = produtos.find((p) => p.id_produto == item.id_produto);
      if (prod) total += prod.preco_atual * (parseInt(item.quantidade) || 0);
    });
    setValorTotal(total);
  }, [itens, produtos]);

  const removerItem = (index) => {
    const nova = [...itens];
    nova.splice(index, 1);
    setItens(nova);
  };

  const onSave = async () => {
    try {
      if (!clienteSelecionado)
        return Alert.alert('Erro', 'Selecione um cliente.');
      if (itens.length === 0) return Alert.alert('Erro', 'Adicione produtos.');

      let estoqueLocal = {};
      produtos.forEach(
        (p) => (estoqueLocal[p.id_produto] = p.quantidade_estoque)
      );

      for (const orig of itensOriginais) {
        const id = orig.id_produto;
        const prodRow = await banco.getOneProduct(id);
        const prod = prodRow && prodRow.length ? prodRow[0] : null;
        const est = prod ? prod.quantidade_estoque : estoqueLocal[id] || 0;
        const novo = est + (parseInt(orig.quantidade) || 0);
        await banco.updateStorage(novo, id);
        estoqueLocal[id] = novo;
      }

      const dataAtual = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await banco.updateVenda(
        id_venda,
        dataAtual,
        valorTotal,
        pago,
        metodoPagamento,
        clienteSelecionado.id_cliente
      );
      await banco.deleteItemsByVenda(id_venda);

      for (const it of itens) {
        const id = it.id_produto;
        const q = parseInt(it.quantidade) || 0;
        const prodInfo = produtos.find((p) => p.id_produto == id);
        if (!prodInfo) continue;

        await banco.insertItemVenda(id_venda, id, q, prodInfo.preco_atual);

        const row = await banco.getOneProduct(id); // Pega fresco do banco após reversão
        const atualBanco = row[0].quantidade_estoque;
        await banco.updateStorage(atualBanco - q, id);
      }

      Alert.alert('Sucesso', 'Venda atualizada.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Erro', 'Falha ao salvar.');
    }
  };

  const handleDeleteVenda = () => {
    Alert.alert('Confirmar', 'Deletar venda e devolver estoque?', [
      { text: 'Cancelar' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          for (const orig of itensOriginais) {
            const r = await banco.getOneProduct(orig.id_produto);
            if (r[0])
              await banco.updateStorage(
                r[0].quantidade_estoque + orig.quantidade,
                orig.id_produto
              );
          }
          await banco.deleteItemsByVenda(id_venda);
          await banco.deleteVenda(id_venda);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading)
    return (
      <ActivityIndicator size="large" style={{ flex: 1 }} color="#1976d2" />
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={{ marginBottom: 20 }}>
          <Text style={localStyles.headerTitle}>Editar Venda #{id_venda}</Text>
        </View>

        {/* CARD CLIENTE */}
        <View style={localStyles.card}>
          <View style={localStyles.cardHeader}>
            <Feather name="user" size={18} color="#1976d2" />
            <Text style={localStyles.cardTitle}>CLIENTE</Text>
          </View>
          {/* Lógica de visualização do cliente igual ao AddVenda */}
          <View style={localStyles.selectedItemBox}>
            <View>
              <Text style={localStyles.selectedLabel}>
                Cliente Selecionado:
              </Text>
              <Text style={localStyles.selectedName}>
                {clienteSelecionado?.nome}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                /* Opcional: Permitir trocar cliente */
              }}>
              <Feather name="edit-2" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* CARD PRODUTOS */}
        <View style={localStyles.card}>
          <View style={localStyles.cardHeader}>
            <Feather name="package" size={18} color="#1976d2" />
            <Text style={localStyles.cardTitle}>PRODUTOS</Text>
          </View>

          <View style={localStyles.searchContainer}>
            <Feather
              name="search"
              size={20}
              color="#999"
              style={{ marginRight: 10 }}
            />
            <TextInput
              placeholder="Adicionar mais produtos..."
              value={filtro}
              onChangeText={setFiltro}
              style={localStyles.searchInput}
              placeholderTextColor="#999"
            />
          </View>

          {filtro.length > 0 && (
            <ScrollView style={localStyles.suggestionBox} nestedScrollEnabled>
              {produtos
                .filter((p) =>
                  p.nome_produto.toLowerCase().includes(filtro.toLowerCase())
                )
                .slice(0, 10)
                .map((p) => {
                  const semEstoque = p.quantidade_estoque <= 0;
                  return (
                    <TouchableOpacity
                      key={p.id_produto}
                      disabled={semEstoque}
                      style={[
                        localStyles.suggestionItem,
                        semEstoque && { opacity: 0.5 },
                      ]}
                      onPress={() => {
                        if (!itens.some((i) => i.id_produto === p.id_produto)) {
                          setItens([
                            ...itens,
                            {
                              id_produto: p.id_produto,
                              nome_produto: p.nome_produto,
                              quantidade: '1',
                              estoque_maximo: p.quantidade_estoque,
                            },
                          ]);
                          setFiltro('');
                        }
                      }}>
                      <Text style={localStyles.suggestionText}>
                        {p.nome_produto} {semEstoque ? '(Esgotado)' : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          )}

          <View style={{ marginTop: 10 }}>
            {itens.map((item, index) => (
              <View key={index} style={localStyles.cartItem}>
                <View style={{ flex: 1 }}>
                  <Text style={localStyles.cartItemName}>
                    {item.nome_produto}
                  </Text>
                  <Text style={localStyles.cartItemStock}>
                    Max disponível: {item.estoque_maximo}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={localStyles.qtyInput}
                    keyboardType="numeric"
                    value={item.quantidade}
                    onChangeText={(text) => {
                      const qtd = parseInt(text.replace(/\D/g, '')) || 0;
                      const max = item.estoque_maximo || 9999;
                      const nova = [...itens];
                      if (qtd > max) {
                        Alert.alert('Limite', `Máximo disponível: ${max}`);
                        nova[index].quantidade = String(max);
                      } else {
                        nova[index].quantidade = text.replace(/\D/g, '');
                      }
                      setItens(nova);
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => removerItem(index)}
                    style={{ marginLeft: 12 }}>
                    <Feather name="trash-2" size={20} color="#ef5350" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        <ButtonWI title="Salvar Alterações" iconName="save" onPress={onSave} />
        <View style={{ height: 6 }} />
        <ButtonWI
          title="Deletar Venda"
          iconName="trash-2"
          onPress={handleDeleteVenda}
          style={{
            borderColor: '#ffebee',
            borderWidth: 1,
            backgroundColor: 'red',
            marginTop: 0
          }}
          textStyle={{ color: '#d32f2f' }}
          iconColor="#d32f2f"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1976d2' },
  headerSubtitle: { fontSize: 16, color: '#777', marginTop: 4 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
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
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976d2',
    marginLeft: 8,
    letterSpacing: 1,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },

  suggestionBox: {
    maxHeight: 150,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 3,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  suggestionText: { fontSize: 14, color: '#333', fontWeight: '500' },

  selectedItemBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  selectedLabel: { fontSize: 12, color: '#1976d2' },
  selectedName: { fontSize: 16, fontWeight: 'bold', color: '#0d47a1' },

  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cartItemName: { fontSize: 15, fontWeight: '600', color: '#333' },
  cartItemStock: { fontSize: 11, color: '#888' },

  qtyInput: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 10,
  },
  pickerWrapper: {
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },

  footer: { marginTop: 10, paddingBottom: 20 },
  totalValue: { fontSize: 26, fontWeight: '800', color: '#2e7d32' },
});
