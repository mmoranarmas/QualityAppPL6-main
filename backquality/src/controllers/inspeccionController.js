const Inspeccion = require('../models/inspeccion');

// Crear un nuevo reporte de inspección
const createInspeccion = async (req, res) => {
  try {
    const nuevoReporte = new Inspeccion(req.body);
    await nuevoReporte.save();
    res.status(200).json({ message: 'Reporte de inspección creado exitosamente', nuevoReporte });
  } catch (error) {
    res.status(404).json({ message: 'Error al crear el reporte de inspección', error });
  }
};

// Obtener todos los reportes de inspección
const findInspeccion = async (req, res) => {
  try {
    const reportes = await Inspeccion.find();
    res.status(200).json(reportes);
  } catch (error) {
    res.status(404).json({ message: 'Error al obtener los reportes de inspección', error });
  }
};

// Obtener un reporte de inspección por ID
const findInspeccionById = async (req, res) => {
  try {
    const reporte = await Inspeccion.findById(req.params.id);
    if (!reporte) {
      return res.status(404).json({ message: 'Reporte de inspección no encontrado' });
    }
    res.status(200).json(reporte);
  } catch (error) {
    res.status(404).json({ message: 'Error al obtener el reporte de inspección', error });
  }
};

// Actualizar un reporte de inspección
const updateInspeccion = async (req, res) => {
  try {
    const reporteActualizado = await Inspeccion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reporteActualizado) {
      return res.status(404).json({ message: 'Reporte de inspección no encontrado' });
    }
    res.status(200).json({ message: 'Reporte de inspección actualizado correctamente', reporteActualizado });
  } catch (error) {
    res.status(404).json({ message: 'Error al actualizar el reporte de inspección', error });
  }
};

// Eliminar un reporte de inspección
const deleteInspeccion = async (req, res) => {
    try {
      const reporteEliminado = await Inspeccion.findByIdAndDelete(req.params.id);
      if (!reporteEliminado) {
        return res.status(404).json({ message: 'Reporte de inspección no encontrado' });
      }
      res.status(200).json({ message: 'Reporte de inspección eliminado correctamente' });
    } catch (error) {
      res.status(404).json({ message: 'Error al eliminar el reporte de inspección', error });
    }
  };

module.exports = {
    createInspeccion,
    findInspeccion,
    findInspeccionById,
    updateInspeccion,
    deleteInspeccion
};
