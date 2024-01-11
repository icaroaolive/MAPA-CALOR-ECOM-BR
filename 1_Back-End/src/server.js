const app = require('./app');
require('dotenv').config();


const PORT = process.env.PORT || 3333;

app.listen(PORT, () => console.log(`[API: ADDRESS MONITOR] # e-comBR] Serviço inicializado: http://localhost:${PORT}`));

app.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');

    next();
});


