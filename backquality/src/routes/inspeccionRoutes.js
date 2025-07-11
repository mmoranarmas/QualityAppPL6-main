const express = require('express');
const router = express.Router();
const inspeccionController = require('../controllers/inspeccionController');

router.post('/', inspeccionController.createInspeccion);
router.get('/', inspeccionController.findInspeccion);
router.get('/:id', inspeccionController.findInspeccionById);
router.put('/:id', inspeccionController.updateInspeccion);
router.delete('/:id', inspeccionController.deleteInspeccion);

module.exports = router;
