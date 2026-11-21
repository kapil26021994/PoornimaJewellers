import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PwaService } from '../services/pwa.service';
import { JewelleryService } from '../services/jewellery.service';

@Component({
  selector: 'app-pwa-install',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!pwa.isInstalled()) {
      <button
        type="button"
        (click)="pwa.triggerInstall()"
        class="h-8 px-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[11px] font-bold flex items-center space-x-1 shadow-sm transition active:scale-95 cursor-pointer"
        title="Install App">
        <span class="material-icons text-sm">install_mobile</span>
        <span>Install</span>
      </button>
    }
  `
})
export class PwaInstall {
  readonly pwa = inject(PwaService);
}

@Component({
  selector: 'app-pwa-install-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pwa.showGuide()) {
      <div class="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="bg-neutral-900 text-neutral-100 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t sm:border border-amber-500/30 shadow-2xl native-sheet max-h-[88dvh] overflow-y-auto">
          <div class="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-4 sm:hidden"></div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-2.5">
              <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <span class="material-icons text-xl">install_mobile</span>
              </div>
              <div>
                <h3 class="text-sm font-bold text-white">Install SwarnaMudra App</h3>
                <p class="text-[11px] text-neutral-400">Run full-screen like a native app</p>
              </div>
            </div>
            <button
              type="button"
              (click)="pwa.closeGuide()"
              class="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center cursor-pointer">
              <span class="material-icons text-sm">close</span>
            </button>
          </div>

          @if (pwa.isInIframe()) {
            <div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 mb-3 text-xs text-amber-200 leading-relaxed">
              Browsers disable the one-tap install popup inside embedded preview windows. Open the app directly in a full Chrome/Safari browser tab to install it to your home screen.
            </div>
            <button
              type="button"
              (click)="copyAppUrl()"
              class="w-full py-2.5 mb-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer">
              <span class="material-icons text-sm">content_copy</span>
              <span>Copy App Link</span>
            </button>
          }

          @if (pwa.isIOS()) {
            <ol class="text-xs text-neutral-300 space-y-2 mb-5 pl-1">
              <li class="flex items-center space-x-2">
                <span class="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                <span>Open in <strong>Safari</strong> and tap the <strong>Share</strong> icon.</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
              </li>
            </ol>
          } @else {
            <ol class="text-xs text-neutral-300 space-y-2 mb-5 pl-1">
              <li class="flex items-center space-x-2">
                <span class="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                <span>Open the app URL in <strong>Chrome / Edge</strong> outside preview.</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                <span>Tap <strong>Install</strong> in the header or browser menu (<strong>⋮ → Add to Home screen</strong>).</span>
              </li>
            </ol>
          }

          <button
            type="button"
            (click)="pwa.closeGuide()"
            class="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition active:scale-95 cursor-pointer">
            Got It
          </button>
        </div>
      </div>
    }
  `
})
export class PwaInstallSheet {
  readonly pwa = inject(PwaService);
  private readonly jewelleryService = inject(JewelleryService);

  async copyAppUrl() {
    const url = this.pwa.currentUrl();
    if (!url || typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(url);
      this.jewelleryService.showToast('App link copied! Paste in Chrome/Safari to install.', 'success');
    } catch {
      this.jewelleryService.showToast('Copy the shared app URL from your browser address bar.', 'info');
    }
  }
}
