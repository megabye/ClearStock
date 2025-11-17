import React from 'react'; 
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
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

export default function AddProduct({ navigation }) {
  const schema = yup.object({
    nome_produto: yup.string().required('O nome não pode ser vazio'),
    preco: yup.string().required('O preço é obrigatório'),
    quantidade: yup
      .string()
      .matches(/^[0-9]+$/, 'Digite apenas números')
      .required('A quantidade é obrigatória'),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    const precoNumerico = parseFloat(data.preco.replace(/\D/g, '')) / 100;

    banco.insertProduct(
      data.nome_produto,
      'sem_imagem.jpg',
      precoNumerico.toFixed(2),
      parseInt(data.quantidade),
      data.descricao
    );

    Alert.alert(
      'Sucesso!',
      'Produto adicionado com sucesso.',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        
        <View style={{ marginBottom: 20 }}>
          <Text style={localStyles.headerTitle}>Novo Produto</Text>
          <Text style={localStyles.headerSubtitle}>Cadastre um item no estoque</Text>
        </View>

        {/* CARTÃO 1: INFORMAÇÕES BÁSICAS */}
        <View style={localStyles.card}>
          <View style={localStyles.cardHeader}>
            <Feather name="package" size={18} color="#1976d2" />
            <Text style={localStyles.cardTitle}>INFORMAÇÕES BÁSICAS</Text>
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
                  label="Descrição (Opcional)"
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

        {/* CARTÃO 2: VALORES E ESTOQUE */}
        <View style={localStyles.card}>
          <View style={localStyles.cardHeader}>
            <Feather name="tag" size={18} color="#1976d2" />
            <Text style={localStyles.cardTitle}>VALORES E ESTOQUE</Text>
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
                    label="Qtd. Inicial"
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

        <ButtonWI
          title="Salvar Produto"
          iconName="save"
          onPress={handleSubmit(onSubmit)}
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