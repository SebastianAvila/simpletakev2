const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: "uploads/" }).single("inputFile"));

function simplifyText(inputText) {
  const regex =
    /TAKE \d+\s+(Track \d+\s+)?[\s\S]+?IN: (\d{2}:\d{2}:\d{2}:\d{2})\s+DURATION: (\d{2}:\d{2}:\d{2}:\d{2})\s+[\s\S]+?OUT: (\d{2}:\d{2}:\d{2}:\d{2})\s+[-]+/g;
  let simplifiedBlocks = [];
  let match;
  while ((match = regex.exec(inputText)) !== null) {
    const take = match[0].match(/TAKE \d+/)[0];
    const timeIN = match[2];
    const timeOUT = match[4];
    const dialogueLines = match[0].split("\n").slice(2, -2);
    const dialogue = dialogueLines
      .map((line, index) => {
        if (index === 0) {
          // Eliminar el número de pista pero conservar el número de toma
          line = line.replace(/(TAKE \d+\s+)?(Track \d+\s+)?/, "");
        }
        // Reemplazar salto de línea después del nombre por ": "
        return line.replace(/\n/, ": ");
      })
      .join("\n")
      .trim();
    const simplifiedBlock = `${take}\n${timeIN}\n${dialogue}\n${timeOUT}`;
    simplifiedBlocks.push(simplifiedBlock);
  }
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
