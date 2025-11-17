import React, { useState } from 'react';
import { View, Text, Alert, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Feather } from '@expo/vector-icons';

import { ButtonWI } from '../../components/button_w_i';
import { AnimatedTextField } from '../../components/field';
import * as banco from '../../sql/banco';

const formatCurrency = (value) => {
  if (!value) return '';
  const numericValue = String(value).replace(/\D/g, '');
  if (!numericValue) return '';
  const floatValue = parseFloat(numericValue) / 100;
  return floatValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export default function EditProduct({ navigation }) {
  const route = useRoute();
  const id_from_product = route.params?.productId;

  const [loading, setLoading] = useState(true);

  const schema = yup.object({
    nome_produto: yup.string().required('O nome não pode ser vazio'),
    preco: yup.string().required('O preço é obrigatório'),
    quantidade: yup
      .string()
      .matches(/^[0-9]+$/, 'Digite apenas números')
      .required('A quantidade é obrigatória'),
    descricao: yup.string().nullable(),
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nome_produto: '',
      preco: '',
      quantidade: '',
      descricao: '',
    },
  });

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
        const p = allProduct[0];
        reset({
          nome_produto: p.nome_produto,
          preco: String((p.preco_atual * 100).toFixed(0)), // Convertendo para centavos string
          quantidade: String(p.quantidade_estoque),
          descricao: p.descricao,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Garante limpeza de caracteres não numéricos antes de dividir
      const precoLimpo = String(data.preco).replace(/\D/g, '');
      const precoNumerico = parseFloat(precoLimpo) / 100;
      
      const sucesso = await banco.updateProduct(
        data.nome_produto,
        'er', 
        precoNumerico.toFixed(2),
        parseInt(data.quantidade),
        data.descricao,
        id_from_product
      );

      if (sucesso) {
        Alert.alert('Sucesso!', 'Produto editado com sucesso.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o produto.');
      }
    } catch (error) {
      Alert.alert('Erro inesperado', error.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={{ marginTop: 10, color: '#666' }}>Carregando produto...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        
        <View style={{ marginBottom: 20 }}>
          <Text style={localStyles.headerTitle}>Editar Produto</Text>
          <Text style={localStyles.headerSubtitle}>Atualize as informações do item</Text>
        </View>

        {/* CARD 1 */}
        <View style={localStyles.card}>
          <View style={localStyles.cardHeader}>
            <Feather name="edit-3" size={18} color="#1976d2" />
            <Text style={localStyles.cardTitle}>DETALHES</Text>
          </View>

          <View style={localStyles.inputContainer}>
            <Controller
              control={control}
              name="nome_produto"
              render={({ field: { onChange, onBlur, value } }) => (
                <AnimatedTextField
                  label="Nome do Produto"
                  error={errors.nome_produto}
                  keyboardType="default"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
          <View style={localStyles.inputContainer}>
            <Controller
              control={control}
              name="descricao"
              render={({ field: { onChange, onBlur, value } }) => (
                <AnimatedTextField
                  label="Descrição"
                  error={errors.descricao}
                  keyboardType="default"
                  onBlur={onBlur}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
        </View>

        {/* CARD 2 */}
        <View style={localStyles.card}>
          <View style={localStyles.cardHeader}>
            <Feather name="layers" size={18} color="#1976d2" />
            <Text style={localStyles.cardTitle}>ESTOQUE E PREÇO</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={[localStyles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Controller
                control={control}
                name="preco"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AnimatedTextField
                    label="Preço (R$)"
                    error={errors.preco}
                    keyboardType="numeric"
                    onBlur={onBlur}
                    value={formatCurrency(value)}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/\D/g, '');
                      onChange(numericValue);
                    }}
                  />
                )}
              />
            </View>
            <View style={[localStyles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Controller
                control={control}
                name="quantidade"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AnimatedTextField
                    label="Quantidade"
                    error={errors.quantidade}
                    keyboardType="numeric"
                    onBlur={onBlur}
                    value={value}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/\D/g, '');
                      onChange(numericValue);
                    }}
                  />
                )}
              />
            </View>
          </View>
        </View>

        <ButtonWI title="Salvar Alterações" iconName="check" onPress={handleSubmit(onSubmit)} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos iguais ao AddProduct
const localStyles = StyleSheet.create({
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1976d2' },
  headerSubtitle: { fontSize: 16, color: '#777', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  inputContainer: {
    marginBottom: 12,
  }
});