const filtrosModel = require('../models/filtrosModel')


const buscarFiltros = async (request, response) => {
    const { schema } = request.params
    const { tabela } = request.params
    const { pass } = request.params
    const filtros = await filtrosModel.buscarFiltros(schema, tabela, pass)

    return response.status(200).json(filtros)
}

module.exports = {
    buscarFiltros
}