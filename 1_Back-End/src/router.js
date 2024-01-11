const express = require('express')
const enderecoController = require('./controllers/enderecosController')
const utilsController = require('./controllers/utilsController')
const filtrosController = require('./controllers/filtrosController')

const router = express.Router()
//documentação api
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')

router.use('/', swaggerUi.serve)
router.get('/', swaggerUi.setup(swaggerDocument))


//endereços
router.get('/criarEstatisticas', enderecoController.criarEstatisticas)
router.get('/corrigirEnderecos/:pass', enderecoController.corrigirEnderecos)
router.get('/buscarTodosSemLatLong', enderecoController.buscarTodosSemLatLong)

//utils

router.get('/buscarPorNumero/:numero', utilsController.buscarPorNumero)
router.get('/buscarFiltro/:consulta/:pass', enderecoController.buscarFiltro)

router.get('/buscarFiltros/:schema,:tabela,:pass', filtrosController.buscarFiltros)




module.exports = router