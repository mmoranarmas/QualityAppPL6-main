const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', usuariosController.findUsers);
router.get('/data', usuariosController.getData);
router.get('/:id', verifyToken, usuariosController.findUsersById);
router.post('/', usuariosController.createUsuario);
router.put('/:id', verifyToken, usuariosController.updateUser);
router.delete('/:id', verifyToken, usuariosController.deleteUser);
router.post('/login', usuariosController.loginUser);

module.exports = router;