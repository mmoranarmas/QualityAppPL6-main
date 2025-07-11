// Configuración de Express para el servidor
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const minutas_routes = require("./routes/minutasRoutes");
const material_routes = require("./routes/materialRoutes");
const usuarios_routes = require("./routes/usuariosRoutes");
const inspeccion_routes = require("./routes/inspeccionRoutes");
const grafica_routes = require("./routes/graficaRoutes");
const status_routes = require("./routes/statusRoutes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// RUTAS

app.get("/", (req, res) => {
    res.send("Si ves este mensaje, el servidor está funcionando correctamente");
  });

app.use("/api/usuarios", usuarios_routes)
app.use("/api/minutas", minutas_routes)
app.use("/api/material", material_routes)
app.use("/api/inspeccion", inspeccion_routes)
app.use("/api/grafica", grafica_routes)
app.use("/api/status", status_routes)

module.exports = app;