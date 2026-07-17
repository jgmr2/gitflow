import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './db.js';
import { swaggerSpec } from './config/swagger.js';
import { appTokenAuth } from './middlewares/appTokenAuth.js';
import usuarioRoutes from './routes/usuarioRoutes.js';

const app = express();

app.disable('x-powered-by');

// Documentación Swagger UI servida en la raíz.
// - swaggerUi.serve incluye swaggerInitFn, que genera /swagger-ui-init.js dinámicamente
//   en memoria (necesario para que la UI se inicialice) — siempre funciona en Vercel.
// - El CSS/JS pesado (swagger-ui.css, swagger-ui-bundle.js, standalone-preset.js) se
//   carga desde CDN en vez de node_modules/swagger-ui-dist: el bundler serverless de
//   Vercel no rastrea esos archivos estáticos servidos en runtime y da 404 con ellos.
const SWAGGER_UI_CDN = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.32.8';
app.use(helmet({ contentSecurityPolicy: false }), swaggerUi.serve);
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

// Protege todos los endpoints de negocio con un application token (JWT firmado con
// JWT_SECRET), enviado en el header app-token. Se valida antes de intentar conectar
// a Mongo para no gastar conexiones en requests no autorizadas.
app.use('/api', appTokenAuth);

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
