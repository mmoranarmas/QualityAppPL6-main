const User = require('../models/usuarios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Registrar un nuevo usuario
const createUsuario = async (req, res) => {
  try {
    const { nombre, apellidos, password, num_empleado, rol } = req.body;

    // Verificar si el usuario ya existe
    const existeUsuario = await User.findOne({ num_empleado });
    if (existeUsuario) {
      return res.status(400).json({ message: 'El número de empleado ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = new User({ nombre, apellidos, password: hashedPassword, num_empleado, rol });
    await nuevoUsuario.save();

    res.status(201).json({ message: 'Usuario registrado exitosamente' });

  } catch (error) {
    res.status(404).json({ message: 'Error en el servidor', error });
  }
};

// Iniciar sesión
const loginUser = async (req, res) => {
  try {
    const { num_empleado, password } = req.body;

    // Buscar el usuario por número de empleado
    const usuario = await User.findOne({ num_empleado });
    if (!usuario) {
      return res.status(400).json({ message: 'Número de empleado o contraseña incorrectos' });
    }

    // Comparar la contraseña
    const esCorrecta = await bcrypt.compare(password, usuario.password);
    if (!esCorrecta) {
      return res.status(400).json({ message: 'Número de empleado o contraseña incorrectos' });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: usuario._id, num_empleado: usuario.num_empleado, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '1y' } // Token válido por 1 año
    );

    // Enviar respuesta con el token y los datos del usuario (sin la contraseña)
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario._id,
        num_empleado: usuario.num_empleado,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        rol: usuario.rol,
      },
    });

  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Obtener toda la información de los usuarios
const getData = async (req, res) => {
  try {
    const usuarios = await User.find();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener datos', error });
  }
};

// Obtener todos los usuarios
const findUsers = async (req, res) => {
  try {
    const usuarios = await User.find(); // Ahora también envía la contraseña
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(404).json({ message: 'Error al obtener usuarios', error });
  }
};

// Obtener un usuario por ID
const findUsersById = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) throw new Error('Usuario no encontrado');
    res.status(200).json(usuario);
  } catch (error) {
    res.status(404).json({ message: 'Error en el servidor', error });
  }
};

// Actualizar usuario
const updateUser = async (req, res) => {
  try {
    const { nombre, password, rol } = req.body;
    const usuarioId = req.params.id;

    // Crea un objeto con los datos a actualizar
    const actualizar = { nombre, rol };

    // Si se envía una nueva contraseña, la hasheamos antes de actualizar
    if (password) {
      actualizar.password = await bcrypt.hash(password, 10);
    }

    const usuarioActualizado = await User.findByIdAndUpdate(usuarioId, actualizar, { new: true });

    if (!usuarioActualizado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(usuarioActualizado);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// Eliminar un usuario por ID
const deleteUser = async (req, res) => {
  try {
      const { id } = req.params;

      // Buscar y eliminar el usuario
      const usuarioEliminado = await User.findByIdAndDelete(id);

      if (!usuarioEliminado) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json({ message: 'Error en el servidor', error });
  }
};

module.exports = {
  createUsuario,
  loginUser,
  findUsers,
  findUsersById,
  updateUser,
  getData,
  deleteUser
};