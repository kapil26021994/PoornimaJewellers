import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';
import { ExpenseModal } from './expense-modal';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ExpenseModal],
  template: `
    <div class="space-y-4 lg:space-y-5 pb-24 lg:pb-8 relative min-h-[75vh]">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl shadow-sm border border-neutral-200">
        <div>
          <h2 class="text-xl font-bold text-neutral-900 tracking-tight">Shop Operating Expenses</h2>
          <p class="text-xs text-neutral-500">Track rent, salaries, BIS hallmarking test fees and utilities</p>
        </div>
        <button
          type="button"
          (click)="isModalOpen.set(true)"
          class="hidden lg:inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition cursor-pointer shrink-0">
          <span class="material-icons text-base">receipt</span>
          <span>Record Expense</span>
        </button>
      </div>

      <!-- Total Expenses KPI -->
      <div class="bg-white rounded-3xl p-5 border border-neutral-200 flex items-center justify-between shadow-xs">
        <div>
          <span class="text-xs font-medium text-neutral-500">Total Operating Expenses</span>
          <div class="text-2xl font-extrabold text-neutral-900 mt-1 tabular-nums">₹{{ totalExpensesAmount() | number:'1.0-0' }}</div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
          <span class="material-icons text-2xl">account_balance_wallet</span>
        </div>
      </div>

      @if (service.expenses().length === 0) {
        <div class="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-xs">
          <span class="material-icons text-5xl text-neutral-300 mb-3">receipt</span>
          <h4 class="font-bold text-neutral-800 text-base">No expenses recorded yet.</h4>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          @for (exp of service.expenses(); track exp.id) {
            <div class="bg-white rounded-3xl p-5 shadow-xs border border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold shrink-0">
                  <span class="material-icons">payments</span>
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-bold text-neutral-900 text-sm">{{ exp.title }}</span>
                    <span class="px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full">
                      {{ exp.category }}
                    </span>
                  </div>
                  <div class="text-xs text-neutral-500 mt-1">Date: {{ exp.date }} • Paid via: {{ exp.paidBy }}</div>
                  @if (exp.notes) {
                    <div class="text-xs text-neutral-600 mt-1 italic">{{ exp.notes }}</div>
                  }
                </div>
              </div>

              <div class="text-right shrink-0">
                <span class="text-[10px] text-neutral-400 block uppercase font-bold">Amount</span>
                <span class="text-lg font-extrabold text-red-600 tabular-nums">-₹{{ exp.amount | number:'1.0-0' }}</span>
              </div>
            </div>
          }
        </div>
      }

      <div class="fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom))] right-6 z-30 lg:hidden">
        <button (click)="isModalOpen.set(true)" type="button"
          class="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-5 py-4 rounded-3xl shadow-xl shadow-amber-500/30 flex items-center space-x-2 transition hover:scale-105 active:scale-95 cursor-pointer border border-amber-400/50">
          <span class="material-icons text-2xl">receipt</span>
          <span class="text-xs font-bold tracking-wide pr-1">Record Expense</span>
        </button>
      </div>

      @if (isModalOpen()) {
        <app-expense-modal (dismiss)="isModalOpen.set(false)"></app-expense-modal>
      }
    </div>
  `
})
export class Expenses {
  readonly service = inject(JewelleryService);
  readonly isModalOpen = signal<boolean>(false);

  readonly totalExpensesAmount = computed(() => {
    return this.service.expenses().reduce((acc, e) => acc + e.amount, 0);
  });
}
