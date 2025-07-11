const mongoose = require("mongoose");

const ReporteInspeccionSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  no_molde: { type: String, required: true },
  no_parte: { type: String, required: true },
  no_maquina: { type: String, required: true },
  cavidades: { type: String, required: true },
  material: { type: String, required: true },
  hora: { type: String, required: true },
  auditor: { type: String, required: true },
  turno: { 
    type: String, 
    enum: ['Primer-turno', 'Segundo-turno', 'Tercer-turno'], 
    required: true 
  },
  
  items: [{
    tipo: { 
      type: String, 
      enum: [
        'estado',
        'inspeccion',
        'kanban',
        'verificacion_apariencia', 
        'maquina_limpia',
        'observaciones',
        'matng',
        'gage'
      ],
      required: true 
    },
    nombre: { type: String, required: true },
    valores: [{
      hora: { type: String, required: true },
      valor: { type: String, required: true }
    }]
  }],

}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('ReporteInspeccion', ReporteInspeccionSchema);