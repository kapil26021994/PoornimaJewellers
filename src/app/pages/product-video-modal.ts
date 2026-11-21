import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';
import { Product } from '../models/jewellery.model';

@Component({
  selector: 'app-product-video-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[92dvh] overflow-hidden border border-amber-500/25 flex flex-col native-sheet">
        <!-- Header -->
        <div class="bg-neutral-900 text-white px-5 pt-2.5 pb-4 sm:p-5 border-b border-amber-500/20 shrink-0">
          <div class="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-3 sm:hidden"></div>
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center space-x-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0">
                <span class="material-icons">videocam</span>
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-base text-white truncate">Product Video Showcase</h3>
                <p class="text-[11px] text-amber-300 truncate">{{ currentProduct().name }}</p>
              </div>
            </div>
            <button
              type="button"
              (click)="closeModal()"
              class="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition cursor-pointer shrink-0"
              title="Close">
              <span class="material-icons text-sm">close</span>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <!-- Hidden file pickers -->
          <input #videoFileInput type="file" accept="video/*" class="hidden" (change)="onFileSelected($event, 'Uploaded Video')" />
          <input #cameraFileInput type="file" accept="video/*" capture="environment" class="hidden" (change)="onFileSelected($event, 'Camera Clip')" />

          <!-- Video Stage -->
          @if (isRecording()) {
            <div class="relative rounded-2xl overflow-hidden bg-black border-2 border-red-500 shadow-lg">
              <video #cameraPreview autoplay muted playsinline class="w-full h-64 object-cover block"></video>
              <div class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center space-x-1.5 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <span>REC {{ formatSeconds(recordingSeconds()) }}</span>
              </div>
              <div class="absolute bottom-3 inset-x-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  (click)="cancelRecording()"
                  class="px-3.5 py-2 rounded-xl bg-neutral-900/85 text-white text-xs font-bold border border-white/20 cursor-pointer">
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="stopRecording()"
                  class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg cursor-pointer">
                  <span class="material-icons" [style.fontSize.px]="16">stop_circle</span>
                  <span>Stop & Save</span>
                </button>
              </div>
            </div>
          } @else if (isGeneratingReel()) {
            <div class="rounded-2xl bg-neutral-950 border border-amber-500/30 p-6 text-center space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
                <span class="material-icons text-2xl">movie_creation</span>
              </div>
              <div>
                <div class="text-sm font-bold text-white">Creating Showroom Video Reel...</div>
                <div class="text-[11px] text-neutral-400 mt-0.5">Rendering animated HD clip with hallmark & price overlay</div>
              </div>
              <div class="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div class="bg-amber-500 h-full transition-all duration-150" [style.width.%]="reelProgress()"></div>
              </div>
              <div class="text-[11px] font-bold text-amber-300 tabular-nums">{{ reelProgress() }}%</div>
            </div>
          } @else if (activeVideoUrl(); as videoSrc) {
            <div class="space-y-2.5">
              <div class="relative rounded-2xl overflow-hidden bg-black border border-neutral-200 shadow-sm">
                <video
                  [src]="videoSrc"
                  controls
                  autoplay
                  [autoplay]="true"
                  [muted]="false"
                  loop
                  [loop]="true"
                  playsinline
                  [playsInline]="true"
                  (loadedmetadata)="playWithAudio($event)"
                  class="w-full max-h-72 object-contain bg-black block mx-auto"></video>
                @if (currentProduct().videoLabel) {
                  <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-neutral-900/85 text-amber-300 text-[10px] font-bold backdrop-blur-xs pointer-events-none">
                    {{ currentProduct().videoLabel }}
                  </span>
                }
              </div>

              <!-- Spec Strip -->
              <div class="bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 flex items-center justify-between gap-2 text-xs">
                <div class="min-w-0">
                  <span class="font-mono text-[10px] text-amber-700 font-bold block">{{ currentProduct().code }}</span>
                  <span class="text-[11px] text-neutral-600 truncate block">
                    {{ currentProduct().netWeight }}g • {{ currentProduct().metalType }} • {{ currentProduct().purity }}
                  </span>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-xs font-extrabold text-neutral-950 tabular-nums">
                    ₹{{ currentProduct().sellingPrice | number:'1.0-0' }}
                  </span>
                </div>
              </div>

              <!-- Active Video Actions -->
              <div class="grid grid-cols-2 gap-2">
                <a
                  [href]="videoSrc"
                  [download]="downloadFileName()"
                  class="py-2.5 px-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer">
                  <span class="material-icons" [style.fontSize.px]="16">download</span>
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  (click)="shareProductAndVideo()"
                  class="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition cursor-pointer">
                  <span class="material-icons" [style.fontSize.px]="16">share</span>
                  <span>Share Video</span>
                </button>
              </div>
            </div>
          } @else {
            <!-- Empty State Preview with Product Image -->
            <div class="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-900 h-44">
              <img
                [src]="currentProduct().image"
                [alt]="currentProduct().name"
                referrerpolicy="no-referrer"
                class="w-full h-full object-cover opacity-55" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col items-center justify-center p-4 text-center">
                <div class="w-11 h-11 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center mb-2 shadow-lg">
                  <span class="material-icons text-2xl">videocam</span>
                </div>
                <div class="text-xs font-bold text-white">No Showcase Video Attached</div>
                <div class="text-[10px] text-neutral-300 mt-0.5 max-w-xs">
                  Record a live showroom try-on clip, upload a video, or auto-create a showcase reel.
                </div>
              </div>
            </div>
          }

          @if (errorMessage()) {
            <div class="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 font-medium flex items-center space-x-2">
              <span class="material-icons text-red-600" [style.fontSize.px]="16">error_outline</span>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- Capture / Upload / Generate Controls -->
          @if (!isRecording() && !isGeneratingReel()) {
            <div class="space-y-2 pt-1">
              <div class="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                {{ activeVideoUrl() ? 'Replace Video' : 'Add Product Video' }}
              </div>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="startLiveCameraRecording()"
                  class="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-95">
                  <span class="material-icons" [style.fontSize.px]="16">fiber_manual_record</span>
                  <span>Record Live</span>
                </button>
                <button
                  type="button"
                  (click)="videoFileInput.click()"
                  class="py-2.5 px-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-95">
                  <span class="material-icons" [style.fontSize.px]="16">video_library</span>
                  <span>Upload Video</span>
                </button>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="generatePromoReel()"
                  class="py-2.5 px-3 rounded-xl border border-amber-400/60 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-95">
                  <span class="material-icons text-amber-600" [style.fontSize.px]="16">auto_awesome_motion</span>
                  <span>Create Reel</span>
                </button>
                <button
                  type="button"
                  (click)="cameraFileInput.click()"
                  class="py-2.5 px-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-95">
                  <span class="material-icons" [style.fontSize.px]="16">photo_camera_front</span>
                  <span>Device Cam</span>
                </button>
              </div>

              @if (activeVideoUrl()) {
                <button
                  type="button"
                  (click)="removeVideo()"
                  class="w-full py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center space-x-1 transition cursor-pointer">
                  <span class="material-icons" [style.fontSize.px]="15">delete_outline</span>
                  <span>Remove Product Video</span>
                </button>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ProductVideoModal {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  readonly service = inject(JewelleryService);

  readonly product = input.required<Product>();
  readonly dismiss = output<void>();
  readonly shareWhatsapp = output<Product>();

  @ViewChild('cameraPreview') cameraPreviewRef?: ElementRef<HTMLVideoElement>;

  readonly isRecording = signal<boolean>(false);
  readonly recordingSeconds = signal<number>(0);
  readonly isGeneratingReel = signal<boolean>(false);
  readonly reelProgress = signal<number>(0);
  readonly errorMessage = signal<string | null>(null);

  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordTimerId: number | null = null;
  private discardRecordingOnStop = false;

  readonly currentProduct = computed(() => {
    const id = this.product().id;
    return this.service.products().find(p => p.id === id) ?? this.product();
  });

  readonly activeVideoUrl = computed(() => this.currentProduct().videoUrl ?? null);

  readonly downloadFileName = computed(() => {
    const code = this.currentProduct().code.toLowerCase();
    return `${code}-showcase.webm`;
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.cleanupStreamAndTimers();
    });
  }

  closeModal() {
    this.cleanupStreamAndTimers();
    this.dismiss.emit();
  }

  playWithAudio(event: Event) {
    const videoEl = event.target as HTMLVideoElement | null;
    if (!videoEl) return;
    videoEl.muted = false;
    videoEl.volume = 1;
    void videoEl.play().catch(() => {
      videoEl.muted = true;
      void videoEl.play().catch(() => undefined);
    });
  }

  formatSeconds(total: number): string {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  onFileSelected(event: Event, label: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    const inputEl = event.target as HTMLInputElement | null;
    const file = inputEl?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      this.errorMessage.set('Please select a valid video file.');
      if (inputEl) inputEl.value = '';
      return;
    }

    this.errorMessage.set(null);
    const objectUrl = URL.createObjectURL(file);
    this.service.updateProductVideo(this.currentProduct().id, objectUrl, label);
    if (inputEl) inputEl.value = '';
  }

  async startLiveCameraRecording() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.errorMessage.set(null);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      this.errorMessage.set('Live camera recording is unavailable here. Use Upload Video or Create Reel.');
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: true
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      this.mediaStream = stream;
      this.recordedChunks = [];
      this.recordingSeconds.set(0);
      this.discardRecordingOnStop = false;
      this.isRecording.set(true);

      setTimeout(() => {
        const videoEl = this.cameraPreviewRef?.nativeElement;
        if (videoEl) {
          videoEl.srcObject = stream;
          void videoEl.play().catch(() => undefined);
        }
      }, 0);

      const mimeType = this.pickSupportedVideoMime();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      this.mediaRecorder = recorder;

      recorder.ondataavailable = (ev: BlobEvent) => {
        if (ev.data && ev.data.size > 0) {
          this.recordedChunks.push(ev.data);
        }
      };

      recorder.onstop = () => {
        const shouldDiscard = this.discardRecordingOnStop;
        const chunks = [...this.recordedChunks];
        const type = recorder.mimeType || 'video/webm';
        this.cleanupStreamAndTimers();
        this.isRecording.set(false);

        if (!shouldDiscard && chunks.length > 0) {
          const blob = new Blob(chunks, { type });
          const url = URL.createObjectURL(blob);
          this.service.updateProductVideo(this.currentProduct().id, url, 'Camera Clip');
        }
      };

      recorder.start(250);
      this.recordTimerId = window.setInterval(() => {
        const next = this.recordingSeconds() + 1;
        this.recordingSeconds.set(next);
        if (next >= 30) {
          this.stopRecording();
        }
      }, 1000);
    } catch {
      this.cleanupStreamAndTimers();
      this.isRecording.set(false);
      this.errorMessage.set('Camera access denied or unavailable. Try Upload Video or Create Reel instead.');
    }
  }

  stopRecording() {
    this.discardRecordingOnStop = false;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    } else {
      this.cleanupStreamAndTimers();
      this.isRecording.set(false);
    }
  }

  cancelRecording() {
    this.discardRecordingOnStop = true;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    } else {
      this.cleanupStreamAndTimers();
      this.isRecording.set(false);
    }
  }

  async generatePromoReel() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.errorMessage.set(null);

    const testCanvas = document.createElement('canvas');
    if (typeof testCanvas.captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
      this.errorMessage.set('Video reel export is not supported in this browser. Try uploading a video.');
      return;
    }

    const prod = this.currentProduct();
    const shop = this.service.settings();
    this.isGeneratingReel.set(true);
    this.reelProgress.set(5);

    try {
      const img = await this.loadCorsImage(prod.image);
      const width = 720;
      const height = 720;
      testCanvas.width = width;
      testCanvas.height = height;
      const ctx = testCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      const stream = testCanvas.captureStream(30);
      const mimeType = this.pickSupportedVideoMime();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (ev: BlobEvent) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
      };

      const recordingDone = new Promise<Blob>(resolve => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }));
      });

      recorder.start(200);

      const totalFrames = 120; // 4 seconds at ~30fps
      for (let frame = 0; frame <= totalFrames; frame++) {
        const progress = frame / totalFrames;
        this.drawShowcaseFrame(ctx, width, height, img, prod, shop.shopName, progress);
        this.reelProgress.set(Math.min(99, Math.round(5 + progress * 93)));
        await new Promise(resolve => window.setTimeout(resolve, 33));
      }

      recorder.stop();
      const blob = await recordingDone;
      const url = URL.createObjectURL(blob);
      this.reelProgress.set(100);
      this.service.updateProductVideo(prod.id, url, 'Showroom Reel');
    } catch {
      this.errorMessage.set('Unable to generate showcase reel on this device.');
    } finally {
      this.isGeneratingReel.set(false);
      this.reelProgress.set(0);
    }
  }

  async shareProductAndVideo() {
    if (!isPlatformBrowser(this.platformId)) return;
    const prod = this.currentProduct();
    const videoSrc = prod.videoUrl;

    if (videoSrc && typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
      try {
        const res = await fetch(videoSrc);
        const blob = await res.blob();
        const file = new File([blob], this.downloadFileName(), { type: blob.type || 'video/webm' });
        const shareData: ShareData = {
          title: prod.name,
          text: `${prod.name} (${prod.code}) • ${prod.netWeight}g • ₹${Math.round(prod.sellingPrice).toLocaleString('en-IN')}`,
          files: [file]
        };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch {
        // Fallback to WhatsApp Share modal below
      }
    }

    this.closeModal();
    this.shareWhatsapp.emit(prod);
  }

  removeVideo() {
    this.service.updateProductVideo(this.currentProduct().id, undefined, undefined);
  }

  private pickSupportedVideoMime(): string | undefined {
    const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
    return candidates.find(type => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type));
  }

  private loadCorsImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  private drawShowcaseFrame(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    img: HTMLImageElement | null,
    prod: Product,
    shopName: string,
    t: number
  ) {
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, w, h);

    if (img) {
      const scale = 1.04 + t * 0.12;
      const imgRatio = img.width / Math.max(1, img.height);
      const canvasRatio = w / h;
      let drawW = w * scale;
      let drawH = h * scale;
      if (imgRatio > canvasRatio) {
        drawH = h * scale;
        drawW = drawH * imgRatio;
      } else {
        drawW = w * scale;
        drawH = drawW / imgRatio;
      }
      const dx = (w - drawW) / 2;
      const dy = (h - drawH) / 2;
      ctx.drawImage(img, dx, dy, drawW, drawH);
    } else {
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 40, w * 0.5, h * 0.5, w * 0.7);
      bgGrad.addColorStop(0, '#451a03');
      bgGrad.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // Subtle animated light sheen sweep
    const sheenX = -w * 0.4 + t * w * 1.8;
    const sheen = ctx.createLinearGradient(sheenX, 0, sheenX + 180, h);
    sheen.addColorStop(0, 'rgba(245, 158, 11, 0)');
    sheen.addColorStop(0.5, 'rgba(253, 224, 71, 0.14)');
    sheen.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);

    // Bottom dark gradient scrim
    const scrim = ctx.createLinearGradient(0, h * 0.45, 0, h);
    scrim.addColorStop(0, 'rgba(0,0,0,0)');
    scrim.addColorStop(0.55, 'rgba(10,10,10,0.72)');
    scrim.addColorStop(1, 'rgba(10,10,10,0.94)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, w, h);

    // Top showroom header pill
    ctx.fillStyle = 'rgba(23, 23, 23, 0.82)';
    ctx.fillRect(32, 28, w - 64, 48);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 28, w - 64, 48);

    ctx.fillStyle = '#fcd34d';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(shopName.toUpperCase(), 50, 59);

    // Bottom product info
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${prod.code}  •  ${prod.purity.toUpperCase()}`, 36, h - 135);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(prod.name.slice(0, 32), 36, h - 92);

    ctx.fillStyle = '#d4d4d4';
    ctx.font = '600 22px sans-serif';
    ctx.fillText(`${prod.metalType}  •  Net Wt: ${prod.netWeight}g`, 36, h - 50);

    ctx.fillStyle = '#fcd34d';
    ctx.font = 'bold 34px sans-serif';
    const priceText = `₹${Math.round(prod.sellingPrice).toLocaleString('en-IN')}`;
    const priceWidth = ctx.measureText(priceText).width;
    ctx.fillText(priceText, w - priceWidth - 36, h - 46);
  }

  private cleanupStreamAndTimers() {
    if (this.recordTimerId !== null) {
      window.clearInterval(this.recordTimerId);
      this.recordTimerId = null;
    }
    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.mediaStream = null;
    }
    this.mediaRecorder = null;
  }
}
