const connection = require('./connection');
var key = '' // SALT da API (Usado para ter permissão ao rodar os métodos de busca ou inserção)
const buscarFiltros = async (schema, tabela, pass) => {
    try {
        if (pass == key) {


            const { rows } = await connection.query(
                `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = '${schema}' AND table_name   = '${tabela}'`);
            //console.log(schema, tabela);
            return rows;
        } else {
            return "Não Autorizado";
        }
    } catch (error) {
        console.error('Erro ao buscar endereços:', error);
        throw error;
    }
};


module.exports = {
    buscarFiltros
};