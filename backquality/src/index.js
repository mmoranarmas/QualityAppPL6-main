require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");

const port = process.env.PORT || 3000;
const URI = process.env.URI_MONGO;

// Evitar múltiples conexiones
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log("MongoDB conectado");

  } catch (err) {
    console.error("Error al conectar a MongoDB:", err);
    console.log("Reintentando conexión en 5 segundos...");
    setTimeout(connectDB, 5000);
  }
}

// Eventos
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB desconectado. Reintentando...");
  isConnected = false;
  connectDB();
});

mongoose.connection.on("error", (err) => {
  console.error("Error MongoDB:", err);
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectDB(); // 👈 Conecta al iniciar el servidor
});
