const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nombre: { type: String,  },
  apellidos: { type: String,  },
  password: { type: String,  },
  num_empleado: { type: String, unique: true },
  rol: { type: String, enum: ['admin', 'usuario'], default: 'usuario' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
