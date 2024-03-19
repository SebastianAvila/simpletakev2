const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: "uploads/" }).single("inputFile"));

// Ruta para la página de inicio
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Exporta la aplicación de Express
exports.app = app;

// Inicia el servidor
const server = app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
