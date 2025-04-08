# SSO Integration Guide

## Overview
Pehchan provides a secure Single Sign-On (SSO) solution that allows your application to authenticate users through our identity platform. This guide will walk you through the integration process.

## Prerequisites
- A Pehchan account
- Your application's redirect URI(s)
- Basic understanding of OAuth 2.0 and OpenID Connect

## Integration Steps

### 1. Configure Your Application

Before you can integrate with Pehchan SSO, you need to:

1. Contact Pehchan support to register your application
2. Provide your application's redirect URI(s)
3. Receive your client credentials (Client ID and Client Secret)

### 2. Implement the Login Flow

#### Step 1: Redirect to Pehchan Login

When a user needs to log in, redirect them to the Pehchan login page:

```javascript
const redirectToLogin = () => {
  const params = new URLSearchParams({
    client_id: 'YOUR_CLIENT_ID',
    redirect_uri: 'YOUR_REDIRECT_URI',
    response_type: 'code',
    scope: 'openid profile email',
    state: 'YOUR_STATE_PARAMETER' // Optional but recommended
  });

  window.location.href = `https://auth.pehchan.com/realms/pehchan/protocol/openid-connect/auth?${params}`;
};
```

#### Step 2: Handle the Callback

After successful authentication, Pehchan will redirect back to your application with an authorization code. Exchange this code for tokens:

```javascript
const handleCallback = async (code) => {
  const response = await fetch('https://auth.pehchan.com/realms/pehchan/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET',
      code: code,
      redirect_uri: 'YOUR_REDIRECT_URI'
    })
  });

  const tokens = await response.json();
  // Store tokens securely
};
```

### 3. Using the Access Token

Once you have the access token, you can use it to make authenticated requests to your backend:

```javascript
const fetchUserData = async (accessToken) => {
  const response = await fetch('YOUR_API_ENDPOINT', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.json();
};
```

### 4. Handling Token Refresh

Access tokens expire after a certain period. Use the refresh token to obtain a new access token:

```javascript
const refreshTokens = async (refreshToken) => {
  const response = await fetch('https://auth.pehchan.com/realms/pehchan/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET',
      refresh_token: refreshToken
    })
  });

  return response.json();
};
```

## Security Best Practices

1. Always use HTTPS for all communications
2. Store tokens securely (preferably in HTTP-only cookies)
3. Implement proper token validation
4. Use state parameter to prevent CSRF attacks
5. Implement proper error handling
6. Regularly rotate your client secret

## Error Handling

Handle common OAuth errors appropriately:

```javascript
try {
  // Your OAuth flow code
} catch (error) {
  switch (error.error) {
    case 'invalid_grant':
      // Handle invalid or expired tokens
      break;
    case 'invalid_client':
      // Handle invalid client credentials
      break;
    case 'invalid_request':
      // Handle malformed requests
      break;
    default:
      // Handle other errors
  }
}
```

## Support

If you encounter any issues during integration, please contact Pehchan support at support@pehchan.com. 