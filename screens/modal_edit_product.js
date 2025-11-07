import React, { useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { Divider } from '@rneui/themed';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import styles from '../components/css';
import { ButtonWI } from '../components/button_w_i';
import { AnimatedTextField } from '../components/field';
import * as banco from '../sql/banco';

// Função auxiliar para formatar o valor do preço
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

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Schema de validação
  const schema = yup.object({
    nome_produto: yup.string().required('O nome não pode ser vazio'),
    preco: yup.string().required('O preço é obrigatório'),
    quantidade: yup
      .string()
      .matches(/^[0-9]+$/, 'Digite apenas números')
      .required('A quantidade é obrigatória'),
    descricao: yup.string().nullable(),
  });

  // Formulário com react-hook-form
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

  // Carrega dados do produto quando a tela é focada
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
        setProduct(p);

        // Preenche o formulário com os dados existentes
        reset({
          nome_produto: p.nome_produto,
          preco: String(p.preco_atual * 100),
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
      const precoNumerico = parseFloat(data.preco) / 100;
      const sucesso = await banco.updateProduct(
        data.nome_produto,
        'er', // placeholder para imagem
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
      <View style={[styles.container_home, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Carregando produto...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container_home}>
      <Text style={styles.appTitle}>Editar Produto</Text>
      <Divider />

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

      <Controller
        control={control}
        name="preco"
        render={({ field: { onChange, onBlur, value } }) => (
          <AnimatedTextField
            label="Preço Atual"
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

      <Controller
        control={control}
        name="quantidade"
        render={({ field: { onChange, onBlur, value } }) => (
          <AnimatedTextField
            label="Quantidade em Estoque"
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

      <Controller
        control={control}
        name="descricao"
        render={({ field: { onChange, onBlur, value } }) => (
          <AnimatedTextField
            label="Descrição do Produto"
            error={errors.descricao}
            keyboardType="default"
            onBlur={onBlur}
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <ButtonWI title="Editar Produto" iconName="plus" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
