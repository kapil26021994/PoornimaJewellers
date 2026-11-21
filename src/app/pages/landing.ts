import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  output,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';
import { Product } from '../models/jewellery.model';

export interface TutorialModule {
  id: string;
  targetSection: string;
  titleHindi: string;
  titleEnglish: string;
  badge: string;
  duration: string;
  icon: string;
  hindiVoiceScript: string;
  hinglishGuide: string;
  englishSummary: string;
  keySteps: { icon: string; titleHindi: string; desc: string }[];
  uiMockup: {
    headerTitle: string;
    metrics: { label: string; value: string; color: string }[];
    primaryAction: string;
    focusElementLabel: string;
    highlights: string[];
  };
}

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 lg:space-y-10 pb-16">
      <!-- Top Action Bar (Storefront / ERP Switcher) -->
      <div class="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white p-3.5 lg:p-4 rounded-2xl border border-amber-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center space-x-3 text-left w-full sm:w-auto">
          <div class="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
            <span class="material-icons text-2xl">diamond</span>
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-500/30">Official Showroom & Storefront</span>
              <span class="text-xs text-neutral-400 hidden md:inline">• Est. 1984</span>
            </div>
            <h2 class="text-base sm:text-lg font-bold text-white leading-tight mt-0.5">
              {{ settings().shopName }}
            </h2>
          </div>
        </div>

        <div class="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            (click)="scrollToTutorial()"
            class="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer">
            <span class="material-icons text-base text-amber-400">play_circle</span>
            <span>हिंदी ट्यूटोरियल देखें</span>
          </button>
          <button
            type="button"
            (click)="navigateTo('dashboard')"
            class="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-md shadow-amber-500/20">
            <span class="material-icons text-base">dashboard</span>
            <span>Open Shop Manager</span>
          </button>
        </div>
      </div>

      <!-- Hero Banner & Heritage Story -->
      <section class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white border border-amber-500/25 p-6 lg:p-10 shadow-xl">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 max-w-4xl space-y-4">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <span class="material-icons text-sm text-amber-400">verified</span>
            <span>BIS 916 Hallmarked & IGI Certified Fine Jewellery</span>
          </div>

          <h1 class="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Crafting Timeless Heirlooms, <br class="hidden sm:inline" />
            <span class="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">Certified Purity & Modern Trust</span>
          </h1>

          <p class="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
            Welcome to {{ settings().shopName }} ({{ settings().ownerName }}). For over four decades, our master karigars have handcrafted royal bridal sets, solitaires, temple jewellery, and antique heritage pieces with zero-deduction gold exchange and 100% digital hallmarking transparency.
          </p>

          <!-- Quick Action Links -->
          <div class="pt-2 flex flex-wrap items-center gap-3">
            <a
              [href]="'tel:' + settings().phone"
              class="px-4 py-2.5 rounded-xl bg-white text-neutral-950 text-xs sm:text-sm font-bold flex items-center space-x-2 hover:bg-neutral-100 transition shadow-sm">
              <span class="material-icons text-base text-amber-600">call</span>
              <span>Call Us: {{ settings().phone }}</span>
            </a>

            <a
              [href]="whatsappInquiryUrl()"
              target="_blank"
              rel="noopener noreferrer"
              class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 transition shadow-sm">
              <span class="material-icons text-base">chat</span>
              <span>WhatsApp Showroom</span>
            </a>

            <button
              type="button"
              (click)="openAppointmentModal.set(true)"
              class="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-semibold flex items-center space-x-2 transition cursor-pointer">
              <span class="material-icons text-base">calendar_month</span>
              <span>Book VIP Bridal Appointment</span>
            </button>
          </div>
        </div>

        <!-- Trust Badges Strip -->
        <div class="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
          <div class="flex items-center space-x-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
            <span class="material-icons text-amber-400 text-2xl">verified_user</span>
            <div>
              <div class="text-xs font-bold text-white">100% BIS 916</div>
              <div class="text-[10px] text-neutral-400">Govt HUID Stamped</div>
            </div>
          </div>
          <div class="flex items-center space-x-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
            <span class="material-icons text-amber-400 text-2xl">sync_alt</span>
            <div>
              <div class="text-xs font-bold text-white">0% Deduction</div>
              <div class="text-[10px] text-neutral-400">Old Gold Exchange</div>
            </div>
          </div>
          <div class="flex items-center space-x-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
            <span class="material-icons text-amber-400 text-2xl">biotech</span>
            <div>
              <div class="text-xs font-bold text-white">Karatmeter Tested</div>
              <div class="text-[10px] text-neutral-400">Instant Laser XRF Purity</div>
            </div>
          </div>
          <div class="flex items-center space-x-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
            <span class="material-icons text-amber-400 text-2xl">auto_awesome</span>
            <div>
              <div class="text-xs font-bold text-white">Lifetime Service</div>
              <div class="text-[10px] text-neutral-400">Free Ultrasonic Cleaning</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Live Bullion Rates & Quick Price Calculator -->
      <section class="bg-white rounded-3xl p-5 lg:p-7 shadow-sm border border-neutral-200 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div>
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="text-xs font-extrabold text-neutral-500 uppercase tracking-wider">Live Showroom Rates</span>
            </div>
            <h3 class="text-lg font-bold text-neutral-900 mt-0.5">Today's Gold & Silver Bullion Board</h3>
          </div>

          <div class="flex items-center space-x-2">
            <span class="text-xs text-neutral-500">GST: 3% (Auto Included)</span>
            <button
              type="button"
              (click)="service.refreshLiveRates(true)"
              [disabled]="service.isLoadingRates()"
              class="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition">
              <span class="material-icons text-sm" [class.animate-spin]="service.isLoadingRates()">refresh</span>
              <span>Refresh Rates</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- 22K Gold -->
          <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-amber-900">22 Karat Gold (916)</span>
              <span class="material-icons text-amber-600 text-lg">workspace_premium</span>
            </div>
            <div class="text-2xl font-black text-neutral-950 tabular-nums">
              ₹{{ settings().goldRate22k | number:'1.0-0' }} <span class="text-xs font-normal text-neutral-500">/ gram</span>
            </div>
            <div class="text-[11px] text-amber-800">10 Grams: ₹{{ (settings().goldRate22k * 10) | number:'1.0-0' }}</div>
          </div>

          <!-- 24K Gold -->
          <div class="p-4 rounded-2xl bg-neutral-900 text-white space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-amber-300">24 Karat Pure Gold (999)</span>
              <span class="material-icons text-amber-400 text-lg">bolt</span>
            </div>
            <div class="text-2xl font-black text-white tabular-nums">
              ₹{{ settings().goldRate24k | number:'1.0-0' }} <span class="text-xs font-normal text-neutral-400">/ gram</span>
            </div>
            <div class="text-[11px] text-neutral-300">10 Grams: ₹{{ (settings().goldRate24k * 10) | number:'1.0-0' }}</div>
          </div>

          <!-- 18K Gold -->
          <div class="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-neutral-700">18 Karat Gold (750)</span>
              <span class="material-icons text-neutral-500 text-lg">diamond</span>
            </div>
            <div class="text-2xl font-black text-neutral-900 tabular-nums">
              ₹{{ (settings().goldRate24k * 0.75) | number:'1.0-0' }} <span class="text-xs font-normal text-neutral-500">/ gram</span>
            </div>
            <div class="text-[11px] text-neutral-500">For Diamond Solitaires</div>
          </div>

          <!-- 925 Silver -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700">925 Sterling Silver</span>
              <span class="material-icons text-slate-500 text-lg">filter_vintage</span>
            </div>
            <div class="text-2xl font-black text-neutral-900 tabular-nums">
              ₹{{ settings().silverRate | number:'1.0-2' }} <span class="text-xs font-normal text-neutral-500">/ gram</span>
            </div>
            <div class="text-[11px] text-slate-600">1 Kg: ₹{{ (settings().silverRate * 1000) | number:'1.0-0' }}</div>
          </div>
        </div>

        <!-- Quick Live Weight Estimator -->
        <div class="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div class="space-y-0.5">
            <h4 class="text-xs font-bold text-neutral-900">Instant Gold Rate Calculator (आज का सोने का हिसाब)</h4>
            <p class="text-[11px] text-neutral-500">Enter gold weight to see approximate bullion value + 3% GST</p>
          </div>

          <div class="flex items-center space-x-2">
            <div class="relative w-28">
              <input
                type="number"
                [value]="calcGrams()"
                (input)="onCalcGramsInput($event)"
                min="0.5"
                step="0.5"
                class="w-full pl-3 pr-8 py-1.5 rounded-xl bg-white border border-neutral-300 text-xs font-bold text-neutral-900 outline-none focus:border-amber-500" />
              <span class="absolute right-2.5 top-1.5 text-[11px] font-bold text-neutral-400">g</span>
            </div>
            <div class="px-3 py-1.5 rounded-xl bg-amber-500 text-neutral-950 text-xs font-extrabold tabular-nums whitespace-nowrap shadow-xs">
              22K Est: ₹{{ calculatedGoldEstimate() | number:'1.0-0' }}
            </div>
          </div>
        </div>
      </section>

      <!-- ===================================================================== -->
      <!-- SECTION: INTERACTIVE TUTORIAL VIDEO & HINDI VOICE MODULE WALKTHROUGH -->
      <!-- ===================================================================== -->
      <section #tutorialSection class="bg-neutral-950 text-white rounded-3xl p-5 lg:p-8 shadow-2xl border-2 border-amber-500/40 space-y-6 scroll-mt-6">
        <!-- Tutorial Section Header -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div class="space-y-1">
            <div class="flex items-center space-x-2">
              <span class="px-2.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider">
                Interactive Video Walkthrough
              </span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center space-x-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Hindi Voice Narration Active</span>
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <span class="material-icons text-amber-400 text-2xl">record_voice_over</span>
              <span>दुकान प्रबंधन ट्यूटोरियल: हर 1 मॉड्यूल कैसे काम करता है?</span>
            </h2>
            <p class="text-xs sm:text-sm text-neutral-300">
              Listen to step-by-step Hindi audio explanation for each shop ERP module with interactive visual mockups.
            </p>
          </div>

          <!-- Video Player Controls Summary -->
          <div class="flex items-center space-x-2">
            <button
              type="button"
              (click)="toggleHindiVoice()"
              class="px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition cursor-pointer shadow-md"
              [class]="isSpeaking() ? 'bg-red-500 text-white' : 'bg-amber-500 text-neutral-950 hover:bg-amber-400'">
              <span class="material-icons text-base">{{ isSpeaking() ? 'pause' : 'play_arrow' }}</span>
              <span>{{ isSpeaking() ? 'Pause Voice (रोकें)' : 'Play Hindi Voice (सुनें)' }}</span>
            </button>
            <button
              type="button"
              (click)="replayCurrentModuleAudio()"
              class="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center justify-center transition cursor-pointer"
              title="Replay Voice (दोबारा सुनें)">
              <span class="material-icons text-lg">replay</span>
            </button>
          </div>
        </div>

        <!-- 7-Module Carousel Tabs -->
        <div class="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          @for (mod of tutorialModules; track mod.id; let idx = $index) {
            <button
              type="button"
              (click)="selectModule(idx)"
              [class]="selectedModuleIndex() === idx
                ? 'bg-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-500/25 border-amber-400'
                : 'bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border-neutral-800'"
              class="px-3.5 py-2 rounded-xl text-xs whitespace-nowrap border flex items-center space-x-2 transition cursor-pointer shrink-0">
              <span class="material-icons text-sm">{{ mod.icon }}</span>
              <span>{{ mod.titleHindi }}</span>
              <span
                [class]="selectedModuleIndex() === idx ? 'bg-neutral-950 text-amber-300' : 'bg-white/10 text-neutral-400'"
                class="px-1.5 py-0.2 rounded-md text-[9px] font-mono">
                {{ idx + 1 }}/{{ tutorialModules.length }}
              </span>
            </button>
          }
        </div>

        <!-- Video Stage Player (Interactive Mockup with Hindi Voice) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <!-- Left: Video Mockup Stage (7 Cols) -->
          <div class="lg:col-span-7 bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col justify-between shadow-inner">
            <!-- Video Top Meta Bar -->
            <div class="px-4 py-2.5 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span class="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  Module {{ selectedModuleIndex() + 1 }} • {{ currentModule().titleEnglish }}
                </span>
              </div>

              <!-- Animated Sound Wave Indicator -->
              <div class="flex items-center space-x-1.5">
                <div class="flex items-end space-x-0.5 h-3.5">
                  <span class="w-1 bg-amber-400 rounded-full transition-all duration-150" [style.height.px]="isSpeaking() ? 14 : 4"></span>
                  <span class="w-1 bg-amber-400 rounded-full transition-all duration-150" [style.height.px]="isSpeaking() ? 8 : 4"></span>
                  <span class="w-1 bg-amber-400 rounded-full transition-all duration-150" [style.height.px]="isSpeaking() ? 12 : 4"></span>
                  <span class="w-1 bg-amber-400 rounded-full transition-all duration-150" [style.height.px]="isSpeaking() ? 6 : 4"></span>
                </div>
                <span class="text-[10px] font-mono text-neutral-400">
                  {{ isSpeaking() ? 'Hindi Speech Playing' : 'Voice Paused' }}
                </span>
              </div>
            </div>

            <!-- Simulated Software Interface Stage -->
            <div class="p-4 sm:p-6 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 flex-1 flex flex-col justify-center relative min-h-[300px] sm:min-h-[360px]">
              <!-- Live Video Walkthrough Demonstration (HTML5 Video Demo with Fallback Mockup) -->
              <div class="relative w-full h-56 sm:h-68 rounded-2xl overflow-hidden bg-neutral-950 border border-amber-500/40 shadow-2xl flex items-center justify-center group">
                <video
                  [src]="currentModuleVideoUrl()"
                  [poster]="currentModulePosterUrl()"
                  autoplay
                  [autoplay]="true"
                  loop
                  [loop]="true"
                  muted
                  [muted]="true"
                  playsinline
                  [playsInline]="true"
                  class="w-full h-full object-cover"></video>

                <!-- Video Overlay Badge -->
                <div class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-neutral-950/85 text-amber-300 text-[10px] font-black border border-amber-500/40 backdrop-blur-md flex items-center space-x-1.5 shadow-md">
                  <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span>LIVE DEMO: {{ currentModule().titleEnglish }}</span>
                </div>

                <div class="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-neutral-950/85 text-white text-[10px] font-bold border border-white/25 backdrop-blur-md">
                  {{ currentModule().duration }} Walkthrough
                </div>
              </div>
            </div>

            <!-- Video Bottom Scrub Bar & Navigation -->
            <div class="px-4 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-2 flex-wrap">
              <div class="flex items-center space-x-2">
                <button
                  type="button"
                  (click)="prevModule()"
                  [disabled]="selectedModuleIndex() === 0"
                  class="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  title="Previous Module">
                  <span class="material-icons text-base">skip_previous</span>
                </button>
                <button
                  type="button"
                  (click)="toggleHindiVoice()"
                  class="px-3 py-1 rounded-lg bg-amber-500 text-neutral-950 text-xs font-black flex items-center space-x-1 cursor-pointer">
                  <span class="material-icons text-sm">{{ isSpeaking() ? 'pause' : 'play_arrow' }}</span>
                  <span>{{ isSpeaking() ? 'Pause' : 'Play' }}</span>
                </button>
                <button
                  type="button"
                  (click)="nextModule()"
                  [disabled]="selectedModuleIndex() === tutorialModules.length - 1"
                  class="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  title="Next Module">
                  <span class="material-icons text-base">skip_next</span>
                </button>

                <span class="text-[11px] text-neutral-400 font-mono ml-2">
                  {{ selectedModuleIndex() + 1 }} of {{ tutorialModules.length }}
                </span>
              </div>

              <!-- Speed & Auto Advance Toggles -->
              <div class="flex items-center space-x-2">
                <button
                  type="button"
                  (click)="toggleSpeed()"
                  class="px-2 py-1 rounded-md bg-neutral-800 text-amber-300 text-[11px] font-mono hover:bg-neutral-700 cursor-pointer"
                  title="Change Speech Speed">
                  {{ speechRate() }}x Speed
                </button>
                <button
                  type="button"
                  (click)="toggleAutoAdvance()"
                  [class]="autoAdvance() ? 'text-amber-400 bg-amber-500/20' : 'text-neutral-400 bg-neutral-800'"
                  class="px-2 py-1 rounded-md text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                  title="Automatically play next module when finished">
                  <span>Auto-Next</span>
                  <span class="material-icons text-[12px]">{{ autoAdvance() ? 'check_circle' : 'radio_button_unchecked' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Hindi Subtitles & Step-by-Step Explanation (5 Cols) -->
          <div class="lg:col-span-5 bg-neutral-900 rounded-2xl border border-neutral-800 p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <!-- Hindi Voice Script / Subtitles Box -->
            <div class="space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-white/10">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center space-x-1">
                  <span class="material-icons text-xs">subtitles</span>
                  <span>Hindi Voice Subtitles (हिंदी वॉइस स्क्रिप्ट)</span>
                </span>
                <span class="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-mono">
                  Audio: {{ currentModule().duration }}
                </span>
              </div>

              <!-- Real-time Hindi Speech Transcript -->
              <div class="p-3.5 rounded-xl bg-neutral-950 border border-amber-500/25 space-y-2">
                <p class="text-sm font-semibold text-amber-100 leading-relaxed font-sans">
                  "{{ currentModule().hindiVoiceScript }}"
                </p>
                <div class="text-[11px] text-neutral-400 italic pt-1 border-t border-neutral-800/80">
                  <span class="font-bold text-neutral-300">Hinglish Guide:</span> {{ currentModule().hinglishGuide }}
                </div>
              </div>
            </div>

            <!-- Key Steps for This Module -->
            <div class="space-y-2.5">
              <div class="text-[11px] font-bold text-white flex items-center space-x-1">
                <span class="material-icons text-amber-400 text-sm">checklist</span>
                <span>मुख्य स्टेप्स (How To Use):</span>
              </div>

              <div class="space-y-2">
                @for (step of currentModule().keySteps; track step.titleHindi) {
                  <div class="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex items-start space-x-2.5">
                    <span class="material-icons text-amber-400 text-base mt-0.5 shrink-0">{{ step.icon }}</span>
                    <div>
                      <div class="text-xs font-bold text-white">{{ step.titleHindi }}</div>
                      <div class="text-[11px] text-neutral-400 leading-tight mt-0.5">{{ step.desc }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Direct Jump Button to Test In App -->
            <div class="pt-2">
              <button
                type="button"
                (click)="navigateTo(currentModule().targetSection)"
                class="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg shadow-amber-500/20">
                <span class="material-icons text-base">launch</span>
                <span>Open {{ currentModule().titleEnglish }} in Shop Manager</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Signature Collections Gallery (Real Product Photos & Reels) -->
      <section class="bg-white rounded-3xl p-5 lg:p-8 shadow-sm border border-neutral-200 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div>
            <div class="flex items-center space-x-2">
              <span class="material-icons text-amber-600 text-sm">stars</span>
              <span class="text-xs font-extrabold text-neutral-500 uppercase tracking-wider">Showroom Showcase</span>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mt-0.5">Signature Jewellery Collections</h3>
            <p class="text-xs text-neutral-500">Each piece is stamped with Govt BIS Hallmarking and certified purity.</p>
          </div>

          <div class="flex items-center space-x-2">
            <button
              type="button"
              (click)="navigateTo('catalog')"
              class="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer">
              <span class="material-icons text-sm">menu_book</span>
              <span>Open Digital Catalog</span>
            </button>
          </div>
        </div>

        <!-- Product Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (prod of featuredProducts(); track prod.id) {
            <div class="rounded-2xl border border-neutral-200 hover:border-amber-500/60 transition overflow-hidden bg-white shadow-xs group flex flex-col justify-between">
              <div>
                <div class="relative h-52 bg-neutral-950 overflow-hidden">
                  @if (prod.videoUrl) {
                    <video
                      [src]="prod.videoUrl"
                      [poster]="prod.image"
                      autoplay
                      [autoplay]="true"
                      loop
                      [loop]="true"
                      muted
                      [muted]="true"
                      playsinline
                      [playsInline]="true"
                      class="w-full h-full object-cover group-hover:scale-105 transition duration-500"></video>
                    <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-neutral-900/85 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center space-x-1">
                      <span class="material-icons text-xs">play_circle</span>
                      <span>HD Reel</span>
                    </span>
                  } @else {
                    <img
                      [src]="prod.image"
                      [alt]="prod.name"
                      referrerpolicy="no-referrer"
                      class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  }

                  <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-neutral-950/80 text-white text-[10px] font-bold border border-white/20">
                    {{ prod.purity }}
                  </span>

                  <span class="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-neutral-950/80 text-amber-200 text-[10px] font-mono">
                    {{ prod.code }}
                  </span>
                </div>

                <div class="p-4 space-y-2">
                  <h4 class="font-bold text-neutral-900 text-sm line-clamp-1">{{ prod.name }}</h4>
                  <div class="flex items-center justify-between text-xs text-neutral-500">
                    <span>Net Wt: <strong class="text-neutral-800">{{ prod.netWeight }}g</strong></span>
                    <span>Metal: <strong class="text-neutral-800">{{ prod.metalType }}</strong></span>
                  </div>
                </div>
              </div>

              <div class="p-4 pt-0 space-y-2">
                <div class="flex items-center justify-between border-t border-neutral-100 pt-3">
                  <div>
                    <div class="text-[10px] text-neutral-400">Showroom Price</div>
                    <div class="text-base font-black text-neutral-950 tabular-nums">
                      ₹{{ prod.sellingPrice | number:'1.0-0' }}
                    </div>
                  </div>
                  <a
                    [href]="getWhatsAppInquiryForProduct(prod)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center space-x-1 transition cursor-pointer">
                    <span class="material-icons text-sm text-emerald-600">chat</span>
                    <span>Inquire</span>
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Store Details, Google Maps Preview, & Timings -->
      <section class="bg-neutral-900 text-white rounded-3xl p-5 lg:p-8 border border-neutral-800 shadow-xl space-y-6">
        <div class="border-b border-white/10 pb-3">
          <div class="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span class="material-icons text-base">store</span>
            <span>Showroom Location & Contact</span>
          </div>
          <h3 class="text-xl font-bold text-white mt-0.5">Visit Our Flagship Jewellery Showroom</h3>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- Address & Timings -->
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div class="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <span class="material-icons text-sm">place</span>
                <span>Flagship Address</span>
              </div>
              <p class="text-xs text-neutral-200 leading-relaxed font-medium">
                {{ settings().address }}
              </p>
              <div class="text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
                Landmark: 200m from T. Nagar Bus Terminus & Metro • Valet Parking Available
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div class="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <span class="material-icons text-sm">schedule</span>
                <span>Showroom Hours</span>
              </div>
              <div class="space-y-1 text-xs">
                <div class="flex justify-between text-neutral-300">
                  <span>Monday - Saturday:</span>
                  <strong class="text-white">10:00 AM – 9:00 PM</strong>
                </div>
                <div class="flex justify-between text-neutral-300">
                  <span>Sunday:</span>
                  <strong class="text-white">11:00 AM – 8:00 PM</strong>
                </div>
                <div class="text-[10px] text-amber-300/80 pt-1">
                  Open all 7 days during wedding season & festive bullion occasions.
                </div>
              </div>
            </div>
          </div>

          <!-- Master Jeweller Contact & Official Registrations -->
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div class="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <span class="material-icons text-sm">badge</span>
                <span>Direct Contact & Registrations</span>
              </div>

              <div class="space-y-2 text-xs">
                <div>
                  <div class="text-[10px] text-neutral-400">Master Jeweller & Proprietor</div>
                  <div class="font-bold text-white">{{ settings().ownerName }}</div>
                </div>
                <div>
                  <div class="text-[10px] text-neutral-400">Phone / WhatsApp Support</div>
                  <div class="font-bold text-amber-300">{{ settings().phone }}</div>
                </div>
                <div>
                  <div class="text-[10px] text-neutral-400">Official Email</div>
                  <div class="font-mono text-neutral-200">{{ settings().email }}</div>
                </div>
                <div>
                  <div class="text-[10px] text-neutral-400">GSTIN Registration</div>
                  <div class="font-mono text-emerald-400 font-bold">{{ settings().gstin }}</div>
                </div>
              </div>
            </div>

            <!-- Quick Action Buttons -->
            <div class="grid grid-cols-2 gap-2">
              <a
                [href]="'tel:' + settings().phone"
                class="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition">
                <span class="material-icons text-base text-amber-400">call</span>
                <span>Direct Call</span>
              </a>
              <a
                [href]="whatsappInquiryUrl()"
                target="_blank"
                rel="noopener noreferrer"
                class="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition">
                <span class="material-icons text-base">chat</span>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          <!-- Interactive Google Maps Stylized Preview Card -->
          <div class="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between space-y-3">
            <div class="space-y-1">
              <div class="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <span class="material-icons text-sm">map</span>
                <span>Live Location & Map Pin</span>
              </div>
              <p class="text-[11px] text-neutral-400">Easily navigate to our showroom in Chennai's jewellery district</p>
            </div>

            <!-- Map Mockup Graphic -->
            <div class="h-36 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/80 p-3 flex flex-col items-center justify-center relative overflow-hidden text-center group">
              <div class="absolute inset-0 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:12px_12px] opacity-40"></div>
              <div class="relative z-10 w-10 h-10 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-500/40 animate-bounce">
                <span class="material-icons text-xl">store</span>
              </div>
              <div class="relative z-10 text-xs font-bold text-white mt-2">{{ settings().shopName }}</div>
              <div class="relative z-10 text-[10px] text-amber-300">T. Nagar, Chennai</div>
            </div>

            <button
              type="button"
              (click)="openGoogleMapsDirections()"
              class="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold flex items-center justify-center space-x-1.5 transition cursor-pointer">
              <span class="material-icons text-sm">directions</span>
              <span>Open Google Maps Directions</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Bottom Launch CTA Strip -->
      <section class="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-3xl p-6 lg:p-8 text-neutral-950 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="space-y-1 text-center sm:text-left">
          <h3 class="text-xl sm:text-2xl font-black text-neutral-950">
            Ready to manage your jewellery shop?
          </h3>
          <p class="text-xs sm:text-sm font-semibold text-neutral-900">
            Access inventory, instant 3% GST billing, bullion purchases, Karigar ledgers & marketing reels.
          </p>
        </div>

        <div class="flex items-center space-x-3 w-full sm:w-auto justify-center">
          <button
            type="button"
            (click)="navigateTo('sales')"
            class="px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-amber-300 text-xs font-black flex items-center space-x-1.5 transition cursor-pointer shadow-md">
            <span class="material-icons text-sm">point_of_sale</span>
            <span>Create New Bill</span>
          </button>
          <button
            type="button"
            (click)="navigateTo('dashboard')"
            class="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-black flex items-center space-x-1.5 transition cursor-pointer shadow-md">
            <span class="material-icons text-sm">dashboard</span>
            <span>Go to Dashboard</span>
          </button>
        </div>
      </section>

      <!-- VIP Bridal Appointment Modal -->
      @if (openAppointmentModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div class="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
                  <span class="material-icons text-lg">diamond</span>
                </div>
                <div>
                  <h4 class="font-bold text-neutral-900 text-sm">Book VIP Bridal Consultation</h4>
                  <p class="text-[10px] text-neutral-500">Private jewellery trial room & master karigar consultation</p>
                </div>
              </div>
              <button
                type="button"
                (click)="openAppointmentModal.set(false)"
                class="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center cursor-pointer">
                <span class="material-icons text-base">close</span>
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label for="vipCustName" class="block font-bold text-neutral-700 mb-1">Your Full Name</label>
                <input
                  id="vipCustName"
                  type="text"
                  #custNameInput
                  placeholder="e.g. Ananya Sundaram"
                  class="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs text-neutral-900 outline-none focus:border-amber-500" />
              </div>
              <div>
                <label for="vipCustPhone" class="block font-bold text-neutral-700 mb-1">Mobile / WhatsApp Number</label>
                <input
                  id="vipCustPhone"
                  type="tel"
                  #custPhoneInput
                  placeholder="+91 98765 43210"
                  class="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs text-neutral-900 outline-none focus:border-amber-500" />
              </div>
              <div>
                <label for="vipReqType" class="block font-bold text-neutral-700 mb-1">Jewellery Requirement</label>
                <select
                  id="vipReqType"
                  #reqTypeInput
                  class="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs text-neutral-900 outline-none focus:border-amber-500">
                  <option value="Complete Bridal Set (Harams & Choker)">Complete Bridal Set (Harams & Choker)</option>
                  <option value="Solitaire Engagement Ring">Solitaire Engagement Ring</option>
                  <option value="Antique Temple Jewellery">Antique Temple Jewellery</option>
                  <option value="Old Gold Exchange & New Purchase">Old Gold Exchange & New Purchase</option>
                  <option value="Custom Karigar Design">Custom Karigar Design</option>
                </select>
              </div>
            </div>

            <div class="pt-2 flex items-center space-x-2">
              <button
                type="button"
                (click)="openAppointmentModal.set(false)"
                class="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                (click)="confirmAppointment(custNameInput.value, custPhoneInput.value, reqTypeInput.value)"
                class="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold cursor-pointer shadow-md">
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class Landing {
  private readonly platformId = inject(PLATFORM_ID);
  readonly service = inject(JewelleryService);
  readonly settings = this.service.settings;

  readonly navigateToSection = output<string>();

  @ViewChild('tutorialSection') tutorialSectionRef?: ElementRef<HTMLElement>;

  readonly calcGrams = signal<number>(10);
  readonly openAppointmentModal = signal<boolean>(false);

  // Tutorial Video & Hindi Voice State
  readonly selectedModuleIndex = signal<number>(0);
  readonly isSpeaking = signal<boolean>(false);
  readonly speechRate = signal<number>(1.0);
  readonly autoAdvance = signal<boolean>(true);

  private currentUtterance: SpeechSynthesisUtterance | null = null;

  readonly tutorialModules: TutorialModule[] = [
    {
      id: 'mod-1',
      targetSection: 'dashboard',
      titleHindi: '1. डैशबोर्ड व लाइव रेट्स',
      titleEnglish: 'Dashboard & Live Bullion',
      badge: 'Overview',
      duration: '45 sec',
      icon: 'dashboard',
      hindiVoiceScript:
        'नमस्ते! स्वर्णमुद्रा ज्वेलर्स सॉफ्टवेयर में आपका स्वागत है। डैशबोर्ड में आपको आज का कुल सेल, शुद्ध मुनाफा और 22 कैरेट व 24 कैरेट का लाइव सोने-चांदी का भाव रियल-टाइम दिखाई देता है। यहाँ से आप एक क्लिक में नया बिल बना सकते हैं और ट्रेंडिंग गहनों के वीडियो रील्स भी देख सकते हैं।',
      hinglishGuide:
        'Dashboard me aapko daily total sales, estimated profit aur live 22K/24K gold rates milte hain. Yahan se quick shortcuts se direct naya bill create kar sakte hain.',
      englishSummary:
        'Live 22K/24K & Silver bullion ticker, daily sales turnover, estimated profit, low stock indicators, and instant shortcut buttons.',
      keySteps: [
        {
          icon: 'trending_up',
          titleHindi: 'लाइव रेट्स ऑटो-सिंक',
          desc: '22K सोना, 24K सोना और चांदी का भाव रियल टाइम अपडेट होता है।'
        },
        {
          icon: 'receipt_long',
          titleHindi: 'त्वरित बिलिंग शॉर्टकट',
          desc: 'सीधे डैशबोर्ड से 1-क्लिक में ग्राहक का नया इनवॉइस खोलें।'
        },
        {
          icon: 'warning',
          titleHindi: 'लो-स्टॉक अलर्ट',
          desc: 'कम इन्वेंटरी वाले गहनों का ऑटोमैटिक लाल बैज दिखाई देगा।'
        }
      ],
      uiMockup: {
        headerTitle: 'Dashboard & Live Bullion Analytics',
        metrics: [
          { label: "Today's Sales", value: '₹1,45,000', color: '#10b981' },
          { label: '22K Gold Rate', value: '₹6,650/g', color: '#f59e0b' },
          { label: 'Active SKUs', value: '38 Items', color: '#60a5fa' }
        ],
        primaryAction: 'Open Dashboard',
        focusElementLabel: 'Live Bullion Ticker & Quick Sales Counter',
        highlights: ['Live Bullion Sync', 'Gross Profit Tracker', 'Video Showcase Carousel']
      }
    },
    {
      id: 'mod-2',
      targetSection: 'inventory',
      titleHindi: '2. इन्वेंटरी व 916 हॉलमार्किंग',
      titleEnglish: 'Jewellery Stock & HUID',
      badge: 'Core Stock',
      duration: '50 sec',
      icon: 'inventory_2',
      hindiVoiceScript:
        'इन्वेंटरी मॉड्यूल में आप अपने सोने, हीरे, और चांदी के गहनों का पूरा स्टॉक मैनेज करते हैं। नया गहना जोड़ते समय ग्रॉस वेट, नेट वेट, स्टोन वेट और बीआईएस 916 हॉलमार्क दर्ज कर सकते हैं। बारकोड या क्यूआर कोड से गहना तुरंत स्कैन होता है, और कम स्टॉक होते ही अलर्ट मिल जाता है।',
      hinglishGuide:
        'Inventory me Gold, Diamond aur Silver items ka stock add aur update karte hain. Gross weight, Net weight, Making charges aur Hallmark code store hota hai.',
      englishSummary:
        'Manage jewellery stock, gross vs net weights, stone deductions, making charges, low stock thresholds, and barcode searches.',
      keySteps: [
        {
          icon: 'add_circle',
          titleHindi: 'नया गहना ऐड करें',
          desc: 'फोटो, मेटल टाइप, शुद्धता और मेकिंग चार्ज के साथ सेव करें।'
        },
        {
          icon: 'scale',
          titleHindi: 'वजन हिसाब (Gross vs Net)',
          desc: 'स्टोन वेट घटाकर असली सोने का शुद्ध वजन ऑटो-कैलकुलेट होता है।'
        },
        {
          icon: 'qr_code_scanner',
          titleHindi: 'बारकोड सर्च',
          desc: 'SKU कोड टाइप करते ही गहने की पूरी डिटेल स्क्रीन पर आ जाती है।'
        }
      ],
      uiMockup: {
        headerTitle: 'Jewellery Inventory & Hallmarking Ledger',
        metrics: [
          { label: 'Total Gold Stock', value: '2,450.5 g', color: '#f59e0b' },
          { label: 'Silver Articles', value: '1,820 g', color: '#cbd5e1' },
          { label: 'Low Stock Alert', value: '2 Items', color: '#ef4444' }
        ],
        primaryAction: 'Open Inventory',
        focusElementLabel: 'Add New Jewellery Item & Weight Calculator',
        highlights: ['Gross / Net Weight Split', 'BIS 916 HUID Code', 'Instant Stock Search']
      }
    },
    {
      id: 'mod-3',
      targetSection: 'sales',
      titleHindi: '3. बिलिंग, जीएसटी व व्हाट्सएप इनवॉइस',
      titleEnglish: 'Billing, 3% GST & POS',
      badge: 'Sales POS',
      duration: '55 sec',
      icon: 'point_of_sale',
      hindiVoiceScript:
        'बिलिंग और पॉइंट ऑफ सेल में गहनों का 3% जीएसटी और मेकिंग चार्ज ऑटोमैटिक कैलकुलेट होता है। ग्राहक के लिए कैश, यूपीआई या कार्ड से पेमेंट लेकर थर्मल प्रिंट बिल निकाल सकते हैं, या सीधे व्हाट्सएप पर पीडीएफ इनवॉइस शेयर कर सकते हैं। पुराने सोने का एक्सचेंज भी यहीं एडजस्ट होता है।',
      hinglishGuide:
        'Sales POS me 3% GST aur making charges auto calculate hote hain. Cash, UPI ya Card payment lekar customer ko WhatsApp par direct digital invoice bhej sakte hain.',
      englishSummary:
        'Automated 3% jewellery GST, split cash/UPI/card tender, old gold exchange deduction, thermal receipt printing, and 1-click WhatsApp bill sharing.',
      keySteps: [
        {
          icon: 'calculate',
          titleHindi: '3% GST ऑटो-कैलकुलेशन',
          desc: 'सरकारी नियमों के अनुसार सोने-चांदी पर 3% टैक्स अपने-आप जुड़ता है।'
        },
        {
          icon: 'payment',
          titleHindi: 'कैश + यूपीआई स्प्लिट',
          desc: 'ग्राहक चाहे तो आधा कैश और आधा गूगल-पे से भुगतान कर सकता है।'
        },
        {
          icon: 'share',
          titleHindi: 'व्हाट्सएप इनवॉइस शेयर',
          desc: 'कागज़ के बिना ग्राहक के मोबाइल पर तुरंत पक्का बिल चला जाता है।'
        }
      ],
      uiMockup: {
        headerTitle: 'Tax Invoice & Point of Sale (POS)',
        metrics: [
          { label: 'Today Total Sales', value: '₹3,95,000', color: '#10b981' },
          { label: 'Tax Collected', value: '₹11,550 (3%)', color: '#60a5fa' },
          { label: 'Payment Modes', value: 'UPI / Cash', color: '#f59e0b' }
        ],
        primaryAction: 'Open Sales POS',
        focusElementLabel: 'Create New Tax Invoice & WhatsApp Share',
        highlights: ['Govt 3% GST Split', 'Thermal POS Print', 'WhatsApp Direct PDF']
      }
    },
    {
      id: 'mod-4',
      targetSection: 'customers',
      titleHindi: '4. ग्राहक खाता व लॉयल्टी रिवॉर्ड',
      titleEnglish: 'Customer CRM & Gold Khata',
      badge: 'CRM',
      duration: '40 sec',
      icon: 'people',
      hindiVoiceScript:
        'कस्टमर मैनेजमेंट में आप अपने वीआईपी ग्राहकों की पूरी लिस्ट, उनकी खरीदारी का इतिहास और गोल्ड खाता बैलेंस देख सकते हैं। हर खरीदारी पर उन्हें लॉयल्टी रिवॉर्ड पॉइंट्स मिलते हैं, और एनिवर्सरी व जन्मदिन पर विशेष ग्रीटिंग्स व डिस्काउंट ऑफर भेज सकते हैं।',
      hinglishGuide:
        'Customer module me VIP customer list, loyalty points aur unka lifetime purchase record rehta hai. Birthday aur anniversary reminder bhi bhej sakte hain.',
      englishSummary:
        'VIP customer profiles, gold khata balance, purchase history ledger, loyalty points rewards, and anniversary wishes.',
      keySteps: [
        {
          icon: 'card_giftcard',
          titleHindi: 'लॉयल्टी रिवॉर्ड पॉइंट्स',
          desc: 'हर ₹100 की खरीदारी पर पॉइंट्स जमा होते हैं जो अगली बार रिडीम होंगे।'
        },
        {
          icon: 'history',
          titleHindi: 'खरीदारी इतिहास',
          desc: 'ग्राहक ने कब क्या गहना खरीदा, पूरा बिल रिकॉर्ड हमेशा सुरक्षित रहता है।'
        },
        {
          icon: 'celebration',
          titleHindi: 'एनिवर्सरी विशेस',
          desc: 'शादी की सालगिरह और जन्मदिन पर व्हाट्सएप ग्रीटिंग्स भेजें।'
        }
      ],
      uiMockup: {
        headerTitle: 'Customer Profiles & VIP Loyalty Ledger',
        metrics: [
          { label: 'Active Customers', value: '142 VIPs', color: '#60a5fa' },
          { label: 'Avg Loyalty Pts', value: '3,250 Pts', color: '#f59e0b' },
          { label: 'Repeat Rate', value: '78%', color: '#10b981' }
        ],
        primaryAction: 'Open Customers',
        focusElementLabel: 'Customer Gold Khata & Reward Points Ledger',
        highlights: ['Khata Book Balances', 'Loyalty Redemption', 'Anniversary Alerts']
      }
    },
    {
      id: 'mod-5',
      targetSection: 'catalog',
      titleHindi: '5. मार्केटिंग रील्स व वीडियो स्टूडियो',
      titleEnglish: 'Marketing Reels Video Studio',
      badge: 'Social Video',
      duration: '50 sec',
      icon: 'movie_filter',
      hindiVoiceScript:
        'मार्केटिंग वीडियो स्टूडियो में आप गहनों की कई तस्वीरें अपलोड करके इंस्टाग्राम और व्हाट्सएप रील्स बना सकते हैं। रॉयल गोल्ड, ब्राइडल वेलवेट, और फेस्टिव स्पार्कल जैसे 6 डिज़ाइनर टेम्पलेट्स से बिना किसी एडिटिंग के सिर्फ 10 सेकंड में फैंसी वीडियो तैयार हो जाती है।',
      hinglishGuide:
        'Marketing Video Studio me multiple jewellery photos upload karke Royal Gold ya Bridal Velvet template se 10 second me WhatsApp aur Instagram reels banate hain.',
      englishSummary:
        'Upload multiple jewellery photos in a horizontal scroll gallery, pick from 6 designer reel templates, and export HD promo videos.',
      keySteps: [
        {
          icon: 'add_photo_alternate',
          titleHindi: 'मल्टीपल फोटो अपलोड',
          desc: 'गहनों की 3 से 6 एंगल की तस्वीरें हॉरिजॉन्टल गैलरी में अपलोड करें।'
        },
        {
          icon: 'style',
          titleHindi: '6 लक्ज़री टेम्पलेट्स',
          desc: 'रॉयल गोल्ड, ब्राइडल वेलवेट या फेस्टिव स्पार्कल थीम चुनें।'
        },
        {
          icon: 'smart_display',
          titleHindi: '10 सेकंड में रील तैयार',
          desc: 'दुकान के नाम और 916 लोगो के साथ वीडियो इंस्टाग्राम पर शेयर करें।'
        }
      ],
      uiMockup: {
        headerTitle: 'Marketing Video Studio & Reels Generator',
        metrics: [
          { label: 'Templates Available', value: '6 Themes', color: '#f59e0b' },
          { label: 'Aspect Ratio', value: '9:16 Reel', color: '#cbd5e1' },
          { label: 'Export Quality', value: '1080p HD', color: '#10b981' }
        ],
        primaryAction: 'Open Digital Catalog',
        focusElementLabel: 'Select Reel Template & Generate Video',
        highlights: ['Horizontal Image Gallery', 'Luxury Animations', 'Instagram Ready']
      }
    },
    {
      id: 'mod-6',
      targetSection: 'purchases',
      titleHindi: '6. सप्लायर खरीदारी व कारीगर लेजर',
      titleEnglish: 'Bullion Purchases & Expenses',
      badge: 'Procurement',
      duration: '45 sec',
      icon: 'local_mall',
      hindiVoiceScript:
        'परचेस और एक्सपेंस मॉड्यूल में आप रिफाइनर्स से खरीदे गए रॉ गोल्ड और चांदी का इनफ्लो रिकॉर्ड करते हैं। साथ ही कारीगर की मजूरी, दुकान का किराया और हॉलमार्किंग टेस्टिंग फीस का रोज़ाना हिसाब-किताब आसानी से मेंटेन होता है।',
      hinglishGuide:
        'Purchases aur Expenses me bullion refiners se raw gold kharidna aur karigar making charges ka daily hisab-kitab maintain hota hai.',
      englishSummary:
        'Track raw bullion procurement, supplier credit balances, karigar making wages, hallmarking testing fees, and daily showroom overheads.',
      keySteps: [
        {
          icon: 'factory',
          titleHindi: 'सप्लायर लेजर',
          desc: 'रिफाइनर का पुराना बाकी और नया माल इनफ्लो तुरंत मैच करें।'
        },
        {
          icon: 'receipt',
          titleHindi: 'कारीगर मजदूरी हिसाब',
          desc: 'गहने बनाने वाले कारीगर का मेकिंग चार्ज और वेस्टेज रिकॉर्ड करें।'
        },
        {
          icon: 'account_balance_wallet',
          titleHindi: 'दुकान के खर्चे',
          desc: 'बिजली बिल, स्टाफ सैलरी और हॉलमार्किंग फीस का अलग हिसाब।'
        }
      ],
      uiMockup: {
        headerTitle: 'Bullion Procurement & Expenses Ledger',
        metrics: [
          { label: 'Bullion Inflow', value: '₹5,20,000', color: '#f59e0b' },
          { label: 'Supplier Balance', value: '₹62,000', color: '#ef4444' },
          { label: 'Monthly Expenses', value: '₹79,500', color: '#60a5fa' }
        ],
        primaryAction: 'Open Purchases',
        focusElementLabel: 'Add Bullion Inflow & Karigar Wages',
        highlights: ['Certified Refiners', 'Karigar Wastage Ledger', 'Petty Cash Tracking']
      }
    },
    {
      id: 'mod-7',
      targetSection: 'reports',
      titleHindi: '7. रिपोर्ट्स, टैक्स व शुद्ध मुनाफा',
      titleEnglish: 'Reports & Profit Analytics',
      badge: 'Financials',
      duration: '40 sec',
      icon: 'assessment',
      hindiVoiceScript:
        'बिजनेस रिपोर्ट्स में आप पूरे महीने की बिक्री, इन्वेंटरी वैल्यूएशन, जीएसटी देनदारी और शुद्ध मुनाफे का पाई-चार्ट व ग्राफ देख सकते हैं। यह रिपोर्ट सीए और टैक्स फाइलिंग के लिए एक्सेल व पीडीएफ में एक क्लिक में एक्सपोर्ट की जा सकती है।',
      hinglishGuide:
        'Reports me pure mahine ka sales trend, inventory valuation aur GST liability graph ke sath dikhti hai jise CA ke liye export kar sakte hain.',
      englishSummary:
        'Visual sales trends, inventory stock valuation, GST tax compliance reports, and Excel/PDF export for Chartered Accountants.',
      keySteps: [
        {
          icon: 'pie_chart',
          titleHindi: 'प्रॉफिट एंड लॉस चार्ट',
          desc: 'रोज़ाना और मासिक मुनाफे का साफ़ विज़ुअल ग्राफ।'
        },
        {
          icon: 'table_view',
          titleHindi: 'सीए के लिए जीएसटी रिपोर्ट',
          desc: 'GSTR-1 और 3B के लिए सभी इनवॉइस की समरी एक्सेल में डाउनलोड करें।'
        },
        {
          icon: 'inventory',
          titleHindi: 'स्टॉक वैल्यूएशन',
          desc: 'दुकान में रखे कुल सोने-चांदी की आज की बाजार कीमत तुरंत जानें।'
        }
      ],
      uiMockup: {
        headerTitle: 'Financial Statements & Tax Analytics',
        metrics: [
          { label: 'Monthly Revenue', value: '₹28,40,000', color: '#10b981' },
          { label: 'Net Profit', value: '₹4,12,000', color: '#f59e0b' },
          { label: 'GST Liability', value: '₹85,200', color: '#60a5fa' }
        ],
        primaryAction: 'Open Reports',
        focusElementLabel: 'Export CA Tax Summary & Stock Valuation',
        highlights: ['Real-time P&L Statement', 'Excel / PDF Export', 'Tax Audit Ready']
      }
    }
  ];

  readonly currentModule = computed(
    () => this.tutorialModules[this.selectedModuleIndex()] ?? this.tutorialModules[0]
  );

  readonly currentModuleVideoUrl = computed(() => {
    const prods = this.service.products();
    const withVideo = prods.find(p => !!p.videoUrl);
    if (withVideo?.videoUrl) return withVideo.videoUrl;
    return '/videos/reel-p1.mp4';
  });

  readonly currentModulePosterUrl = computed(() => {
    const prods = this.service.products();
    const withVideo = prods.find(p => !!p.videoUrl);
    if (withVideo?.image) return withVideo.image;
    return '/images/p1.jpg';
  });

  readonly featuredProducts = computed(() => this.service.products().slice(0, 6));

  readonly calculatedGoldEstimate = computed(() => {
    const rate = this.settings().goldRate22k;
    const g = Number(this.calcGrams()) || 0;
    const base = rate * g;
    const gst = base * 0.03;
    return Math.round(base + gst);
  });

  onCalcGramsInput(event: Event) {
    const inputEl = event.target as HTMLInputElement | null;
    const val = Number(inputEl?.value ?? 10);
    this.calcGrams.set(val > 0 ? val : 1);
  }

  scrollToTutorial() {
    this.tutorialSectionRef?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  selectModule(index: number) {
    this.selectedModuleIndex.set(index);
    if (this.isSpeaking()) {
      this.playHindiSpeechForModule(this.tutorialModules[index]);
    }
  }

  nextModule() {
    const nextIdx = Math.min(this.tutorialModules.length - 1, this.selectedModuleIndex() + 1);
    this.selectModule(nextIdx);
  }

  prevModule() {
    const prevIdx = Math.max(0, this.selectedModuleIndex() - 1);
    this.selectModule(prevIdx);
  }

  toggleSpeed() {
    const cur = this.speechRate();
    const next = cur === 1.0 ? 1.25 : cur === 1.25 ? 1.5 : 1.0;
    this.speechRate.set(next);
    if (this.isSpeaking()) {
      this.playHindiSpeechForModule(this.currentModule());
    }
  }

  toggleAutoAdvance() {
    this.autoAdvance.set(!this.autoAdvance());
  }

  toggleHindiVoice() {
    if (this.isSpeaking()) {
      this.stopSpeech();
    } else {
      this.playHindiSpeechForModule(this.currentModule());
    }
  }

  replayCurrentModuleAudio() {
    this.stopSpeech();
    this.playHindiSpeechForModule(this.currentModule());
  }

  private stopSpeech() {
    if (isPlatformBrowser(this.platformId) && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking.set(false);
  }

  private playHindiSpeechForModule(mod: TutorialModule) {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!('speechSynthesis' in window)) {
      this.service.showToast('Speech synthesis not supported in this browser.', 'info');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(mod.hindiVoiceScript);
    utterance.rate = this.speechRate();
    utterance.pitch = 1.0;

    // Detect Hindi voices (e.g. Google hi-IN or Microsoft Hemant/Kalpana)
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice =
      voices.find(v => v.lang.toLowerCase().includes('hi')) ||
      voices.find(v => v.lang.toLowerCase().includes('in')) ||
      voices[0];

    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }
    utterance.lang = 'hi-IN';

    utterance.onstart = () => {
      this.isSpeaking.set(true);
    };

    utterance.onend = () => {
      this.isSpeaking.set(false);
      if (this.autoAdvance() && this.selectedModuleIndex() < this.tutorialModules.length - 1) {
        setTimeout(() => {
          this.nextModule();
          this.playHindiSpeechForModule(this.currentModule());
        }, 1200);
      }
    };

    utterance.onerror = () => {
      this.isSpeaking.set(false);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    this.service.showToast(`हिंदी ऑडियो शुरू: ${mod.titleHindi}`, 'info');
  }

  navigateTo(section: string) {
    this.stopSpeech();
    this.navigateToSection.emit(section);
  }

  whatsappInquiryUrl(): string {
    const phone = this.settings().phone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Namaste ${this.settings().shopName}! I would like to enquire about your jewellery collections and live gold rates.`
    );
    return `https://wa.me/${phone}?text=${text}`;
  }

  getWhatsAppInquiryForProduct(product: Product): string {
    const phone = this.settings().phone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Namaste ${this.settings().shopName}! I am interested in "${product.name}" (Code: ${product.code}, Purity: ${product.purity}, Approx: ₹${product.sellingPrice}). Please share more details.`
    );
    return `https://wa.me/${phone}?text=${text}`;
  }

  openGoogleMapsDirections() {
    const query = encodeURIComponent(`${this.settings().shopName}, ${this.settings().address}`);
    if (isPlatformBrowser(this.platformId)) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  }

  confirmAppointment(name: string, phone: string, occasion: string) {
    if (!name.trim() || !phone.trim()) {
      this.service.showToast('Please enter your name and phone number.', 'error');
      return;
    }
    this.openAppointmentModal.set(false);
    this.service.showToast(
      `Dhanyavaad ${name}! Your VIP consultation (${occasion}) has been booked. Our manager will call you shortly.`,
      'success'
    );
  }
}
