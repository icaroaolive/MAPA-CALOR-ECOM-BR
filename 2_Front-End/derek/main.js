//CONFIGURAÇÕES
const host = "" //host da API
const porta = "" //porta da API
const schema = "" //determina o schema do postgres para auxiliar em consultas globais
const tabela = "" //determina a tabela de onde os filtros serão montados
const key = "" //usado como salt na API para não ser explorado como vulnerabilidade
const coordenada_padrao_mapa = [-5855349.118211474, -3140369.6419760953] //Posicionamento padrão do mapa quando criada a visualização em tela.



// RECEBE COLUNAS PARA FILTRO
function retornaColunas(selectAlvo) {
    const api = `${host}:${porta}`
    const url = `http://${api}/buscarFiltros/${schema},${tabela},${key}`
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            filtroDinamico(JSON.parse(xhttp.responseText), selectAlvo)
        }
    }
    xhttp.open("GET", url, true)
    xhttp.setRequestHeader("Content-type", "json")
    xhttp.send()
}

//Declaração de variáveis para callback na interface dos dados estatísticos da base

var label_totalconsist = document.getElementById('totalconsist')
var label_totalregis = document.getElementById('totalregis')
var label_consistencia = document.getElementById('consistencia')

//Cria função assíncrona de nutrição dos dados estatísticos da base para a interface, retorna percentual de correção, quantidade de registros corrigidos, e total de registros
async function retornaEstatisticas() {
    const api = `${host}:${porta}`
    const url = `http://${api}/criarEstatisticas/`
    var xhttp = new XMLHttpRequest()


    xhttp.open("GET", url, true)
    xhttp.setRequestHeader("Content-type", "json")
    xhttp.send()
    xhttp.onreadystatechange = async function () {

        var percentual = ((JSON.parse(xhttp.responseText)[0].count / JSON.parse(xhttp.responseText)[1].count) * 100).toFixed(2)

        label_consistencia.innerHTML = percentual + "%"
        label_totalconsist.innerHTML = JSON.parse(xhttp.responseText)[0].count
        label_totalregis.innerHTML = JSON.parse(xhttp.responseText)[1].count

    }

}



// GERADOR DE CONSULTAS PARA FILTROS
function selecaoDeFiltros(colunas = []) {

    // Recebe todos os elementos e seus devidos slots como constantes para uso no código.
    const filtros = document.getElementsByName("filtro")
    const operadores = document.getElementsByName("operador")
    const condicoes = document.getElementsByName("condicao")

    if (condicoes == '') {

    }
    // inicializa variável que vai armazenar os tipos de dados de cada filtro para saber se utiliza operador numérico ou de texto.
    var colxtipo = []
    
    var query = `SELECT * FROM ${tabela} WHERE `

    //Monta o vetor de filtros na tela armazenando seu nome e tipo de dados
    for (var i = 0; i < filtros.length; i++) {
        for (var j = 0; j < colunas.length; j++) {
            if (filtros[i].options[filtros[i].selectedIndex].value == colunas[j].column_name) {
                colxtipo.push({
                    "filtro": colunas[j].column_name,
                    "tipo": colunas[j].data_type
                })
            }
        }
    }
    //Se o filtro for único e possuir tipo de texto será aplicado ILIKE senão utiliza condição padrão para filtro numérico
    if (colxtipo.length == 1) {

        if (deParaOperador(operadores[0].value) == "ILIKE") {
            query += `${colxtipo[0].filtro} ` + deParaOperador(operadores[0].value) + " '%25" + deParaTipo(colxtipo[0].tipo, condicoes[0].value + "%25'", true)
        } else {
            query += `${colxtipo[0].filtro} ` + deParaOperador(operadores[0].value) + " " + deParaTipo(colxtipo[0].tipo, condicoes[0].value)
        }



    } else {

        //Para mais de um filtro, i vai loopar até a quantidade de filtros que foi montado no colxtipo no laço acima;
        for (let i = 0; i < colxtipo.length; i++) {
            if (i == 0) {
                // O primeiro filtro sempre receberá valores fixos.
                // foi montada a query usando %25 por ser o código de encoding do '%', passar ele só como '%' não funciona por que da erro no processamento do link.
                if (deParaOperador(operadores[i].value) == "ILIKE") {
                    query += `${colxtipo[0].filtro} ` + deParaOperador(operadores[0].value) + " '%25" + deParaTipo(colxtipo[0].tipo, condicoes[0].value + "%25'", true)
                } else {
                    query += `${colxtipo[0].filtro} ` + deParaOperador(operadores[0].value) + " " + deParaTipo(colxtipo[0].tipo, condicoes[0].value)
                }

            } else {
                //Caso ele não seja o primeiro filtro, a query receberá uma estrutura que seja possível "cumular" vários filtros na consulta.
                // Os métodos "dePara[...]" servem para fazer um switch case transformando a operação do filtro de "Maior" para ">" para que seja aplicado na consulta.
                // O mesmo é aplicado para saber quando é "Contem" e "Igual" , pois precisavamos aplicar "="; "ILIKE" nas situações.

                query += ` AND ${colxtipo[i].filtro} ` + deParaOperador(operadores[i].value)

                if (deParaOperador(operadores[i].value) == "ILIKE") {
                    query += " '%25" + deParaTipo(colxtipo[i].tipo, condicoes[i].value, true) + "%25'"
                } else {
                    query += " " + deParaTipo(colxtipo[i].tipo, condicoes[i].value)
                }
            }
        }
    }



    //Método xhttp em todo o projeto chama o executar de request do node para receber ou aplicar dados através da API, neste caso, está buscando os dados passando os parâmetros :query/:key
    const api = `${host}:${porta}`
    const url = "http://" + api + "/buscarFiltro/" + query + "/" + key

    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const dados = xhttp.responseText
            resultadoDoFiltro(dados)



        }
    }
    xhttp.open("GET", url, true)
    xhttp.setRequestHeader("Content-type", "json")
    xhttp.send()

    return xhttp.responseText


}

// deParaOperador serve para converter a operação da interface de "Maior" para ">" para ser utilizado na query.
function deParaOperador(operadorId) {
    switch (operadorId) {
        case "0":
            return '='

        case "1":
            return 'ILIKE'

        case "2":
            return '>'

        case "3":
            return '<'
        default:
            return '='
    }

}

// deParaTipo serve para identificar o tipo de caracter e aplicar adequadamente o tipo de operação, nesse caso, foi usado para aplicar 'ILIKE' ou '=' nas queries de texto.

function deParaTipo(tipoNome, condicao, like) {
    if (like == true) {
        switch (tipoNome) {
            case "integer":
                return condicao
            case "character":
                return `${condicao}`
            case "character varying":
                return `${condicao}`

            default:
                return `${condicao}`
        }
    }
    switch (tipoNome) {
        case "integer":
            return condicao
        case "character":
            return `'${condicao}'`
        case "character varying":
            return `'${condicao}'`

        default:
            return `'${condicao}'`
    }
}




//Método que monta o GEOJSONData, é um auxiliar que recebe um vetor global de pessoas criado pelos métodos de busca da API e monta os 
//pontos dentro de um JSON nomeado de "FeatureCollection", caso haja necessidade de entender uma 'FC' ler a API do OpenLayers 
//no que diz a respeito sobre FeactureCollections
function loadGeoJSONData() {
    const features = pessoas.map(pessoa => montaPontosLatLong(pessoa))
    return ({
        'type': 'FeatureCollection',
        'features': features
    })
}




//CONSTANTES INICIALIZADORAS DO MAPA

const attributionControl = new ol.control.Attribution({
    collapsible: false
})


const map = new ol.Map({

    view: new ol.View({
        center: coordenada_padrao_mapa,
        zoom: 12,
        minZoom: 4,
        maxZoom: 20,
    }),

    target: 'js-map',
    controls: ol.control.defaults({
        attribution: false
    }).extend([attributionControl])
})


const openstreetMapStandard = new ol.layer.Tile({
    source: new ol.source.OSM(),
    visible: true,
    title: 'OSMStandard'
})

const openStreetMapHumanitarian = new ol.layer.Tile({
    source: new ol.source.OSM({
        url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    }),
    visible: false,
    title: 'OSMHumanitarian'
})

const cartoDBBaseLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'http://{1-4}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
        attributions: '© CARTO'
    }),
    visible: false,
    title: 'CartoDarkAll'
})

const googleSatelliteMap = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    }),
    visible: false,
    title: 'Google Satellite',
})

const baseLayerGroup = new ol.layer.Group({
    layers: [
        openstreetMapStandard,
        openStreetMapHumanitarian,
        cartoDBBaseLayer,
        googleSatelliteMap
    ]
})

const baseLayerElements = document.querySelectorAll('input[type=radio]')
for (let baseLayerElement of baseLayerElements) {
    baseLayerElement.addEventListener('change', function () {
        let baseLayerElementValue = this.value
        baseLayerGroup.getLayers().forEach(function (element, index, array) {
            let baseLayerName = element.get('title')
            element.setVisible(baseLayerName === baseLayerElementValue)
        })
    })
}



//FUNÇÃO DE CARREGAMENTO DA VIEW DO MAPA

function inicializaVisualizacao() {

    map.addLayer(baseLayerGroup)

}





//CONSTANTE QUE VAI HOSPEDAR TODOS OS REGISTROS QUE POSSUEM LATITUDE E LONGITUDE DENTRO DO FILTRO DE DADOS
var pessoas = []

function montaPontosLatLong(pessoa) {


    const lat = parseFloat(pessoa.gps_latitude)
    const lon = parseFloat(pessoa.gps_longitude)


    const jsonData = {
        type: "Feature",
        properties: {
            weight: 0.1
        },
        geometry: {
            coordinates: [lon, lat],
            type: "Point"
        }
    }

    return jsonData
}

function resultadoDoFiltro(pessoasFiltradas = []) {
    try {
        const data = JSON.parse(pessoasFiltradas)
        for (var i = 0; i < data.length; i++) {
            pessoas.push({
                "gps_latitude": data[i].gps_latitude,
                "gps_longitude": data[i].gps_longitude
            })
        }
        if (data.length == 1) {
            alert('Foi encontrado: ' + data.length + ' registro a ser exibido no mapa.')

        } else if (data.length == 0) {
            alert('Nenhum registro foi encontrado.')
        } else {
            alert('Foram encontrados: ' + data.length + ' registros a serem exibidos no mapa.')
        }

        return adicionaPontoCalor()
    } catch (error) {
        alert('Nenhum registro foi encontrado.')
        map.setLayerGroup(new ol.layer.Group())
        inicializaVisualizacao()

    }

}


function adicionaPontoCalor() {



    //LIMPA CAMADAS DE PONTO DE CALOR QUE PODEM ESTAR POR CIMA DO MAPA
    map.setLayerGroup(new ol.layer.Group())

    //RECONSTRÓI A VIEW DO MAPA
    inicializaVisualizacao()

    //ADICIONA OPÇÃO DE PROJEÇÃO DAS FEATURES QUE SÃO MONTADAS NO ARQUIVO DE GEOJSON
    const featureProjection = 'EPSG:3857'

    //EXECUTA MÉTODO DE CARREGAMENTO DO GEOJSON 

    const geoJSONData = loadGeoJSONData()

    //CONFIGURA A APARÊNCIA DOS PONTOS DE CALOR
    const heatMapPontosCalor = new ol.layer.Heatmap({
        source: new ol.source.Vector({
            features: [],
        }),
        radius: 20,
        blur: 12,
        gradient: ['#0000FF', '#00FF00', '#FFFF00', '#FFA500', '#FF0000'],
        title: 'PontosCalor',
        visible: true,
    })


    //FEATURES SÃO PARTE COMPONENTE DE UM GEOJSON, QUE TRAZ A MARCAÇÃO DO PONTO DE CALOR PELA LATITUDE E LONGITUDE.
    //PARA ADICIONAR UMA CAMADA COM OS PONTOS DE CALOR PRECISAMOS MONTAR UM OBJETO (NÃO CONFUNDIR COM ARRAY DE OBJETOS) COM A ESTRUTURA:
    // {
    //     "type": "FeatureCollection",
    //     "features": [
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "weight": 0.3
    //             },
    //             "geometry": {
    //                 "coordinates": [
    //                     LATITUDE,
    //                     LONGITUDE
    //                 ],
    //                 "type": "Point"
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "weight": 0.3
    //             },
    //             "geometry": {
    //                 "coordinates": [
    //                     -48.531974,
    //                     -6.414104
    //                 ],
    //                 "type": "Point"
    //             }
    //         }
    //     ]
    // }


    const features = new ol.format.GeoJSON().readFeatures(geoJSONData, {
        featureProjection: featureProjection,
    })

    // as features recebem a leitura do geoJSONData que foi criado através do método map de arrays pois o map de arrays funciona semelhante a um foreach
    // como não se consegue saber o fim do dos pontos a função map, vai rodar e acrescentar features dentro do arquivo geoJSON e encontrar o fim por conta própria
    // depois que o GeoJSON é montado com as features, acrescentamos ela no mapa através do new ol.format.GeoJSON().readFeatures() , este método lê o json corretamente formatado
    // e acrescenta a opção: "featureprojection" no arquivo, que vai complementar o cabeçalho dos arquivos das features, sem ele, o mapa não renderiza os pontos.

    heatMapPontosCalor.getSource().addFeatures(features)

    const resultadoFinal = JSON.stringify(geoJSONData, null, 4)

    console.log(resultadoFinal)



    //Adiciona a camada de FeactureCollections (que são os pontos e as latitudes /longitudes) em cima da camada de visualização do mapa.
    const layerGroup = new ol.layer.Group({
        layers: [
            heatMapPontosCalor
        ]
    })

    //ATUALIZA A VIEW COM OS PONTOS ADICIONADOS
    map.addLayer(layerGroup)

    for (let i = 0; i < pessoas.length; i++) {
        if (pessoas[i].gps_latitude != 0 && pessoas[i].gps_latitude != '') {
            if (pessoas[i].gps_longitude != 0 && pessoas[i].gps_longitude != '') {
                map.getView().setCenter(ol.proj.fromLonLat([pessoas[i].gps_longitude, pessoas[i].gps_latitude]))
                break
            }
        }
    }

    pessoas = []
}



//Executa a função no momento que o DOM é carregado.
async function init() {
    retornaEstatisticas()
    await retornaColunas("select0")
    inicializaVisualizacao()


}



//INICIALIZA MAPA AO CARREGAR A PÁGINA
window.ini = init()
