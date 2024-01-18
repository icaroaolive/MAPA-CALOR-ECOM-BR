// Método de busca para encontrar as colunas da tabela que deverá ser criados os filtros no Front-end


const connection = require('./connection');
var key = '' // SALT da API (Usado para ter permissão ao rodar os métodos de busca ou inserção)
const buscarFiltros = async (schema, tabela, pass) => {
    try {
        if (pass == key) {

            //Inicializa uma constante para gravar o retorno da query que consulta o nome das colunas da tabela no schema do postgres.
            //Por padrão em todo o projeto, foi enviado o eschema public, mas isso é configurável, é só passar a variável schema com o correto.
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
