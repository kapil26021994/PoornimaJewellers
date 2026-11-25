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
        </div>

        <div class="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h3 class="text-sm font-bold text-neutral-900">Shop Location</h3>
              <p class="text-xs text-neutral-600 mt-0.5">Sarafa Bazar, Agar Malwa, Madhya Pradesh</p>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Sarafa%20Bazar%2C%20Agar%20Malwa%2C%20Madhya%20Pradesh"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition">
              <span class="material-icons text-sm">open_in_new</span>
              Open in Maps
            </a>
          </div>
          <iframe
            title="Map showing Sarafa Bazar, Agar Malwa, Madhya Pradesh"
            src="https://www.google.com/maps?q=Sarafa%20Bazar%2C%20Agar%20Malwa%2C%20Madhya%20Pradesh&z=15&output=embed"
            class="w-full h-56 rounded-xl border border-neutral-200"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
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
      id: 'blue-white',
      name: 'Blue & White',
      subtitle: 'Fresh white surfaces paired with royal sapphire blue accents.',
      badge: 'Default',
      previewBg: '#eff6ff',
      previewCardBg: '#ffffff',
      previewBorder: '#bfdbfe',
      previewHeaderBg: '#1e3a8a',
      previewText: '#1e3a8a',
      previewAccent: '#2563eb'
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
