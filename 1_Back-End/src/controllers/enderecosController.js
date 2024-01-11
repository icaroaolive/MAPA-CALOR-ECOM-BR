const enderecoModel = require('../models/enderecosModel')

const corrigirEnderecos = async (request, response) => {
    const { pass } = request.params
    const enderecos = await enderecoModel.buscarTodosSemLatLong()
    const correcao = await enderecoModel.corrigirEnderecos(enderecos, pass)
    return response.status(200).json(correcao)
}


const criarEstatisticas = async (request, response) => {
    const enderecos = await enderecoModel.criarEstatisticas()
    return response.status(200).json(enderecos)
}


const buscarFiltro = async (request, response) => {
    const consulta = request.params.consulta
    const pass = request.params.pass

    try {
        const dadosEncontrados = await enderecoModel.buscarFiltro(consulta, pass)
        return response.status(200).json(dadosEncontrados)
    } catch (error) {

    }



}

const buscarTodosSemLatLong = async (request, response) => {
    const enderecos = await enderecoModel.buscarTodosSemLatLong()

    return response.status(200).json(enderecos)
}

module.exports = {
    buscarFiltro,
    buscarTodosSemLatLong,
    criarEstatisticas,
    corrigirEnderecos
}