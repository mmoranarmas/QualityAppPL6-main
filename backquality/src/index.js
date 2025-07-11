require('dotenv').config()
const app = require("./app");
const port = process.env.PORT;
const mongoose = require("mongoose");

const URI = process.env.URI_MONGO;

mongoose.set("strictQuery", false);

mongoose
  .connect(URI)
  .then(console.log("Conectado a MongoDB"))
  .catch((error) => console.log(error));

  
app.listen(port, () => {
  console.log("Server on port", port);
});