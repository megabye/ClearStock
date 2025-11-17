import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { ButtonWI } from '../../components/button_w_i';
import { AnimatedTextField } from '../../components/field';
import * as banco from '../../sql/banco';

// Funções de formatação (mantidas iguais)
function formatTelefone(value) {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  } else {
    return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  }
}

function formatData(value) {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
}

function convertDataParaSQL(data) {
  const partes = data.split('/');
  if (partes.length === 3) return `${partes[2]}-${partes[1]}-${partes[0]}`;
  return data;
}

export default function AddCliente({ navigation }) {
  const [foto, setFoto] = useState('sem_foto.jpg');

  const schema = yup.object({
    nome: yup.string().required('O nome é obrigatório'),
    telefone: yup.string().matches(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido').required('Obrigatório'),
    data_nascimento: yup.string().matches(/^\d{2}\/\d{2}\/\d{4}$/, 'DD/MM/AAAA').required('Obrigatório'),
  });

  const { handleSubmit, control, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    const dataSQL = convertDataParaSQL(data.data_nascimento);
    const telefoneLimpo = data.telefone.replace(/\D/g, ''); // Salva apenas números se preferir, ou mantenha formatado

    banco.insertCliente(data.nome, data.telefone, dataSQL, foto);

    Alert.alert('Sucesso!', 'Cliente adicionado com sucesso.', 
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        
        <View style={{ marginBottom: 20 }}>
          <Text style={localStyles.headerTitle}>Novo Cliente</Text>
          <Text style={localStyles.headerSubtitle}>Preencha as informações de contato</Text>
        </View>

        {/* CARD FORMULÁRIO */}
        <View style={localStyles.card}>
            <View style={localStyles.cardHeader}>
                <Feather name="user" size={18} color="#1976d2" />
                <Text style={localStyles.cardTitle}>DADOS PESSOAIS</Text>
            </View>

            <View style={localStyles.inputContainer}>
                <Controller
                    control={control}
                    name="nome"
                    render={({ field: { onChange, onBlur, value } }) => (
                    <AnimatedTextField
                        label="Nome Completo"
                        error={errors.nome}
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
                    name="telefone"
                    render={({ field: { onChange, onBlur, value } }) => (
                    <AnimatedTextField
                        label="Telefone / Celular"
                        error={errors.telefone}
                        keyboardType="numeric"
                        onBlur={onBlur}
                        value={formatTelefone(value)}
                        onChangeText={(text) => onChange(formatTelefone(text))}
                    />
                    )}
                />
            </View>

            <View style={localStyles.inputContainer}>
                <Controller
                    control={control}
                    name="data_nascimento"
                    render={({ field: { onChange, onBlur, value } }) => (
                    <AnimatedTextField
                        label="Data de Nascimento"
                        error={errors.data_nascimento}
                        keyboardType="numeric"
                        onBlur={onBlur}
                        value={formatData(value)}
                        onChangeText={(text) => onChange(formatData(text))}
                    />
                    )}
                />
            </View>
        </View>

        <ButtonWI title="Salvar Cliente" iconName="user-plus" onPress={handleSubmit(onSubmit)} />
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
    marginBottom: 20,
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
  inputContainer: { marginBottom: 12 }
});