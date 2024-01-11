const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['./router.js']

swaggerAutogen(outputFile, endpointsFiles)