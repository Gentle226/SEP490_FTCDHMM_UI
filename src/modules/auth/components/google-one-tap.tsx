'use client';

import { useCallback, useEffect } from 'react';

import { authService } from '@/modules/auth/services/auth.service';

import { googleIdentityManager } from '../utils/google-identity-manager';

interface GoogleOneTapProps {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  autoSelect?: boolean;
  cancelOnTapOutside?: boolean;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  [key: string]: unknown;
}

// Google types are already declared in google-login-button.tsx

export function GoogleOneTap({
  onSuccess,
  onError,
  autoSelect: _autoSelect = false, // Set to false to prevent conflicts
  cancelOnTapOutside: _cancelOnTapOutside = true,
}: GoogleOneTapProps) {
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
        console.error('Google One Tap login error:', error);
        onError?.(error);
      }
    },
    [onSuccess, onError],
  );

  useEffect(() => {
    const initializeGoogleOneTap = async () => {
      try {
        await googleIdentityManager.initialize(GOOGLE_CLIENT_ID, handleGoogleCallback);

        // Check if One Tap is available before showing prompt
        if (googleIdentityManager.isOneTapAvailable()) {
          // Show One Tap prompt automatically after initialization
          setTimeout(() => {
            googleIdentityManager.showPrompt();
          }, 500); // Small delay to ensure everything is ready
        } else {
          console.warn('Google One Tap is not available, skipping auto-prompt');
        }
      } catch (error) {
        console.warn('Failed to initialize Google One Tap:', error);
        onError?.(error);
      }
    };

    initializeGoogleOneTap();

    // Cleanup function
    return () => {
      googleIdentityManager.cancel();
    };
  }, [GOOGLE_CLIENT_ID, handleGoogleCallback, onError]);

  if (!GOOGLE_CLIENT_ID) {
    console.warn('Google Client ID not configured');
    return null;
  }

  // This component doesn't render anything visible
  return null;
}
