import { NextResponse } from 'next/server'
import { createSwaggerSpec } from 'next-swagger-doc'

const spec = createSwaggerSpec({
  apiFolder: 'app/api',
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pehchan API Documentation',
      version: '1.0.0',
      description: 'Documentation for Pehchan Authentication Service',
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        description: 'API Server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication related endpoints'
      },
      {
        name: 'User Profile',
        description: 'User profile management endpoints'
      },
      {
        name: 'Sessions',
        description: 'Session management endpoints'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
})

export async function GET() {
  return NextResponse.json(spec)
}
