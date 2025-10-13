const app = require("./app");
const port = process.env.PORT;
const mongoose = require("mongoose");
require('dotenv').config()


const URI = process.env.URI_MONGO;

mongoose.set("strictQuery", false);

mongoose
  .connect(URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true
})
  .then(console.log("Conectado a mongo Atlas"))
  .catch((error) => console.log(error));

  
app.listen(port, () => {
  console.log("Server on port", port);
});