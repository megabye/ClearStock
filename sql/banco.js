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
        imagem TEXT DEFAULT 'sem_imagem.jpg',
        preco_atual REAL,
        quantidade_estoque INTEGER DEFAULT 0,
        descricao TEXT
      );

      CREATE TABLE IF NOT EXISTS clientes (
        id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(200),
        telefone VARCHAR(11),
        data_nascimento DATE,
        foto TEXT DEFAULT 'sem_foto.jpg'
      );

      CREATE TABLE IF NOT EXISTS vendas (
        id_venda INTEGER PRIMARY KEY AUTOINCREMENT,
        data_venda TEXT DEFAULT (datetime('now', 'localtime')),
        valor_total REAL,
        pago VARCHAR(5),
        metodo_pagamento VARCHAR(50),
        id_cliente INTEGER,
        FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
      );

      CREATE TABLE IF NOT EXISTS item_venda (
        id_venda INTEGER,
        id_produto INTEGER,
        quantidade INTEGER DEFAULT 1,
        preco_unitario REAL,
        PRIMARY KEY (id_venda, id_produto),
        FOREIGN KEY (id_venda) REFERENCES vendas(id_venda),
        FOREIGN KEY (id_produto) REFERENCES products(id_produto)
      );
    `);

    console.log('Tabelas criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabelas:', error.message);
  }
};

export const insertProduct = async (nome, imagem, preco, quantidade, descricao) => {
  try {
    const db = await openDB();
    await db.runAsync(
      'INSERT INTO products (nome_produto, imagem, preco_atual, quantidade_estoque, descricao) VALUES (?, ?, ?, ?, ?)',
      nome,
      imagem,
      preco,
      quantidade,
      descricao
    );
    console.log('Produto inserido com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir produto:', error.message);
  }
};

export const getProducts = async () => {
  try {
    const db = await openDB();
    const rows = await db.getAllAsync('SELECT * FROM products ORDER BY nome_produto ASC');
    return rows;
  } catch (error) {
    console.error('Erro ao listar produtos:', error.message);
    return [];
  }
};

export const getOneProduct = async (id_produto) => {
  try {
    const db = await openDB();
    const row = await db.getAllAsync('SELECT * FROM products WHERE id_produto = ?', id_produto);
    return row;
  } catch (error) {
    console.error('Erro ao buscar produto:', error.message);
    return null;
  }
};

export const updateStorage = async (quantidade_estoque, id_produto) => {
  try {
    const db = await openDB();
    await db.runAsync(
      'UPDATE products SET quantidade_estoque = ? WHERE id_produto = ?',
      quantidade_estoque,
      id_produto
    );
    console.log(`Estoque atualizado (Produto ${id_produto})`);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error.message);
    return false;
  }
};

export const updateProduct = async (nome_produto, imagem, preco_atual, quantidade_estoque, descricao, id_produto) => {
  try {
    const db = await openDB();
    await db.runAsync(
      `UPDATE products
       SET nome_produto = ?, imagem = ?, preco_atual = ?, quantidade_estoque = ?, descricao = ?
       WHERE id_produto = ?`,
      nome_produto,
      imagem,
      preco_atual,
      quantidade_estoque,
      descricao,
      id_produto
    );
    console.log(`Produto ${id_produto} atualizado com sucesso!`);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar produto:', error.message);
    return false;
  }
};

export const deletedProduct = async (id_produto) => {
  try {
    const db = await openDB();
    await db.runAsync('DELETE FROM products WHERE id_produto = ?', id_produto);
    console.log(`Produto ${id_produto} deletado`);
    return true;
  } catch (error) {
    console.error('Erro ao deletar produto:', error.message);
    return false;
  }
};

export const insertCliente = async (nome, telefone, data_nascimento, foto) => {
  try {
    const db = await openDB();
    await db.runAsync(
      'INSERT INTO clientes (nome, telefone, data_nascimento, foto) VALUES (?, ?, ?, ?)',
      nome,
      telefone,
      data_nascimento,
      foto
    );
    console.log('Cliente inserido com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir cliente:', error.message);
  }
};

export const getClientes = async () => {
  try {
    const db = await openDB();
    const rows = await db.getAllAsync('SELECT * FROM clientes ORDER BY nome ASC');
    return rows;
  } catch (error) {
    console.error('Erro ao listar clientes:', error.message);
    return [];
  }
};

export const getOneCliente = async (id_cliente) => {
  try {
    const db = await openDB();
    const row = await db.getAllAsync('SELECT * FROM clientes WHERE id_cliente = ?', id_cliente);
    return row;
  } catch (error) {
    console.error('Erro ao buscar cliente:', error.message);
    return null;
  }
};

export const updateCliente = async (nome, telefone, data_nascimento, foto, id_cliente) => {
  try {
    const db = await openDB();
    await db.runAsync(
      `UPDATE clientes
       SET nome = ?, telefone = ?, data_nascimento = ?, foto = ?
       WHERE id_cliente = ?`,
      nome,
      telefone,
      data_nascimento,
      foto,
      id_cliente
    );
    console.log(`Cliente ${id_cliente} atualizado com sucesso!`);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error.message);
    return false;
  }
};

export const deletedCliente = async (id_cliente) => {
  try {
    const db = await openDB();
    await db.runAsync('DELETE FROM clientes WHERE id_cliente = ?', id_cliente);
    console.log(`Cliente ${id_cliente} deletado`);
    return true;
  } catch (error) {
    console.error('Erro ao deletar cliente:', error.message);
    return false;
  }
};

export const insertVenda = async (data_venda, valor_total, pago, metodo_pagamento, id_cliente) => {
  try {
    const db = await openDB();
    const result = await db.runAsync(
      `INSERT INTO vendas (data_venda, valor_total, pago, metodo_pagamento, id_cliente)
       VALUES (?, ?, ?, ?, ?)`,
      data_venda,
      valor_total,
      pago,
      metodo_pagamento,
      id_cliente
    );
    console.log('Venda registrada com sucesso!');
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Erro ao registrar venda:', error.message);
    return null;
  }
};

export const insertItemVenda = async (id_venda, id_produto, quantidade, preco_unitario) => {
  try {
    const db = await openDB();
    await db.runAsync(
      `INSERT INTO item_venda (id_venda, id_produto, quantidade, preco_unitario)
       VALUES (?, ?, ?, ?)`,
      id_venda,
      id_produto,
      quantidade,
      preco_unitario
    );
    console.log(`Item de venda adicionado (Venda ${id_venda})`);
  } catch (error) {
    console.error('Erro ao inserir item de venda:', error.message);
  }
};

export const getVendasComCliente = async () => {
  try {
    const db = await openDB();
    const query = `
      SELECT v.*, c.nome AS nome_cliente
      FROM vendas v
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      ORDER BY v.data_venda DESC;
    `;
    const results = await db.getAllAsync(query);
    return results;
  } catch (error) {
    console.error('Erro ao listar vendas:', error.message);
    return [];
  }
};

export const getVendasByCliente = async (id_cliente) => {
  try {
    const db = await openDB();
    const rows = await db.getAllAsync(
      `SELECT id_venda, data_venda, valor_total
       FROM vendas
       WHERE id_cliente = ?
       ORDER BY data_venda DESC;`,
      [id_cliente]
    );
    return rows;
  } catch (error) {
    console.error("Erro ao buscar vendas do cliente:", error);
    return [];
  }
};

export const getItensPorVenda = async (id_venda) => {
  try {
    const db = await openDB();
    const query = `
      SELECT i.*, p.nome_produto
      FROM item_venda i
      LEFT JOIN products p ON i.id_produto = p.id_produto
      WHERE i.id_venda = ?;
    `;
    const results = await db.getAllAsync(query, id_venda);
    return results;
  } catch (error) {
    console.error('Erro ao buscar itens da venda:', error.message);
    return [];
  }
};

export const getOneVenda = async (id_venda) => {
  try {
    const db = await openDB();
    const row = await db.getAllAsync(
      `SELECT v.*, c.nome AS nome_cliente, c.telefone AS telefone_cliente
       FROM vendas v
       LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
       WHERE v.id_venda = ?`,
      [id_venda]
    );
    return row;
  } catch (error) {
    console.error('Erro ao buscar venda:', error.message);
    return null;
  }
};

export const getItensByVenda = async (id_venda) => {
  try {
    const db = await openDB();
    const rows = await db.getAllAsync(
      `SELECT iv.*, p.nome_produto, p.preco_atual AS preco_unitario
       FROM item_venda iv
       JOIN products p ON iv.id_produto = p.id_produto
       WHERE iv.id_venda = ?`,
      [id_venda]
    );
    return rows;
  } catch (error) {
    console.error('Erro ao buscar itens da venda:', error.message);
    return [];
  }
};

export const deleteVenda = async (id_venda) => {
  try {
    const db = await openDB();

    await db.runAsync('DELETE FROM item_venda WHERE id_venda = ?', [id_venda]);
    await db.runAsync('DELETE FROM vendas WHERE id_venda = ?', [id_venda]);
    console.log(`Venda ${id_venda} e seus itens foram deletados com sucesso`);
    return true;
  } catch (error) {
    console.error('Erro ao deletar venda:', error.message);
    return false;
  }
};

export const updateVenda = async (id_venda, data_venda, valor_total, pago, metodo_pagamento, id_cliente) => {
  try {
    const db = await openDB();
    await db.runAsync(
      `UPDATE vendas
       SET data_venda = ?, valor_total = ?, pago = ?, metodo_pagamento = ?, id_cliente = ?
       WHERE id_venda = ?`,
      data_venda,
      valor_total,
      pago,
      metodo_pagamento,
      id_cliente,
      id_venda
    );
    console.log(`Venda ${id_venda} atualizada.`);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar venda:', error.message);
    return false;
  }
};

export const deleteItemsByVenda = async (id_venda) => {
  try {
    const db = await openDB();
    await db.runAsync('DELETE FROM item_venda WHERE id_venda = ?', [id_venda]);
    console.log(`Itens da venda ${id_venda} deletados.`);
    return true;
  } catch (error) {
    console.error('Erro ao deletar itens da venda:', error.message);
    return false;
  }
};
