import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { JewelleryService } from '../services/jewellery.service';
import { CategoryType } from '../models/jewellery.model';

@Component({
  selector: 'app-purchase-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden border border-amber-500/20 native-sheet">
        <!-- Header -->
        <div class="bg-neutral-900 text-white px-5 pt-2.5 pb-4 sm:p-5 border-b border-amber-500/20">
          <div class="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-3 sm:hidden"></div>
          <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
              <span class="material-icons">local_shipping</span>
            </div>
            <div>
              <h3 class="font-bold text-lg text-white">Record Bullion Purchase</h3>
              <p class="text-xs text-neutral-400">Add wholesale stock from verified bullion suppliers</p>
            </div>
          </div>
          <button (click)="dismiss.emit()" class="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition cursor-pointer" type="button">
            <span class="material-icons text-sm">close</span>
          </button>
          </div>
        </div>

        <!-- Form Body -->
        <form [formGroup]="purchaseForm" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Select Supplier *
              <select formControlName="supplierId" class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 bg-white font-normal">
                <option value="">-- Choose Bullion Supplier --</option>
                @for (sup of service.suppliers(); track sup.id) {
                  <option [value]="sup.id">{{ sup.companyName }} ({{ sup.name }})</option>
                }
              </select>
            </label>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Item / Bullion Name *
                <input type="text" formControlName="productName" placeholder="e.g. 22K Gold Bangles Batch" 
                  class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 font-normal">
              </label>
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Category *
                <select formControlName="category" class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 bg-white font-normal">
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Artificial">Artificial</option>
                </select>
              </label>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Total Weight (Grams) *
                <input type="number" step="0.1" formControlName="weight" placeholder="50.0" (input)="recalculate()"
                  class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 font-normal">
              </label>
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Rate per Gram (₹) *
                <input type="number" formControlName="ratePerGram" placeholder="6200" (input)="recalculate()"
                  class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 font-normal">
              </label>
            </div>
          </div>

          <div class="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex justify-between items-center text-sm">
            <span class="font-bold text-neutral-800">Total Purchase Amount:</span>
            <span class="font-extrabold text-amber-800 text-base">₹{{ totalAmount() | number:'1.0-0' }}</span>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200 mt-6">
            <button type="button" (click)="dismiss.emit()" class="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold transition cursor-pointer">
              Cancel
            </button>
            <button type="submit" [disabled]="purchaseForm.invalid" class="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer">
              Record Purchase
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PurchaseModal {
  readonly service = inject(JewelleryService);
  readonly fb = inject(FormBuilder);
  readonly dismiss = output<void>();

  purchaseForm = this.fb.group({
    supplierId: ['', Validators.required],
    productName: ['', Validators.required],
    category: ['Gold', Validators.required],
    weight: [50, [Validators.required, Validators.min(0.1)]],
    ratePerGram: [6500, [Validators.required, Validators.min(1)]]
  });

  totalAmount = signal<number>(325000);

  recalculate() {
    const val = this.purchaseForm.value;
    const w = Number(val.weight) || 0;
    const r = Number(val.ratePerGram) || 0;
    this.totalAmount.set(w * r);
  }

  onSubmit() {
    if (this.purchaseForm.invalid) return;
    const val = this.purchaseForm.value;
    const sup = this.service.suppliers().find(s => s.id === val.supplierId);

    this.service.addPurchase({
      supplierId: val.supplierId || '',
      supplierName: sup ? sup.companyName : 'Wholesale Supplier',
      items: [
        {
          productName: val.productName || '',
          category: (val.category as CategoryType) || 'Gold',
          weight: Number(val.weight) || 0,
          ratePerGram: Number(val.ratePerGram) || 0,
          total: this.totalAmount()
        }
      ],
      totalAmount: this.totalAmount(),
      status: 'Received'
    });
    this.dismiss.emit();
  }
}
