let cajitas = []; //Contiene todas las cajitas jugables cuya cantidad siempre será igual a n*n
let isUserPlaying = true; //Determina si el bot es el jugador actual
let playerScore = 0;
let botScore = 0;
let squaresPerRow = 0; //Determina la cantidad de cuadros por lado (no de puntitos ojo) que tiene el tablero
const distance = 50; //tamano de cada cuadrito
$("#userwon").addClass( "d-none" )
$("#botwon").addClass( "d-none" )
let someoneWon = false //Variable usada para detener el juego si alguien ha ganado


function createBoard(){

	cajitas = []; //Se reinicializan los valores por si el usuario decide cambiar el tamano del tablero
	playerScore = 0;
	botScore = 0;
	$(".playeruser").text("👨‍💻 : " + playerScore);
	$(".playerbot").text("🤖 : " + botScore);
	$("#userwon").addClass( "d-none" )
	$("#botwon").addClass( "d-none" )
	someoneWon = false

	isUserPlaying = !$("#firstToPlay").is(':checked');  //Determina cual es el jugador actual y su primer valor es el del checkbox del DOM
	squaresPerRow = parseInt($('#boardSize').val());


	const sx= window.innerWidth/2 - (squaresPerRow*distance)/2, sy = distance*2.5;
	let html = "";	//variable referenciadora al div app del DOM
	$("#app").html(html);
	let cajitaID = 0; //Sirve para identificar dentro del DOM cada linea de una cajita
	for(let i=0; i<squaresPerRow; i++){
		for(let j=0; j<squaresPerRow; j++){
			const x = sx + j * distance, y = sy + i * distance;
			html += `
				<div class="cajita" data-id="${cajitaID}" style="z-index=${j-1}; left:${x+2.5}px; top:${y+2.5}px"></div>
				<div class="punto" style="z-index=${j}; left:${x-5}px; top:${y-5}px" data-cajita="${cajitaID}"></div>						
				<div class="linea lineah" data-linea-1="${cajitaID}" data-linea-2="${cajitaID-squaresPerRow}" style="z-index=${j}; left:${x}px; top:${y}px" data-active="false"></div>
				<div class="linea lineav" data-linea-1="${cajitaID}" data-linea-2="${cajitaID-1}" style="z-index=${j}; left:${x}px; top:${y}px" data-active="false"></div>
				`;			
			cajitas.push(0); //Inicia cada cajita originalmente con un valor de 0
			cajitaID++;
		}
	}

	//Agrega las cajitas de la derecha
	for(let j=0; j<squaresPerRow; j++){
		const x = sx + squaresPerRow * distance, y = sy + j * distance;
		html += `				
				<div class="punto" style="z-index=${j}; left:${x-5}px; top:${y-5}px" data-cajita="${cajitaID}"></div>
				<div class="linea lineav" data-linea-1="${squaresPerRow*(j+1)-1}" data-linea-2="${-1}" style="z-index=${j}; left:${x}px; top:${y}px" data-active="false"></div>
				`;		
	}
	let lastJ = 0
	//Agrega las cajitas de abajo
	for(let j=0; j<squaresPerRow; j++){
		const x = sx + j * distance, y = sy + squaresPerRow * distance;
		html += `				
				<div class="punto" style="z-index=${j}; left:${x-5}px; top:${y-5}px" data-cajita="${cajitaID}"></div>
				<div class="linea lineah" data-linea-1="${((squaresPerRow-1)*squaresPerRow)+j}" data-linea-2="${-1}" style="z-index=${j}; left:${x}px; top:${y}px" data-active="false"></div>
				`;
		lastJ = j;		
	}

	//Anade el punto inferior derecho
	html += `<div class="punto" style="z-index=${lastJ}; left:${sx+squaresPerRow*distance-5}px; top:${sy+squaresPerRow*distance-5}px" data-active="false"></div>`
	
	//Agrega los valores al DOM
	$("#app").html(html);
	applyEvents();
	!isUserPlaying ? botPlay(): null; //El bot es quien juega primero si el user lo seleccionó así en el DOM
}

//Esta función agrega los eventos de click a cada una de las lineas del juego
function applyEvents(){
	$("div.linea").unbind('click').bind('click', function(){
		if(someoneWon) return
		const id1 = parseInt($(this).attr("data-linea-1"));
		const id2 = parseInt($(this).attr("data-linea-2"));  
		let a = false , b = false; 
		
		if(checkValid(this) && isUserPlaying){	
			//Si la linea existe para x o y, se hace una variable auxiliar para cada uno de esos casos
			//si la funcion addValue retorna true quiere decir que se obtuvo una cajita al jugar esa linea
			if(id1 >= 0) a = addValue(id1);
			if(id2 >= 0) b = addValue(id2);
			$(this).addClass("linea-active"); //Marca la linea como jugada de forma visual
			$(this).attr("data-active", "true"); //Marca la linea como jugada

			//Determina si al user le toca ceder la jugada al bot
			if(a === false && b === false){
				botPlay();	
			}			
		}	
	});
}

//Adquiere una cajita (determinada por el id) para un usuario o el bot respectivamente
function acquire(id){
	let color;
	let letter;
	if(isUserPlaying){
		color = "red";
		letter = "U"
		playerScore++;
	}else{
		color = "blue";
		letter = "B"
		botScore++;
	}
	
	$("div.cajita[data-id='"+id+"']").css("background-color", color);
	$("div.cajita[data-id='"+id+"']").html(letter)	

	//Como se adquirió la cajita se coloca su valor como full
	cajitas[id] = "full";


	//Actualiza el tablero en el DOM
	$(".playeruser").text("👨‍💻 : " + playerScore);
	$(".playerbot").text("🤖 : " + botScore);

	//Recorre todo el arreglo de cajitas para determinar si todas están llenas
	let full = true;
	for(let i=cajitas.length-1; i>=0; i--){
		if(cajitas[i] != full){
			full = false;
			break;
		}
	}

	//Si todas las cajitas están llenas quiere decir que alguien ganó, entonces se hace que se pueda ver el mensaje ganador
	if(full){
		(playerScore>botScore) ? 
		$("#userwon").removeClass( "d-none" ): 
		$("#botwon").removeClass( "d-none" )
		someoneWon = true
	}

	if(playerScore>=Math.ceil((squaresPerRow*squaresPerRow)/2)) {
		$("#userwon").removeClass( "d-none" )
		someoneWon = true
	}
	if(botScore>=Math.ceil((squaresPerRow*squaresPerRow)/2)) {
		$("#botwon").removeClass( "d-none" )
		someoneWon = true
	}
}

//Busca una cajita dada por el id y aumenta su valor 
function addValue(id){
	cajitas[id]++;

	//Si el valor de una cajita es 4 quiere decir que está full y que le toca al usuario que hizo la jugada
	if(cajitas[id] === 4){
		acquire(id);
		return true;
	}
	return false;
}

//Checkea si un click es valido
function checkValid(t){
	return($(t).attr("data-active") === "false");
}

//Función que permite al bot jugar
function botPlay(){
	if(someoneWon) return

	isUserPlaying = false;

	setTimeout(function(){		

		
		const length = cajitas.length;

		//Crea 4 arreglos dependiendo para cada caso, 3 lineas 
		//jugadas, 2 lineas jugadas, 1 linea jugada y sin lineas jugadas respectivamente
		//para cada cajita
		let arr3 = [], arr2 = [], arr1 = [], arr0 = [];

		for(let i=length-1; i>=0; i--){
			if(cajitas[i] === 3) arr3.push(i);
			else if(cajitas[i] === 2) arr2.push(i);
			else if(cajitas[i] === 1) arr1.push(i);
			else arr0.push(i);
		}

		//El mejor de los casos es cuando hay 3 lineas en una cajita, 
		//eso quiere decir que si el bot juega la linea restante entonces se quedará con esa cajita
		//entonces selecciona un numero al azar de la lista de cajitas con 3 lineas jugadas
		if(arr3.length > 0){
			botSelect(arr3[numeroRandom(0, arr3.length-1)]);
		}


		//El Caso bueno es donde se ha jugado solo una linea en la cajita, quiere decir que el bot puede jugar ahi
		//sin miedo a que el usuario haga una jugada y se quede con la cajita
		else if(arr1.length > 0){
			botSelect(arr1[numeroRandom(0, arr1.length-1)]);
		}

		//El caso normal es cuando no se ha jugado ninguna linea en la cajita
		else if(arr0.length > 0){
			botSelect(arr0[numeroRandom(0, arr0.length-1)]);
		}

		//El peor de los casos es cuando hay dos lineas jugadas en la cajita puesto que si el bot juega ahí
		//entonces eso ayuda al usuario a conseguir esa cajita
		else if(arr2.length > 0){
			botSelect(arr2[numeroRandom(0, arr2.length-1)]);
		}
		
	}, 500);

}

//Funcion que permite al bot seleccionar una cajita dado un id
function botSelect(id){
	console.log("cajita " + id);

	//Para cada (i,v) de un conjunto de linea1, linea2
	$("div.linea[data-linea-1='"+id+"'], div.linea[data-linea-2='"+id+"']").each(function(i, v){		
		//Si la linea no se ha jugado
		if(!$(v).hasClass("linea-active")){
			const id1 = parseInt($(v).attr("data-linea-1"));
			const id2 = parseInt($(v).attr("data-linea-2")); 
			let a = false , b = false; 

			console.log("----- " + isUserPlaying);

			if(checkValid(v) && isUserPlaying === false){
				console.log("-----");
				//Si la linea existe para x o y, se hace una variable auxiliar para cada uno de esos casos
				//si la funcion addValue retorna true quiere decir que se obtuvo una cajita al jugar esa linea
				if(id1 >= 0) a = addValue(id1);
				if(id2 >= 0) b = addValue(id2);
				$(v).addClass("linea-active"); //Marca la linea como jugada de forma visual
				$(v).attr("data-active", "true"); //Marca la linea como jugada

				//Determina si al bot le toca repetir la jugada
				if(a === true || b === true){
					botPlay();	
				}else{
					isUserPlaying = true; //Intercambia el turno con el jugador
				}					
			}
		}
	});
}

function numeroRandom(min, max){        
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


