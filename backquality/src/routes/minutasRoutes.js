const express = require('express');
const router = express.Router();
const minutaController = require('../controllers/minutasController');

router.post('/', minutaController.createMinutas);
router.get('/', minutaController.findMinutas);
router.get('/:id', minutaController.findMinutasById);
router.put('/:id', minutaController.updateMinutas);
router.delete('/:id', minutaController.deleteMinutas);

module.exports = router;
