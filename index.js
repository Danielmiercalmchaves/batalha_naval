const app = require('./app');
const appWs = require('./app-ws');
const sessoes = require("./sessoes");
 
const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Está rodando!`);
})
 
sessoes(server);