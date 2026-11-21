import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type WindowWithPwa = Window & {
  __deferredPwaPrompt?: BeforeInstallPromptEvent | null;
};

@Injectable({ providedIn: 'root' })
export class PwaService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly deferredPrompt = signal<BeforeInstallPromptEvent | null>(null);

  readonly isInstalled = signal<boolean>(false);
  readonly isIOS = signal<boolean>(false);
  readonly isInIframe = signal<boolean>(false);
  readonly isOnline = signal<boolean>(true);
  readonly currentUrl = signal<string>('');
  readonly showGuide = signal<boolean>(false);
  readonly isInstallable = computed(() => this.deferredPrompt() !== null && !this.isInstalled());

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const win = window as WindowWithPwa;
    const nav = win.navigator as Navigator & { standalone?: boolean };
    const standalone =
      win.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
    this.isInstalled.set(standalone);

    const ua = nav.userAgent.toLowerCase();
    this.isIOS.set(/iphone|ipad|ipod/.test(ua));
    this.isOnline.set(nav.onLine);
    this.currentUrl.set(win.location.href);

    try {
      this.isInIframe.set(win.self !== win.top);
    } catch {
      this.isInIframe.set(true);
    }

    if (win.__deferredPwaPrompt) {
      this.deferredPrompt.set(win.__deferredPwaPrompt);
    }

    if ('serviceWorker' in nav) {
      nav.serviceWorker.register('/sw.js').catch(() => undefined);
    }

    win.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      win.__deferredPwaPrompt = promptEvent;
      this.deferredPrompt.set(promptEvent);
    });

    win.addEventListener('appinstalled', () => {
      this.isInstalled.set(true);
      this.deferredPrompt.set(null);
      this.showGuide.set(false);
      win.__deferredPwaPrompt = null;
    });

    win.addEventListener('online', () => this.isOnline.set(true));
    win.addEventListener('offline', () => this.isOnline.set(false));
  }

  async install(): Promise<boolean> {
    const promptEvent = this.deferredPrompt();
    if (!promptEvent) return false;

    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      this.isInstalled.set(true);
      this.deferredPrompt.set(null);
      (window as WindowWithPwa).__deferredPwaPrompt = null;
      return true;
    }
    return false;
  }

  async triggerInstall(): Promise<void> {
    if (this.isInstallable()) {
      const installed = await this.install();
      if (installed) return;
    }
    this.showGuide.set(true);
  }

  closeGuide(): void {
    this.showGuide.set(false);
  }
}
