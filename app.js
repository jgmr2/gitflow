import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './db.js';
import { swaggerSpec } from './config/swagger.js';
import usuarioRoutes from './routes/usuarioRoutes.js';

const app = express();

app.disable('x-powered-by');

// Documentación Swagger UI servida en la raíz. Los assets se cargan desde CDN
// (en vez de node_modules/swagger-ui-dist) porque el bundler serverless de Vercel
// no rastrea los archivos estáticos que swagger-ui-express sirve en runtime,
// causando 404 en swagger-ui.css / swagger-ui-bundle.js en producción.
const SWAGGER_UI_CDN = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.32.8';
app.get(
  '/',
  helmet({ contentSecurityPolicy: false }),
  swaggerUi.setup(swaggerSpec, {
    customCssUrl: `${SWAGGER_UI_CDN}/swagger-ui.min.css`,
    customJs: [`${SWAGGER_UI_CDN}/swagger-ui-bundle.js`, `${SWAGGER_UI_CDN}/swagger-ui-standalone-preset.js`],
    customfavIcon: `${SWAGGER_UI_CDN}/favicon-32x32.png`,
  })
);

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
