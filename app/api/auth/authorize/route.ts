import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * @swagger
 * /api/auth/authorize:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Authorize client for OAuth
 *     description: Stores client information in cookies and redirects the user to the login page with the provided service name if specified.
 *     parameters:
 *       - in: query
 *         name: client_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The client ID for the OAuth client.
 *         example: my-client-id
 *       - in: query
 *         name: redirect_uri
 *         required: true
 *         schema:
 *           type: string
 *         description: The URI to redirect to after successful authorization.
 *         example: https://example.com/callback
 *       - in: query
 *         name: service_name
 *         required: false
 *         schema:
 *           type: string
 *         description: The name of the service requesting authorization. This is optional.
 *         example: my-service
 *     responses:
 *       302:
 *         description: Redirects to the login page with the appropriate parameters.
 *         headers:
 *           Location:
 *             description: The URL to which the user is redirected.
 *             schema:
 *               type: string
 *               example: https://example.com/login?service_name=my-service
 *       400:
 *         description: Missing required parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required parameters.
 *       500:
 *         description: Server error occurred during authorization.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authorization failed.
 */


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')
    const redirectUri = searchParams.get('redirect_uri')
    const serviceName = searchParams.get('service_name')
    
    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Store client information in cookies for later use
    const cookieStore = cookies()
    cookieStore.set('oauth_client_id', clientId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    })
    
    cookieStore.set('oauth_redirect_uri', redirectUri, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600
    })

    // Redirect to login page with service name
    const loginUrl = new URL('/login', request.url)
    if (serviceName) {
      loginUrl.searchParams.set('service_name', serviceName)
    }

    return NextResponse.redirect(loginUrl)
  } catch (error) {
    console.error('Authorization error:', error)
    return NextResponse.json(
      { message: 'Authorization failed' },
      { status: 500 }
    )
  }
} 