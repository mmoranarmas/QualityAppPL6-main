const mongoose = require('mongoose');

const GraficaStatusSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  month: { type: Number, required: true },
  status: { type: Number, required: true },
}, { timestamps: false, versionKey: false }, );


module.exports = mongoose.model('GraficaStatus', GraficaStatusSchema);
