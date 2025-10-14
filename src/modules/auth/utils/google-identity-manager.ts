// Singleton to manage Google Identity Services initialization
class GoogleIdentityManager {
  private static instance: GoogleIdentityManager;
  private isInitialized = false;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private scriptLoaded = false;

  private constructor() {}

  static getInstance(): GoogleIdentityManager {
    if (!GoogleIdentityManager.instance) {
      GoogleIdentityManager.instance = new GoogleIdentityManager();
    }
    return GoogleIdentityManager.instance;
  }

  async loadScript(): Promise<void> {
    if (this.scriptLoaded) return;

    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      );
      if (existingScript) {
        this.scriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.warn('Google Identity Services script loaded successfully');
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity Services script');
        reject(new Error('Failed to load Google Identity Services script'));
      };

      document.head.appendChild(script);
    });
  }

  async initialize(
    clientId: string,
    callback: (response: unknown) => Promise<void>,
  ): Promise<void> {
    if (this.isInitialized) return;

    if (this.isInitializing) {
      await this.initPromise;
      return;
    }

    this.isInitializing = true;
    this.initPromise = this._initialize(clientId, callback);

    try {
      await this.initPromise;
      this.isInitialized = true;
    } finally {
      this.isInitializing = false;
    }
  }

  private async _initialize(
    clientId: string,
    callback: (response: unknown) => Promise<void>,
  ): Promise<void> {
    await this.loadScript();

    // Wait a bit for Google to be fully available
    let retries = 0;
    while (!window.google && retries < 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      retries++;
    }

    if (!window.google) {
      throw new Error('Google Identity Services not available');
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback,
      cancel_on_tap_outside: true,
      auto_select: false, // Disable auto-select to prevent conflicts
      use_fedcm_for_prompt: false, // Disable FedCM to avoid current issues
      itp_support: true, // Enable Intelligent Tracking Prevention support
      context: 'signin', // Provide context for better UX
      ux_mode: 'popup', // Use popup mode for better compatibility
    });
  }

  showPrompt(): void {
    if (!this.isInitialized || !window.google) {
      console.warn('Google Identity Services not initialized');
      return;
    }

    try {
      window.google.accounts.id.prompt((notification: unknown) => {
        const notif = notification as {
          isNotDisplayed?: () => boolean;
          getNotDisplayedReason?: () => string;
          isSkippedMoment?: () => boolean;
          getSkippedReason?: () => string;
          isDismissedMoment?: () => boolean;
          getDismissedReason?: () => string;
        };

        if (notif.isNotDisplayed?.()) {
          const reason = notif.getNotDisplayedReason?.();
          console.warn('Google prompt was not displayed - Reason:', reason);

          // Handle specific cases where prompt is not displayed
          if (reason === 'browser_not_supported') {
            console.warn('Browser does not support Google One Tap');
          } else if (reason === 'invalid_client') {
            console.error('Invalid Google Client ID configuration');
          } else if (reason === 'missing_client_id') {
            console.error('Missing Google Client ID');
          }
        } else if (notif.isSkippedMoment?.()) {
          const reason = notif.getSkippedReason?.();
          console.warn('Google prompt was skipped - Reason:', reason);
        } else if (notif.isDismissedMoment?.()) {
          const reason = notif.getDismissedReason?.();
          console.warn('Google prompt was dismissed - Reason:', reason);
        }
      });
    } catch (error) {
      console.error('Error showing Google prompt:', error);
    }
  }

  // Alternative method to render the sign-in button directly
  renderButton(element: HTMLElement, options?: Record<string, unknown>): void {
    if (!this.isInitialized || !window.google) {
      console.error('Google Identity Services not initialized');
      return;
    }

    try {
      window.google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        ...options,
      });
    } catch (error) {
      console.error('Error rendering Google button:', error);
    }
  }

  cancel(): void {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
    }
  }

  reset(): void {
    this.isInitialized = false;
    this.isInitializing = false;
    this.initPromise = null;
  }

  // Check if One Tap is available for the current user/browser
  isOneTapAvailable(): boolean {
    if (!this.isInitialized || !window.google) {
      return false;
    }

    // Check if One Tap was disabled by user action
    try {
      // This is a basic check - Google doesn't provide a direct API to check availability
      return typeof window.google.accounts.id.prompt === 'function';
    } catch (error) {
      console.warn('Error checking One Tap availability:', error);
      return false;
    }
  }

  // Disable One Tap for the current user (useful for fallback scenarios)
  disableOneTap(): void {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
        console.warn('Google One Tap auto-select has been disabled');
      } catch (error) {
        console.error('Error disabling One Tap:', error);
      }
    }
  }
}

export const googleIdentityManager = GoogleIdentityManager.getInstance();
