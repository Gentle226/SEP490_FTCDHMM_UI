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
        console.log('Google Identity Services script loaded successfully');
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

  async initialize(clientId: string, callback: (response: any) => void): Promise<void> {
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

  private async _initialize(clientId: string, callback: (response: any) => void): Promise<void> {
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
      use_fedcm_for_prompt: true, // Enable FedCM as it will become mandatory
      itp_support: true, // Enable Intelligent Tracking Prevention support
    });
  }

  showPrompt(): void {
    if (!this.isInitialized || !window.google) {
      console.error('Google Identity Services not initialized');
      return;
    }

    try {
      window.google.accounts.id.prompt((notification: any) => {
        console.log('Google prompt notification:', notification);

        if (notification.isNotDisplayed()) {
          console.log(
            'Google prompt was not displayed - Reason:',
            notification.getNotDisplayedReason(),
          );
        } else if (notification.isSkippedMoment()) {
          console.log('Google prompt was skipped - Reason:', notification.getSkippedReason());
        } else if (notification.isDismissedMoment()) {
          console.log('Google prompt was dismissed - Reason:', notification.getDismissedReason());
        }
      });
    } catch (error) {
      console.error('Error showing Google prompt:', error);
    }
  }

  // Alternative method to render the sign-in button directly
  renderButton(element: HTMLElement, options?: any): void {
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
}

export const googleIdentityManager = GoogleIdentityManager.getInstance();
