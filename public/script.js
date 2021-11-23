const lcabeza = document.getElementById("cabeza");
const lcuerpo = document.getElementById("cuerpo");
const babyForm = document.querySelector("form");

var apreguntas;
var pregunta_n = 1;
var toget = {};

console.log(babyForm.elements);

fetch("/preguntas")
  .then(response => response.json()) // parse the JSON from the server
  .then(preguntas => {
	  console.log(preguntas);
	  apreguntas = preguntas;
 });


babyForm.addEventListener("submit", event => {
    event.preventDefault();		
	
	// debugger;
	
	if(pregunta_n == 1){
		var formData = new FormData(event.target);
		console.log(formData.get("bnombre"));
		toget['name'] = formData.get("bnombre");
	} 
	
	lcabeza.innerHTML = "Pregunta " + pregunta_n;
	lcuerpo.innerHTML = apreguntas[pregunta_n - 1][0];	
	
	
	var formSize = babyForm.elements.length;
	for(var i = 0; i < formSize; i++)
		babyForm.elements[0].remove();
		
	for(var i = 0; i < 4; i++){
		const newButton = document.createElement("button");
		newButton.innerHTML = apreguntas[pregunta_n - 1][i + 1];
		newButton.className = "btn";
		newButton.value = i + 1;
		newButton.type = "submit";
		newButton.style.marginTop = "5px";
		babyForm.appendChild(newButton);
	}	
	
	pregunta_n += 1;
});

babyForm.addEventListener("click", event => {
	if(pregunta_n > 1) {
		console.log(event.target.value);
		toget['r' + (pregunta_n - 1)] = event.target.value;		
		
		if(pregunta_n > 5){
			console.log(toget);
			
			var formSize = babyForm.elements.length;
		for(var i = 0; i < formSize; i++)
			babyForm.elements[0].remove();
			lcabeza.innerHTML = "Eso fue todo!";
			lcuerpo.innerHTML = "Gracias por participar, el anfitrion dara los resultados.";	
			
			fetch("/respuesta?name="+toget["name"]+"&r1="+toget["r1"]+"&r2="+toget["r2"]+"&r3="+toget["r3"]+"&r4="+toget["r4"]+"&r5="+toget["r5"])
				.then(res => {
				  console.log("Request complete! response:", res);
				});
			return;
		}
	}
});