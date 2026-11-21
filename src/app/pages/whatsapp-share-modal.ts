import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject, input, output } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { JewelleryService } from '../services/jewellery.service';
import { Product } from '../models/jewellery.model';

@Component({
  selector: 'app-whatsapp-share-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[92dvh] overflow-hidden border border-emerald-500/25 flex flex-col native-sheet">
        <!-- Header -->
        <div class="bg-neutral-900 text-white px-5 pt-2.5 pb-4 sm:p-5 border-b border-emerald-500/20 shrink-0">
          <div class="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-3 sm:hidden"></div>
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center space-x-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <span class="material-icons">share</span>
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-base text-white truncate">Share on WhatsApp</h3>
                <p class="text-[11px] text-emerald-300 truncate">
                  @if (products().length === 1) {
                    {{ products()[0].name }}
                  } @else {
                    {{ products().length }} selected catalogue items
                  }
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="dismiss.emit()"
              class="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition cursor-pointer shrink-0"
              title="Close">
              <span class="material-icons text-sm">close</span>
            </button>
          </div>
        </div>

        <!-- Body -->
        <form [formGroup]="shareForm" class="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <!-- Selected Product Preview Strip -->
          <div class="bg-neutral-50 border border-neutral-200 rounded-2xl p-2.5 flex items-center space-x-3">
            @if (products().length === 1) {
              <img
                [src]="products()[0].image"
                [alt]="products()[0].name"
                referrerpolicy="no-referrer"
                class="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-200" />
              <div class="min-w-0 flex-1">
                <div class="text-xs font-bold text-neutral-900 truncate">{{ products()[0].name }}</div>
                <div class="text-[10px] text-neutral-500 truncate">
                  {{ products()[0].code }} • {{ products()[0].netWeight }}g • {{ products()[0].metalType }}
                </div>
                <div class="text-xs font-extrabold text-amber-700 mt-0.5 tabular-nums">
                  ₹{{ products()[0].sellingPrice | number:'1.0-0' }}
                </div>
              </div>
            } @else {
              <div class="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <span class="material-icons">collections</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-bold text-neutral-900">{{ products().length }} Jewellery Pieces Selected</div>
                <div class="text-[10px] text-neutral-500 truncate">
                  {{ selectedCodesLabel() }}
                </div>
              </div>
            }
          </div>

          <!-- Optional Customer WhatsApp Number -->
          <div>
            <label class="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Customer WhatsApp Number (Optional)
              <input
                type="tel"
                formControlName="phone"
                placeholder="e.g. 9876543210 or leave blank to pick in WhatsApp"
                class="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs text-neutral-900 bg-white font-normal" />
            </label>

            @if (service.customers().length > 0) {
              <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1.5">
                <span class="text-[10px] text-neutral-400 font-semibold shrink-0">Quick pick:</span>
                @for (cust of service.customers(); track cust.id) {
                  <button
                    type="button"
                    (click)="pickCustomerPhone(cust.phone)"
                    class="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-emerald-50 border border-neutral-200 hover:border-emerald-300 text-[10px] font-semibold text-neutral-700 hover:text-emerald-800 whitespace-nowrap transition cursor-pointer shrink-0">
                    {{ cust.name }}
                  </button>
                }
              </div>
            }
          </div>

          <!-- Toggle Options -->
          <div class="grid grid-cols-3 gap-2">
            <label class="flex items-center space-x-1.5 p-2 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer">
              <input type="checkbox" formControlName="includePrice" class="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer" />
              <span class="text-[11px] font-semibold text-neutral-800">Price</span>
            </label>
            <label class="flex items-center space-x-1.5 p-2 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer">
              <input type="checkbox" formControlName="includeMaking" class="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer" />
              <span class="text-[11px] font-semibold text-neutral-800">Making</span>
            </label>
            <label class="flex items-center space-x-1.5 p-2 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer">
              <input type="checkbox" formControlName="includeShopInfo" class="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer" />
              <span class="text-[11px] font-semibold text-neutral-800">Shop Info</span>
            </label>
          </div>

          <!-- Custom Note -->
          <div>
            <label class="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Message Note (Optional)
              <input
                type="text"
                formControlName="customNote"
                placeholder="e.g. Ready in showroom — let us know if you'd like a video!"
                class="w-full mt-1 px-3.5 py-2 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs text-neutral-900 bg-white font-normal" />
            </label>
          </div>

          <!-- Live WhatsApp Message Preview -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-500">WhatsApp Message Preview</span>
              <button
                type="button"
                (click)="copyMessage()"
                class="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer">
                <span class="material-icons" [style.fontSize.px]="14">content_copy</span>
                <span>Copy</span>
              </button>
            </div>
            <pre class="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 text-[11px] text-neutral-800 font-sans whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto select-text">{{ formattedMessage() }}</pre>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-2 border-t border-neutral-200">
            @if (canNativeShare()) {
              <button
                type="button"
                (click)="nativeShare()"
                class="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-800 hover:bg-neutral-100 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shrink-0">
                <span class="material-icons" [style.fontSize.px]="16">ios_share</span>
                <span>More</span>
              </button>
            }

            <button
              type="button"
              (click)="copyMessage()"
              class="px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-800 hover:bg-neutral-100 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shrink-0">
              <span class="material-icons" [style.fontSize.px]="16">content_copy</span>
              <span>Copy</span>
            </button>

            <a
              [href]="whatsappUrl()"
              target="_blank"
              rel="noopener noreferrer"
              (click)="onWhatsappClick()"
              class="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-1.5 cursor-pointer">
              <span class="material-icons" [style.fontSize.px]="17">chat</span>
              <span>Send on WhatsApp</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class WhatsappShareModal {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly fb = inject(FormBuilder);
  readonly service = inject(JewelleryService);

  readonly products = input.required<Product[]>();
  readonly dismiss = output<void>();

  readonly shareForm = this.fb.group({
    phone: [''],
    includePrice: [true],
    includeMaking: [false],
    includeShopInfo: [true],
    customNote: ['Available at our showroom — reply to reserve or ask for a live video!']
  });

  private readonly formValue = toSignal(this.shareForm.valueChanges, {
    initialValue: this.shareForm.getRawValue()
  });

  readonly canNativeShare = computed(() => {
    if (!isPlatformBrowser(this.platformId)) return false;
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  });

  readonly selectedCodesLabel = computed(() =>
    this.products()
      .map(p => p.code)
      .join(', ')
  );

  readonly formattedMessage = computed(() => {
    const items = this.products();
    const form = this.formValue();
    const shop = this.service.settings();
    const lines: string[] = [];

    if (form.includeShopInfo) {
      lines.push(`✨ *${shop.shopName}* ✨`);
      if (shop.tagline) {
        lines.push(`_${shop.tagline}_`);
      }
      lines.push('');
    }

    if (items.length === 1) {
      const p = items[0];
      lines.push(`💎 *${p.name}*`);
      lines.push(`• Code: ${p.code}`);
      lines.push(`• Category: ${p.category} (${p.metalType} • ${p.purity})`);
      lines.push(`• Weight: Gross ${p.grossWeight}g | Net ${p.netWeight}g`);
      if (form.includeMaking) {
        lines.push(`• Making Charges: ₹${this.formatInr(p.makingCharges)}`);
      }
      if (form.includePrice) {
        lines.push(`• Price: *₹${this.formatInr(p.sellingPrice)}*`);
      }
      lines.push(`• Availability: ${p.quantity > 0 ? `In Stock (${p.quantity} pcs)` : 'Made to Order'}`);
    } else {
      lines.push(`💍 *Curated Jewellery Selection (${items.length} pieces)*`);
      lines.push('');
      items.forEach((p, idx) => {
        lines.push(`${idx + 1}. *${p.name}* (${p.code})`);
        let spec = `   ${p.metalType} • Net ${p.netWeight}g`;
        if (form.includeMaking) {
          spec += ` • Making ₹${this.formatInr(p.makingCharges)}`;
        }
        if (form.includePrice) {
          spec += ` • *₹${this.formatInr(p.sellingPrice)}*`;
        }
        lines.push(spec);
      });
    }

    const note = (form.customNote || '').trim();
    if (note) {
      lines.push('');
      lines.push(`💬 ${note}`);
    }

    if (form.includeShopInfo) {
      lines.push('');
      lines.push(`📞 ${shop.phone}`);
      lines.push(`📍 ${shop.address}`);
    }

    return lines.join('\n');
  });

  readonly whatsappUrl = computed(() => {
    const rawPhone = this.formValue().phone || '';
    const digits = rawPhone.replace(/[^\d]/g, '');
    const targetDigits = digits.length === 10 ? `91${digits}` : digits;
    const encodedText = encodeURIComponent(this.formattedMessage());
    return targetDigits
      ? `https://wa.me/${targetDigits}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;
  });

  pickCustomerPhone(phone: string) {
    this.shareForm.patchValue({ phone });
  }

  async copyMessage() {
    if (!isPlatformBrowser(this.platformId)) return;
    const msg = this.formattedMessage();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(msg);
        this.service.showToast('WhatsApp message copied to clipboard!');
      } else {
        this.service.showToast('Copy not supported in this browser.', 'error');
      }
    } catch {
      this.service.showToast('Could not copy message. Please select & copy.', 'error');
    }
  }

  async nativeShare() {
    if (!isPlatformBrowser(this.platformId) || typeof navigator.share !== 'function') return;
    try {
      await navigator.share({
        title: this.products().length === 1 ? this.products()[0].name : 'SwarnaMudra Jewellery Catalogue',
        text: this.formattedMessage()
      });
    } catch {
      // User dismissed native share sheet
    }
  }

  onWhatsappClick() {
    this.service.showToast('Opening WhatsApp...');
  }

  private formatInr(amount: number): string {
    return Math.round(amount).toLocaleString('en-IN');
  }
}
