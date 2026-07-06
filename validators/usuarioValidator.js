import { body, param } from 'express-validator';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

export const registroValidator = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('correo')
    .trim()
    .isEmail()
    .withMessage('El correo no tiene un formato válido')
    .normalizeEmail(),
  body('password')
    .matches(PASSWORD_REGEX)
    .withMessage(
      'La contraseña debe tener al menos 10 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales'
    ),
];

export const perfilValidator = [
  param('id').isMongoId().withMessage('El id proporcionado no es válido'),
];
