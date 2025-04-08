# Pehchan React

A React component library for integrating Pehchan SSO into your application.

## Installation

```bash
npm install @pehchan/react
# or
yarn add @pehchan/react
```

## Usage

```tsx
import { PehchanLoginButton } from '@pehchan/react';

function LoginPage() {
  return (
    <PehchanLoginButton
      clientId="your-client-id"
      redirectUri="https://your-app.com/auth/callback"
      serviceName="Your App"
      variant="white" // or "green"
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `clientId` | string | Yes | - | Your application's client ID from Pehchan |
| `redirectUri` | string | Yes | - | The URL where users will be redirected after login |
| `serviceName` | string | Yes | - | Your application's name (displayed to users) |
| `variant` | 'white' \| 'green' | No | 'white' | The logo variant to use. Use 'white' for dark backgrounds and 'green' for light backgrounds |
| `pehchanUrl` | string | No | 'https://pehchan.gov.pk' | The base URL of your Pehchan instance |
| `className` | string | No | '' | Additional CSS classes to apply to the button |
| `buttonText` | string | No | 'Login with Pehchan' | Custom button text |
| `onLoginStart` | () => void | No | - | Callback function called when login is initiated |

## Styling

The button comes with default styling using Tailwind CSS classes. You can customize its appearance by:

1. Using the `className` prop to add additional classes
2. Using the `variant` prop to switch between white and green logo versions
3. Overriding the default styles in your CSS

Example with custom styling:

```tsx
<PehchanLoginButton
  clientId="your-client-id"
  redirectUri="https://your-app.com/auth/callback"
  serviceName="Your App"
  variant="green"
  className="my-4 w-full max-w-md"
/>
```

## TypeScript Support

This package includes TypeScript type definitions. You can import types like this:

```tsx
import type { PehchanLoginButtonProps } from '@pehchan/react';
```

## Examples

### Basic Usage

```tsx
import { PehchanLoginButton } from '@pehchan/react';

function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <PehchanLoginButton
        clientId="your-client-id"
        redirectUri="https://your-app.com/auth/callback"
        serviceName="Your App"
      />
    </div>
  );
}
```

### With Custom Styling and Event Handler

```tsx
import { PehchanLoginButton } from '@pehchan/react';

function LoginPage() {
  const handleLoginStart = () => {
    console.log('User started login process');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <PehchanLoginButton
        clientId="your-client-id"
        redirectUri="https://your-app.com/auth/callback"
        serviceName="Your App"
        variant="green"
        className="shadow-lg hover:shadow-xl"
        buttonText="Sign in with Pehchan"
        onLoginStart={handleLoginStart}
      />
    </div>
  );
}
```

## Support

For any issues or questions, please contact the Pehchan core development team at integration@pehchan.gov.pk. 