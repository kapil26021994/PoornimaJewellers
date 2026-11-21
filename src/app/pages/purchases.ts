import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';
import { PurchaseModal } from './purchase-modal';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, PurchaseModal],
  template: `
    <div class="space-y-4 lg:space-y-5 pb-24 lg:pb-8 relative min-h-[75vh]">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl shadow-sm border border-neutral-200">
        <div>
          <h2 class="text-xl font-bold text-neutral-900 tracking-tight">Bullion Purchases & Supplier Orders</h2>
          <p class="text-xs text-neutral-500">Track raw gold, silver and gemstone wholesale procurement</p>
        </div>
        <button
          type="button"
          (click)="isModalOpen.set(true)"
          class="hidden lg:inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition cursor-pointer shrink-0">
          <span class="material-icons text-base">local_shipping</span>
          <span>Record Purchase</span>
        </button>
      </div>

      @if (service.purchases().length === 0) {
        <div class="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-xs">
          <span class="material-icons text-5xl text-neutral-300 mb-3">local_mall</span>
          <h4 class="font-bold text-neutral-800 text-base">No purchases recorded</h4>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          @for (pur of service.purchases(); track pur.id) {
            <div class="bg-white rounded-3xl p-5 shadow-xs border border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
                  <span class="material-icons">inventory</span>
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-bold text-neutral-900 text-sm">{{ pur.purchaseNo }}</span>
                    <span class="px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full">Received</span>
                  </div>
                  <div class="text-xs font-semibold text-neutral-800 mt-0.5">{{ pur.supplierName }}</div>
                  <div class="text-[11px] text-neutral-500 mt-1">Date: {{ pur.date }} • Items: {{ pur.items.length }}</div>
                </div>
              </div>

              <div class="text-right shrink-0">
                <span class="text-[10px] text-neutral-400 block uppercase font-bold">Total Amount</span>
                <span class="text-lg font-extrabold text-neutral-900 tabular-nums">₹{{ pur.totalAmount | number:'1.0-0' }}</span>
              </div>
            </div>
          }
        </div>
      }

      <div class="fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom))] right-6 z-30 lg:hidden">
        <button (click)="isModalOpen.set(true)" type="button"
          class="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-5 py-4 rounded-3xl shadow-xl shadow-amber-500/30 flex items-center space-x-2 transition hover:scale-105 active:scale-95 cursor-pointer border border-amber-400/50">
          <span class="material-icons text-2xl">local_shipping</span>
          <span class="text-xs font-bold tracking-wide pr-1">Record Purchase</span>
        </button>
      </div>

      @if (isModalOpen()) {
        <app-purchase-modal (dismiss)="isModalOpen.set(false)"></app-purchase-modal>
      }
    </div>
  `
})
export class Purchases {
  readonly service = inject(JewelleryService);
  readonly isModalOpen = signal<boolean>(false);
}
