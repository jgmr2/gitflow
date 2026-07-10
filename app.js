import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './db.js';
import { swaggerSpec } from './config/swagger.js';
import usuarioRoutes from './routes/usuarioRoutes.js';

const app = express();

app.disable('x-powered-by');

// Documentación Swagger UI servida en la raíz. Usa scripts/estilos inline,
// por eso corre con CSP relajado, aislado de las cabeceras del resto de la API.
app.use(helmet({ contentSecurityPolicy: false }), swaggerUi.serve);
app.get('/', swaggerUi.setup(swaggerSpec));

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
