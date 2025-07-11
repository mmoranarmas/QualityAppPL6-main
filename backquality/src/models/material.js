const mongoose = require('mongoose');

const ReporteMaterialSchema = new mongoose.Schema({
  fecha: { type: Date },
  no_maquina: { type: String },
  no_molde: { type: String },
  no_parte: { type: String },
  responsable: { type: String },
  material: { type: String },
  cantidad_bien: { type: Number },
  defectos: [{
    tipo: { type: String },
    cantidad_mal: { type: Number },
  }],
  total_bien: { type: Number },
  total_mal: { type: Number },
  total_final: { type: Number },
  destino: { type: String },
  observaciones: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('ReporteMaterial', ReporteMaterialSchema);
