import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JewelleryService } from '../services/jewellery.service';
import { AppTheme } from '../models/jewellery.model';

interface ThemeOptionCard {
  id: AppTheme;
  name: string;
  subtitle: string;
  badge: string;
  previewBg: string;
  previewCardBg: string;
  previewBorder: string;
  previewHeaderBg: string;
  previewText: string;
  previewAccent: string;
}

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-4 pb-20 lg:pb-8">
      <!-- Page Title -->
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
        <h2 class="text-xl font-bold text-neutral-900 tracking-tight">Shop Settings & Appearance</h2>
        <p class="text-xs text-neutral-500">Customize visual theme, store profile, bullion rates and stock limits</p>
      </div>

      <!-- Theme Customizer Card -->
      <div class="bg-white rounded-2xl p-5 border border-neutral-200 space-y-3.5 shadow-xs">
        <div class="flex items-center justify-between gap-2">
          <div>
            <h3 class="font-bold text-sm text-neutral-900 flex items-center space-x-1.5">
              <span class="material-icons text-amber-600" [style.fontSize.px]="18">palette</span>
              <span>Theme Customizer</span>
            </h3>
            <p class="text-[11px] text-neutral-500 mt-0.5">
              Switch instantly between Light, Blue & White, Obsidian Dark, or Gold / Luxury mode
            </p>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800 shrink-0">
            {{ activeThemeLabel() }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          @for (option of themeOptions; track option.id) {
            <button
              type="button"
              (click)="selectTheme(option.id)"
              [class]="service.currentTheme() === option.id
                ? 'border-amber-500 ring-2 ring-amber-500/60 shadow-md'
                : 'border-neutral-200 hover:border-amber-500/50'"
              class="rounded-2xl border p-3 text-left transition flex flex-col justify-between gap-2.5 cursor-pointer active:scale-[0.99] bg-neutral-50">
              <!-- Live Mini Swatch (Inline colors stay true regardless of active theme) -->
              <div
                class="w-full h-20 rounded-xl p-2 flex flex-col justify-between overflow-hidden"
                [style.backgroundColor]="option.previewBg"
                [style.border]="'1.5px solid ' + option.previewBorder">
                <div
                  class="h-4 rounded-md px-1.5 flex items-center justify-between"
                  [style.backgroundColor]="option.previewHeaderBg">
                  <span class="w-8 h-1.5 rounded-full" [style.backgroundColor]="option.previewAccent"></span>
                  <span class="w-3 h-1.5 rounded-full" [style.backgroundColor]="option.previewAccent"></span>
                </div>
                <div
                  class="rounded-lg p-1.5 flex items-center justify-between"
                  [style.backgroundColor]="option.previewCardBg"
                  [style.border]="'1px solid ' + option.previewBorder">
                  <div class="space-y-1">
                    <div class="w-14 h-1.5 rounded-full" [style.backgroundColor]="option.previewText"></div>
                    <div class="w-9 h-1 rounded-full opacity-70" [style.backgroundColor]="option.previewAccent"></div>
                  </div>
                  <span class="w-4 h-4 rounded-full" [style.backgroundColor]="option.previewAccent"></span>
                </div>
              </div>

              <!-- Label & Active Indicator -->
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="flex items-center space-x-1.5">
                    <span class="font-bold text-xs text-neutral-900">{{ option.name }}</span>
                    <span class="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-bold">
                      {{ option.badge }}
                    </span>
                  </div>
                  <p class="text-[10px] text-neutral-500 mt-0.5 leading-snug">{{ option.subtitle }}</p>
                </div>

                @if (service.currentTheme() === option.id) {
                  <span class="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0">
                    <span class="material-icons" [style.fontSize.px]="14">check</span>
                  </span>
                }
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Store Profile & Bullion Form -->
      <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()" class="bg-white rounded-2xl p-6 border border-neutral-200 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Shop Name *
              <input type="text" formControlName="shopName" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 outline-none text-sm text-neutral-900 font-normal">
            </label>
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Tagline *
              <input type="text" formControlName="tagline" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 outline-none text-sm text-neutral-900 font-normal">
            </label>
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Owner Name *
              <input type="text" formControlName="ownerName" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 outline-none text-sm text-neutral-900 font-normal">
            </label>
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Phone *
              <input type="text" formControlName="phone" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 outline-none text-sm text-neutral-900 font-normal">
            </label>
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Email *
              <input type="email" formControlName="email" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 outline-none text-sm text-neutral-900 font-normal">
            </label>
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              GSTIN Number *
              <input type="text" formControlName="gstin" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 outline-none text-sm text-neutral-900 font-normal">
            </label>
          </div>
          <div class="sm:col-span-2 lg:col-span-3">
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Shop Address *
              <textarea formControlName="address" rows="2" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 outline-none text-sm text-neutral-900 resize-none font-normal"></textarea>
            </label>
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              24K Gold Rate (₹/g) *
              <input type="number" formControlName="goldRate24k" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 outline-none text-sm text-neutral-900 font-normal">
            </label>
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              22K Gold Rate (₹/g) *
              <input type="number" formControlName="goldRate22k" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 outline-none text-sm text-neutral-900 font-normal">
            </label>
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Silver Rate (₹/g) *
              <input type="number" formControlName="silverRate" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 outline-none text-sm text-neutral-900 font-normal">
            </label>
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Default Low Stock Limit (Pcs) *
              <input type="number" min="0" formControlName="defaultLowStockThreshold" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 outline-none text-sm text-neutral-900 font-normal">
            </label>
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Currency Symbol *
              <input type="text" formControlName="currency" readonly 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-100 outline-none text-sm text-neutral-700 font-normal">
            </label>
          </div>
        </div>

        <div class="pt-4 flex justify-end">
          <button type="submit" class="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 cursor-pointer">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  `
})
export class Settings implements OnInit {
  readonly service = inject(JewelleryService);
  readonly fb = inject(FormBuilder);

  settingsForm!: FormGroup;

  readonly themeOptions: ThemeOptionCard[] = [
    {
      id: 'light',
      name: 'Light Classic',
      subtitle: 'Crisp bright cards & warm gold highlights for daylight counters.',
      badge: 'Default',
      previewBg: '#f5f5f5',
      previewCardBg: '#ffffff',
      previewBorder: '#e5e5e5',
      previewHeaderBg: '#171717',
      previewText: '#171717',
      previewAccent: '#f59e0b'
    },
    {
      id: 'blue-white',
      name: 'Blue & White',
      subtitle: 'Fresh white surfaces paired with royal sapphire blue accents.',
      badge: 'Clean',
      previewBg: '#eff6ff',
      previewCardBg: '#ffffff',
      previewBorder: '#bfdbfe',
      previewHeaderBg: '#1e3a8a',
      previewText: '#1e3a8a',
      previewAccent: '#2563eb'
    },
    {
      id: 'dark',
      name: 'Obsidian Dark',
      subtitle: 'Low-glare charcoal surfaces ideal for evening showroom hours.',
      badge: 'Dark',
      previewBg: '#09090b',
      previewCardBg: '#18181b',
      previewBorder: '#3f3f46',
      previewHeaderBg: '#111115',
      previewText: '#f4f4f5',
      previewAccent: '#fbbf24'
    },
    {
      id: 'gold-luxury',
      name: 'Gold / Luxury',
      subtitle: 'Maximum-contrast pitch black & 24K gold borders for sharp legibility.',
      badge: 'AAA Contrast',
      previewBg: '#020202',
      previewCardBg: '#0d0c09',
      previewBorder: '#fbbf24',
      previewHeaderBg: '#000000',
      previewText: '#ffffff',
      previewAccent: '#fde047'
    }
  ];

  ngOnInit() {
    const s = this.service.settings();
    this.settingsForm = this.fb.group({
      shopName: [s.shopName, Validators.required],
      tagline: [s.tagline, Validators.required],
      ownerName: [s.ownerName, Validators.required],
      phone: [s.phone, Validators.required],
      email: [s.email, Validators.required],
      address: [s.address, Validators.required],
      gstin: [s.gstin, Validators.required],
      currency: [s.currency, Validators.required],
      goldRate24k: [s.goldRate24k, Validators.required],
      goldRate22k: [s.goldRate22k, Validators.required],
      silverRate: [s.silverRate, Validators.required],
      gstPercentage: [s.gstPercentage, Validators.required],
      defaultLowStockThreshold: [s.defaultLowStockThreshold, [Validators.required, Validators.min(0)]],
      theme: [s.theme, Validators.required]
    });
  }

  activeThemeLabel(): string {
    const current = this.service.currentTheme();
    return this.themeOptions.find(opt => opt.id === current)?.name ?? 'Light Classic';
  }

  selectTheme(theme: AppTheme) {
    this.service.setTheme(theme);
    this.settingsForm.patchValue({ theme });
  }

  onSubmit() {
    if (this.settingsForm.invalid) return;
    this.service.updateSettings(this.settingsForm.value);
  }
}
