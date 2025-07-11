const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');

router.post('/', materialController.createMaterial);
router.get('/', materialController.findMaterial);
router.get('/:id', materialController.findMaterialById);
router.put('/:id', materialController.updateMaterial);
router.delete('/:id', materialController.deleteMaterial);

module.exports = router;
