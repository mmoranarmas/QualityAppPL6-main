require('dotenv').config();
const app = require("./app");
const mongoose = require("mongoose");

const port = process.env.PORT;
const URI = process.env.URI_MONGO;

mongoose.set("strictQuery", false);

const mongoOptions = {
  serverSelectionTimeoutMS: 30000, // de 5000 a 30000
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,         // de 10000 a 30000
  retryWrites: true,
  retryReads: true,
};

let isConnecting = false; // evita reconexiones duplicadas

const connectDB = async () => {
  if (isConnecting) return;
  isConnecting = true;

  try {
    await mongoose.connect(URI, mongoOptions);
    isConnecting = false;
  } catch (error) {
    isConnecting = false;
    console.error("Error al conectar a MongoDB:", error.message);
    setTimeout(connectDB, 15000);
  }
};

mongoose.connection.on('connected', () => {
  console.log('MongoDB conectado.');
});

mongoose.connection.on('error', () => {
  // connectDB ya maneja los errores
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB desconectado. Reintentando...');
  setTimeout(connectDB, 15000); // reintenta con mongoOptions
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconectado.');
});

// una sola función de conexión
connectDB();

app.listen(port, () => {
  console.log(`Server on port ${port}`);
});
