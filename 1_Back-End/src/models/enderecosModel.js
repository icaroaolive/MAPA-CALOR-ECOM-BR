const connection = require('./connection')
const axios = require('axios')

var key = '' // SALT da API (Usado para ter permissão ao rodar os métodos de busca ou inserção).
const tabela = '' // Tabela a ser utilizada.
var urlapi = 'https://nominatim.openstreetmap.org' //Endereço da API que fará a correção dos endereços não colocar / no final.
var tempoConsulta = 1250 //Intervalo em milisegundos para utilização da API gratuita.

// Cria método para delay utilizando-se de uma promessa que espera a quantidade de milisegundos até ser resolvida.
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// inicializa variável para armazenar os dados do json para consulta dos endereços.
var dados = []
dados[0] = '0'
dados[1] = '0'

//função de correção dos endereços, recebe a URL e executa tarefa assíncrona no banco
function corrigeEnderecos(url) {
  axios.get(url).then(resposta => {

    const headerDate = resposta.headers && resposta.headers.date ? resposta.headers.date : 'Não foi possível realizar a solicitação à API'

    console.log('Solicitação Realizada em:', headerDate)
    console.log('Resposta Status: ' + resposta.status + "\n")

    const enderecos = resposta.data
    
    //Para cada endereco na lista de endereços faça:
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

//Complementação do método corrigeEndereco, recebe o endereço e a chave da API para executar o método
const corrigirEnderecos = async (enderecos, pass) => {
  if (pass == key) {
    try {
      console.log('Solicitação de Correção para: ' + enderecos.length + ' registros. \n')
      //Para i até a quantidade de enderecos faça:
      for (let i = 0; i <= enderecos.length; i++) {
        await delay(tempoConsulta)

        //Retorno visual do que foi encontrado no banco de endereço
        console.log("(" + i + "/" + enderecos.length + ")" + " - " + enderecos[i].nome + " - " + enderecos[i].endereco + " - " + enderecos[i].gps_latitude + ", " + enderecos[i].gps_longitude + "")
        // Executa a correção singular de cadastros para o registro encontrado no banco de dados que não possui latitude e longitude, com base no endereço.
        var dados = corrigeEnderecos(`${urlapi}/search?format=json&q=${enderecos[i].endereco} ${enderecos[i].bairro} ${enderecos[i].municipio}`)
        //Retorno visual no console do que será aplicado no banco de dados.
        console.log("Correção a ser Aplicada: Lat: " + dados[0] + ", Lon: " + dados[1])

        //Esse try vai tentar adicionar a Query no banco, e caso falhe, vai pular para o próximo registro.
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


//Método que busca todos os endereços e filtra por quais não possuem latitude e longitude.
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

// Utilizado para criar o retorno visual no Front-end dos percentuais de correção da base.
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

//Método de pesquisa no banco de dados compatível com o filtro dinâmico de tabelas do schema.
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

//Método de busca para todos os registros sem latitude e longitude.
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
