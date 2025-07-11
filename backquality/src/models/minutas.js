const mongoose = require('mongoose');

const MinutaSchema = new mongoose.Schema({
  fecha: { type: Date },
  hora_inicio: { type: String }, 
  hora_fin: { type: String }, 
  asistentes: [
    {
      nombre: { type: String }, 
      confirmacion: { type: String }, // Estado de confirmación (Confirmado, Pendiente, Cancelado)
    },
  ],

  asuntosTratados: [
    {
      maquina: { type: String }, 
      concepto: { type: String }, 
    },
  ], 
  compromisosAsumidos: [
    {
      no_compromiso: { type: String},
      tarea: { type: String },
      responsable: { type: String }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Minuta', MinutaSchema);