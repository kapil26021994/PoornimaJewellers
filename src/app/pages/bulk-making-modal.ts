import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { JewelleryService } from '../services/jewellery.service';
import { Product } from '../models/jewellery.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-bulk-making-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-500/20 flex flex-col native-sheet">
        <!-- Header -->
        <div class="bg-neutral-900 text-white px-5 pt-2.5 pb-4 sm:p-5 border-b border-amber-500/20">
          <div class="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-3 sm:hidden"></div>
          <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
              <span class="material-icons">tune</span>
            </div>
            <div>
              <h3 class="font-bold text-base text-white">Bulk Update Making Charges</h3>
              <p class="text-[11px] text-amber-300">{{ selectedProducts().length }} jewellery items selected</p>
            </div>
          </div>
          <button (click)="dismiss.emit()" class="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition cursor-pointer" type="button">
            <span class="material-icons text-sm">close</span>
          </button>
          </div>
        </div>

        <!-- Form Body -->
        <form [formGroup]="bulkForm" (ngSubmit)="onSubmit()" class="p-5 space-y-4">
          <!-- Selected Items Preview Chips -->
          <div class="bg-neutral-50 border border-neutral-200 rounded-2xl p-3">
            <div class="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Selected SKUs</div>
            <div class="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              @for (prod of selectedProducts(); track prod.id) {
                <span class="px-2 py-0.5 rounded-lg bg-white border border-neutral-200 text-[10px] font-mono text-neutral-800">
                  {{ prod.code }} (₹{{ prod.makingCharges | number:'1.0-0' }})
                </span>
              }
            </div>
          </div>

          <!-- Operation Mode -->
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Update Action *
              <select formControlName="mode"
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 bg-white font-normal">
                <option value="increase">Increase Making Charges (+)</option>
                <option value="decrease">Decrease Making Charges (-)</option>
                <option value="set">Set Fixed Making Charges (=)</option>
              </select>
            </label>
          </div>

          <!-- Value & Unit -->
          <div class="grid grid-cols-3 gap-3">
            <div [class]="bulkForm.value.mode === 'set' ? 'col-span-3' : 'col-span-2'">
              <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                {{ bulkForm.value.mode === 'set' ? 'New Making Charges (₹) *' : 'Adjustment Value *' }}
                <input type="number" formControlName="value" min="0" placeholder="e.g. 1000"
                  class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 font-normal">
              </label>
            </div>

            @if (bulkForm.value.mode !== 'set') {
              <div>
                <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Unit
                  <select formControlName="unit"
                    class="w-full mt-1 px-3 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 bg-white font-normal">
                    <option value="amount">₹ (INR)</option>
                    <option value="percent">% (Pct)</option>
                  </select>
                </label>
              </div>
            }
          </div>

          @if (bulkForm.get('value')?.touched && bulkForm.get('value')?.invalid) {
            <div class="text-red-500 text-xs">Please enter a valid non-negative number.</div>
          }

          <!-- Selling Price Sync Option -->
          <label class="flex items-start space-x-2.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200 cursor-pointer">
            <input type="checkbox" formControlName="adjustSellingPrice"
              class="mt-0.5 w-4 h-4 accent-amber-600 rounded cursor-pointer">
            <div>
              <span class="text-xs font-bold text-neutral-900 block">Sync Selling Price Automatically</span>
              <span class="text-[11px] text-neutral-600 block">Adds or subtracts the making charge difference from each item's selling price.</span>
            </div>
          </label>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end space-x-2.5 pt-3 border-t border-neutral-200">
            <button type="button" (click)="dismiss.emit()"
              class="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold transition cursor-pointer">
              Cancel
            </button>
            <button type="submit" [disabled]="bulkForm.invalid"
              class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer">
              Apply to {{ selectedProducts().length }} Items
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class BulkMakingModal {
  private readonly service = inject(JewelleryService);
  private readonly fb = inject(FormBuilder);

  readonly selectedProducts = input.required<Product[]>();
  readonly dismiss = output<void>();
  readonly applied = output<void>();

  bulkForm = this.fb.group({
    mode: ['increase', Validators.required],
    value: [500, [Validators.required, Validators.min(0)]],
    unit: ['amount', Validators.required],
    adjustSellingPrice: [true]
  });

  onSubmit() {
    if (this.bulkForm.invalid) return;
    const val = this.bulkForm.value;
    const ids = this.selectedProducts().map(p => p.id);
    const mode = (val.mode || 'increase') as 'set' | 'increase' | 'decrease';
    const unit = mode === 'set' ? 'amount' : ((val.unit || 'amount') as 'amount' | 'percent');

    this.service.bulkUpdateMakingCharges(
      ids,
      mode,
      Number(val.value) || 0,
      unit,
      !!val.adjustSellingPrice
    );
    this.applied.emit();
  }
}
