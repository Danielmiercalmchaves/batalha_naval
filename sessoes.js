const WebSocket = require('ws');
const uuid = require('uuid');

const SITUACAO_NOVA = 0;
const SITUACAO_ANDAMENTO = 1;
const SITUACAO_FINALIZADA = 2;

let tabuleiro_zero = [];
let partidas = [];
let id;
 
function onError(ws, err) {
    console.error(`onError: ${err.message}`);
}

function onClose(ws, reasonCode, description) {
	//Do nothing
}
 
function onMessage(ws, data) 
{
    const json = JSON.parse(data);
    ws.send(JSON.stringify({
        type: 'confirmation',
        data: 'Iniciando'
    })); 

    if(json.type == "match") matchMaking(ws, json);    

    if(json.type == "game") gameManager(ws, json);

}

function endMatch(partida)
{
	partida.jogador1.websocket.send(JSON.stringify({
        type: 'match_win',
        vencedor: partida.vencedor 
    })); 
    partida.jogador2.websocket.send(JSON.stringify({
        type: 'match_win',
        vencedor: partida.vencedor
    })); 

    const index = partidas.indexOf(partida);
    if (index > -1) {
        partida.splice(index, 1);
    }


}

function gameManager(ws, json) 
{

	//Dados da partida
	var partida = partidas[json.gameid];

	var vez = partida.vez;
	var situacao = partida.situacao;

	//Dados dos players
	var player = json.slot;

	var tabuleiro_p1 = partida.jogador1.meu_tabuleiro;
	var tabuleiro_p2 = partida.jogador2.meu_tabuleiro;

	if(player==1) partida.jogador1.tabuleiro_adversario = json.alvos;
	if(player==2) partida.jogador2.tabuleiro_adversario = json.alvos;

	var alvos_p1 = partida.jogador1.tabuleiro_adversario;
	var alvos_p2 = partida.jogador2.tabuleiro_adversario;

	//Turno em progresso
	if(situacao==1)
	{
		if(player==1)			
		{	
			alvos_p1.forEach(function(item) {
				let i = alvos_p1.indexOf(item);
				let j = item.indexOf(1);

				if(j!=-1) 
				{
					if(partida.jogador2.meu_tabuleiro[i][j]>0) {
						partida.jogador1.tabuleiro_adversario[i][j] = 3;
						partida.jogador2.meu_tabuleiro[i][j] = -3;
					}
					else {
						partida.jogador1.tabuleiro_adversario[i][j] = 2;
						partida.jogador2.meu_tabuleiro[i][j] = -2;
					}
				}
			});
			vez++;
		}

		if(player==2)
		{
			alvos_p2.forEach(function(item) {
				let i = alvos_p2.indexOf(item);
				let j = item.indexOf(1);

				if(j!=-1) 
				{
					if(partida.jogador1.meu_tabuleiro[i][j]>0) {
						partida.jogador2.tabuleiro_adversario[i][j] = 3;
						partida.jogador1.meu_tabuleiro[i][j] = -3;
					}
					else {
						partida.jogador2.tabuleiro_adversario[i][j] = 2;
						partida.jogador1.meu_tabuleiro[i][j] = -2;
					}
				}
			});
			vez++;
		}

		if(vez==2)
		{
			partida.jogador1.websocket.send(JSON.stringify({
				type: 'round_end',
				meu_tabuleiro: partida.jogador1.meu_tabuleiro,
				tabuleiro_adversario: partida.jogador1.tabuleiro_adversario
			}));
			partida.jogador2.websocket.send(JSON.stringify({
				type: 'round_end',
				meu_tabuleiro: partida.jogador2.meu_tabuleiro,
				tabuleiro_adversario: partida.jogador2.tabuleiro_adversario
			}));

			let win1 = false, win2 = false; 
			var t=0;

			partida.jogador1.meu_tabuleiro.forEach(function(linha){
				linha.forEach(function(item){
					if(item>0)t++;
				});	
			});
			if(t==0) win2 = true;
			t=0;
			partida.jogador2.meu_tabuleiro.forEach(function(linha){
				linha.forEach(function(item){
					if(item>0)t++;
				});	
			});
			if(t==0) win1 = true;

			if(win1 && win2) 
			{
				partida.vencedor = 3;
				situacao = 2;
				endMatch(partida);
			} 
			else if(win1) 
			{
				partida.vencedor = 1;
				situacao = 2;
				endMatch(partida);
			} 
			else if(win2) 
			{
				partida.vencedor = 2;
				situacao = 2;
				endMatch(partida);
			} 
			vez = 0;	
		}
		partida.vez = vez; 
	}

	//Jogadores posicionam os navios
	if(situacao==0) 
	{
		if(player==1) 
		{
			tabuleiro_p1 = json.meu_tabuleiro;
			vez++;
		}

		if(player==2)
		{
			tabuleiro_p2 = json.meu_tabuleiro;
			vez++; 		
		}

		if(vez==2)
		{
			partida.situacao = 1;
			vez = 0;

			partida.jogador1.websocket.send(JSON.stringify({
				type: 'map_done'
			}));
			partida.jogador2.websocket.send(JSON.stringify({
				type: 'map_done'
			}));
		}

		partida.vez = vez;
	}
	
	//Atualiza os dados salvos em partida
	partida.jogador1.meu_tabuleiro = tabuleiro_p1;
	partida.jogador2.meu_tabuleiro = tabuleiro_p2;



}

function matchMaking(ws, json)
{
	while(true) 
	    {
	    	p1 = partidas[id].jogador1;
	    	p2 = partidas[id].jogador2;

		    if(p1.nome=="None")
		    {
		    	p1.nome = json.username;
		    	p1.websocket = ws;

		    	p1.websocket.send(JSON.stringify({
		            type: 'matching',
		            nome: p1.nome,
		            meu_tabuleiro: p1.meu_tabuleiro,
		            tabuleiro_adversario: p1.tabuleiro_adversario,
		            gameid: id,
		            slot: 1
	        	}));


		    	break;
		    }	    
		    else if(p2.nome=="None")
		    {
				p2.nome = json.username;
		    	p2.websocket = ws;

		    	p1.websocket.send(JSON.stringify({
		            type: 'matched',
		            adversario: p2.nome
	        	}));

		    	p2.websocket.send(JSON.stringify({
		            type: 'matching',
		            nome: p2.nome,
		            meu_tabuleiro: p2.meu_tabuleiro,        
		            tabuleiro_adversario: p2.tabuleiro_adversario,
		            gameid: id,
		            slot: 2
	        	}));
	        	p2.websocket.send(JSON.stringify({
		            type: 'matched',
		            adversario: p1.nome
	        	}));


		    	break;
		    }
		    else gameBuilder();
	    }
}

//Cria um jogo vazio e adicona a lista de partidas
function gameBuilder() 
{
	id = uuid.v4();

	partidas[id] = {
		jogador1: {
			nome: 'None',
			websocket: 0,
			meu_tabuleiro: tabuleiro_zero,
			tabuleiro_adversario: tabuleiro_zero
		},
		jogador2: {
			nome: 'None',
			websocket: 0,
			meu_tabuleiro: tabuleiro_zero,
			tabuleiro_adversario: tabuleiro_zero
		},
		situacao: 0,
		vencedor: 0,
		vez: 0
	}

}

//Cria um tabuleiro preenchido por zero
function tabuleiroZero() 
{
	for(let i=0; i<10; i++) {
		tabuleiro_zero[i] = [0, 0];
		for(let j=0; j<10; j++) {
			tabuleiro_zero[i][j] = 0;
		}
	}	
}

function onConnection(ws, req) {
    ws.on('message', data => onMessage(ws, data));
    ws.on('error', error => onError(ws, error));
    ws.on('close', (reasonCode, description) => onClose(ws, reasonCode, description));

    ws.send(JSON.stringify({
        type: 'connection',
        data: 'Bem vindo'
    }))
}

module.exports = (server) => {
    const wss = new WebSocket.Server({
        server
    });
 
    wss.on('connection', onConnection);

    tabuleiroZero();
    gameBuilder();

    return wss;
}