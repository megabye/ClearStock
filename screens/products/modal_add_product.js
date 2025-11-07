import React, { useState } from 'react'; 
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form'; 
import { Divider } from '@rneui/themed';
//import * as ImagePicker from 'expo-image-picker';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import styles from '../../components/css';
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
  //const [image, setImage] = useState(null);

  /*const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'É necessário permitir o acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhotoWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'É necessário permitir o acesso à câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };*/

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
    const precoNumerico = parseFloat(data.preco) / 100;
    //const imgPath = image ? image : '../images/sem_imagem.jpg';

    banco.insertProduct(
      data.nome_produto,
      imgPath,
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
    <View style={styles.container_home}>
      <Text style={styles.appTitle}>Adicionar Produto</Text>
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

      <ButtonWI
        title="Adicionar Produto"
        iconName="plus"
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
