//Parte do JS que trata o front-end lidando com a questrão dos filtros.

var colunas_global = []
var contador = 1

function filtroDinamico(colunas = [], selectAlvo) {
    colunas_global = colunas;
    for (let i = 0; i < colunas.length; i++) {
        var option = document.createElement("option");
        option.text = colunas[i].column_name;
        option.value = colunas[i].column_name;
        var select = document.getElementById(selectAlvo);
        select.appendChild(option);
    }

}

//Função utilizada para criar novos objetos containerizados para a interface que respondam como selects de filtros e se posicionem abaixo do primeiro filtro da página.
function adicionarFiltro() {

    var linha = document.createElement("div");
    linha.id = `linha${contador}`
    linha.className = "uk-flex"


    var linhaIn = document.getElementById(`linha${contador - 1}`);

    var linhaNova = document.createElement("div");
    linhaNova.id = `linha${contador}`;
    linhaNova.className = "uk-flex"
    linhaNova.style = "padding-top: 5px;"

    var filtro = document.createElement("select");
    filtro.id = `filtro${contador}`
    filtro.className = "uk-select DerekSelect"
    filtro.name = "filtro"
    filtro.style = "height:30px"

    var operador = document.createElement("select");
    operador.id = `operador${contador}`
    operador.className = "uk-select DerekSelect"
    operador.name = "operador"
    operador.style = "height:30px; margin-left: 5px"

    var condicao = document.createElement("input");
    condicao.id = `condicao${contador}`
    condicao.className = "uk-input"
    condicao.name = "condicao"
    condicao.style = "height:30px; margin-left: 5px"
    condicao.placeholder = "Condição"



    linhaIn.insertAdjacentElement('afterend', linhaNova);



    linhaNova.insertAdjacentElement('afterbegin', filtro);

    linhaNova.insertAdjacentElement('beforeend', operador);



    var option = document.createElement("option");
    option.name = 'igual';
    option.text = 'Igual';
    option.value = '0';
    var select = document.getElementById(`operador${contador}`);
    select.appendChild(option);

    var option2 = document.createElement("option");
    option.name = 'contem';
    option2.text = 'Contem';
    option2.value = '1';
    select.appendChild(option2);

    var option3 = document.createElement("option");
    option.name = 'maior';
    option3.text = 'Maior';
    option3.value = '2';
    select.appendChild(option3);

    var option4 = document.createElement("option");
    option.name = 'menor';
    option4.text = 'Menor';
    option4.value = '3';
    select.appendChild(option4);

    linhaNova.insertAdjacentElement('beforeend', condicao);





    contador++
    //alert(filtro.id)
    filtroDinamico(colunas_global, filtro.id);
}
//Função que se dispõe de filtros criados na tela em tempo de execução.
function removerFiltro() {
    if (contador > 1) {
        contador--;
        document.getElementById(`linha${contador}`).remove();
    } else {
        select0 = document.getElementById('select0');
        operador0 = document.getElementById('operador0');
        condicao0 = document.getElementById('condicao0');

        select0.selectedIndex = 0;
        operador0.value = 0;
        condicao0.value = '';
    }

}
