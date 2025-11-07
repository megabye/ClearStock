import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { MyButton } from '../components/button';
import { ButtonWI } from '../components/button_w_i';
import * as banco from '../sql/banco';

export default function View_Products({ navigation }) {
  const route = useRoute();
  const id_from_product = route.params?.productId;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantidade, setQuantidade] = useState(0);

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
        setProduct(allProduct[0]);
        setQuantidade(allProduct[0].quantidade_estoque);
      }
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatestoragef = async (simbol) => {
    let qtd = quantidade;

    if (simbol === '+') qtd += 1;
    else if (simbol === '-') qtd = Math.max(qtd - 1, 0);

    setQuantidade(qtd);

    await banco.updateStorage(qtd, id_from_product);

    setProduct({ ...product, quantidade_estoque: qtd });
  };

  const deleteProduct = async (nome_produto, id_produto) => {
    Alert.alert(
      `Deletando ${nome_produto}`,
      "Certeza que quer deletar produto selecionado?", 
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              await banco.deletedProduct(id_produto); 
              navigation.goBack();
            } catch (error) {
              console.error("Erro ao deletar produto:", error);
            }
          }
        }
      ],
      { cancelable: false }
    );
  };


  if (loading || !product) {
    return (
      <View style={localStyles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando produto...</Text>
      </View>
    );
  }

  return (
    <View style={localStyles.view_container}>
      <Text style={localStyles.itemTitle}>{product.nome_produto}</Text>
      <Text style={localStyles.itemDescription}>{product.descricao}</Text>
      <Text style={localStyles.itemPrice}>R$ {product.preco_atual.toFixed(2)}</Text>

      <View style={localStyles.grid}>
        <MyButton iconName="minus" style={localStyles.btn} onPress={() => updatestoragef('-')} />
        <Text style={localStyles.itemStock}>{quantidade}</Text>
        <MyButton iconName="plus" style={localStyles.btn} onPress={() => updatestoragef('+')} />
      </View>

      <View>
        <ButtonWI title="Editar Informações do Produto" style={{marginBottom: 5}} onPress={() => navigation.navigate('Editar Produto', {productId: product.id_produto})}/>
        <ButtonWI title="Excluir Produto" style={{ backgroundColor: "red", marginTop:5}} onPress={() => deleteProduct(product.nome_produto, product.id_produto)}/>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  view_container: {
    flex: 1,
    padding: 15,
    marginTop: 20,
    backgroundColor: '#f5f7fa',
  },
  itemTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    width: 50,
    height: 50,
    marginHorizontal: 10,
  },
  itemStock: {
    fontSize: 26,
    color: '#333',
    textAlign: 'center',
    width: 200,
  },
});
