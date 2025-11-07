import * as SQLite from 'expo-sqlite';

export const openDB = async () => {
  const db = SQLite.openDatabaseAsync('estoque.db', { useNewConnection: true });
  return db;
};

export const createTable = async () => {
  try {
    const db = await openDB();

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS products (
        id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_produto TEXT,
        imagem TEXT default 'sem_imagem.jpg',
        preco_atual REAL,
        quantidade_estoque INTEGER default 0,
        descricao TEXT
      );

      CREATE TABLE IF NOT EXISTS clientes (
        id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
        nome varchar(200),
        telefone varchar(11),
        data_nascimento date,
        foto TEXT default 'sem_foto.jpg'
      )
    `);

    console.log('Tabela criada com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabela:', error.message);
  }
};

//Inputs na tabela produtos 
//============================

export const insertProduct = async (nome, imagem, preco, quantidade, descricao) => {
  try {
    const db = await openDB();
    const result = await db.runAsync(
      'INSERT INTO products (nome_produto, imagem, preco_atual, quantidade_estoque, descricao) VALUES (?, ?, ?, ?, ?)',
      nome,
      imagem,
      preco,
      quantidade,
      descricao
    );
  } catch (error) {
    console.error('Erro ao inserir produto:', error.message);
  }
};

export const getProducts = async () => {
  try {
    const db = await openDB();
    const rows = await db.getAllAsync('SELECT * FROM products');
    return rows;
  } catch (error) {
    console.error('Erro ao listar produtos:', error.message);
    return [];
  }
};

export const getOneProduct = async (id_produto) => {
  try{
    const db = await openDB();
    const row = await db.getAllAsync(
      'SELECT * FROM products WHERE id_produto = ?',
      id_produto);
      console.log(row)
      return row;
  } catch (error) {
    console.log('Erro ao procurar produto', error.message);
    return [];
  }
};

export const updateStorage = async (quantidade_estoque, id_produto) => {
  try {
    const db = await openDB();
    await db.runAsync(
      'UPDATE products SET quantidade_estoque = ? WHERE id_produto = ?',
      [quantidade_estoque, id_produto]
    );
    console.log(`Produto ${id_produto} atualizado: ${quantidade_estoque}`);
    return true;
  } catch (error) {
    console.log('Erro ao atualizar produto:', error.message);
    return false;
  }
};

export const updateProduct = async (nome_produto, imagem, preco_atual, quantidade_estoque, descricao, id_produto) => {
  try {
    const db = await openDB();
    await db.runAsync(
      `UPDATE products
      SET
        nome_produto = ?,
        imagem = ?,
        preco_atual = ?,
        quantidade_estoque = ?,
        descricao = ?
      WHERE id_produto = ?`,
      [nome_produto, imagem, preco_atual, quantidade_estoque, descricao, id_produto]
    );
    console.log(`Produto ${id_produto} atualizado com sucesso!`);
    return true;
  } catch (error) {
    console.log('Erro ao atualizar produto:', error.message);
    return false;
  }
};

export const deletedProduct = async (id_produto) => {
  try {
    const db = await openDB();
    await db.runAsync(
      'DELETE FROM products WHERE id_produto = ?',
      [id_produto]
    );
    console.log(`Produto ${id_produto} deletado com sucesso`);
    return true;
  } catch (error) {
    console.log('Erro ao deletar produto:', error.message);
    return false;
  }
};

//Inserções na tabela clientes 
//============================

export const insertCliente = async (nome, telefone, data_nascimento, foto) => {
  try {
    const db = await openDB();
    const result = await db.runAsync(
      'INSERT INTO clientes (nome, telefone, data_nascimento, foto) VALUES (?, ?, ?, ?)',
      nome,
      telefone,
      data_nascimento,
      foto
    );
  } catch (error) {
    console.error('Erro ao inserir cliente:', error.message);
  }
};

export const getClientes = async () => {
  try {
    const db = await openDB();
    const rows = await db.getAllAsync('SELECT * FROM clientes');
    return rows;
  } catch (error) {
    console.error('Erro ao listar clientes:', error.message);
    return [];
  }
};

export const getOneCliente = async (id_cliente) => {
  try{
    const db = await openDB();
    const row = await db.getAllAsync(
      'SELECT * FROM clientes WHERE id_cliente = ?',
      id_cliente);
      console.log(row)
      return row;
  } catch (error) {
    console.log('Erro ao procurar cliente', error.message);
    return [];
  }
};

export const updateCliente = async (nome, telefone, data_nascimento, foto, id_cliente) => {
  try {
    const db = await openDB();
    await db.runAsync(
      `UPDATE products
      SET
        nome = ?,
        telefone = ?,
        data_nascimento = ?,
        foto = ?,
      WHERE id_cliente = ?`,
      [nome, telefone, data_nascimento, foto, id_cliente]
    );
    console.log(`Cliente ${id_cliente} atualizado com sucesso!`);
    return true;
  } catch (error) {
    console.log('Erro ao atualizar cliente:', error.message);
    return false;
  }
};

export const deletedCliente = async (id_cliente) => {
  try {
    const db = await openDB();
    await db.runAsync(
      'DELETE FROM clientes WHERE id_cliente = ?',
      [id_cliente]
    );
    console.log(`Cliente ${id_cliente} deletado com sucesso`);
    return true;
  } catch (error) {
    console.log('Erro ao deletar cliente:', error.message);
    return false;
  }
};
