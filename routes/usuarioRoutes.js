import { Router } from 'express';
import { registrar, obtenerPerfil } from '../controllers/usuarioController.js';
import { registroValidator, perfilValidator } from '../validators/usuarioValidator.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.post('/registro', registroValidator, validate, registrar);
router.get('/perfil/:id', perfilValidator, validate, obtenerPerfil);

export default router;
