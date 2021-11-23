const express = require("express");
const app = express();
var sqlite3 = require('sqlite3').verbose();

const preguntas = [
	["Cual es el segundo nombre que me puso mi mama?", "Catalina", "Almudena", "Carolina", "Martina"],
	["Cual es el mayor antojo de mi mama durante su embarazo?", "Chocolate", "Tigrillo", "Pizza", "Sushi"],
	["Cual es el color favorito de mi mama?", "Azul", "Rojo", "Rosado", "Celeste"],
	["En que fecha se caso mi mama?", "5 agosto", "12 agosto", "19 agosto", "26 agosto"],
	["Cuantas semana me tiene mi mama en su vientre?", "35", "36", "37", "38"]
];

const resultados = [3,2,3,1,2];

app.use(express.static("public"));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/preguntas", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(preguntas);
});

app.get('/respuesta', function (req, res) {  
   console.log(req.query.name);  
   console.log(req.query.r1); 
   console.log(req.query.r2); 
   console.log(req.query.r3); 
   console.log(req.query.r4); 
   console.log(req.query.r5);
   
  let db = new sqlite3.Database('baby.db', sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
		console.error(err.message);
	}
	console.log('Connected to the baby database.');
	});	
	
	db.serialize(() => {
		db.run("INSERT INTO player VALUES ('" + req.query.name + "'," + req.query.r1 + "," + req.query.r2 + "," + req.query.r3 + "," 
		+ req.query.r4 + "," + req.query.r5 +  ")", function(err) {
		if (err) {
			return console.error(err.message);
		}
		console.log("Row(s) updated");

		});
	});

	db.close((err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Close the database connection.');
	});
   
   res.end("exito");  
})  

var textsql;
app.get("/final", (request, response) => {	
	var ordenada = [];
	let db = new sqlite3.Database('baby.db', sqlite3.OPEN_READONLY, (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Connected to the baby database.');
		response.writeHead(200, {'Content-Type': 'text/html'});
		textsql = "";
		textsql += "<html><head><style>table {  border-collapse: collapse;  border-spacing: 0;  width: 100%;  border: 1px solid #ddd;}";
		textsql += "th, td {  text-align: left;  padding: 16px; } tr:nth-child(even) { background-color: #f2f2f2;}</style></head><body><table>";
		textsql += "<tr><th>Nombre</th><th>Respuesta1</th><th>Respuesta2</th><th>Respuesta3</th><th>Respuesta4</th><th>Respuesta5</th><th>Puntuacion</th></tr>";
	});	
	
	db.serialize(() => {
		db.each("SELECT * FROM player", (err, row) => {
			if (err) {
				console.error(err.message);
			}
			var calculo = (row.r1==resultados[0])?1:0;
			calculo += (row.r2==resultados[1])?1:0;
			calculo += (row.r3==resultados[2])?1:0;
			calculo += (row.r4==resultados[3])?1:0;
			calculo += (row.r5==resultados[4])?1:0;
			console.log(calculo);
			ordenada.push([row.nombre,(row.r1==resultados[0]),(row.r2==resultados[1]),(row.r3==resultados[2]),(row.r4==resultados[3]),
				(row.r5==resultados[4]),calculo]);				
		});		
	});

	db.close((err) => {
		if (err) {
			console.error(err.message);
		}
		ordenada = ordenada.sort(function(a,b) {
			return b[6] - a[6];
		});
		for(var i = 0; i < ordenada.length; i++){
			textsql += "<tr><th>"+ordenada[i][0]+"</th><th>"+ordenada[i][1]+"</th><th>"+ordenada[i][2]+"</th><th>"+ordenada[i][3]+"</th><th>"
				+ordenada[i][4]+"</th><th>"+ordenada[i][5]+"</th><th>"+ordenada[i][6]+"</th></tr>";
		}		
		textsql += "</table></body></html>";
		console.log('Close the database connection.');
		response.write(textsql);
		return response.end();
	});	
	
});

app.get("/reset", (request, response) => {	
	let db = new sqlite3.Database('baby.db', sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
		console.error(err.message);
	}
	console.log('Connected to the baby database.');
	});	
	
	db.serialize(() => {
		db.run("DELETE FROM player", function(err) {
		if (err) {
			return console.error(err.message);
		}
		console.log("Rows deleted");

		});
	});

	db.close((err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Close the database connection.');
	});
   
   response.end("exito");  
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
