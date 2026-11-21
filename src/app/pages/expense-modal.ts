import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { JewelleryService } from '../services/jewellery.service';

@Component({
  selector: 'app-expense-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-amber-500/20 native-sheet">
        <!-- Header -->
        <div class="bg-neutral-900 text-white px-5 pt-2.5 pb-4 sm:p-5 border-b border-amber-500/20">
          <div class="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-3 sm:hidden"></div>
          <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
              <span class="material-icons">receipt</span>
            </div>
            <div>
              <h3 class="font-bold text-lg text-white">Record Shop Expense</h3>
              <p class="text-xs text-neutral-400">Log rent, salaries, testing fees and utilities</p>
            </div>
          </div>
          <button (click)="dismiss.emit()" class="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition cursor-pointer" type="button">
            <span class="material-icons text-sm">close</span>
          </button>
          </div>
        </div>

        <!-- Form Body -->
        <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Expense Title *
              <input type="text" formControlName="title" placeholder="e.g. Electricity Bill February" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 font-normal">
            </label>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Category *
                <select formControlName="category" class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 bg-white font-normal">
                  <option value="Rent">Rent</option>
                  <option value="Salary">Salary</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Hallmarking & Testing">Hallmarking & Testing</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Amount (₹) *
                <input type="number" formControlName="amount" placeholder="15000" 
                  class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 font-normal">
              </label>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Date *
                <input type="date" formControlName="date" 
                  class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 font-normal">
              </label>
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Paid By *
                <select formControlName="paidBy" class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 bg-white font-normal">
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Notes / Description
              <textarea formControlName="notes" rows="2" placeholder="Optional details..." 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 resize-none font-normal"></textarea>
            </label>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200 mt-6">
            <button type="button" (click)="dismiss.emit()" class="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold transition cursor-pointer">
              Cancel
            </button>
            <button type="submit" [disabled]="expenseForm.invalid" class="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer">
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ExpenseModal {
  readonly service = inject(JewelleryService);
  readonly fb = inject(FormBuilder);
  readonly dismiss = output<void>();

  expenseForm = this.fb.group({
    title: ['', Validators.required],
    category: ['Utilities', Validators.required],
    amount: [5000, [Validators.required, Validators.min(1)]],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    paidBy: ['Bank Transfer', Validators.required],
    notes: ['']
  });

  onSubmit() {
    if (this.expenseForm.invalid) return;
    const val = this.expenseForm.value;
    const validCat = (val.category || 'Utilities') as 'Rent' | 'Salary' | 'Utilities' | 'Hallmarking & Testing' | 'Marketing' | 'Maintenance' | 'Other';
    this.service.addExpense({
      title: val.title || '',
      category: validCat,
      amount: Number(val.amount) || 0,
      date: val.date || '',
      paidBy: val.paidBy || '',
      notes: val.notes || ''
    });
    this.dismiss.emit();
  }
}
