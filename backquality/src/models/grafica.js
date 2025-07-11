const mongoose = require('mongoose');

const GraficaDataSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  partNumber: { type: String, required: true },
  day: { type: Number, required: true },
  month: { type: Number, required: true },
  defectos: [{
    tipo: { type: String },
    cantidad_mal: { type: Number },
  }],
  status: { type: Number, required: true },
  total_mal: { type: Number },
  total_passed: { type: Number } 
}, { timestamps: false, versionKey: false }, );


module.exports = mongoose.model('GraficaData', GraficaDataSchema);
