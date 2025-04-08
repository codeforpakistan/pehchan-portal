# Integrating Pehchan as an SSO Provider

This guide explains how to integrate Pehchan as a Single Sign-On (SSO) provider for your application.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Integration Examples](#integration-examples)
3. [API Reference](#api-reference)
4. [Logo Usage](#logo-usage)

## Getting Started

### 1. Request Access

To integrate Pehchan SSO into your application, please contact the Pehchan core development team:

**Email**: integration@pehchan.gov.pk

Please provide:
- Your application name and description
- Intended use case
- Redirect URIs (URLs where users will be redirected after login)
- Contact information

Our team will review your request and provide:
- Client ID
- Client Secret
- Access to the test environment
- Technical support during integration

### 2. Configuration

Once approved, add these environment variables to your application:

```env
PEHCHAN_CLIENT_ID=your-provided-client-id
PEHCHAN_CLIENT_SECRET=your-provided-client-secret
PEHCHAN_AUTH_URL=https://pehchan.gov.pk
```

## Integration Examples

### Option 1: Using Our React Component (Recommended)

Install our official React component:

```bash
npm install @pehchan/react
# or
yarn add @pehchan/react
```

Add the login button to your app:

```tsx
import { PehchanLoginButton } from '@pehchan/react';

export default function LoginPage() {
  return (
    <div>
      <h1>Welcome</h1>
      <PehchanLoginButton
        clientId="your-provided-client-id"
        redirectUri="https://your-app.com/auth/callback"
        serviceName="Your App Name"
        variant="white"
      />
    </div>
  );
}
```

### Option 2: HTML & JavaScript

If you're not using React, add this to your HTML:

```html
<style>
  .pehchan-button {
    display: inline-flex;
    align-items: center;
    background-color: #2563eb;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: background-color 0.2s;
    text-decoration: none;
  }

  .pehchan-button:hover {
    background-color: #1d4ed8;
  }

  .pehchan-button--light {
    background-color: white;
    color: #2563eb;
    border: 1px solid #e5e7eb;
  }

  .pehchan-button--light:hover {
    background-color: #f9fafb;
  }

  .pehchan-logo {
    width: 24px;
    height: 24px;
    margin-right: 0.5rem;
  }
</style>

<a href="#" class="pehchan-button" onclick="loginWithPehchan()">
  <svg class="pehchan-logo" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M19.3517 28.84C23.7416 33.2322 30.859 33.2322 35.2489 28.84C35.7282 28.3604 36.1553 27.8482 36.5299 27.3106C35.977 29.4649 34.8577 31.5036 33.172 33.1902C28.155 38.2098 20.0208 38.2098 15.0038 33.1902C9.98681 28.1706 9.98681 20.0322 15.0038 15.0125C16.6895 13.3259 18.7272 12.206 20.8803 11.6528C20.343 12.0277 19.8311 12.4549 19.3517 12.9345C14.9618 17.3267 14.9618 24.4478 19.3517 28.84Z" fill="white"/>
    <path d="M34.0717 14.1117L31.8162 18.5407L35.3293 22.0556L30.4222 21.278L28.1667 25.7071L27.3895 20.7975L22.4824 20.0198L26.9091 17.7631L26.1319 12.8535L29.645 16.3684L34.0717 14.1117Z" fill="white"/>
    <path d="M1.53058 15.3389C0.510193 15.3389 0 14.8117 0 13.7573V7.30544C0 4.87866 0.618923 3.05439 1.85677 1.83264C3.09462 0.610879 4.93466 0 7.37689 0H13.8254C14.8792 0 15.4062 0.51046 15.4062 1.53138C15.4062 2.56904 14.8792 3.08787 13.8254 3.08787H7.45217C6.03032 3.08787 4.94302 3.45607 4.19028 4.19247C3.45426 4.92887 3.08625 6.0251 3.08625 7.48117V13.7573C3.08625 14.8117 2.56769 15.3389 1.53058 15.3389ZM46.4443 15.3389C45.4239 15.3389 44.9137 14.8117 44.9137 13.7573V7.48117C44.9137 6.0251 44.529 4.92887 43.7595 4.19247C42.9901 3.45607 41.9111 3.08787 40.5227 3.08787H34.1746C33.1208 3.08787 32.5938 2.56904 32.5938 1.53138C32.5938 0.51046 33.1208 0 34.1746 0H40.598C43.057 0 44.9054 0.619247 46.1432 1.85774C47.3811 3.0795 48 4.8954 48 7.30544V13.7573C48 14.8117 47.4814 15.3389 46.4443 15.3389ZM7.37689 48C4.93466 48 3.09462 47.3808 1.85677 46.1423C0.618923 44.9205 0 43.0962 0 40.6695V34.2427C0 33.1883 0.510193 32.6611 1.53058 32.6611C2.56769 32.6611 3.08625 33.1883 3.08625 34.2427V40.5188C3.08625 41.9749 3.45426 43.0711 4.19028 43.8075C4.94302 44.5439 6.03032 44.9121 7.45217 44.9121H13.8254C14.8792 44.9121 15.4062 45.431 15.4062 46.4686C15.4062 47.4895 14.8792 48 13.8254 48H7.37689ZM34.1746 48C33.1208 48 32.5938 47.4895 32.5938 46.4686C32.5938 45.431 33.1208 44.9121 34.1746 44.9121H40.5227C41.9111 44.9121 42.9901 44.5439 43.7595 43.8075C44.529 43.0711 44.9137 41.9749 44.9137 40.5188V34.2427C44.9137 33.1883 45.4239 32.6611 46.4443 32.6611C47.4814 32.6611 48 33.1883 48 34.2427V40.6695C48 43.0962 47.3811 44.9205 46.1432 46.1423C44.9054 47.3808 43.057 48 40.598 48H34.1746Z" fill="white"/>
  </svg>
  Login with Pehchan
</a>

<a href="#" class="pehchan-button pehchan-button--light" onclick="loginWithPehchan()">
  <svg class="pehchan-logo" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M19.3517 28.84C23.7416 33.2322 30.859 33.2322 35.2489 28.84C35.7282 28.3604 36.1553 27.8482 36.5299 27.3106C35.977 29.4649 34.8577 31.5036 33.172 33.1902C28.155 38.2098 20.0208 38.2098 15.0038 33.1902C9.98681 28.1706 9.98681 20.0322 15.0038 15.0125C16.6895 13.3259 18.7272 12.206 20.8803 11.6528C20.343 12.0277 19.8311 12.4549 19.3517 12.9345C14.9618 17.3267 14.9618 24.4478 19.3517 28.84Z" fill="#00AC48"/>
    <path d="M34.0717 14.1117L31.8162 18.5407L35.3293 22.0556L30.4222 21.278L28.1667 25.7071L27.3895 20.7975L22.4824 20.0198L26.9091 17.7631L26.1319 12.8535L29.645 16.3684L34.0717 14.1117Z" fill="#00AC48"/>
    <path d="M1.53058 15.3389C0.510193 15.3389 0 14.8117 0 13.7573V7.30544C0 4.87866 0.618923 3.05439 1.85677 1.83264C3.09462 0.610879 4.93466 0 7.37689 0H13.8254C14.8792 0 15.4062 0.51046 15.4062 1.53138C15.4062 2.56904 14.8792 3.08787 13.8254 3.08787H7.45217C6.03032 3.08787 4.94302 3.45607 4.19028 4.19247C3.45426 4.92887 3.08625 6.0251 3.08625 7.48117V13.7573C3.08625 14.8117 2.56769 15.3389 1.53058 15.3389ZM46.4443 15.3389C45.4239 15.3389 44.9137 14.8117 44.9137 13.7573V7.48117C44.9137 6.0251 44.529 4.92887 43.7595 4.19247C42.9901 3.45607 41.9111 3.08787 40.5227 3.08787H34.1746C33.1208 3.08787 32.5938 2.56904 32.5938 1.53138C32.5938 0.51046 33.1208 0 34.1746 0H40.598C43.057 0 44.9054 0.619247 46.1432 1.85774C47.3811 3.0795 48 4.8954 48 7.30544V13.7573C48 14.8117 47.4814 15.3389 46.4443 15.3389ZM7.37689 48C4.93466 48 3.09462 47.3808 1.85677 46.1423C0.618923 44.9205 0 43.0962 0 40.6695V34.2427C0 33.1883 0.510193 32.6611 1.53058 32.6611C2.56769 32.6611 3.08625 33.1883 3.08625 34.2427V40.5188C3.08625 41.9749 3.45426 43.0711 4.19028 43.8075C4.94302 44.5439 6.03032 44.9121 7.45217 44.9121H13.8254C14.8792 44.9121 15.4062 45.431 15.4062 46.4686C15.4062 47.4895 14.8792 48 13.8254 48H7.37689ZM34.1746 48C33.1208 48 32.5938 47.4895 32.5938 46.4686C32.5938 45.431 33.1208 44.9121 34.1746 44.9121H40.5227C41.9111 44.9121 42.9901 44.5439 43.7595 43.8075C44.529 43.0711 44.9137 41.9749 44.9137 40.5188V34.2427C44.9137 33.1883 45.4239 32.6611 46.4443 32.6611C47.4814 32.6611 48 33.1883 48 34.2427V40.6695C48 43.0962 47.3811 44.9205 46.1432 46.1423C44.9054 47.3808 43.057 48 40.598 48H34.1746Z" fill="#00AC48"/>
  </svg>
  Login with Pehchan
</a>

<script>
function loginWithPehchan() {
  const clientId = 'your-provided-client-id';
  const redirectUri = 'https://your-app.com/auth/callback';
  const serviceName = 'Your App Name';
  
  window.location.href = `https://pehchan.codeforpakistan.org/login?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&service_name=${encodeURIComponent(serviceName)}`;
}
</script>
```

### Handling Authentication

Create a callback handler at your redirect URI:

```typescript
// pages/auth/callback.ts
async function handleCallback(code: string, state: string) {
  // The callback endpoint will handle the token exchange internally
  // and redirect back to your application with the tokens
  window.location.href = `https://pehchan.codeforpakistan.org/api/auth/callback?code=${code}&state=${state}`;
  
  // After the callback, your application will receive the tokens as URL parameters:
  // - access_token: The access token for API calls
  // - id_token: The ID token containing user information
  // - token_type: Always "Bearer"
  // - expires_in: Token expiration time in seconds
}
```

## API Reference

### Authentication Flow

1. User clicks "Login with Pehchan"
2. User is redirected to Pehchan login page
3. After successful login, user is redirected back with an auth code and state
4. Your app sends the code and state to the callback endpoint
5. The callback endpoint exchanges the code for tokens and redirects back to your app
6. Your app receives the tokens as URL parameters

### Endpoints

- **Login**: `GET https://pehchan.codeforpakistan.org/login`
  - Parameters:
    - `client_id`: Your provided client ID
    - `redirect_uri`: Your callback URL
    - `service_name`: Your app name

- **Callback**: `GET https://pehchan.codeforpakistan.org/api/auth/callback`
  - Parameters:
    - `code`: The authorization code
    - `state`: The state parameter for CSRF protection
  - Response: Redirects back to your application with tokens as URL parameters

- **User Info**: `GET https://pehchan.codeforpakistan.org/api/auth/userinfo`
  - Headers:
    - `Authorization`: Bearer token

### User Profile Data

```typescript
interface UserProfile {
  sub: string;          // Unique user ID
  email: string;        // User's email
  email_verified: boolean;
  name: string;         // Full name
  given_name: string;   // First name
  family_name: string;  // Last name
  picture?: string;     // Profile picture URL
}
```

## Security Best Practices

1. Store client secrets securely (never in client-side code)
2. Use HTTPS for all API calls
3. Validate all tokens and signatures
4. Implement CSRF protection
5. Follow OAuth 2.0 security best practices

## Support

- Integration Support: integration@pehchan.gov.pk
- Documentation: https://docs.pehchan.gov.pk
- Technical Support: https://support.pehchan.gov.pk

For any issues or questions during integration, our team is here to help!

## Logo Usage

The Pehchan SSO button comes with two logo variants:

1. **White Logo** - For use on dark backgrounds
2. **Green Logo** - For use on light backgrounds

### React Component

The React component supports both variants through the `variant` prop:

```tsx
// White logo (for dark backgrounds)
<PehchanLoginButton
  variant="white"
  // ... other props
/>

// Green logo (for light backgrounds)
<PehchanLoginButton
  variant="green"
  // ... other props
/>
```

### HTML/CSS

For HTML implementation, we provide both SVG versions and corresponding CSS classes:
- Use `pehchan-button` class for dark background with white logo
- Use `pehchan-button pehchan-button--light` classes for light background with green logo

The SVG code for both variants is provided in the examples above. 