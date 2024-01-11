const enderecoModel = require('../models/utilsModel')



const buscarPorNumero = async (request, response) => {
    const { numero } = request.params

    try {
        const numerosEncontrados = await enderecoModel.buscarPorNumero(numero)
        return response.status(200).json({ numerosEncontrados })
    } catch (error) {

    }
}

module.exports = {
    buscarPorNumero,
}