# **Catálogo de APIs con Enfoque de Seguridad Progresiva**

Este documento actúa como la guía técnica oficial para el desarrollo de proyectos prácticos en la asignatura de Seguridad en el Desarrollo de Aplicaciones. Las siguientes 10 propuestas de APIs están diseñadas bajo el stack tecnológico **MongoDB, Express y Node.js (MEN Stack)**. Su complejidad y controles de seguridad avanzan de manera incremental a lo largo del cuatrimestre, permitiendo a los estudiantes implementar desde validaciones básicas hasta arquitecturas defensivas avanzadas.

## **Estructura de Desarrollo Semanal y Progresión**

Cada propuesta incluye una descripción detallada de sus requerimientos funcionales, los mecanismos de seguridad obligatorios que deben implementarse, las herramientas/librerías recomendadas y la justificación de su uso dentro del Ciclo de Vida de Desarrollo de Software Seguro (S-SDLC).

### **1\. API de Catálogo Público de Productos (Enfoque: Saneamiento y Validación de Entradas)**

Diseñada para las primeras semanas del curso. El objetivo es mitigar ataques básicos de inyección y manipulación de datos desde los endpoints públicos.

| Componente | Requerimientos y Especificaciones Técnicas |
| :---- | :---- |
| **Descripción General** | Un backend para gestionar un catálogo de productos de tecnología, permitiendo búsquedas, filtrado y paginación pública. |
| **Requerimientos Funcionales** | Endpoint GET /api/productos con soporte de queries para filtrar por categoría, rango de precios y ordenación. Endpoint GET /api/productos/:id para obtener detalles de un artículo específico. Endpoint POST /api/productos para la inserción interna de nuevos artículos. |
| **Controles de Seguridad Obligatorios** | **Validación estricta de tipos:** Asegurar que los parámetros de precios sean numéricos y los IDs sigan el formato de ObjectId de MongoDB. **Mitigación de NoSQL Injection:** Saneamiento de los objetos de consulta (query strings) para evitar operadores maliciosos como $gt o $ne. **Escape de caracteres:** Sanitizar strings de búsqueda para prevenir almacenamiento o reflejo de scripts maliciosos. |
| **Stack y Librerías clave** | express-validator para reglas de validación en middlewares, express-mongo-sanitize para la remoción automática de caracteres prohibidos (parámetros que inicien con $ o .). |

### **2\. API de Registro de Usuarios y Gestión de Perfiles (Enfoque: Almacenamiento Seguro de Credenciales)**

Introduce la gestión de datos sensibles de identidad y los principios criptográficos para contraseñas en reposo.

| Componente | Requerimientos y Especificaciones Técnicas |
| :---- | :---- |
| **Descripción General** | Servicio de aprovisionamiento de usuarios donde la prioridad absoluta es la confidencialidad y el manejo correcto de contraseñas. |
| **Requerimientos Funcionales** | Endpoint POST /api/usuarios/registro que reciba nombre, correo electrónico y contraseña. Endpoint GET /api/usuarios/perfil/:id para consultar la información pública y técnica del usuario creado. |
| **Controles de Seguridad Obligatorios** | **Haseo con Sal (Salting):** Queda estrictamente prohibido guardar contraseñas en texto plano. Se debe aplicar una función de derivación de claves con un factor de costo adecuado. **Políticas de Complejidad:** Validar mediante expresiones regulares que la contraseña contenga mayúsculas, minúsculas, números y caracteres especiales, con una longitud mínima de 10 caracteres. **Prevención de Enumeración de Usuarios:** Los mensajes de error de correos duplicados deben manejarse de forma genérica para no exponer qué correos ya están registrados en la base de datos. |
| **Stack y Librerías clave** | bcryptjs (mínimo 12 rondas de haseo), mongoose para la definición de esquemas con validadores únicos ocultando el campo password por defecto en las consultas (select: false). |

### **3\. API de Autenticación Centralizada (Enfoque: Stateless Authentication y Gestión de Tokens)**

Se enfoca en la generación y validación de sesiones seguras mediante mecanismos sin estado (stateless) ideales para arquitecturas modernas.

| Componente | Requerimientos y Especificaciones Técnicas |
| :---- | :---- |
| **Descripción General** | Módulo de autenticación que emite credenciales temporales de acceso para endpoints restringidos. |
| **Requerimientos Funcionales** | Endpoint POST /api/auth/login para verificar credenciales de usuario. Middleware global de verificación para proteger rutas subsecuentes. |
| **Controles de Seguridad Obligatorios** | **Firmas Robustas:** Uso de JSON Web Tokens (JWT) firmados con una clave secreta de alta entropía (mínimo 256 bits) extraída estrictamente de variables de entorno. **Expiración de Sesión Corta:** Configuración de tiempo de vida (TTL) del token a un máximo de 15 minutos para reducir la ventana de oportunidad en caso de robo. **Estructura del Payload Efímera:** No incluir datos sensibles ni PII (Información de Identificación Personal) dentro del JWT, únicamente el ID de referencia técnica del usuario. |
| **Stack y Librerías clave** | jsonwebtoken para la firma y verificación, uso estricto del módulo process.env nativo de Node.js. |

### **4\. API de Control de Tareas Corporativas (Enfoque: Control de Acceso Basado en Roles \- RBAC)**

Implementa la separación de funciones y la validación de privilegios en base a la identidad previamente autenticada.

| Componente | Requerimientos y Especificaciones Técnicas |
| :---- | :---- |
| **Descripción General** | Sistema de gestión de tareas (To-Do/Project Management) donde las acciones dependen estrictamente del rol jerárquico del usuario. |
| **Requerimientos Funcionales** | Endpoints CRUD para /api/tareas. Roles requeridos: Admin (Lectura/Escritura/Borrado), Supervisor (Lectura/Escritura), Operador (Solo lectura de sus propias tareas). |
| **Controles de Seguridad Obligatorios** | **Middlewares de Autorización Secuenciales:** Rutas protegidas primero por verificación de autenticación y consecutivamente por un validador de roles. **Defensa contra IDOR (Insecure Direct Object References):** Validar que un usuario con rol de Operador no pueda modificar o visualizar una tarea que pertenece a otro usuario cambiando el ID de la URL. |
| **Stack y Librerías clave** | Estructuras condicionales personalizadas en Express o middlewares personalizados que validen arreglos de roles permitidos (ej. checkRole(\['Admin', 'Supervisor'\])). |

### **5\. API Gateway / Proxy de Seguridad (Enfoque: Forzado de Cabeceras HTTP y CORS)**

Diseñada a mitad del cuatrimestre para aprender a blindar la capa de transporte y controlar los orígenes que consumen nuestros recursos.

| Componente | Requerimientos y Especificaciones Técnicas |
| :---- | :---- |
| **Descripción General** | Una API intermedia o configuración avanzada de servidor Express encargada de sanitizar las respuestas HTTP y bloquear peticiones cruzadas no autorizadas. |
| **Requerimientos Funcionales** | Servir de capa de interconexión segura para el consumo de aplicaciones web externas hechas en React JS. |
| **Controles de Seguridad Obligatorios** | **Políticas de Origen Cruzado (CORS) Restrictivas:** Configurar explícitamente una lista blanca de dominios permitidos. Queda prohibido el uso del comodín \*. **Desactivación de Cabeceras Informativas:** Remover la cabecera X-Powered-By: Express para evitar que atacantes realicen fingerprinting del stack tecnológico. **Cabeceras de Protección Activa:** Forzar el uso de X-Content-Type-Options: nosniff, X-Frame-Options: DENY y configuraciones iniciales de Content Security Policy (CSP). |
| **Stack y Librerías clave** | Librería helmet configurada con sus módulos por defecto, módulo cors con configuración dinámica basada en arreglos de orígenes válidos. |

### **6\. API de Autenticación Robusta (Enfoque: Mitigación de Fuerza Bruta y Denial of Service)**

Introduce técnicas de resiliencia y control de flujo de peticiones para proteger la disponibilidad de los recursos de autenticación.

| Componente | Requerimientos y Especificaciones Técnicas |
| :---- | :---- |
| **Descripción General** | Evolución del endpoint de login tradicional enfocado en repeler ataques automatizados de diccionarios de contraseñas y saturación de peticiones (DoS). |
| **Requerimientos Funcionales** | Endpoint POST /api/v2/auth/login integrado con un contador de intentos fallidos. |
| **Controles de Seguridad Obligatorios** | **Rate Limiting Geométrico o Lineal:** Limitar el número de peticiones máximas permitidas por una misma dirección IP dentro de una ventana temporal (ej. máximo 5 intentos de inicio de sesión cada 15 minutos). **Bloqueo Temporal de Cuenta:** Bloquear de forma lógica en la base de datos la cuenta del usuario afectado tras múltiples intentos erróneos consecutivos, requiriendo validación adicional. |
| **Stack y Librerías clave** | express-rate-limit para la capa de enrutamiento Express, o almacenamiento de estados de bloqueo temporales directamente en colecciones específicas de MongoDB. |

### **7\. API de Auditoría de Eventos Críticos (Enfoque: Trazabilidad, Logs y Monitoreo Seguro)**

Orientada a enseñar la importancia del no-repudio y el análisis posterior a un incidente (forense digital).

| Componente | Requerimientos y Especificaciones Técnicas |
| :---- | :---- |
| **Descripción General** | Un microservicio o módulo transversal encargado de registrar de manera inalterable toda transacción crítica ocurrida en la aplicación. |
| **Requerimientos Funcionales** | Middleware de auditoría que intercepte peticiones de modificación (POST, PUT, DELETE). Colección especializada en MongoDB para almacenar bitácoras históricas. |
| **Controles de Seguridad Obligatorios** | **Estructura de Log Segura:** Cada log debe registrar de forma obligatoria: Timestamp (ISO 8601), IP de origen, ID del usuario ejecutor, acción realizada y código de estado HTTP resultante. **Prevención de Log Injection:** Saneamiento de las entradas del log para evitar caracteres de salto de línea que puedan corromper o falsificar registros de auditoría. **No Almacenamiento de Secretos:** Garantizar mediante código que ninguna contraseña, token JWT o dato de tarjeta bancaria sea guardado jamás dentro de las trazas de logs. |
| **Stack y Librerías clave** | Librería de logging profesional winston combinada con winston-mongodb para el almacenamiento directo estructurado, o morgan personalizado para entornos de desarrollo. |

### **8\. API de Almacenamiento y Gestión de Expedientes (Enfoque: File Upload Security)**

Introduce los complejos desafíos de seguridad relacionados con la carga de archivos maliciosos en servidores backend.

| Componente | Requerimientos y Especificaciones Técnicas |
| :---- | :---- |
| **Descripción General** | Un sistema que permite a los usuarios cargar su documentación de identidad (archivos PDF o imágenes de perfil) al servidor. |
| **Requerimientos Funcionales** | Endpoint POST /api/expedientes/upload que procese la subida de un único archivo. |
| **Controles de Seguridad Obligatorios** | **Validación estricta de extensiones y tamaños:** Restringir el tamaño máximo a 2MB. Validar extensiones explícitamente permitidas (ej. solo .jpg, .png, .pdf). **Verificación del tipo MIME real (Magic Numbers):** No confiar en el nombre del archivo ni en la extensión enviada por el cliente. Inspeccionar los primeros bytes del archivo para confirmar su naturaleza real. **Almacenamiento Aislado con Renombrado:** Modificar el nombre original del archivo por un hash único (UUIDv4) y guardarlo fuera del directorio de ejecución pública del servidor Express para prevenir la ejecución remota de código (RCE). |
| **Stack y Librerías clave** | multer para el procesamiento de streams de archivos FormData, combinado con validadores basados en firmas de archivo mediante librerías como file-type. |

### **9\. API Financiera de Transferencias (Enfoque: Cifrado de Datos en Reposo y Transacciones Atómicas)**

Implementa criptografía avanzada y consistencia en datos para escenarios donde se manejan activos de alto valor.

| Componente | Requerimientos y Especificaciones Técnicas |
| :---- | :---- |
| **Descripción General** | Simulador bancario o monedero digital donde se realizan movimientos de saldo entre cuentas verificadas. |
| **Requerimientos Funcionales** | Endpoint POST /api/transacciones/transferir que recibe cuenta de origen, cuenta de destino y monto. |
| **Controles de Seguridad Obligatorios** | **Transaccionalidad Atómica (ACID):** Uso de sesiones de MongoDB para garantizar que si la deducción de saldo ocurre pero el depósito falla, toda la transacción se revierta (rollback), evitando inconsistencias financieras. **Cifrado de Datos en Reposo:** Los datos altamente confidenciales (como el número de cuenta interbancaria) deben almacenarse cifrados en MongoDB utilizando un algoritmo simétrico robusto. |
| **Stack y Librerías clave** | Uso del módulo nativo de Node.js crypto implementando el algoritmo aes-256-gcm con un vector de inicialización (IV) único por cada registro. Sesiones nativas de Mongoose (mongoose.startSession()). |

### **10\. API de Pasarela de Comercio Electrónico Segura (Enfoque: Integración Defensiva de Fin de Curso)**

El proyecto integrador final. Reúne todos los controles anteriores agregando requerimientos de despliegue y hardening de entorno de producción.

| Componente | Requerimientos y Especificaciones Técnicas |
| :---- | :---- |
| **Descripción General** | Backend completo para una tienda en línea que maneja carrito de compras, órdenes de pago y perfiles premium de usuarios. |
| **Requerimientos Funcionales** | Integración total de los módulos de usuarios, catálogo, checkout y reportes financieros automáticos. |
| **Controles de Seguridad Obligatorios** | **Hardening total:** Aplicación de la totalidad de las directrices OWASP Top 10 aplicables al stack MEN. **Gestión de Configuraciones Segura:** Cero dependencias o credenciales duras en el código. Uso estricto de esquemas de entorno validados en el arranque del servidor. **Arquitectura Multifase:** Implementación de esquemas de validación de esquemas JSON entrantes y sanitización en la salida para evitar fugas de información técnica en respuestas de error. |
| **Stack y Librerías clave** | Integración completa de las librerías previas, sumando validadores de entornos robustos como dotenv en conjunto con herramientas automatizadas de escaneo de dependencias (SAST con Snyk/NPM Audit integrado en el flujo). Despliegue seguro obligatorio en plataformas controladas (ej. Render) configurando exclusivamente conexiones HTTPS/TLS. |

