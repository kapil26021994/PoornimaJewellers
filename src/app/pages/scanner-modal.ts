import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  output,
  signal,
  computed
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { JewelleryService } from '../services/jewellery.service';
import { Product } from '../models/jewellery.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-scanner-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-500/30 flex flex-col max-h-[92vh]">
        <!-- Header -->
        <div class="bg-neutral-900 text-white p-4 flex items-center justify-between border-b border-amber-500/20 shrink-0">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
              <span class="material-icons">qr_code_scanner</span>
            </div>
            <div>
              <h3 class="font-bold text-base text-white">Tag QR / Barcode Scanner</h3>
              <p class="text-[11px] text-neutral-400">Scan ornament tag to look up or add item</p>
            </div>
          </div>
          <button (click)="closeScanner()" class="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition cursor-pointer" type="button" title="Close Scanner">
            <span class="material-icons text-sm">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="p-4 overflow-y-auto space-y-4 flex-1">
          <!-- Camera Viewport -->
          @if (!scannedCode()) {
            <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
              <video #videoElement class="w-full h-full object-cover" autoplay muted playsinline></video>

              <!-- Scanning Overlay Frame -->
              @if (cameraActive()) {
                <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div class="w-56 h-40 relative rounded-2xl border-2 border-amber-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                    <!-- Corner accents -->
                    <span class="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-amber-400 rounded-tl-lg"></span>
                    <span class="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-amber-400 rounded-tr-lg"></span>
                    <span class="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-amber-400 rounded-bl-lg"></span>
                    <span class="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-amber-400 rounded-br-lg"></span>
                    <!-- Animated Scan Line -->
                    <div class="absolute left-2 right-2 top-1/2 h-0.5 bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-pulse"></div>
                  </div>
                </div>

                <!-- Live Camera Controls -->
                <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span class="px-2.5 py-1 rounded-full bg-black/70 text-amber-300 text-[10px] font-semibold backdrop-blur-md flex items-center space-x-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Align tag inside frame</span>
                  </span>

                  <div class="flex items-center space-x-1.5">
                    @if (hasTorch()) {
                      <button (click)="toggleTorch()" type="button"
                        [class]="torchOn() ? 'bg-amber-500 text-neutral-950' : 'bg-black/70 text-white hover:bg-black/90'"
                        class="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition cursor-pointer" title="Toggle Flashlight">
                        <span class="material-icons text-sm">{{ torchOn() ? 'flashlight_on' : 'flashlight_off' }}</span>
                      </button>
                    }
                    @if (availableCameras().length > 1) {
                      <button (click)="switchCamera()" type="button"
                        class="w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer" title="Switch Camera">
                        <span class="material-icons text-sm">cameraswitch</span>
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Starting / Error State -->
              @if (isStartingCamera()) {
                <div class="absolute inset-0 bg-neutral-950/90 flex flex-col items-center justify-center text-neutral-300 p-4 text-center">
                  <span class="material-icons text-3xl text-amber-400 animate-spin mb-2">sync</span>
                  <p class="text-xs font-medium">Starting camera...</p>
                </div>
              } @else if (cameraError()) {
                <div class="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center text-center p-5">
                  <span class="material-icons text-4xl text-amber-400 mb-2">no_photography</span>
                  <p class="text-xs font-bold text-white mb-1">Camera Unavailable</p>
                  <p class="text-[11px] text-neutral-400 max-w-xs">{{ cameraError() }}</p>
                  <button (click)="startCamera()" type="button" class="mt-3 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition cursor-pointer">
                    Retry Camera
                  </button>
                </div>
              }
            </div>

            <!-- Alternative Actions: Scan from Image or Manual Tag Entry -->
            <div class="space-y-3">
              <input #imageFileInput type="file" accept="image/*" class="hidden" (change)="onImageUpload($event)">
              <button (click)="imageFileInput.click()" type="button"
                class="w-full py-2.5 px-4 rounded-xl border border-amber-500/40 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer">
                <span class="material-icons text-base text-amber-600">image_search</span>
                <span>Scan QR / Barcode from Photo</span>
              </button>

              <!-- Manual Tag Input Fallback -->
              <div class="bg-neutral-50 p-3 rounded-2xl border border-neutral-200 space-y-2">
                <label class="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Or Enter Tag Code Manually
                  <div class="flex items-center space-x-2 mt-1.5">
                    <input #manualInput type="text" placeholder="e.g. JWL-G-1001"
                      (keydown.enter)="handleManualCode(manualInput.value)"
                      class="flex-1 px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs text-neutral-900 font-mono focus:border-amber-500 outline-none">
                    <button (click)="handleManualCode(manualInput.value)" type="button"
                      class="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs font-bold transition cursor-pointer">
                      Check
                    </button>
                  </div>
                </label>
                <div class="flex items-center flex-wrap gap-1.5 pt-1">
                  <span class="text-[10px] text-neutral-400">Quick test:</span>
                  <button (click)="handleManualCode('JWL-G-1001')" type="button" class="px-2 py-0.5 rounded-lg bg-white border border-neutral-200 text-[10px] font-mono text-neutral-700 hover:border-amber-400 cursor-pointer">
                    JWL-G-1001
                  </button>
                  <button (click)="handleManualCode('JWL-G-9901')" type="button" class="px-2 py-0.5 rounded-lg bg-white border border-neutral-200 text-[10px] font-mono text-neutral-700 hover:border-amber-400 cursor-pointer">
                    JWL-G-9901 (New)
                  </button>
                </div>
              </div>
            </div>
          } @else {
            <!-- Scanned Result Panel -->
            <div class="space-y-4">
              <div class="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                  <span class="material-icons text-amber-600">qr_code_2</span>
                  <div>
                    <span class="text-[10px] uppercase font-bold text-amber-800 block">Scanned Tag Code</span>
                    <span class="text-sm font-mono font-extrabold text-neutral-950">{{ scannedCode() }}</span>
                  </div>
                </div>
                <button (click)="rescan()" type="button" class="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-[11px] font-bold hover:bg-amber-100 transition cursor-pointer flex items-center space-x-1">
                  <span class="material-icons text-xs">refresh</span>
                  <span>Rescan</span>
                </button>
              </div>

              @if (matchedProduct(); as prod) {
                <!-- Found Product Card -->
                <div class="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
                  <div class="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center justify-between">
                    <span class="text-xs font-bold text-emerald-800 flex items-center">
                      <span class="material-icons text-sm mr-1.5">check_circle</span> Item Found in Vault
                    </span>
                    <span class="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Qty: {{ prod.quantity }}
                    </span>
                  </div>
                  <div class="p-4 flex items-center space-x-3.5">
                    <img [src]="prod.image" [alt]="prod.name" referrerpolicy="no-referrer" class="w-16 h-16 rounded-xl object-cover object-center border border-neutral-200 shrink-0">
                    <div class="flex-1 min-w-0">
                      <div class="text-[10px] font-mono font-bold text-amber-700">{{ prod.code }} • {{ prod.category }}</div>
                      <h4 class="font-bold text-sm text-neutral-900 truncate">{{ prod.name }}</h4>
                      <div class="text-xs text-neutral-600 mt-0.5">{{ prod.netWeight }}g • {{ prod.purity }}</div>
                      <div class="text-sm font-extrabold text-neutral-950 mt-1">₹{{ prod.sellingPrice | number:'1.0-0' }}</div>
                    </div>
                  </div>
                  <div class="p-3 bg-neutral-50 border-t border-neutral-100 grid grid-cols-2 gap-2">
                    <button (click)="lookupInInventory.emit(prod.code)" type="button"
                      class="py-2.5 px-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1.5">
                      <span class="material-icons text-sm">filter_alt</span>
                      <span>Show in List</span>
                    </button>
                    <button (click)="editMatchedProduct.emit(prod)" type="button"
                      class="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm">
                      <span class="material-icons text-sm">edit</span>
                      <span>Edit Details</span>
                    </button>
                  </div>
                </div>
              } @else {
                <!-- New / Unregistered Tag -->
                <div class="bg-white rounded-2xl border border-neutral-200 p-5 text-center space-y-3">
                  <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <span class="material-icons text-2xl">add_box</span>
                  </div>
                  <div>
                    <h4 class="font-bold text-neutral-900 text-sm">No Matching Item Found</h4>
                    <p class="text-xs text-neutral-500 mt-1">
                      Tag <span class="font-mono font-bold text-neutral-800">{{ scannedCode() }}</span> is not in your inventory yet. Would you like to add a new jewellery item with this tag?
                    </p>
                  </div>
                  <div class="grid grid-cols-2 gap-2 pt-2">
                    <button (click)="lookupInInventory.emit(scannedCode()!)" type="button"
                      class="py-2.5 px-3 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold transition cursor-pointer">
                      Search Anyway
                    </button>
                    <button (click)="addWithScannedCode.emit(scannedCode()!)" type="button"
                      class="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition cursor-pointer shadow-md flex items-center justify-center space-x-1">
                      <span class="material-icons text-sm">add</span>
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ScannerModal implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  readonly service = inject(JewelleryService);

  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;

  readonly dismiss = output<void>();
  readonly lookupInInventory = output<string>();
  readonly editMatchedProduct = output<Product>();
  readonly addWithScannedCode = output<string>();

  readonly isStartingCamera = signal<boolean>(false);
  readonly cameraActive = signal<boolean>(false);
  readonly cameraError = signal<string | null>(null);
  readonly availableCameras = signal<MediaDeviceInfo[]>([]);
  readonly currentCameraIndex = signal<number>(0);
  readonly hasTorch = signal<boolean>(false);
  readonly torchOn = signal<boolean>(false);
  readonly scannedCode = signal<string | null>(null);

  readonly matchedProduct = computed<Product | null>(() => {
    const code = this.scannedCode()?.trim().toLowerCase();
    if (!code) return null;
    return (
      this.service.products().find(
        p => p.code.toLowerCase() === code || p.id.toLowerCase() === code
      ) ?? null
    );
  });

  private codeReader: BrowserMultiFormatReader | null = null;
  private scannerControls: IScannerControls | null = null;

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      void this.startCamera();
    }
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  async startCamera() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.stopCamera();
    this.cameraError.set(null);
    this.isStartingCamera.set(true);
    this.cameraActive.set(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.isStartingCamera.set(false);
      this.cameraError.set('Camera access is not supported in this browser. You can scan from a photo or enter the tag code manually below.');
      return;
    }

    try {
      this.codeReader = new BrowserMultiFormatReader();
      let devices: MediaDeviceInfo[] = [];
      try {
        devices = await BrowserMultiFormatReader.listVideoInputDevices();
      } catch {
        devices = [];
      }

      this.availableCameras.set(devices);

      // Prefer back/environment camera on mobile if not explicitly switched
      let selectedDeviceId: string | undefined;
      if (devices.length > 0) {
        if (this.currentCameraIndex() === 0) {
          const backCamIdx = devices.findIndex(d =>
            /back|rear|environment/i.test(d.label)
          );
          if (backCamIdx >= 0) {
            this.currentCameraIndex.set(backCamIdx);
          }
        }
        const safeIdx = this.currentCameraIndex() % devices.length;
        selectedDeviceId = devices[safeIdx]?.deviceId;
      }

      const videoEl = this.videoElement?.nativeElement;
      if (!videoEl) {
        this.isStartingCamera.set(false);
        return;
      }

      const controls = await this.codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoEl,
        (result) => {
          if (result && !this.scannedCode()) {
            const text = this.extractTagCode(result.getText());
            this.onCodeDetected(text);
          }
        }
      );

      this.scannerControls = controls;
      this.hasTorch.set(typeof controls.switchTorch === 'function');
      this.isStartingCamera.set(false);
      this.cameraActive.set(true);
    } catch (err) {
      this.isStartingCamera.set(false);
      this.cameraActive.set(false);
      const message = err instanceof Error ? err.message : 'Camera permission was denied or no camera was found.';
      this.cameraError.set(`${message} You can still scan from a photo or type the tag code below.`);
    }
  }

  async switchCamera() {
    const cams = this.availableCameras();
    if (cams.length <= 1) return;
    this.currentCameraIndex.set((this.currentCameraIndex() + 1) % cams.length);
    await this.startCamera();
  }

  async toggleTorch() {
    if (!this.scannerControls?.switchTorch) return;
    try {
      const next = !this.torchOn();
      await this.scannerControls.switchTorch(next);
      this.torchOn.set(next);
    } catch {
      this.service.showToast('Flashlight is not available on this camera.', 'info');
    }
  }

  async onImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    try {
      const reader = this.codeReader ?? new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageUrl(objectUrl);
      const text = this.extractTagCode(result.getText());
      this.onCodeDetected(text);
    } catch {
      this.service.showToast('No QR code or barcode detected in that image.', 'error');
    } finally {
      URL.revokeObjectURL(objectUrl);
      input.value = '';
    }
  }

  handleManualCode(raw: string) {
    const cleaned = raw.trim();
    if (!cleaned) {
      this.service.showToast('Please enter a valid tag code.', 'info');
      return;
    }
    this.onCodeDetected(this.extractTagCode(cleaned));
  }

  private extractTagCode(rawText: string): string {
    const trimmed = rawText.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed) as { code?: string; sku?: string; id?: string };
        return (parsed.code || parsed.sku || parsed.id || trimmed).trim();
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  private onCodeDetected(code: string) {
    this.stopCamera();
    this.scannedCode.set(code);
  }

  rescan() {
    this.scannedCode.set(null);
    setTimeout(() => {
      void this.startCamera();
    }, 50);
  }

  stopCamera() {
    if (this.scannerControls) {
      try {
        this.scannerControls.stop();
      } catch {
        // Ignore stop errors
      }
      this.scannerControls = null;
    }
    const videoEl = this.videoElement?.nativeElement;
    if (videoEl && videoEl.srcObject) {
      const stream = videoEl.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoEl.srcObject = null;
    }
    this.cameraActive.set(false);
    this.torchOn.set(false);
  }

  closeScanner() {
    this.stopCamera();
    this.dismiss.emit();
  }
}
