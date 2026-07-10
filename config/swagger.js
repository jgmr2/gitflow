import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Registro de Usuarios y Gestión de Perfiles',
      version: '1.0.0',
      description:
        'Proyecto 2 del catálogo de APIs con enfoque de seguridad progresiva (Stack MEN). Enfoque: Almacenamiento Seguro de Credenciales.',
    },
    servers: [{ url: '/', description: 'Servidor actual' }],
    components: {
      schemas: {
        UsuarioPublico: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '664f1c2e5a1b2c3d4e5f6789' },
            nombre: { type: 'string', example: 'Ana Test' },
            correo: { type: 'string', format: 'email', example: 'ana@example.com' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ErrorMensaje: {
          type: 'object',
          properties: {
            mensaje: { type: 'string' },
          },
        },
        ErrorValidacion: {
          type: 'object',
          properties: {
            errores: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
