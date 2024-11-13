import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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