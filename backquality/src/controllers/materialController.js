const Material = require('../models/material');

// Crear un nuevo reporte de material
const createMaterial = async (req, res) => {
  try {
    const nuevoReporte = new Material(req.body);
    await nuevoReporte.save();
    res.status(200).json({ message: 'Reporte de material creado exitosamente', nuevoReporte });
  } catch (error) {
    res.status(404).json({ message: 'Error al crear el reporte de material', error });
  }
};

// Obtener todos los reportes de material
const findMaterial = async (req, res) => {
  try {
    const reportes = await Material.find();
    res.status(200).json(reportes);
  } catch (error) {
    res.status(404).json({ message: 'Error al obtener los reportes de material', error });
  }
};

// Obtener un reporte de material por ID
const findMaterialById = async (req, res) => {
  try {
    const reporte = await Material.findById(req.params.id);
    if (!reporte) {
      return res.status(404).json({ message: 'Reporte de material no encontrado' });
    }
    res.status(200).json(reporte);
  } catch (error) {
    res.status(404).json({ message: 'Error al obtener el reporte de material', error });
  }
};

// Actualizar un reporte de material
const updateMaterial = async (req, res) => {
  try {
    const reporteActualizado = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reporteActualizado) {
      return res.status(404).json({ message: 'Reporte de material no encontrado' });
    }
    res.status(200).json({ message: 'Reporte de material actualizado correctamente', reporteActualizado });
  } catch (error) {
    res.status(404).json({ message: 'Error al actualizar el reporte de material', error });
  }
};

// Eliminar un reporte de material
const deleteMaterial = async (req, res) => {
  try {
    const reporteEliminado = await Material.findByIdAndDelete(req.params.id);
    if (!reporteEliminado) {
      return res.status(404).json({ message: 'Reporte de material no encontrado' });
    }
    res.status(200).json({ message: 'Reporte de material eliminado correctamente' });
  } catch (error) {
    res.status(404).json({ message: 'Error al eliminar el reporte de material', error });
  }
};

module.exports = {
    createMaterial,
    findMaterial,
    findMaterialById,
    updateMaterial,
    deleteMaterial
};