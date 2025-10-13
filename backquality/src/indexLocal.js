require('dotenv').config();
const app = require("./app");
const port = process.env.PORT || 4000;
const mongoose = require("mongoose");

// Configuración mínima pero efectiva para Vercel
const mongoOptions = {
  serverSelectionTimeoutMS: 8000,  // 8 segundos para selección de servidor
  socketTimeoutMS: 30000,         // 30 segundos para operaciones
  connectTimeoutMS: 10000,        // 10 segundos para conexión inicial
  retryWrites: true,              // Reintentar escrituras
  retryReads: true                // Reintentar lecturas
};

mongoose.set("strictQuery", false); // Para evitar warnings en Mongoose 7+

// Solución DNS para Vercel (opcional pero recomendada)
try {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '1.1.1.1']); // Usar DNS públicos
} catch (dnsError) {
  console.log('⚠️ No se pudo configurar DNS alternativo');
}

const connectDB = async () => {
  try {
    // Conexión usando solo URI_MONGO
    await mongoose.connect(process.env.URI_MONGO, mongoOptions);
    console.log("✅ Conexión exitosa a MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
    console.log("\n🔍 Soluciones rápidas:");
    console.log("1. Verifica que URI_MONGO en Vercel sea idéntica a la de Atlas");
    console.log("2. Añade 0.0.0.0/0 temporalmente en Network Access de Atlas");
    console.log("3. Revisa que el cluster no esté pausado");
    process.exit(1);
  }
};

// Iniciar servidor
connectDB().then(() => {
  const server = app.listen(port, () => {
    console.log(`🚀 Servidor funcionando en puerto ${port}`);
  });

  // Manejo elegante de cierre
  process.on('SIGTERM', () => {
    server.close(() => {
      mongoose.connection.close();
      console.log('🔌 Servidor y conexión a MongoDB cerrados');
    });
  });
});