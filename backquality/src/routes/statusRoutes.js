const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

router.get('/', statusController.findStatusGrafica);
router.post('/save-status', statusController.saveStatus);

module.exports = router;