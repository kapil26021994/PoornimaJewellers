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
    <div id="invoice-modal-root" class="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="invoice-modal-dialog bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92dvh] flex flex-col overflow-hidden border border-amber-500/20 native-sheet">
        <!-- Header Actions -->
        <div class="invoice-modal-actions bg-neutral-900 text-white px-4 pt-2.5 pb-3.5 sm:p-4 border-b border-amber-500/20 shrink-0">
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
        <div class="invoice-modal-body p-3 sm:p-6 overflow-y-auto text-neutral-800 flex-1 bg-neutral-100/70">
          <div id="invoice-print-area" class="bg-white p-4 sm:p-7 shadow-xs border border-neutral-300 text-neutral-900 space-y-4">
            <div class="text-center rounded-lg border-b-4 border-amber-500 bg-neutral-900 px-3 py-2.5 text-[10px]">
              <div class="font-extrabold uppercase tracking-widest text-amber-300">
                {{ sale().billType === 'GST' ? 'GST Invoice' : 'Estimate Bill' }}
              </div>
            </div>

            <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-[10px]">
              <div class="min-w-0 font-semibold text-amber-900">GSTIN: {{ settings.gstin }}</div>
              <div class="text-center min-w-0">
                <h1 class="text-lg sm:text-2xl font-black uppercase tracking-[0.08em] text-amber-900 whitespace-nowrap">{{ settings.shopName }}</h1>
                <div class="mx-auto mt-1 h-0.5 w-14 rounded-full bg-amber-500"></div>
                <p class="mt-1 text-[9px] sm:text-[11px] uppercase tracking-wider text-neutral-600">{{ settings.address }}</p>
              </div>
              <div class="min-w-0 text-right font-semibold text-amber-900 whitespace-pre-line break-words">{{ settings.phone }}</div>
            </div>

            <div class="grid grid-cols-2 border-y border-neutral-400 divide-x divide-neutral-300 text-xs">
              <div class="px-3 py-2"><span class="font-bold">Bill No.:</span> {{ sale().invoiceNo }}</div>
              <div class="px-3 py-2 text-right"><span class="font-bold">Date:</span> {{ sale().date }}</div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 border-b border-neutral-300 text-xs">
              <div class="py-3 sm:pr-4 sm:border-r border-neutral-300">
                <div class="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Customer Details</div>
                <div class="font-bold text-sm mt-1">{{ sale().customerName }}</div>
                <div class="text-neutral-600 mt-0.5">Ph: {{ sale().customerPhone }}</div>
                @if (sale().customerAddress) {
                  <div class="text-neutral-600 mt-0.5">{{ sale().customerAddress }}</div>
                }
              </div>
              <div class="py-3 sm:pl-4">
                <div class="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Payment Details</div>
                <div class="mt-1"><span class="font-semibold">Payment mode:</span> {{ sale().paymentMode }}</div>
                <div class="mt-0.5"><span class="font-semibold">Bill type:</span> {{ sale().billType === 'GST' ? 'Tax Invoice' : 'Estimate' }}</div>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-[10px] sm:text-[11px] min-w-[900px] border-collapse">
                <thead>
                  <tr class="bg-neutral-100 text-neutral-700 uppercase tracking-wide">
                    <th class="border border-neutral-400 px-1.5 py-2 font-bold">Description</th>
                    <th class="border border-neutral-400 px-1.5 py-2 font-bold">Purity</th>
                    <th class="border border-neutral-400 px-1.5 py-2 text-right font-bold whitespace-nowrap">Gross Wt. (g)</th>
                    <th class="border border-neutral-400 px-1.5 py-2 text-right font-bold whitespace-nowrap">Net Wt. (g)</th>
                    <th class="border border-neutral-400 px-1.5 py-2 text-center font-bold">Pcs</th>
                    <th class="border border-neutral-400 px-1.5 py-2 text-right font-bold">Rate</th>
                    <th class="border border-neutral-400 px-1.5 py-2 text-right font-bold">Value</th>
                    <th class="border border-neutral-400 px-1.5 py-2 text-right font-bold whitespace-nowrap">Making Charges</th>
                    <th class="border border-neutral-400 px-1.5 py-2 text-right font-bold whitespace-nowrap">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of sale().items; track $index) {
                    <tr>
                      <td class="border border-neutral-400 px-1.5 py-2">
                        <div class="font-bold">{{ item.productName }}</div>
                        <div class="text-[9px] text-neutral-500">{{ item.productCode }}</div>
                      </td>
                      <td class="border border-neutral-400 px-1.5 py-2 whitespace-nowrap">{{ item.purity || '—' }}</td>
                      <td class="border border-neutral-400 px-1.5 py-2 text-right tabular-nums">{{ item.grossWeight | number:'1.0-3' }}</td>
                      <td class="border border-neutral-400 px-1.5 py-2 text-right tabular-nums">{{ item.netWeight | number:'1.0-3' }}</td>
                      <td class="border border-neutral-400 px-1.5 py-2 text-center tabular-nums">{{ item.quantity }}</td>
                      <td class="border border-neutral-400 px-1.5 py-2 text-right tabular-nums">
                        @if (item.jewelleryRate !== undefined) { ₹{{ item.jewelleryRate | number:'1.0-0' }} } @else { — }
                      </td>
                      <td class="border border-neutral-400 px-1.5 py-2 text-right tabular-nums">₹{{ item.unitPrice | number:'1.0-0' }}</td>
                      <td class="border border-neutral-400 px-1.5 py-2 text-right tabular-nums">₹{{ (item.makingCharges || 0) | number:'1.0-0' }}</td>
                      <td class="border border-neutral-400 px-1.5 py-2 text-right font-bold tabular-nums">₹{{ item.total | number:'1.0-0' }}</td>
                    </tr>
                  }
                  <tr class="font-bold bg-neutral-50">
                    <td class="border border-neutral-400 px-1.5 py-1.5" colspan="4">Total</td>
                    <td class="border border-neutral-400 px-1.5 py-1.5 text-center">{{ totalPieces() }}</td>
                    <td class="border border-neutral-400 px-1.5 py-1.5" colspan="3"></td>
                    <td class="border border-neutral-400 px-1.5 py-1.5 text-right tabular-nums">₹{{ sale().subtotal | number:'1.0-0' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-[1fr_320px] gap-4 border-b border-neutral-300 pb-4">
              <div class="space-y-2 text-[11px] text-neutral-600">
                @if (sale().oldJewellery && sale().oldJewellery!.totalValue > 0) {
                  <div class="flex justify-between gap-3 text-emerald-800 border border-emerald-200 px-2.5 py-2">
                    <span>Old Jewellery Exchange (Net Wt: {{ sale().oldJewellery!.netWeight }}g @ ₹{{ sale().oldJewellery!.ratePerGram }}/g)</span>
                    <span class="font-bold tabular-nums whitespace-nowrap">-₹{{ sale().oldJewellery!.totalValue | number:'1.0-0' }}</span>
                  </div>
                }
                @if (sale().discountTotal > 0) {
                  <div class="flex justify-between gap-3 text-emerald-800">
                    <span>Discount Applied</span>
                    <span class="font-bold tabular-nums">-₹{{ sale().discountTotal | number:'1.0-0' }}</span>
                  </div>
                }
                <div class="pt-2 font-semibold">Payment received via {{ sale().paymentMode }}</div>
                <div class="text-[10px] text-neutral-500">Goods once sold will be taken back as per store exchange policy.</div>
              </div>

              <div class="space-y-1.5 text-xs">
                <div class="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span class="tabular-nums">₹{{ sale().subtotal | number:'1.0-0' }}</span>
                </div>
                @if (sale().billType === 'GST') {
                  <div class="flex justify-between text-neutral-600">
                    <span>SGST ({{ sale().gstRate / 2 | number:'1.0-2' }}%)</span>
                    <span class="tabular-nums">₹{{ sale().gstAmount / 2 | number:'1.0-0' }}</span>
                  </div>
                  <div class="flex justify-between text-neutral-600">
                    <span>CGST ({{ sale().gstRate / 2 | number:'1.0-2' }}%)</span>
                    <span class="tabular-nums">₹{{ sale().gstAmount / 2 | number:'1.0-0' }}</span>
                  </div>
                } @else {
                  <div class="flex justify-between text-neutral-500 italic">
                    <span>Estimate Bill (No GST levied)</span>
                    <span>₹0</span>
                  </div>
                }
                <div class="flex justify-between items-center border-t-2 border-neutral-800 pt-2 text-base font-extrabold">
                  <span>Total Amount</span>
                  <span class="tabular-nums">₹{{ sale().grandTotal | number:'1.0-0' }}</span>
                </div>
              </div>
            </div>

            <div class="flex justify-between items-end gap-4 pt-1 text-[10px] text-neutral-600">
              <div>
                <p class="font-semibold">BIS Hallmarked Pure Gold &amp; Certified Diamonds.</p>
                <p class="mt-0.5">Thank you for shopping with us.</p>
              </div>
              <div class="text-right shrink-0">
                <div class="font-bold text-neutral-900">{{ settings.shopName }}</div>
                <div class="mt-5 border-t border-neutral-400 pt-1">Authorized Signatory</div>
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

  totalPieces(): number {
    return this.sale().items.reduce((sum, item) => sum + item.quantity, 0);
  }

  printInvoice() {
    window.print();
  }
}
