import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as banco from '../../sql/banco';
import { ButtonWI } from '../../components/button_w_i';

export default function View_Clientes({ navigation }) {
  const route = useRoute();
  const id_from_cliente = route.params?.clienteId;

  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendas, setVendas] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const allClientes = await banco.getOneCliente(id_from_cliente);
      if (allClientes.length > 0) {
        setCliente(allClientes[0]);
        const historico = await banco.getVendasByCliente(id_from_cliente);
        setVendas(historico);
      }
    } catch (error) {
      console.error("Erro ao carregar cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  function calcularIdade(data) {
    if (!data) return '-';
    const nascimento = new Date(data);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  }

  const deleteCliente = async (nome, id_cliente) => {
    Alert.alert(
      `Excluir ${nome}?`,
      "Todo o histórico de compras deste cliente também será apagado.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await banco.deletedCliente(id_cliente);
              Alert.alert("Sucesso!", "Cliente deletado com sucesso!", [
                { text: "Voltar", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error("Erro ao deletar cliente:", error);
              Alert.alert("Erro", "Não foi possível deletar o cliente.");
            }
          },
        },
      ]
    );
  };

  if (loading || !cliente) {
    return (
      <View style={localStyles.center}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={{marginTop: 10, color: '#666'}}>Carregando cliente...</Text>
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      {/* HEADER IMAGE FIXA */}
      <Image
        source={require("../../images/header.jpg")}
        style={localStyles.headerImage}
        resizeMode="cover"
      />

      <ScrollView contentContainerStyle={localStyles.scrollContent}>
        
        {/* FOTO E NOME */}
        <View style={localStyles.profileHeader}>
          <View style={localStyles.pfpContainer}>
            <Image
                style={localStyles.pfp}
                source={
                cliente.foto && cliente.foto !== "sem_foto.jpg"
                    ? { uri: cliente.foto }
                    : require("../../images/sem_foto.jpg")
                }
            />
          </View>
          <Text style={localStyles.userName}>{cliente.nome}</Text>
          <Text style={localStyles.userId}>ID: #{cliente.id_cliente}</Text>
        </View>

        {/* CARD DE DADOS */}
        <View style={localStyles.card}>
            <View style={localStyles.infoRow}>
                <View style={localStyles.iconBox}>
                    <Feather name="phone" size={20} color="#1976d2" />
                </View>
                <View>
                    <Text style={localStyles.infoLabel}>Telefone</Text>
                    <Text style={localStyles.infoValue}>{cliente.telefone}</Text>
                </View>
            </View>

            <View style={localStyles.separator} />

            <View style={localStyles.infoRow}>
                <View style={localStyles.iconBox}>
                    <Feather name="calendar" size={20} color="#1976d2" />
                </View>
                <View>
                    <Text style={localStyles.infoLabel}>Idade</Text>
                    <Text style={localStyles.infoValue}>
                        {calcularIdade(cliente.data_nascimento)} anos ({new Date(cliente.data_nascimento).toLocaleDateString('pt-BR')})
                    </Text>
                </View>
            </View>
        </View>

        {/* HISTÓRICO DE COMPRAS */}
        <View style={localStyles.sectionHeader}>
            <Feather name="shopping-bag" size={18} color="#555" />
            <Text style={localStyles.sectionTitle}>HISTÓRICO DE COMPRAS</Text>
        </View>

        {vendas.length === 0 ? (
          <View style={localStyles.emptyState}>
             <Feather name="inbox" size={40} color="#ccc" />
             <Text style={{ color: "#999", marginTop: 8 }}>Nenhuma compra registrada.</Text>
          </View>
        ) : (
          vendas.map((venda) => (
            <View key={venda.id_venda} style={localStyles.saleCard}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 <View style={[localStyles.iconBoxSmall, { backgroundColor: '#e8f5e9' }]}>
                    <Feather name="check" size={14} color="#2e7d32" />
                 </View>
                 <View>
                    <Text style={localStyles.saleId}>Venda #{venda.id_venda}</Text>
                    <Text style={localStyles.saleDate}>{new Date(venda.data_venda).toLocaleDateString('pt-BR')}</Text>
                 </View>
              </View>
              <Text style={localStyles.saleValue}>
                R$ {Number(venda.valor_total).toFixed(2).replace('.', ',')}
              </Text>
            </View>
          ))
        )}

        {/* AÇÕES */}
        <View style={localStyles.actionsContainer}>
             <ButtonWI 
                title="Editar" 
                iconName="edit" 
                onPress={() => navigation.navigate('Editar Cliente', { clienteId: cliente.id_cliente })}
                styleButton={{ flex: 1, marginRight: 8 }}
            />
            <ButtonWI 
                title="Excluir" 
                iconName="trash-2" 
                color="#c62828"
                onPress={() => deleteCliente(cliente.nome, cliente.id_cliente)}
                styleButton={{ flex: 1, marginLeft: 8, backgroundColor: '#ffebee', borderWidth: 1, borderColor: '#ef9a9a' }}
                textStyle={{ color: '#c62828' }}
                iconColor="#c62828"
            />
        </View>

      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  headerImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    width: "100%",
  },
  
  scrollContent: {
    paddingTop: 110, // Para sobrepor a imagem
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Perfil
  profileHeader: { alignItems: "center", marginBottom: 20 },
  pfpContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  pfp: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#eee",
  },
  userName: { fontSize: 24, fontWeight: "800", marginTop: 10, color: "#333", textAlign: 'center' },
  userId: { fontSize: 14, color: "#777", marginTop: 2 },

  // Card Info
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoLabel: { fontSize: 12, color: '#757575', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12, marginLeft: 54 },

  // Histórico
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginLeft: 4 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#555', marginLeft: 8 },
  
  saleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  iconBoxSmall: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 10
  },
  saleId: { fontSize: 15, fontWeight: '600', color: '#333' },
  saleDate: { fontSize: 12, color: '#888' },
  saleValue: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32' },
  
  emptyState: { alignItems: 'center', padding: 30, opacity: 0.7 },

  actionsContainer: { flexDirection: 'row', marginTop: 20 },
});