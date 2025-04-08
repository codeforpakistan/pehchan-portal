import React, { useEffect, useState } from 'react';

export interface PehchanLoginButtonProps {
  /**
   * Your application's client ID from Pehchan
   */
  clientId: string;
  
  /**
   * The URL where users will be redirected after login
   */
  redirectUri: string;
  
  /**
   * Your application's name (displayed to users)
   */
  serviceName: string;
  
  /**
   * The logo variant to use
   * @default "white"
   */
  variant?: 'white' | 'green';
  
  /**
   * The base URL of your Pehchan instance
   * @default "https://pehchan.codeforpakistan.org"
   */
  pehchanUrl?: string;
  
  /**
   * Optional CSS class name for styling
   */
  className?: string;
  
  /**
   * Optional custom button text
   */
  buttonText?: string;
  
  /**
   * Optional callback when login is initiated
   */
  onLoginStart?: () => void;
}

const WhiteLogo = () => (
  <svg className="w-6 h-6 mr-2" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M19.3517 28.84C23.7416 33.2322 30.859 33.2322 35.2489 28.84C35.7282 28.3604 36.1553 27.8482 36.5299 27.3106C35.977 29.4649 34.8577 31.5036 33.172 33.1902C28.155 38.2098 20.0208 38.2098 15.0038 33.1902C9.98681 28.1706 9.98681 20.0322 15.0038 15.0125C16.6895 13.3259 18.7272 12.206 20.8803 11.6528C20.343 12.0277 19.8311 12.4549 19.3517 12.9345C14.9618 17.3267 14.9618 24.4478 19.3517 28.84Z" fill="white"/>
    <path d="M34.0717 14.1117L31.8162 18.5407L35.3293 22.0556L30.4222 21.278L28.1667 25.7071L27.3895 20.7975L22.4824 20.0198L26.9091 17.7631L26.1319 12.8535L29.645 16.3684L34.0717 14.1117Z" fill="white"/>
    <path d="M1.53058 15.3389C0.510193 15.3389 0 14.8117 0 13.7573V7.30544C0 4.87866 0.618923 3.05439 1.85677 1.83264C3.09462 0.610879 4.93466 0 7.37689 0H13.8254C14.8792 0 15.4062 0.51046 15.4062 1.53138C15.4062 2.56904 14.8792 3.08787 13.8254 3.08787H7.45217C6.03032 3.08787 4.94302 3.45607 4.19028 4.19247C3.45426 4.92887 3.08625 6.0251 3.08625 7.48117V13.7573C3.08625 14.8117 2.56769 15.3389 1.53058 15.3389ZM46.4443 15.3389C45.4239 15.3389 44.9137 14.8117 44.9137 13.7573V7.48117C44.9137 6.0251 44.529 4.92887 43.7595 4.19247C42.9901 3.45607 41.9111 3.08787 40.5227 3.08787H34.1746C33.1208 3.08787 32.5938 2.56904 32.5938 1.53138C32.5938 0.51046 33.1208 0 34.1746 0H40.598C43.057 0 44.9054 0.619247 46.1432 1.85774C47.3811 3.0795 48 4.8954 48 7.30544V13.7573C48 14.8117 47.4814 15.3389 46.4443 15.3389ZM7.37689 48C4.93466 48 3.09462 47.3808 1.85677 46.1423C0.618923 44.9205 0 43.0962 0 40.6695V34.2427C0 33.1883 0.510193 32.6611 1.53058 32.6611C2.56769 32.6611 3.08625 33.1883 3.08625 34.2427V40.5188C3.08625 41.9749 3.45426 43.0711 4.19028 43.8075C4.94302 44.5439 6.03032 44.9121 7.45217 44.9121H13.8254C14.8792 44.9121 15.4062 45.431 15.4062 46.4686C15.4062 47.4895 14.8792 48 13.8254 48H7.37689ZM34.1746 48C33.1208 48 32.5938 47.4895 32.5938 46.4686C32.5938 45.431 33.1208 44.9121 34.1746 44.9121H40.5227C41.9111 44.9121 42.9901 44.5439 43.7595 43.8075C44.529 43.0711 44.9137 41.9749 44.9137 40.5188V34.2427C44.9137 33.1883 45.4239 32.6611 46.4443 32.6611C47.4814 32.6611 48 33.1883 48 34.2427V40.6695C48 43.0962 47.3811 44.9205 46.1432 46.1423C44.9054 47.3808 43.057 48 40.598 48H34.1746Z" fill="white"/>
  </svg>
);

const GreenLogo = () => (
  <svg className="w-6 h-6 mr-2" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M19.3517 28.84C23.7416 33.2322 30.859 33.2322 35.2489 28.84C35.7282 28.3604 36.1553 27.8482 36.5299 27.3106C35.977 29.4649 34.8577 31.5036 33.172 33.1902C28.155 38.2098 20.0208 38.2098 15.0038 33.1902C9.98681 28.1706 9.98681 20.0322 15.0038 15.0125C16.6895 13.3259 18.7272 12.206 20.8803 11.6528C20.343 12.0277 19.8311 12.4549 19.3517 12.9345C14.9618 17.3267 14.9618 24.4478 19.3517 28.84Z" fill="#00AC48"/>
    <path d="M34.0717 14.1117L31.8162 18.5407L35.3293 22.0556L30.4222 21.278L28.1667 25.7071L27.3895 20.7975L22.4824 20.0198L26.9091 17.7631L26.1319 12.8535L29.645 16.3684L34.0717 14.1117Z" fill="#00AC48"/>
    <path d="M1.53058 15.3389C0.510193 15.3389 0 14.8117 0 13.7573V7.30544C0 4.87866 0.618923 3.05439 1.85677 1.83264C3.09462 0.610879 4.93466 0 7.37689 0H13.8254C14.8792 0 15.4062 0.51046 15.4062 1.53138C15.4062 2.56904 14.8792 3.08787 13.8254 3.08787H7.45217C6.03032 3.08787 4.94302 3.45607 4.19028 4.19247C3.45426 4.92887 3.08625 6.0251 3.08625 7.48117V13.7573C3.08625 14.8117 2.56769 15.3389 1.53058 15.3389ZM46.4443 15.3389C45.4239 15.3389 44.9137 14.8117 44.9137 13.7573V7.48117C44.9137 6.0251 44.529 4.92887 43.7595 4.19247C42.9901 3.45607 41.9111 3.08787 40.5227 3.08787H34.1746C33.1208 3.08787 32.5938 2.56904 32.5938 1.53138C32.5938 0.51046 33.1208 0 34.1746 0H40.598C43.057 0 44.9054 0.619247 46.1432 1.85774C47.3811 3.0795 48 4.8954 48 7.30544V13.7573C48 14.8117 47.4814 15.3389 46.4443 15.3389ZM7.37689 48C4.93466 48 3.09462 47.3808 1.85677 46.1423C0.618923 44.9205 0 43.0962 0 40.6695V34.2427C0 33.1883 0.510193 32.6611 1.53058 32.6611C2.56769 32.6611 3.08625 33.1883 3.08625 34.2427V40.5188C3.08625 41.9749 3.45426 43.0711 4.19028 43.8075C4.94302 44.5439 6.03032 44.9121 7.45217 44.9121H13.8254C14.8792 44.9121 15.4062 45.431 15.4062 46.4686C15.4062 47.4895 14.8792 48 13.8254 48H7.37689ZM34.1746 48C33.1208 48 32.5938 47.4895 32.5938 46.4686C32.5938 45.431 33.1208 44.9121 34.1746 44.9121H40.5227C41.9111 44.9121 42.9901 44.5439 43.7595 43.8075C44.529 43.0711 44.9137 41.9749 44.9137 40.5188V34.2427C44.9137 33.1883 45.4239 32.6611 46.4443 32.6611C47.4814 32.6611 48 33.1883 48 34.2427V40.6695C48 43.0962 47.3811 44.9205 46.1432 46.1423C44.9054 47.3808 43.057 48 40.598 48H34.1746Z" fill="#00AC48"/>
  </svg>
);

/**
 * Generates a random string for PKCE
 */
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates PKCE challenge and verifier
 */
async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateRandomString(128);
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const challenge = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return { verifier, challenge };
}

/**
 * A button component for integrating Pehchan SSO login into your application
 */
export function PehchanLoginButton({
  clientId,
  redirectUri,
  serviceName,
  variant = 'white',
  pehchanUrl = 'https://pehchan.codeforpakistan.org',
  className = '',
  buttonText = 'Login with Pehchan',
  onLoginStart,
}: PehchanLoginButtonProps) {
  const [codeVerifier, setCodeVerifier] = useState<string>('');
  const [codeChallenge, setCodeChallenge] = useState<string>('');

  useEffect(() => {
    // Generate PKCE challenge and verifier on component mount
    generatePKCE().then(({ verifier, challenge }) => {
      setCodeVerifier(verifier);
      setCodeChallenge(challenge);
    });
  }, []);

  const handleLogin = () => {
    onLoginStart?.();
    
    // Store PKCE verifier in session storage
    sessionStorage.setItem('oauth_code_verifier', codeVerifier);
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      service_name: serviceName,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    
    window.location.href = `${pehchanUrl}/login?${params}`;
  };

  const baseClasses = 'inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors';
  const variantClasses = variant === 'white' 
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-white text-blue-600 border border-gray-200 hover:bg-gray-50';

  return (
    <button
      onClick={handleLogin}
      className={`${baseClasses} ${variantClasses} ${className}`}
      disabled={!codeVerifier || !codeChallenge}
    >
      {variant === 'white' ? <WhiteLogo /> : <GreenLogo />}
      {buttonText}
    </button>
  );
} 