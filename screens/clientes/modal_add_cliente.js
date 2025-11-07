import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Divider } from '@rneui/themed';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import styles from '../../components/css';
import { ButtonWI } from '../../components/button_w_i';
import { AnimatedTextField } from '../../components/field';

import * as banco from '../../sql/banco';

export default function AddCliente({ navigation }) {
  const [foto, setFoto] = useState('sem_foto.jpg');

  // Validação dos campos
  const schema = yup.object({
    nome: yup.string().required('O nome é obrigatório'),
    telefone: yup
      .string()
      .matches(/^[0-9]{10,11}$/, 'Digite um telefone válido (10 ou 11 dígitos)')
      .required('O telefone é obrigatório'),
    data_nascimento: yup
      .string()
      .matches(/^\d{4}-\d{2}-\d{2}$/, 'Formato válido: AAAA-MM-DD')
      .required('A data de nascimento é obrigatória'),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    // Inserção no banco
    banco.insertCliente(
      data.nome,
      data.telefone,
      data.data_nascimento,
      foto
    );

    Alert.alert(
      'Sucesso!',
      'Cliente adicionado com sucesso.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container_home}>
      <Text style={styles.appTitle}>Adicionar Cliente</Text>
      <Divider />

      <Controller
        control={control}
        name="nome"
        render={({ field: { onChange, onBlur, value } }) => (
          <AnimatedTextField
            label="Nome do Cliente"
            error={errors.nome}
            keyboardType="default"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="telefone"
        render={({ field: { onChange, onBlur, value } }) => (
          <AnimatedTextField
            label="Telefone (somente números)"
            error={errors.telefone}
            keyboardType="numeric"
            onBlur={onBlur}
            onChangeText={(text) => onChange(text.replace(/\D/g, ''))}
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="data_nascimento"
        render={({ field: { onChange, onBlur, value } }) => (
          <AnimatedTextField
            label="Data de Nascimento (AAAA-MM-DD)"
            error={errors.data_nascimento}
            keyboardType="default"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <ButtonWI
        title="Adicionar Cliente"
        iconName="user-plus"
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  photo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  img: {
    width: 175,
    height: 175,
    borderRadius: 15,
    marginTop: 5,
    alignSelf: 'center',
  },
});
