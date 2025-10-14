'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/base/components/ui/button';
import { authService } from '@/modules/auth/services/auth.service';

import { googleIdentityManager } from '../utils/google-identity-manager';

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  className?: string;
  disabled?: boolean;
  text?: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (callback?: (notification: unknown) => void) => void;
          renderButton: (element: HTMLElement, options?: Record<string, unknown>) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export function GoogleLoginButton({
  onSuccess,
  onError,
  className,
  disabled = false,
  text = 'Continue with Google',
}: GoogleLoginButtonProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const GOOGLE_CLIENT_ID =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '1013528724745-4gb7j1qedeo8n4qd07uj1grpla9ao7bf.apps.googleusercontent.com';

  const handleGoogleCallback = useCallback(
    async (response: unknown) => {
      try {
        const credentialResponse = response as GoogleCredentialResponse;
        console.warn('Google sign-in attempt:', {
          hasCredential: !!credentialResponse.credential,
          selectBy: credentialResponse.select_by,
        });
        await authService.loginWithGoogleIdToken(credentialResponse.credential);
        onSuccess?.();
      } catch (error) {
        console.error('Google login error:', error);
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
        console.warn('Failed to initialize Google Identity Services:', error);
        onError?.(error);
      }
    };

    initializeGoogle();
  }, [GOOGLE_CLIENT_ID, handleGoogleCallback, onError]);

  const handleGoogleLogin = useCallback(() => {
    if (!isInitialized) {
      console.warn('Google Identity Services not initialized');
      return;
    }

    try {
      googleIdentityManager.showPrompt();
    } catch (error) {
      console.warn('Error showing Google sign-in prompt:', error);
      onError?.(error);
    }
  }, [isInitialized, onError]);

  if (!GOOGLE_CLIENT_ID) {
    console.warn('Google Client ID not configured');
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleLogin}
      disabled={disabled}
      className={className}
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {text}
    </Button>
  );
}
