import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';
import { Sale } from '../models/jewellery.model';

@Component({
  selector: 'app-invoice-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92dvh] flex flex-col overflow-hidden border border-amber-500/20 native-sheet">
        <!-- Header Actions -->
        <div class="bg-neutral-900 text-white px-4 pt-2.5 pb-3.5 sm:p-4 border-b border-amber-500/20 shrink-0">
          <div class="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-2.5 sm:hidden"></div>
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center space-x-2 min-w-0">
              <span class="material-icons text-amber-400 shrink-0" [style.fontSize.px]="20">receipt_long</span>
              <span class="font-bold text-xs sm:text-sm truncate">
                {{ sale().billType === 'GST' ? 'Tax Invoice' : 'Estimate Bill' }} #{{ sale().invoiceNo }}
              </span>
            </div>
            <div class="flex items-center space-x-2 shrink-0">
              <button (click)="printInvoice()" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition flex items-center cursor-pointer active:scale-95" type="button">
                <span class="material-icons mr-1" [style.fontSize.px]="14">print</span> Print
              </button>
              <button (click)="dismiss.emit()" class="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition cursor-pointer" type="button">
                <span class="material-icons" [style.fontSize.px]="16">close</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Printable Invoice Body -->
        <div class="p-3 sm:p-6 overflow-y-auto text-neutral-800 flex-1 bg-neutral-100/70">
          <div class="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-neutral-200 space-y-4 sm:space-y-5">
            <!-- Shop & Invoice Meta -->
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 border-b border-neutral-200 pb-4">
              <div class="min-w-0">
                <h1 class="text-base sm:text-xl font-extrabold text-neutral-950 flex items-center">
                  <span class="material-icons text-amber-600 mr-1.5 shrink-0" [style.fontSize.px]="20">diamond</span>
                  <span class="truncate">{{ settings.shopName }}</span>
                </h1>
                <p class="text-[11px] text-neutral-500 mt-1 break-words">{{ settings.address }}</p>
                <p class="text-[11px] text-neutral-600 mt-0.5 break-all">
                  Ph: {{ settings.phone }} | GSTIN: {{ settings.gstin }}
                </p>
              </div>
              <div class="flex sm:flex-col items-center sm:items-end justify-between bg-amber-50/70 sm:bg-transparent px-3 py-2 sm:p-0 rounded-xl border border-amber-200/60 sm:border-0 shrink-0">
                <div class="text-xs sm:text-base font-extrabold text-amber-700 tracking-wide">
                  {{ sale().billType === 'GST' ? 'TAX INVOICE' : 'ESTIMATE BILL' }}
                </div>
                <div class="text-right">
                  <div class="text-[11px] font-mono font-bold text-neutral-900">{{ sale().invoiceNo }}</div>
                  <div class="text-[10px] text-neutral-500">Date: {{ sale().date }}</div>
                </div>
              </div>
            </div>

            <!-- Customer Details -->
            <div class="bg-neutral-50 p-3 sm:p-4 rounded-xl border border-neutral-200 flex flex-wrap justify-between items-center gap-2 text-xs">
              <div class="min-w-0">
                <span class="text-neutral-400 block uppercase font-bold text-[9px] tracking-wider">Billed To</span>
                <strong class="text-neutral-900 text-xs sm:text-sm block mt-0.5 truncate">{{ sale().customerName }}</strong>
                <span class="text-[11px] text-neutral-600">{{ sale().customerPhone }}</span>
                @if (sale().customerAddress) {
                  <span class="text-[11px] text-neutral-600 block">{{ sale().customerAddress }}</span>
                }
              </div>
              <div class="text-right shrink-0">
                <span class="text-neutral-400 block uppercase font-bold text-[9px] tracking-wider">Payment</span>
                <span class="inline-block mt-0.5 px-2.5 py-0.5 font-bold rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
                  {{ sale().paymentMode }}
                </span>
              </div>
            </div>

            <!-- Items Table -->
            <div class="overflow-x-auto -mx-1 px-1">
              <table class="w-full text-left text-[11px] sm:text-xs min-w-[300px]">
                <thead>
                  <tr class="border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[10px]">
                    <th class="py-2 pr-2 font-bold">Item</th>
                    <th class="py-2 px-1.5 font-bold text-center whitespace-nowrap">Qty / Wt</th>
                    <th class="py-2 px-1.5 font-bold text-right whitespace-nowrap">Rate</th>
                    <th class="py-2 pl-1.5 font-bold text-right whitespace-nowrap">Amount</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100">
                  @for (item of sale().items; track item.productId) {
                    <tr>
                      <td class="py-2.5 pr-2">
                        <div class="font-bold text-neutral-900 leading-snug">{{ item.productName }}</div>
                        <div class="text-[10px] font-mono text-neutral-500">{{ item.productCode }}</div>
                      </td>
                      <td class="py-2.5 px-1.5 text-center whitespace-nowrap">
                        <div class="font-medium">{{ item.quantity }} Pcs</div>
                        <div class="text-[10px] text-neutral-500">Gross: {{ item.grossWeight }}g | Net: {{ item.netWeight }}g</div>
                      </td>
                      <td class="py-2.5 px-1.5 text-right whitespace-nowrap tabular-nums">₹{{ item.unitPrice | number:'1.0-0' }}</td>
                      <td class="py-2.5 pl-1.5 text-right font-bold text-neutral-900 whitespace-nowrap tabular-nums">₹{{ item.total | number:'1.0-0' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Summary Totals -->
            <div class="border-t border-neutral-200 pt-3 space-y-1.5 text-xs">
              <div class="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span class="tabular-nums font-medium">₹{{ sale().subtotal | number:'1.0-0' }}</span>
              </div>
              @if (sale().discountTotal > 0) {
                <div class="flex justify-between text-emerald-600 font-medium">
                  <span>Discount Applied</span>
                  <span class="tabular-nums">-₹{{ sale().discountTotal | number:'1.0-0' }}</span>
                </div>
              }
              @if (sale().oldJewellery && sale().oldJewellery!.totalValue > 0) {
                <div class="flex justify-between text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                  <span>Old Jewellery Exchange (Net Wt: {{ sale().oldJewellery!.netWeight }}g @ ₹{{ sale().oldJewellery!.ratePerGram }}/g)</span>
                  <span class="tabular-nums font-bold">-₹{{ sale().oldJewellery!.totalValue | number:'1.0-0' }}</span>
                </div>
              }
              @if (sale().billType === 'GST') {
                <div class="flex justify-between text-neutral-600">
                  <span>GST ({{ sale().gstRate }}% Tax)</span>
                  <span class="tabular-nums font-medium">₹{{ sale().gstAmount | number:'1.0-0' }}</span>
                </div>
              } @else {
                <div class="flex justify-between text-neutral-400 italic text-[11px]">
                  <span>Estimate Bill (No GST levied)</span>
                  <span>₹0</span>
                </div>
              }
              <div class="flex justify-between text-sm sm:text-base font-extrabold text-neutral-950 pt-2 border-t border-neutral-200">
                <span>Grand Total</span>
                <span class="text-amber-700 tabular-nums">₹{{ sale().grandTotal | number:'1.0-0' }}</span>
              </div>
            </div>

            <!-- Hallmark & Signature -->
            <div class="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 text-[11px] text-neutral-500">
              <div>
                <p class="font-medium text-neutral-600">BIS Hallmarked Pure Gold &amp; Certified Diamonds.</p>
                <p class="mt-0.5">Goods once sold will be taken back as per store exchange policy.</p>
              </div>
              <div class="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-dashed border-neutral-200 shrink-0">
                <div class="font-bold text-neutral-900">{{ settings.shopName }}</div>
                <div class="text-[10px] text-neutral-400">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InvoiceModal {
  readonly service = inject(JewelleryService);
  readonly sale = input.required<Sale>();
  readonly dismiss = output<void>();

  readonly settings = this.service.settings();

  printInvoice() {
    window.print();
  }
}
