import { Router } from 'express';
import { registrar, obtenerPerfil } from '../controllers/usuarioController.js';
import { registroValidator, perfilValidator } from '../validators/usuarioValidator.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Registro y consulta de perfiles de usuario
 */

/**
 * @swagger
 * /api/usuarios/registro:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, correo, password]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Ana Test
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: ana@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mínimo 10 caracteres, con mayúscula, minúscula, número y carácter especial
 *                 example: Sup3r$ecreto!
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioPublico'
 *       400:
 *         description: Datos inválidos, o correo ya registrado (mensaje genérico anti-enumeración)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorValidacion'
 *                 - $ref: '#/components/schemas/ErrorMensaje'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMensaje'
 */
router.post('/registro', registroValidator, validate, registrar);

/**
 * @swagger
 * /api/usuarios/perfil/{id}:
 *   get:
 *     summary: Consulta el perfil público de un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId de MongoDB del usuario
 *         example: 664f1c2e5a1b2c3d4e5f6789
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioPublico'
 *       400:
 *         description: El id proporcionado no es un ObjectId válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidacion'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMensaje'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMensaje'
 */
router.get('/perfil/:id', perfilValidator, validate, obtenerPerfil);

export default router;
