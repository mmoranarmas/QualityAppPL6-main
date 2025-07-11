const Grafica = require('../models/grafica');

const createGrafica = async (req, res) => {
  try {
    const nuevaGrafica = new Grafica(req.body);
    await nuevaGrafica.save();
    res.status(200).json({ message: 'Grafica creada exitosamente', nuevaGrafica });
  } catch (error) {
    res.status(404).json({ message: 'Error al crear la grafica', error });
  }
};

const findGrafica = async (req, res) => {
  try {
    const graficas = await Grafica.find();
    res.status(200).json(graficas);
  } catch (error) {
    res.status(404).json({ message: 'Error al obtener los datos de la grafica', error });
  }
};

const updateGrafica = async (req, res) => {
  try {
    const GraficaActualizada = await Grafica.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!GraficaActualizada) {
      return res.status(404).json({ message: 'Grafica no encontrada' });
    }
    res.status(200).json({ message: 'Grafica actualizada correctamente', GraficaActualizada });
  } catch (error) {
    res.status(404).json({ message: 'Error al actualizar la Grafica', error });
  }
};

const deleteGrafica = async (req, res) => {
  try {
    const GraficaEliminada = await Grafica.findByIdAndDelete(req.params.id);
    if (!GraficaEliminada) {
      return res.status(404).json({ message: 'Grafica no encontrada' });
    }
    res.status(200).json({ message: 'Grafica eliminada correctamente' });
  } catch (error) {
    res.status(404).json({ message: 'Error al eliminar la Grafica', error });
  }
};

const saveGraficaData = async (req, res) => {
  try {
    const { projectName, partNumber, day, month, defectos } = req.body;
    
    // Eliminar los datos existentes del proyecto
    await Grafica.deleteMany({ projectName });
    
    // Crear un nuevo documento en la colección
    const graficaData = new Grafica({
      projectName,
      partNumber,
      day,
      month,
      defectos,
      status: req.body.status || 1 // valor por defecto 1 si no se proporciona
    });

    await graficaData.save();

    res.status(201).json({ message: "Datos de la gráfica guardados exitosamente", graficaData });
  } catch (error) {
    res.status(500).json({ message: "Error al guardar los datos de la gráfica", error: error.message });
  }
};

const saveBulkGraficaData = async (req, res) => {
  try {
    const bulkOperations = req.body.map(item => ({
      updateOne: {
        filter: {
          projectName: item.projectName,
          partNumber: item.partNumber,
          day: item.day,
          month: item.month
        },
        update: {
          $set: {
            defectos: item.defectos || [],
            status: item.status,
            total_mal: item.total_mal,
            total_passed: item.total_passed // Incluir total_passed en la actualización
          }
        },
        upsert: true
      }
    }));

    const result = await Grafica.bulkWrite(bulkOperations);

    res.status(201).json({
      message: "Datos actualizados correctamente",
      insertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al guardar los datos",
      error: error.message
    });
  }
};

module.exports = {
  createGrafica,
  findGrafica,
  updateGrafica,
  deleteGrafica,
  saveGraficaData,
  saveBulkGraficaData
};
