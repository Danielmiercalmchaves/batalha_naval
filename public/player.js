const ws = new WebSocket("ws://" + location.host);
	
let tela;

let nome;
let adversario;
let meu_tabuleiro;
let mylimit;
let tabuleiro_adversario;
let gameid;
let slot;
let onwait;

function pressionouTecla(event) 
{
    if (event.keyCode == 13) { // 13 é o código para a tecla Enter
        match(); // Envia a mensagem
    }
}

function colocarNavio(cord)
{
	let i = parseInt(cord.split(" ")[0]);
	let j = parseInt(cord.split(" ")[1]);

	let navio = meu_tabuleiro[i][j];
	var tamanho;

	/*	0- Cima
		1 - Direita
		2 - Baixo
		3 - Esquerda */
	var direcao=0; 

	if(navio==1) tamanho=5;
	if(navio==2) tamanho=4;
	if(navio==3) tamanho=2;
	if(navio==4) tamanho=1;

	
	var t=0; // 0 = Checando // 1 = Próxima direção // 2 = Direção encontrada
	if(!(i-tamanho<0)) 
	{
		for(let k=1; k<tamanho; k++) {
			if(meu_tabuleiro[i-k][j]!=0) t=1;
		}
		if(t!=1) {
			direcao=0;
			t=2;
		}
		else t=0;
	}
	if(!(j+tamanho>9) && t==0)
	{
		for(let k=1; k<tamanho; k++) {
			if(meu_tabuleiro[i][j+k]!=0) t=1;
		}
		if(t!=1) {
			direcao=1;
			t=2;
		}
		else t=0;
	}
	if(!(i+tamanho>9) && t==0)
	{
		for(let k=1; k<tamanho; k++) {
			if(meu_tabuleiro[i+k][j]!=0) t=1;
		}
		if(t!=1) {
			direcao=2;
			t=2;
		}
		else t=0;
	}
	if(!(j-tamanho<0) && t==0)
	{
		for(let k=1; k<tamanho; k++) {
			if(meu_tabuleiro[i][j-k]!=0) t=1;
		}
		if(t!=1) {
			direcao=3;
			t=2;
		}
		else t=0;
	}
	if(t==0) return alert("Sem espaço para embarcações aqui!");


	//Preenche vizinhos com o mesmo número do barco atual
	for(let k=0; k<tamanho; k++)
	{
		let vizinho;
		if(direcao==0) {
			vizinho = "" + (i-k) + " " + j;
			meu_tabuleiro[i-k][j] = navio;
			document.getElementById(vizinho).innerText = meu_tabuleiro[i-k][j];
		}
		if(direcao==1) {
			vizinho = "" + i + " " + (j+k);
			meu_tabuleiro[i][j+k] = navio;
			document.getElementById(vizinho).innerText = meu_tabuleiro[i][j+k];
		}
		if(direcao==2) {
			vizinho = "" + (i+k) + " " + j;
			meu_tabuleiro[i+k][j] = navio;
			document.getElementById(vizinho).innerText = meu_tabuleiro[i+k][j];
		}
		if(direcao==3) {
			vizinho = "" + i + " " + (j-k);
			meu_tabuleiro[i][j-k] = navio;
			document.getElementById(vizinho).innerText = meu_tabuleiro[i][j-k];
		}
	}
	return "sucess";
}




function startGame()
{
	document.body.innerHTML = '';
	document.write("Monte o seu Mapa!");

	//Criando tabela	
  const body = document.body,
        tbl = document.createElement('table');
  tbl.style.width = '700px';
  tbl.style.border = '10px solid blue';

  for (let i = 0; i < 10; i++) 
  {
    const tr = tbl.insertRow();
    for (let j = 0; j < 10; j++) 
    {
        const td = tr.insertCell();

        //Criando botões
        let btn = document.createElement("button");
		btn.innerHTML = meu_tabuleiro[i][j];
		btn.value = i*10+j;
		btn.id= "" + i + " " + j;
		//btn.style.color = "solid black";
		//btn.style.backgroundColor = "solid black";
		btn.style.fontSize = "15px"
		btn.style.width = "50px";
		btn.style.height = "50px";
		btn.innerText = "";

		//Função que monta o mapa
		btn.onclick = function() 
		{
/*
			Regras: 1 Porta-aviões = □□□□□ (5blocos)
					2 Encouraçados = □□□□  (4blocos)
					3 Cruzadores   = □□    (2blocos)
					4 Submarinos   = □     (1bloco )
*/
			if(meu_tabuleiro[i][j]!=0) return alert("Já existe um navio aqui!");

			//num = aviões de 1 a 4
			var num=-1;
			mylimit.forEach(function(item) {
				if(item>0 && num==-1) num = mylimit.indexOf(item)+1;
			});
			if(num==-1) {
				alert("Acabaram suas unidades! Por favor, aguarde o outro jogador.");
					ws.send(JSON.stringify({
			        type: 'game', 
			        meu_tabuleiro: meu_tabuleiro,
			    	gameid: gameid,
			    	slot: slot
			    }));
				document.body.innerHTML = '';
				return document.write("Esperando outro jogador montar o mapa...");
			}

			meu_tabuleiro[i][j] = num;

			if(colocarNavio(btn.id)=="sucess") {
				mylimit[num-1] = mylimit[num-1]-1;
			}
			btn.innerText = num;
			
		};
        
        td.appendChild(btn);
        td.style.border = '0 px solid black';
        td.style.textAlign = "center";
    }
  }
  body.appendChild(tbl);
}

function secondStage()
{
	document.body.innerHTML = '';
	document.write("Ataque seu inimigo!");
	const body = document.body;

	//Tabela de ataque	
  const tbl2 = document.createElement('table');
  tbl2.style.width = '700px';
  tbl2.style.border = '10px solid red';

  for (let i = 0; i < 10; i++) 
  {
    const tr = tbl2.insertRow();
    for (let j = 0; j < 10; j++) 
    {
        const td = tr.insertCell();

        //Criando botões
        let btn = document.createElement("button");
		btn.innerHTML = meu_tabuleiro[i][j];
		btn.value = i*10+j;
		btn.id= "" + i + " " + j;
		//btn.style.color = "solid black";
		//btn.style.backgroundColor = "solid black";
		btn.style.fontSize = "15px"
		btn.style.width = "50px";
		btn.style.height = "50px";
        btn.innerText = "";
        btn.style.background='#33BBFF'
        if(tabuleiro_adversario[i][j] == 3) {btn.innerText = "X"; btn.style.background='red';}
        if(tabuleiro_adversario[i][j] == 2) {btn.innerText = "O"; btn.style.background='blue';}

        //Realizando ataque
		btn.onclick = function() {
				if(tabuleiro_adversario[i][j] == 1) return alert("Você já atacou aí!");
				if(onwait == 1) return alert("Aguade o outro jogador atacar!");
				tabuleiro_adversario[i][j] = 1;
			    ws.send(JSON.stringify({
			    type: 'game', 
			    alvos: tabuleiro_adversario,
			    gameid: gameid,
			    slot: slot
			    }));
			    onwait = 1;
		}; 

        
        td.appendChild(btn);
        td.style.border = '0 px solid black';
        td.style.textAlign = "center";
    }
  }
  body.appendChild(tbl2);

	//Tabela dos seus navios	
  const tbl = document.createElement('table');
  tbl.style.width = '700px';
  tbl.style.border = '10px solid blue';

  for (let i = 0; i < 10; i++) 
  {
    const tr = tbl.insertRow();
    for (let j = 0; j < 10; j++) 
    {
        const td = tr.insertCell();

        //Criando botões
        let btn = document.createElement("button");
		btn.innerHTML = meu_tabuleiro[i][j];
		btn.value = i*10+j;
		btn.id= "" + i + " " + j;
		//btn.style.color = "solid black";
		//btn.style.backgroundColor = "solid black";
		btn.style.fontSize = "15px"
		btn.style.width = "50px";
		btn.style.height = "50px";
		btn.innerText = "";
		btn.style.background='#33BBFF'
        
        let colors = ["yellow", "orange", "green", "#5D4073"]
        if(meu_tabuleiro[i][j] > 0) btn.style.background=colors[meu_tabuleiro[i][j]-1];
        if(meu_tabuleiro[i][j] == -2) btn.style.background='blue';
        if(meu_tabuleiro[i][j] == -3) btn.style.background='red';

        td.appendChild(btn);
        td.style.border = '0 px solid black';
        td.style.textAlign = "center";
    }
  }
  body.appendChild(tbl);

}

function  gameWinner(winner) {
	console.log(winner);
	if(winner == slot)
	{
		document.body.innerHTML = '';
		document.write("Parabéns você venceu! ", adversario, " foi humilhado...");
	}
	if(winner == 3)
	{
		document.body.innerHTML = '';
		document.write("Incrivelmente vocês empataram!");
	}
	else if(winner!=slot) 
	{
		document.body.innerHTML = '';
		document.write("Você pereceu nas mãos de ", adversario, ". Treine mais...");
	}
}


ws.onmessage = (event) => {       
    const json = JSON.parse(event.data);

    if (json.type == 'matching') 
    {
    	meu_tabuleiro = json.meu_tabuleiro;
    	tabuleiro_adversario = json.tabuleiro_adversario;
    	mylimit = [1, 2, 3, 4];
    	gameid = json.gameid;
    	slot = json.slot;

    	var aviso = "Esperando outro jogador..."
    	document.write(aviso);
    }

    if (json.type == 'matched')
    {
    	adversario = json.adversario;
    	startGame();
    }

    if (json.type == 'map_done') secondStage();

    if (json.type == "round_end") 
    {
    	meu_tabuleiro = json.meu_tabuleiro;
    	tabuleiro_adversario = json.tabuleiro_adversario;
    	onwait = 0;
    	secondStage();
    }

    if (json.type == "match_win") gameWinner(json.vencedor);

}

function gameProcess()
{

	//Envia jogada atualizada para o servidor
	ws.send(JSON.stringify({
        type: 'game', 
        meu_tabuleiro: meu_tabuleiro,
    	tabuleiro_adversario: tabuleiro_adversario,
    	gameid: gameid,
    	slot: slot
    }));
}

function match()
{
    if (nome.value == "" || nome.value == "None" ) {
        alert("Por favor, digite um nome de usuário válido!");
        username.focus();
        return;
    }
    ws.send(JSON.stringify({
        type: 'match', 
        username: nome.value
    }));
}



window.addEventListener('load', (e) => {

    nome = document.getElementById('nome');
});

