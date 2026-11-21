import { Component, inject, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';
import { Customer } from '../models/jewellery.model';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-xl w-full max-h-[90dvh] flex flex-col overflow-hidden border border-amber-500/20 native-sheet">
        <!-- Header -->
        <div class="bg-neutral-900 text-white px-5 pt-2.5 pb-4 sm:p-5 border-b border-amber-500/20 shrink-0">
          <div class="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-3 sm:hidden"></div>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3 min-w-0">
              <div class="w-10 h-10 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center font-bold text-lg shrink-0">
                {{ customer().name.charAt(0) }}
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-base sm:text-lg text-white truncate">{{ customer().name }}</h3>
                <p class="text-xs text-amber-400">Loyalty Points: {{ customer().loyaltyPoints }} Pts</p>
              </div>
            </div>
            <button (click)="dismiss.emit()" class="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition cursor-pointer shrink-0" type="button">
              <span class="material-icons text-sm">close</span>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-neutral-50/50">
          <!-- Info Grid -->
          <div class="bg-white p-4 rounded-2xl border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="min-w-0">
              <span class="text-neutral-400 block uppercase font-bold text-[10px]">Phone Number</span>
              <span class="font-semibold text-neutral-900 text-sm mt-0.5 block">{{ customer().phone }}</span>
            </div>
            <div class="min-w-0">
              <span class="text-neutral-400 block uppercase font-bold text-[10px]">Email Address</span>
              <span class="font-semibold text-neutral-900 text-sm mt-0.5 block break-all">{{ customer().email || 'Not Provided' }}</span>
            </div>
            <div class="sm:col-span-2 min-w-0">
              <span class="text-neutral-400 block uppercase font-bold text-[10px]">Residential Address</span>
              <span class="font-semibold text-neutral-900 text-sm mt-0.5 block break-words">{{ customer().address }}</span>
            </div>
          </div>

          <!-- Purchase History -->
          <div class="space-y-3">
            <h4 class="font-bold text-neutral-900 text-sm flex items-center">
              <span class="material-icons text-amber-600 mr-2">shopping_bag</span> Purchase History
            </h4>

            @if (customerSales().length === 0) {
              <div class="bg-white p-6 rounded-2xl border border-neutral-200 text-center text-xs text-neutral-400">
                No purchases recorded for this customer yet.
              </div>
            } @else {
              @for (sale of customerSales(); track sale.id) {
                <div class="bg-white p-4 rounded-2xl border border-neutral-200 flex items-center justify-between">
                  <div>
                    <div class="font-bold text-neutral-900 text-xs">{{ sale.invoiceNo }} • <span class="text-amber-700">₹{{ sale.grandTotal | number:'1.0-0' }}</span></div>
                    <div class="text-[11px] text-neutral-500 mt-0.5">Date: {{ sale.date }} | Mode: {{ sale.paymentMode }}</div>
                  </div>
                  <span class="px-2 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full">Completed</span>
                </div>
              }
            }
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 bg-white border-t border-neutral-200 flex justify-end">
          <button (click)="dismiss.emit()" class="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition cursor-pointer" type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  `
})
export class CustomerDetail {
  readonly service = inject(JewelleryService);
  readonly customer = input.required<Customer>();
  readonly dismiss = output<void>();

  readonly customerSales = computed(() => {
    const c = this.customer();
    return this.service.sales().filter(s => s.customerName.toLowerCase() === c.name.toLowerCase() || s.customerPhone === c.phone);
  });
}
