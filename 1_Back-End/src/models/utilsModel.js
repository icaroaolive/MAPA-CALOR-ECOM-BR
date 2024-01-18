//Faz parte dos métodos utilitários, serve para buscar endereços pelo número, não é usado no projeto.
const connection = require('./connection');
const tabela = '' // Tabela a ser utilizada

const buscarPorNumero = async (numero) => {
  try {         
    const query = `SELECT * FROM ${tabela} WHERE endereco LIKE '%n° ${numero}'` ;                
    const { rows } = await connection.query(query);
    return rows;
  } catch (error) {
    console.error('Erro ao buscar número:', error);
    throw error;
  }
};

module.exports = {
  buscarPorNumero,
  
};
