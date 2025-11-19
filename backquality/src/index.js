require('dotenv').config();
const app = require("./app");
const mongoose = require("mongoose");

const port = process.env.PORT;
const URI = process.env.URI_MONGO;

mongoose.set("strictQuery", false);

// Conexión inicial
mongoose.connect(URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true
})
.then(() => console.log("Conectado a MongoDB Atlas"))
.catch((error) => console.error("Error al conectar a MongoDB:", error));

// Manejo de eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('MongoDB conectado.');
});

mongoose.connection.on('error', (err) => {
  console.error('Error de conexión MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB desconectado. Reintentando en 5 segundos...');
  setTimeout(() => mongoose.connect(URI), 5000);
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconectado.');
});

// Servidor
app.listen(port, () => {
  console.log(`Server on port ${port}`);
});
