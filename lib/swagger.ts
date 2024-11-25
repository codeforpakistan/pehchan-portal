export const swaggerConfig = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Pehchan API Documentation',
        version: '1.0.0',
        description: 'API documentation for Pehchan authentication service',
        contact: {
          name: 'API Support',
          email: 'support@pehchan.gov.pk',
        },
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
    },
    apis: ['./app/api/**/*.ts'], // Path to the API docs
  }