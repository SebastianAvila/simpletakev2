const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: "uploads/" }).single("inputFile"));

// // Función para simplificar el texto elimina el out pero no el track
function simplifyText(inputText) {
  // Encuentra todas las ocurrencias de bloques de diálogo y sus respectivos tiempos
  const regex =
    /TAKE \d+\s+[\s\S]+?IN: (\d{2}:\d{2}:\d{2}:\d{2})\s+DURATION: (\d{2}:\d{2}:\d{2}:\d{2})\s+[\s\S]+?OUT: (\d{2}:\d{2}:\d{2}:\d{2})\s+[-]+/g; //Este elimina OUT, pero no track

  // Crea una lista para almacenar los bloques de diálogo simplificados
  let simplifiedBlocks = [];
  // Encuentra todos los bloques de diálogo
  let match;
  while ((match = regex.exec(inputText)) !== null) {
    // Extrae el tiempo IN, OUT y el diálogo del bloque
    const timeIN = match[1];
    const timeOUT = match[3];
    const dialogue = match[0].split("\n").slice(2, -2).join("\n").trim(); // Elimina las líneas IN y OUT
    // Crea un bloque de diálogo simplificado con el formato requerido
    const simplifiedBlock = `${
      match[0].split("\n")[0]
    }\n${timeIN}\n${dialogue}\n${timeOUT}`;
    // Agrega el bloque de diálogo simplificado a la lista
    simplifiedBlocks.push(simplifiedBlock);
  }
  // Combina todos los bloques de diálogo simplificados en un solo texto
  return simplifiedBlocks.join("\n\n");
}

// Ruta para la página de inicio
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Ruta para procesar el archivo de entrada y mostrar el resultado
app.post("/process", (req, res) => {
  const inputFile = req.file;
  if (inputFile) {
    fs.readFile(inputFile.path, { encoding: "latin1" }, (err, data) => {
      // Especifica la codificación como 'latin1'
      if (err) throw err;
      const simplifiedText = simplifyText(data);
      res.attachment("simplified.txt");
      res.send(simplifiedText);
    });
  } else {
    res.status(400).send("No file uploaded.");
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
