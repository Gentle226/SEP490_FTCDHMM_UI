'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { authService } from '@/modules/auth/services/auth.service';

import { googleIdentityManager } from '../utils/google-identity-manager';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  className?: string;
  disabled?: boolean;
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  [key: string]: unknown;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  className,
  disabled = false,
  theme = 'outline',
  size = 'large',
  text = 'signin_with',
}: GoogleSignInButtonProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const GOOGLE_CLIENT_ID =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '1013528724745-4gb7j1qedeo8n4qd07uj1grpla9ao7bf.apps.googleusercontent.com';

  const handleGoogleCallback = useCallback(
    async (response: unknown) => {
      try {
        const credentialResponse = response as GoogleCredentialResponse;
        await authService.loginWithGoogleIdToken(credentialResponse.credential);
        onSuccess?.();
      } catch (error) {
        onError?.(error);
      }
    },
    [onSuccess, onError],
  );

  useEffect(() => {
    const initializeGoogle = async () => {
      try {
        await googleIdentityManager.initialize(GOOGLE_CLIENT_ID, handleGoogleCallback);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Google Identity Services:', error);
        onError?.(error);
      }
    };

    initializeGoogle();
  }, [GOOGLE_CLIENT_ID, handleGoogleCallback, onError]);

  useEffect(() => {
    if (isInitialized && buttonRef.current && !disabled) {
      // Clear any existing content
      buttonRef.current.innerHTML = '';

      try {
        googleIdentityManager.renderButton(buttonRef.current, {
          theme,
          size,
          text,
        });
      } catch (error) {
        console.error('Error rendering Google button:', error);
        onError?.(error);
      }
    }
  }, [isInitialized, disabled, theme, size, text, onError]);

  if (!GOOGLE_CLIENT_ID) {
    console.warn('Google Client ID not configured');
    return null;
  }

  return (
    <div className={className}>
      <div ref={buttonRef} className={disabled ? 'pointer-events-none opacity-50' : ''} />
      {!isInitialized && (
        <div className="flex items-center justify-center p-4">
          <span className="text-sm text-gray-500">Loading Google Sign-In...</span>
        </div>
      )}
    </div>
  );
}
