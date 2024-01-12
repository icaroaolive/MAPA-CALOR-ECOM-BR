const connection = require('./connection')
const axios = require('axios')

var key = '' // SALT da API (Usado para ter permissão ao rodar os métodos de busca ou inserção)
const tabela = '' // Tabela a ser utilizada
var urlapi = 'https://nominatim.openstreetmap.org' //Endereço da API que fará a correção dos endereços não colocar / no final.
var tempoConsulta = 1250 //Intervalo em milisegundos para utilização da API gratuita.


const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

var dados = []
dados[0] = '0'
dados[1] = '0'

function corrigeEnderecos(url) {
  axios.get(url).then(resposta => {

    const headerDate = resposta.headers && resposta.headers.date ? resposta.headers.date : 'Não foi possível realizar a solicitação à API'

    console.log('Solicitação Realizada em:', headerDate)
    console.log('Resposta Status: ' + resposta.status + "\n")

    const enderecos = resposta.data

    for (endereco of enderecos) {
      //console.log(`Encontrado endereco com latitude: ${endereco.lat}, longitude: ${endereco.lon}`)

      dados[0] = endereco.lat
      dados[1] = endereco.lon

      //console.log(dados[0])
      //console.log(dados[1] + "\n")

    }
  })
    .catch(err => {
      console.log('Não foi possível realizar a solicitação à API: ', err.message)
    })
  return dados
}

const corrigirEnderecos = async (enderecos, pass) => {
  if (pass == key) {
    try {
      console.log('Solicitação de Correção para: ' + enderecos.length + ' registros. \n')

      for (let i = 0; i <= enderecos.length; i++) {
        await delay(tempoConsulta)


        console.log("(" + i + "/" + enderecos.length + ")" + " - " + enderecos[i].nome + " - " + enderecos[i].endereco + " - " + enderecos[i].gps_latitude + ", " + enderecos[i].gps_longitude + "")
        var dados = corrigeEnderecos(`${urlapi}/search?format=json&q=${enderecos[i].endereco} ${enderecos[i].bairro} ${enderecos[i].municipio}`)

        console.log("Correção a ser Aplicada: Lat: " + dados[0] + ", Lon: " + dados[1])

        try {
          if (dados[0] != '0' && dados[1] != 0) {
            const { query } = await connection.query(`UPDATE ${tabela} SET gps_latitude='${dados[0]}', gps_longitude='${dados[1]}' WHERE id = '${enderecos[i].id}'                                        `)
            console.log('Corrigido no banco de dados com sucesso.')
          } else {
            console.log('Latitude e Longitude não foi encontrada pela API.')
          }
        } catch (error) {
          console.log(error)
        }

        dados[0] = '0'
        dados[1] = '0'
      }


    } catch (error) {
      console.error('Erro ao buscar endereços:', error)
      throw error
    }
  } else {
    console.log(pass)
    return "Não Autorizado"
  }
}



const buscarTodosFiltrarLatLong = async () => {
  try {
    const { rows } = await connection.query(`select * from  ${tabela} WHERE gps_latitude <> '' AND gps_longitude <> '' OR gps_latitude IS NOT NULL AND gps_longitude IS NOT NULL`)
    return rows
  } catch (error) {
    console.error('\n Consulta possui erros, nenhum resultado retornado.')

    //Para saber o erro na consulta, para fins de depuração, descomentar as duas linhas abaixo.

    //console.log(error)
    //throw error
  }
}

const criarEstatisticas = async () => {

  try {

    const { rows } = await connection.query(`
        SELECT count(*) FROM ${tabela} WHERE gps_latitude <> '' AND gps_longitude <> '' AND gps_latitude <> '0' AND gps_longitude <> '0' AND gps_latitude IS NOT NULL AND gps_longitude IS NOT NULL
        UNION ALL
        SELECT count(*) FROM ${tabela}`)
    return rows
  } catch (error) {
    console.error('\n Consulta possui erros, nenhum resultado retornado.')

    //Para saber o erro na consulta, para fins de depuração, descomentar as duas linhas abaixo.

    //console.log(error)
    //throw error
  }
}

const buscarFiltro = async (consulta, pass) => {
  try {
    if (pass == key) {
      consulta += " AND gps_latitude <> '' AND gps_longitude <> '' AND gps_latitude <> '0' AND gps_longitude <> '0' AND gps_latitude IS NOT NULL AND gps_longitude IS NOT NULL"
      console.log("\n" + consulta)
      const { rows } = await connection.query(consulta)

      return rows
    } else {
      return 'Não autorizado.'
    }
  } catch (error) {
    console.error('\n Consulta possui erros, nenhum resultado retornado.')


    //Para saber o erro na consulta, para fins de depuração, descomentar as duas linhas abaixo.

    //console.log(error)
    //throw error
  }
}
const buscarTodosSemLatLong = async () => {
  try {

    const { rows } = await connection.query(`select * from pessoa WHERE gps_latitude = '' AND gps_longitude = '' AND gps_latitude = '' OR gps_latitude IS NULL AND gps_longitude IS NULL`)
    return rows
  } catch (error) {
    console.error('Erro ao buscar endereços:', error)
    throw error
  }
}




module.exports = {
  corrigirEnderecos,
  buscarFiltro,
  buscarTodosFiltrarLatLong,
  buscarTodosSemLatLong,
  criarEstatisticas

}
