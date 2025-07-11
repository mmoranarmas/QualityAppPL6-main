const statusGrafica = require('../models/status');

const saveStatus = async (req, res) => {
    try {
        const bulkOperations = req.body.map(item => ({
            updateOne: {
                filter: {
                    projectName: item.projectName,
                    month: item.month
                },
                update: {
                    $set: {
                        status: item.status
                    }
                },
                upsert: true
            }
        }));

        const result = await statusGrafica.bulkWrite(bulkOperations);

        res.status(201).json({
            message: "Status actualizado correctamente",
            result
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al guardar el status",
            error: error.message
        });
    }
};

const findStatusGrafica = async (req, res) => {
    try {
        const status = await statusGrafica.find();
        res.status(200).json(status);
    } catch (error) {
        res.status(404).json({ 
            message: 'Error al obtener los status', 
            error 
        });
    }
};

module.exports = {
    saveStatus,
    findStatusGrafica
};
