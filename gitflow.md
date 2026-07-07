Este es el procedimiento que mi profesor me pide seguir para cada una de las nuevas features creadas1

1.-Lo primero sera ubicarme en la rama develop: git checkout develop
2.-Lo segundo es crear una nueva rama con prejifo feature/: git checkout -b "feature/nombre-descriptivo-para-la-nueva-rama
3.-Realizar cambios acorde a la descripcion de la rama
4.-Añadir los cambios: git add .
5.-Generar commit con nombre descriptivo para seguimiento: git commit -m "nombre descriptivo para el commit"
6.-Push: git push -u origin feature/nombre-descriptivo-para-la-nueva-rama
7.-Hacer checkout a develop: git chekout develop
8.-Hacer merge en develop para traer los cambios de feature/nombre-descriptivo-para-la-nueva-rama: git merge develop feature/nombre-descriptivo-para-la-nueva-rama
9.-Finalmente hacer push a develop: git push -u origin develop

## Proyecto en desarrollo: Proyecto 2 - API de Registro de Usuarios y Gestión de Perfiles

**Enfoque:** Almacenamiento Seguro de Credenciales

Introduce la gestión de datos sensibles de identidad y los principios criptográficos para contraseñas en reposo.

| Componente | Requerimientos y Especificaciones Técnicas |
| :---- | :---- |
| **Descripción General** | Servicio de aprovisionamiento de usuarios donde la prioridad absoluta es la confidencialidad y el manejo correcto de contraseñas. |
| **Requerimientos Funcionales** | Endpoint POST /api/usuarios/registro que reciba nombre, correo electrónico y contraseña. Endpoint GET /api/usuarios/perfil/:id para consultar la información pública y técnica del usuario creado. |
| **Controles de Seguridad Obligatorios** | **Haseo con Sal (Salting):** Queda estrictamente prohibido guardar contraseñas en texto plano. Se debe aplicar una función de derivación de claves con un factor de costo adecuado. **Políticas de Complejidad:** Validar mediante expresiones regulares que la contraseña contenga mayúsculas, minúsculas, números y caracteres especiales, con una longitud mínima de 10 caracteres. **Prevención de Enumeración de Usuarios:** Los mensajes de error de correos duplicados deben manejarse de forma genérica para no exponer qué correos ya están registrados en la base de datos. |
| **Stack y Librerías clave** | bcryptjs (mínimo 12 rondas de haseo), mongoose para la definición de esquemas con validadores únicos ocultando el campo password por defecto en las consultas (select: false). |

### Ramas ejecutadas (historial real de este repo)

1. **`feature/models`** (commit `17d03ab`) — esquema de Mongoose `models/Usuario.js`: `nombre`, `correo` (único), `password` (`select: false`), timestamps.
2. **`feature/routes`** (commit `2f73149`) — `routes/usuarioRoutes.js` con los 2 endpoints requeridos (`POST /api/usuarios/registro`, `GET /api/usuarios/perfil/:id`), montados en `index.js`, respondiendo un placeholder ("hola mundo") sin lógica real todavía.
3. **`feature/controllers`** (commit `846492f`) — lógica real: `controllers/usuarioController.js` (hash con bcrypt vía `utils/password.js`, mensaje genérico ante correo duplicado, respuesta pública sin password), `validators/usuarioValidator.js` (regex de complejidad, validación de ObjectId), `middlewares/validate.js`, y ajustes en `index.js` (helmet, conexión a Mongo, remoción de `X-Powered-By`) y `package.json` (`bcryptjs`, `express-validator`, `"type": "module"`).

Las 3 ramas se fusionaron en `develop` de forma secuencial y sin conflictos (fast-forward): `develop` apunta actualmente al mismo commit que `feature/controllers` (`846492f`).

> Nota: la dockerización (`Dockerfile`, `docker-compose.yml`) y la primera conexión a MongoDB (`db.js`) no se hicieron en una rama `feature/*` de este flujo — ya existían de un commit previo (`43c2f97 - Conexion a mongo e implementacion de contenedores`), anterior al inicio de este seguimiento paso a paso.

## Documentación técnica de lo implementado (Proyecto 2)

### Arquitectura de carpetas (estado real actual)

```
project/
├── controllers/
│   └── usuarioController.js      # POST /api/usuarios/registro, GET /api/usuarios/perfil/:id
├── middlewares/
│   └── validate.js               # corta la petición si express-validator reporta errores
├── models/
│   └── Usuario.js                # nombre, correo (único), password (select:false)
├── routes/
│   └── usuarioRoutes.js          # conecta validators + controller
├── utils/
│   └── password.js               # hashPassword() con bcrypt, 12 rondas
├── validators/
│   └── usuarioValidator.js       # regex de complejidad de password + validación de ObjectId
├── index.js                      # Express, helmet, conexión a Mongo, montaje de rutas
├── db.js                         # conexión a MongoDB (mongoose.connect)
├── Dockerfile
├── docker-compose.yml
└── .env / .env.example
```

### Endpoints

| Método | Ruta | Descripción |
| :---- | :---- | :---- |
| GET | `/` | Mensaje de verificación ("Hello, World!") |
| POST | `/api/usuarios/registro` | Registro de usuario (nombre, correo, password) |
| GET | `/api/usuarios/perfil/:id` | Consulta de perfil público por id |

### Modelo `Usuario`

| Campo | Tipo | Restricciones |
| :---- | :---- | :---- |
| `nombre` | String | requerido, trim |
| `correo` | String | requerido, único, lowercase, trim |
| `password` | String | requerido, `select: false` (nunca se devuelve por defecto) |
| `createdAt` / `updatedAt` | Date | automáticos (`timestamps: true`) |

### Controles de seguridad implementados

- **Hasheo con sal:** bcrypt con 12 rondas (`utils/password.js`); nunca se guarda el password en texto plano.
- **Política de complejidad de contraseña:** regex que exige mínimo 10 caracteres, mayúscula, minúscula, número y carácter especial (`validators/usuarioValidator.js`).
- **Prevención de enumeración de usuarios:** ante correo duplicado se responde siempre el mismo mensaje genérico ("No se pudo completar el registro, verifica los datos ingresados."), tanto en la verificación previa (`findOne`) como en el catch de duplicidad (`error.code === 11000`) para cubrir condiciones de carrera.
- **Password oculto por defecto:** `select: false` en el schema + el controller solo devuelve `id`, `nombre`, `correo`, `createdAt`.
- **Validación de ObjectId:** `GET /api/usuarios/perfil/:id` rechaza ids que no sean un ObjectId válido antes de llegar a Mongo.
- **Hardening HTTP:** `helmet()` + remoción de `X-Powered-By` en `index.js`.

### Verificación end-to-end realizada

En cada rama se reconstruyeron los contenedores (`docker compose up -d --build`) y se probó con `curl` contra la app dockerizada + Mongo real:

- Registro exitoso → devuelve `id`/`nombre`/`correo`/`createdAt`, sin password.
- Password débil → rechazado por el validator (400, mensaje del regex).
- Correo duplicado → mensaje genérico (400), sin revelar que el correo ya existía.
- GET perfil con id inválido → rechazado por el validator (400).
- GET perfil con id válido pero inexistente → 404 "Usuario no encontrado".
- GET perfil con id válido y existente → devuelve datos públicos.
- Verificación directa en `mongosh`: el campo `password` se almacena como hash bcrypt (`$2b$12$...`), nunca en texto plano.
