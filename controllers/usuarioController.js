import Usuario from '../models/Usuario.js';
import { hashPassword } from '../utils/password.js';

const MENSAJE_REGISTRO_GENERICO = 'No se pudo completar el registro, verifica los datos ingresados.';

export async function registrar(req, res) {
  const { nombre, correo, password } = req.body;

  try {
    const existente = await Usuario.findOne({ correo });
    if (existente) {
      return res.status(400).json({ mensaje: MENSAJE_REGISTRO_GENERICO });
    }

    const hash = await hashPassword(password);
    const usuario = await Usuario.create({ nombre, correo, password: hash });

    return res.status(201).json({
      id: usuario._id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      createdAt: usuario.createdAt,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: MENSAJE_REGISTRO_GENERICO });
    }
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

export async function obtenerPerfil(req, res) {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      id: usuario._id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      createdAt: usuario.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}
