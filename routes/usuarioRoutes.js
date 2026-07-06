import { Router } from 'express';

const router = Router();

router.post('/registro', (req, res) => {
  res.status(200).json({ mensaje: 'Hola mundo desde POST /api/usuarios/registro' });
});

router.get('/perfil/:id', (req, res) => {
  res.status(200).json({ mensaje: 'Hola mundo desde GET /api/usuarios/perfil/:id' });
});

export default router;
