const express = require('express');
const router = express.Router();
const graficaController = require('../controllers/graficaController');

router.post('/', graficaController.createGrafica);
router.get('/', graficaController.findGrafica);
router.put('/:id', graficaController.updateGrafica);
router.delete('/:id', graficaController.deleteGrafica);
router.post('/save', graficaController.saveGraficaData);
router.post('/save-bulk', graficaController.saveBulkGraficaData);

module.exports = router;