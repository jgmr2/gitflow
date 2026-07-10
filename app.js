import express from 'express';
import helmet from 'helmet';
import { connectDB } from './db.js';
import usuarioRoutes from './routes/usuarioRoutes.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudo conectar a la base de datos' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/api/usuarios', usuarioRoutes);

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Recurso no encontrado' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  const mensaje = status === 400 ? 'JSON malformado en el cuerpo de la petición' : 'Error interno del servidor';
  res.status(status).json({ mensaje });
});

export default app;
