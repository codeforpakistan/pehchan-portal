# Pehchan API Documentation

This document outlines the key endpoints for integrating Pehchan authentication and SSO into your applications.

## Authentication Endpoints

### 1. User Registration
```http
POST /api/auth/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "user-uuid"
}
```

### 2. User Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "expires_in": 3600
}
```

### 3. OTP Verification
```http
POST /api/auth/otp
```

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

## SSO Integration Endpoints

### 1. Register SSO Client
```http
POST /api/sso/register
```

**Request Body:**
```json
{
  "clientName": "Your App Name",
  "redirectUris": ["https://your-app.com/callback"],
  "allowedOrigins": ["https://your-app.com"]
}
```

**Response:**
```json
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "redirectUris": ["https://your-app.com/callback"]
}
```

### 2. SSO Login
```http
GET /api/sso/login?client_id=your-client-id&redirect_uri=https://your-app.com/callback
```

**Response:**
Redirects to Pehchan login page, then back to your redirect URI with authorization code.

### 3. Token Exchange
```http
POST /api/sso/token
```

**Request Body:**
```json
{
  "grant_type": "authorization_code",
  "code": "authorization_code",
  "client_id": "your-client-id",
  "client_secret": "your-client-secret",
  "redirect_uri": "https://your-app.com/callback"
}
```

**Response:**
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### 4. User Info
```http
GET /api/sso/userinfo
```

**Headers:**
```
Authorization: Bearer your-access-token
```

**Response:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "email_verified": true,
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "phone_number": "+1234567890",
  "phone_number_verified": true
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "error_code",
  "error_description": "Human readable error message"
}
```

Common error codes:
- `invalid_request`: Missing or invalid parameters
- `unauthorized_client`: Invalid client credentials
- `access_denied`: User denied the request
- `invalid_grant`: Invalid authorization code or refresh token
- `unsupported_grant_type`: Unsupported grant type
- `invalid_scope`: Invalid or missing scope

## Security Considerations

1. Always use HTTPS for all API calls
2. Store client secrets securely
3. Implement proper token storage and refresh mechanisms
4. Validate all redirect URIs
5. Implement proper error handling
6. Use PKCE for enhanced security in SSO flows

## Rate Limiting

API endpoints are rate-limited to prevent abuse. The current limits are:
- Authentication endpoints: 10 requests per minute
- SSO endpoints: 20 requests per minute

## Support

For integration support or to report issues, please contact support@pehchan.com 