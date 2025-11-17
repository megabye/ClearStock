import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import * as banco from '../../sql/banco';
import { Feather } from '@expo/vector-icons';
import { ButtonWI } from '../../components/button_w_i';

export default function AddVenda({ navigation }) {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clienteFiltro, setClienteFiltro] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const [pago, setPago] = useState('Não');
  const [valorTotal, setValorTotal] = useState(0);
  const [metodoPagamento, setMetodoPagamento] = useState('');
  const [filtro, setFiltro] = useState('');
  const [itens, setItens] = useState([]);

  const { handleSubmit, setValue } = useForm();

  useEffect(() => {
    async function loadData() {
      const c = await banco.getClientes();
      const p = await banco.getProducts();
      setClientes(c);
      setProdutos(p);
    }
    loadData();
  }, []);

  useEffect(() => {
    let total = 0;
    itens.forEach((item) => {
      const produto = produtos.find((p) => p.id_produto == item.id_produto);
      if (produto) {
        total += produto.preco_atual * (parseInt(item.quantidade) || 0);
      }
    });
    setValorTotal(total);
  }, [itens, produtos]);

  const removerItem = (index) => {
    const novaLista = [...itens];
    novaLista.splice(index, 1);
    setItens(novaLista);
  };

  const onSubmit = async () => {
    try {
      if (!clienteSelecionado) {
        Alert.alert('Erro', 'Selecione um cliente.');
        return;
      }

      if (itens.length === 0 || itens.some((i) => !i.id_produto)) {
        Alert.alert('Erro', 'Selecione ao menos um produto.');
        return;
      }

      const dataVenda = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const idVenda = await banco.insertVenda(
        dataVenda,
        valorTotal,
        pago,
        metodoPagamento,
        clienteSelecionado.id_cliente
      );

      for (const item of itens) {
        const produto = produtos.find((p) => p.id_produto == item.id_produto);
        if (produto) {
          await banco.insertItemVenda(
            idVenda,
            produto.id_produto,
            parseInt(item.quantidade),
            produto.preco_atual
          );
          const novoEstoque =
            produto.quantidade_estoque - parseInt(item.quantidade);
          await banco.updateStorage(novoEstoque, produto.id_produto);
        }
      }

      Alert.alert('Sucesso!', 'Venda registrada com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      Alert.alert('Erro', 'Não foi possível registrar a venda.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Título */}
        <View style={{ marginBottom: 20 }}>
          <Text style={localStyles.headerTitle}>Nova Venda</Text>
          <Text style={localStyles.headerSubtitle}>
            Preencha os dados abaixo
          </Text>
        </View>

        {/* CLIENTE */}
        <View style={localStyles.card}>
          <View style={localStyles.cardHeader}>
            <Feather name="user" size={18} color="#1976d2" />
            <Text style={localStyles.cardTitle}>CLIENTE</Text>
          </View>

          {!clienteSelecionado ? (
            <>
              <View style={localStyles.searchContainer}>
                <Feather
                  name="search"
                  size={20}
                  color="#999"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  placeholder="Buscar cliente..."
                  value={clienteFiltro}
                  onChangeText={setClienteFiltro}
                  style={localStyles.searchInput}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Lista de Sugestões */}
              {clienteFiltro.length > 0 && (
                <ScrollView
                  style={localStyles.suggestionBox}
                  nestedScrollEnabled>
                  {clientes
                    .filter((c) =>
                      c.nome.toLowerCase().includes(clienteFiltro.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((c) => (
                      <TouchableOpacity
                        key={c.id_cliente}
                        style={localStyles.suggestionItem}
                        onPress={() => {
                          setClienteSelecionado(c);
                          setValue('id_cliente', c.id_cliente);
                          setClienteFiltro('');
                        }}>
                        <Text style={localStyles.suggestionText}>{c.nome}</Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={localStyles.selectedItemBox}>
              <View>
                <Text style={localStyles.selectedLabel}>
                  Cliente Selecionado:
                </Text>
                <Text style={localStyles.selectedName}>
                  {clienteSelecionado.nome}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setClienteSelecionado(null)}>
                <Feather name="x" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* PRODUTOS */}
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
              placeholder="Adicionar produto..."
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
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={localStyles.suggestionText}>
                          {p.nome_produto} {semEstoque ? '(Esgotado)' : ''}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#666' }}>
                          R$ {p.preco_atual.toFixed(2)}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 10,
                          color: semEstoque ? 'red' : '#999',
                        }}>
                        Estoque: {p.quantidade_estoque}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          )}

          {/* Lista de Itens Selecionados (Estilo Carrinho) */}
          <View style={{ marginTop: 10 }}>
            {itens.map((item, index) => (
              <View key={index} style={localStyles.cartItem}>
                <View style={{ flex: 1 }}>
                  <Text style={localStyles.cartItemName}>
                    {item.nome_produto}
                  </Text>
                  <Text style={localStyles.cartItemStock}>
                    Max: {item.estoque_maximo}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={localStyles.qtyInput}
                    keyboardType="numeric"
                    value={item.quantidade}
                    onChangeText={(text) => {
                      const qtd = parseInt(text.replace(/\D/g, '')) || 0;
                      const max = item.estoque_maximo || 999;
                      const nova = [...itens];

                      if (qtd > max) {
                        Alert.alert('Aviso', `Estoque máximo: ${max}`);
                        nova[index].quantidade = String(max);
                      } else {
                        nova[index].quantidade = text.replace(/\D/g, '');
                      }
                      setItens(nova);
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => removerItem(index)}
                    style={{ marginLeft: 12, padding: 4 }}>
                    <Feather name="trash-2" size={20} color="#ef5350" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* PAGAMENTO */}
        <View style={localStyles.card}>
          <View style={localStyles.cardHeader}>
            <Feather name="credit-card" size={18} color="#1976d2" />
            <Text style={localStyles.cardTitle}>PAGAMENTO</Text>
          </View>

          <Text style={localStyles.inputLabel}>Status do Pagamento</Text>
          <View style={localStyles.pickerWrapper}>
            <Picker selectedValue={pago} onValueChange={(v) => setPago(v)}>
              <Picker.Item label="Não Pago" value="Não" />
              <Picker.Item label="Pago" value="Sim" />
            </Picker>
          </View>

          <Text style={localStyles.inputLabel}>Método</Text>
          <View style={localStyles.pickerWrapper}>
            <Picker
              selectedValue={metodoPagamento}
              onValueChange={(v) => setMetodoPagamento(v)}>
              <Picker.Item label="Selecione..." value="" />
              <Picker.Item label="Dinheiro" value="Dinheiro" />
              <Picker.Item
                label="Cartão de Crédito"
                value="Cartão de Crédito"
              />
              <Picker.Item label="Cartão de Débito" value="Cartão de Débito" />
              <Picker.Item label="Pix" value="Pix" />
              <Picker.Item label="Outros" value="Outros" />
            </Picker>
          </View>
        </View>

        {/* TOTAL e BOTÃO */}
        <View style={localStyles.footer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 20,
            }}>
            <Text style={{ fontSize: 16, color: '#666' }}>Total a pagar:</Text>
            <Text style={localStyles.totalValue}>
              R$ {valorTotal.toFixed(2).replace('.', ',')}
            </Text>
          </View>

          <ButtonWI
            title="Finalizar Venda"
            iconName="check"
            onPress={handleSubmit(onSubmit)}
          />
        </View>
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
