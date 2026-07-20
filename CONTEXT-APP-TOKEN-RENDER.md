# Contexto: replicar "Application Token" en este proyecto (deploy con Render)

Este archivo es contexto para Claude en un segundo repositorio del mismo curso
(Seguridad en el Desarrollo de Aplicaciones). Ya se implementó y verificó esta misma
funcionalidad en otro proyecto hermano (Stack MEN, API de Registro de Usuarios,
desplegado en Vercel). Aquí se debe replicar el mismo patrón, pero el despliegue de
**este** proyecto es en **Render**, no Vercel — hay diferencias de infraestructura que
importan (ver sección final).

## La asignación (texto original del profesor)

> **Application Token** — 100 puntos
>
> Instructions: Add an application token to all routes in the developed projects.
> Generate a JSON web token that will be the application token to be read.
> Create the function that validates the application token.
> Apply the middleware to all project routes.
> The validation should return a 401 error if the application token is missing or incorrect.
> The application token must be passed in the headers as "app-token".
> Once the functionality is complete, upload it to both the develop and main pages.
> Perform integration tests using the domain and testing at least one GET and one POST or PUT request.
>
> Important Note: All of this must be implemented in both projects.
>
> Document Rubric: Cover Page. Document Name: App-token documentation. File Type: PDF.
> Content: Must detail at least the 7 steps of the instructions. Must include screenshots
> as evidence, in addition to a clear explanation of the implementation. Must demonstrate
> the final result by generating a test using the cloud service domain.

## Qué se implementó en el proyecto hermano (Vercel) — replicar esta misma lógica

### 1. El token es un JWT real, no un string aleatorio

Se usa la librería `jsonwebtoken` (probablemente ya está en `package.json`; si no, instalar
con `npm install jsonwebtoken`). El token se firma una sola vez con `JWT_SECRET` y se le
agrega un claim `scope` para distinguirlo de cualquier otro JWT que la app pudiera emitir
en el futuro (ej. tokens de sesión de usuario):

```js
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { scope: 'app-token', app: '<nombre-de-este-proyecto>' },
  process.env.JWT_SECRET
);
console.log(token); // guardar este valor, es "el" application token
```

Genera un `JWT_SECRET` fuerte y aleatorio (no un placeholder) si el proyecto no tiene uno:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2. Middleware de validación (`middlewares/appTokenAuth.js`)

Verifica la firma del JWT (`jwt.verify`, no comparación de string) y el claim `scope`:

```js
import jwt from 'jsonwebtoken';

const APP_TOKEN_SCOPE = 'app-token';

export function appTokenAuth(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ mensaje: 'JWT_SECRET no está configurado en el servidor' });
  }

  const token = req.header('app-token');
  if (!token) {
    return res.status(401).json({ mensaje: 'Falta el application token (header app-token)' });
  }

  try {
    const payload = jwt.verify(token, secret);
    if (payload.scope !== APP_TOKEN_SCOPE) {
      return res.status(401).json({ mensaje: 'Application token inválido' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Application token inválido' });
  }
}
```

Adaptar `import`/`export` a `require`/`module.exports` si ese proyecto usa CommonJS en vez
de ESM (revisar si `package.json` tiene `"type": "module"`).

### 3. Montar el middleware sobre TODAS las rutas de negocio

En el entry point de Express (`app.js` / `index.js` / `server.js`, el que exista):

```js
app.use(express.json());
app.use('/api', appTokenAuth); // ajustar el prefijo al de las rutas reales de este proyecto
```

**Decisión de diseño ya validada en el proyecto hermano:** si este proyecto también expone
documentación Swagger en una ruta pública (ej. `/` o `/api-docs`), **no** le apliques el
middleware — un navegador no puede mandar headers custom solo navegando, así que exigir el
token ahí rompe la documentación. Protege únicamente los endpoints de datos reales
(`/api/*`). Si este proyecto no tiene Swagger, esta nota no aplica y sí puedes proteger
literalmente todo si así lo prefieres.

Verifica el orden de middlewares: el chequeo del `app-token` debe ir **antes** de cualquier
intento de conexión a la base de datos, para no gastar conexiones en peticiones no
autorizadas.

### 4. Respuesta 401

Ya cubierto en el middleware de arriba: `401` si falta el header, `401` si el JWT no es
válido (firma incorrecta, expirado, o `scope` distinto).

### 5. Header exacto: `app-token`

No uses `Authorization`, `x-api-key`, ni ningún otro nombre — el profesor pide literalmente
`app-token`.

### 6. Documentar en Swagger (si este proyecto tiene Swagger/OpenAPI)

```js
components: {
  securitySchemes: {
    AppTokenAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'app-token',
    },
  },
},
security: [{ AppTokenAuth: [] }],
```

### 7. Subir a `develop` y `main`

Seguir el mismo flujo de git ya establecido en este curso (rama `feature/...` → merge a
`develop` → merge a `main` → push de ambas). Verificar al final que ambas ramas apunten al
mismo commit.

## Diferencias importantes por usar Render en vez de Vercel

- **Variables de entorno:** en Render se configuran en el dashboard del servicio →
  **Environment** (no "Settings → Environment Variables" como en Vercel). Agregar
  `JWT_SECRET` ahí antes de poder probar en producción.
- **No hace falta la adaptación serverless:** Render corre un proceso Node persistente (no
  funciones efímeras por request como Vercel), así que **no** se necesita el patrón de
  conexión a Mongo cacheada en `globalThis`, ni separar `app.js`/`api/index.js`, ni
  `vercel.json`. Un `index.js` simple con `app.listen(PORT)` normal es suficiente y más
  simple que lo que se hizo en el proyecto de Vercel.
- **Redeploy tras cambiar env vars:** igual que en Vercel, Render generalmente redeploya
  solo al detectar el cambio de variable, pero confirmar en el dashboard — si no, hacer un
  "Manual Deploy" desde la última rama.
- **Dominio de pruebas:** el dominio de Render tiene el formato
  `https://<nombre-del-servicio>.onrender.com` — úsalo para las pruebas de integración
  (equivalente a `https://gitflow-seven.vercel.app` en el otro proyecto).
- **Free tier de Render duerme el servicio:** si el plan es gratuito, el servicio puede
  tardar ~30-50s en responder la primera petición tras estar inactivo (cold start). No es un
  error — solo hay que esperar antes de asumir que algo falló.

## Pruebas de integración a replicar (GET + POST) contra el dominio

Mismo patrón usado en el proyecto de Vercel — 3 casos por cada endpoint protegido:

```bash
TOKEN="<el-jwt-generado>"
BASE="https://<servicio>.onrender.com"

# Sin token -> debe dar 401
curl -X POST "$BASE/api/<recurso>" -H "Content-Type: application/json" -d '{...}'

# Con token invalido -> debe dar 401
curl -X POST "$BASE/api/<recurso>" -H "app-token: token-falso" -H "Content-Type: application/json" -d '{...}'

# Con token correcto -> debe funcionar (200/201)
curl -X POST "$BASE/api/<recurso>" -H "app-token: $TOKEN" -H "Content-Type: application/json" -d '{...}'

# Repetir con un GET a algun endpoint existente
curl -H "app-token: $TOKEN" "$BASE/api/<recurso>/<id>"
```

## El documento PDF que también hay que entregar aquí

Mismo rubro que en el proyecto de Vercel: portada, nombre "App-token documentation", PDF,
cubriendo los 7 pasos con explicación + capturas, y demostración final contra el dominio de
Render. En el otro repo se generó un `.tex` (`app-token-documentation.tex`, en la raíz del
proyecto) pensado para compilarse en Overleaf, con placeholders marcados claramente donde
insertar capturas reales de Postman/navegador. Se puede usar como plantilla directa,
cambiando únicamente las menciones a Vercel por Render, el dominio, y los nombres de
endpoints si difieren.
