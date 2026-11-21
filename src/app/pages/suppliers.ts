import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';
import { SupplierModal } from './supplier-modal';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, SupplierModal],
  template: `
    <div class="space-y-6 pb-20">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
        <div>
          <h2 class="text-xl font-bold text-neutral-900 tracking-tight">Bullion Suppliers & Refiners</h2>
          <p class="text-xs text-neutral-500">Manage wholesale vendors, credit ledger balances and contacts</p>
        </div>
        <button (click)="isModalOpen.set(true)" class="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center transition shadow-lg shadow-amber-500/20 cursor-pointer shrink-0">
          <span class="material-icons text-sm mr-1.5">business</span> Add Supplier
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (sup of service.suppliers(); track sup.id) {
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <span class="material-icons">factory</span>
                </div>
                <span class="px-2.5 py-1 text-[10px] font-bold bg-neutral-100 text-neutral-800 rounded-full">
                  {{ sup.metalSupplied }}
                </span>
              </div>
              <h4 class="font-bold text-neutral-900 text-base">{{ sup.companyName }}</h4>
              <div class="text-xs font-semibold text-neutral-700 mt-0.5">Contact: {{ sup.name }} ({{ sup.phone }})</div>
              <p class="text-xs text-neutral-500 mt-2">{{ sup.email }}</p>
            </div>

            <div class="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-neutral-400 block uppercase">Balance Due</span>
                <span class="text-sm font-extrabold text-red-600">₹{{ sup.balanceDue | number:'1.0-0' }}</span>
              </div>
              <span class="text-xs font-semibold text-amber-700">Active Vendor</span>
            </div>
          </div>
        }
      </div>

      @if (isModalOpen()) {
        <app-supplier-modal (dismiss)="isModalOpen.set(false)"></app-supplier-modal>
      }
    </div>
  `
})
export class Suppliers {
  readonly service = inject(JewelleryService);
  readonly isModalOpen = signal<boolean>(false);
}
