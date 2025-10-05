import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Inquiro',
      version: '1.0.0',
      description: 'Documentacion de la API para la gestion de la empresa - INQUIRO',
    },
    servers: [
      {
        url: 'http://127.0.0.1:8080',
        description: 'Servidor local',
      },
    ],
     tags: [
      {
        name: 'Respuestas',
        description: 'Endpoints relacionados con las respuestas de los usuarios',
      },
      {
        name: 'Encuestas',
        description: 'Endpoints para crear y obtener encuestas',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Aquí Swagger buscará los comentarios JSDoc
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;