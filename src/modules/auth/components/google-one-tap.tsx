'use client';

import { useCallback, useEffect } from 'react';

import { authService } from '@/modules/auth/services/auth.service';

import { googleIdentityManager } from '../utils/google-identity-manager';

interface GoogleOneTapProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  autoSelect?: boolean;
  cancelOnTapOutside?: boolean;
}

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleOneTap({
  onSuccess,
  onError,
  autoSelect = false, // Set to false to prevent conflicts
  cancelOnTapOutside = true,
}: GoogleOneTapProps) {
  const GOOGLE_CLIENT_ID =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '1013528724745-4gb7j1qedeo8n4qd07uj1grpla9ao7bf.apps.googleusercontent.com';

  const handleGoogleCallback = useCallback(
    async (response: any) => {
      try {
        console.log('Google One Tap sign-in success:', response);
        await authService.loginWithGoogleIdToken(response.credential);
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

        // Show One Tap prompt automatically after initialization
        setTimeout(() => {
          googleIdentityManager.showPrompt();
        }, 500); // Small delay to ensure everything is ready
      } catch (error) {
        console.error('Failed to initialize Google One Tap:', error);
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
