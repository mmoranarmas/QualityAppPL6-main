const Minuta = require('../models/minutas');

// Crear una nueva minuta
const createMinutas = async (req, res) => {
  try {
    const nuevaMinuta = new Minuta(req.body);
    await nuevaMinuta.save();
    res.status(200).json({ message: 'Minuta creada exitosamente', nuevaMinuta });
  } catch (error) {
    res.status(404).json({ message: 'Error al crear la minuta', error });
  }
};

// Obtener todas las minutas
const findMinutas = async (req, res) => {
  try {
    const minutas = await Minuta.find();
    res.status(200).json(minutas);
  } catch (error) {
    res.status(404).json({ message: 'Error al obtener las minutas', error });
  }
};

// Obtener una minuta por ID
const findMinutasById = async (req, res) => {
  try {
    const minuta = await Minuta.findById(req.params.id);
    if (!minuta) {
      return res.status(404).json({ message: 'Minuta no encontrada' });
    }
    res.status(200).json(minuta);
  } catch (error) {
    res.status(404).json({ message: 'Error al obtener la minuta', error });
  }
};

// Actualizar una minuta
const updateMinutas = async (req, res) => {
  try {
    const minutaActualizada = await Minuta.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!minutaActualizada) {
      return res.status(404).json({ message: 'Minuta no encontrada' });
    }
    res.status(200).json({ message: 'Minuta actualizada correctamente', minutaActualizada });
  } catch (error) {
    res.status(404).json({ message: 'Error al actualizar la minuta', error });
  }
};

// Eliminar una minuta
const deleteMinutas = async (req, res) => {
    try {
      const minutaEliminada = await Minuta.findByIdAndDelete(req.params.id);
      if (!minutaEliminada) {
        return res.status(404).json({ message: 'Minuta no encontrada' });
      }
      res.json({ message: 'Minuta eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la minuta', error });
    }
  };

  
  module.exports = {
    createMinutas,
    findMinutas,
    findMinutasById,
    updateMinutas,
    deleteMinutas
  };
  