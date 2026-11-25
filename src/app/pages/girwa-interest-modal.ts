import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JewelleryService } from '../services/jewellery.service';
import { GirwaRecord } from '../models/jewellery.model';

@Component({
  selector: 'app-girwa-interest-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl max-w-xl w-full max-h-[92dvh] flex flex-col overflow-hidden border border-neutral-300">
        <!-- Header -->
        <div class="bg-neutral-900 text-white px-4 py-3 sm:px-5 sm:py-3.5 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div class="flex items-center space-x-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
              <span class="material-icons text-base">payments</span>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="font-bold text-sm sm:text-base text-white">Interest & Settlement (ब्याज एवं चुकता)</h3>
                <span class="text-[11px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-amber-300 border border-neutral-700">
                  {{ record().girwaNo }}
                </span>
              </div>
              <p class="text-[11px] text-neutral-400">
                {{ record().customerName }} ({{ record().customerPhone }})
              </p>
            </div>
          </div>
          <button (click)="dismiss.emit()" type="button" class="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer">
            <span class="material-icons text-base">close</span>
          </button>
        </div>

        <!-- Loan Summary Ribbon -->
        <div class="bg-amber-50/70 border-b border-amber-200/80 px-4 py-2.5 sm:px-5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span class="text-neutral-500">Principal (मूलधन):</span>
            <span class="ml-1 font-bold text-neutral-900">₹{{ record().loanAmount | number:'1.0-0' }}</span>
            <span class="text-[11px] text-neutral-500 ml-1">@ {{ record().interestRateMonthly }}%/mo</span>
          </div>
          <div>
            <span class="text-neutral-500">Duration:</span>
            <span class="ml-1 font-semibold text-neutral-800">{{ financials().elapsedMonths }} mo ({{ financials().elapsedDays }} days)</span>
          </div>
          <div>
            <span class="text-neutral-500">Pending Interest:</span>
            <span class="ml-1 font-bold text-rose-600">₹{{ financials().pendingInterest | number:'1.0-0' }}</span>
          </div>
        </div>

        <!-- Mode Toggle: Pay Interest vs Settle & Release -->
        <div class="p-4 sm:p-5 pb-0 flex border-b border-neutral-200 bg-neutral-50">
          <button
            type="button"
            (click)="activeTab.set('payment')"
            [class]="activeTab() === 'payment' ? 'border-b-2 border-amber-600 text-amber-700 font-bold bg-white' : 'text-neutral-600 hover:text-neutral-900'"
            class="px-4 py-2 text-xs rounded-t-lg transition flex items-center space-x-1.5 cursor-pointer">
            <span class="material-icons text-xs">add_card</span>
            <span>Pay Interest (ब्याज जमा)</span>
          </button>
          <button
            type="button"
            (click)="activeTab.set('settle')"
            [disabled]="record().status === 'Released'"
            [class]="activeTab() === 'settle' ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold bg-white' : 'text-neutral-600 hover:text-neutral-900'"
            class="px-4 py-2 text-xs rounded-t-lg transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-40">
            <span class="material-icons text-xs">lock_open</span>
            <span>Settle & Release (जेवर छुड़ाएं)</span>
          </button>
          <button
            type="button"
            (click)="activeTab.set('history')"
            [class]="activeTab() === 'history' ? 'border-b-2 border-blue-600 text-blue-700 font-bold bg-white' : 'text-neutral-600 hover:text-neutral-900'"
            class="px-4 py-2 text-xs rounded-t-lg transition flex items-center space-x-1.5 cursor-pointer ml-auto">
            <span class="material-icons text-xs">history</span>
            <span>History ({{ record().interestPayments.length }})</span>
          </button>
        </div>

        <!-- Body Content -->
        <div class="p-4 sm:p-5 overflow-y-auto flex-1 text-neutral-800">
          <!-- TAB 1: PAY MONTHLY INTEREST -->
          @if (activeTab() === 'payment') {
            @if (record().status === 'Released') {
              <div class="p-4 rounded-xl bg-neutral-100 border border-neutral-200 text-center text-xs text-neutral-600">
                <span class="material-icons text-neutral-400 text-2xl mb-1">lock</span>
                <p class="font-bold text-neutral-800">This Girwa loan is already fully Settled & Released.</p>
                <p>No further interest payments can be recorded.</p>
              </div>
            } @else {
              <form [formGroup]="paymentForm" (ngSubmit)="onRecordPayment()" class="space-y-4">
                <!-- Quick Autofill presets -->
                <div class="space-y-1.5">
                  <span class="text-[11px] font-semibold text-neutral-600">Quick Presets:</span>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      (click)="setPreset(financials().monthlyInterestAmount, 1)"
                      class="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-medium border border-amber-300 transition cursor-pointer">
                      1 Month: ₹{{ financials().monthlyInterestAmount | number:'1.0-0' }}
                    </button>
                    @if (financials().pendingInterest > financials().monthlyInterestAmount) {
                      <button
                        type="button"
                        (click)="setPreset(financials().pendingInterest, financials().elapsedMonths)"
                        class="px-2.5 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-medium border border-rose-300 transition cursor-pointer">
                        All Pending: ₹{{ financials().pendingInterest | number:'1.0-0' }}
                      </button>
                    }
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span class="block text-xs font-semibold text-neutral-700 mb-1">Payment Date (तारीख) *</span>
                    <input
                      type="date"
                      formControlName="date"
                      class="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
                  </div>

                  <div>
                    <span class="block text-xs font-semibold text-neutral-700 mb-1">Amount Paid (जमा राशि ₹) *</span>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        min="1"
                        formControlName="amount"
                        placeholder="e.g. 1500"
                        class="w-full pl-7 pr-3 py-2 rounded-lg border border-neutral-300 text-xs font-bold text-neutral-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
                    </div>
                  </div>

                  <div>
                    <span class="block text-xs font-semibold text-neutral-700 mb-1">Months Covered (महीने) *</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      formControlName="monthsCovered"
                      class="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
                  </div>

                  <div>
                    <span class="block text-xs font-semibold text-neutral-700 mb-1">Payment Mode (भुगतान माध्यम) *</span>
                    <select
                      formControlName="paymentMode"
                      class="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none">
                      <option value="Cash">Cash (नकद)</option>
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    </select>
                  </div>
                </div>

                <div>
                  <span class="block text-xs font-semibold text-neutral-700 mb-1">Remarks / Note (वैकल्पिक टिप्पणी)</span>
                  <input
                    type="text"
                    formControlName="notes"
                    placeholder="e.g. Paid interest for Oct-Nov, received by Mohan"
                    class="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
                </div>

                <div class="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    (click)="dismiss.emit()"
                    class="px-4 py-2 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    [disabled]="paymentForm.invalid"
                    class="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer disabled:opacity-50">
                    <span class="material-icons text-sm">check</span>
                    <span>Save Interest Payment</span>
                  </button>
                </div>
              </form>
            }
          }

          <!-- TAB 2: SETTLE & RELEASE -->
          @if (activeTab() === 'settle') {
            <div class="space-y-4">
              <div class="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2 text-xs">
                <h4 class="font-bold text-neutral-900 flex items-center text-sm">
                  <span class="material-icons text-emerald-600 text-base mr-1.5">verified</span>
                  Final Loan Settlement Breakdown
                </h4>
                <div class="flex justify-between py-1 border-b border-neutral-200">
                  <span class="text-neutral-600">Principal Loan Given:</span>
                  <span class="font-bold text-neutral-900">₹{{ record().loanAmount | number:'1.0-0' }}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-neutral-200">
                  <span class="text-neutral-600">Total Accrued Interest ({{ financials().elapsedMonths }} mo):</span>
                  <span class="font-medium text-neutral-800">₹{{ financials().totalInterestAccrued | number:'1.0-0' }}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-neutral-200">
                  <span class="text-neutral-600">Less: Already Paid Interest:</span>
                  <span class="font-medium text-emerald-600">- ₹{{ financials().totalInterestPaid | number:'1.0-0' }}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-neutral-200">
                  <span class="text-neutral-600">Pending Interest Balance:</span>
                  <span class="font-bold text-rose-600">₹{{ financials().pendingInterest | number:'1.0-0' }}</span>
                </div>
                <div class="flex justify-between py-2 pt-3 text-sm font-extrabold text-neutral-950 bg-amber-100/60 -mx-4 px-4 rounded-b-xl border-t border-amber-300">
                  <span>TOTAL PAYABLE TO RELEASE (कुल देय):</span>
                  <span class="text-amber-900 text-base">₹{{ financials().totalPayableToRelease | number:'1.0-0' }}</span>
                </div>
              </div>

              <!-- Collateral ornamanets being released -->
              <div class="p-3 bg-neutral-100/80 rounded-lg border border-neutral-200 text-xs">
                <span class="font-bold text-neutral-800 block mb-1">Pledged Ornaments to be Returned to Customer:</span>
                <ul class="space-y-1 list-disc list-inside text-neutral-600">
                  @for (item of record().items; track item.itemName + $index) {
                    <li>
                      <span class="font-medium text-neutral-800">{{ item.itemName }}</span>
                      ({{ item.metalType }}, Net: {{ item.netWeight }}g)
                    </li>
                  }
                </ul>
              </div>

              <div class="space-y-3 pt-1">
                <div>
                  <span class="block text-xs font-semibold text-neutral-700 mb-1">Settlement / Handover Remarks</span>
                  <input
                    type="text"
                    [formControl]="settlementNotesControl"
                    placeholder="e.g. Received full amount via Cash, customer verified jewellery weight"
                    class="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
                </div>

                <label class="flex items-start space-x-2 cursor-pointer text-xs text-neutral-700">
                  <input
                    type="checkbox"
                    [formControl]="handoverConfirmedControl"
                    class="mt-0.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500" />
                  <span>
                    I confirm that full principal ₹{{ record().loanAmount }} + pending interest has been received and the pledged jewellery ornaments have been safely handed back to the customer.
                  </span>
                </label>
              </div>

              <div class="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  (click)="dismiss.emit()"
                  class="px-4 py-2 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer">
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="onConfirmSettlement()"
                  [disabled]="!handoverConfirmedControl.value"
                  class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer disabled:opacity-40">
                  <span class="material-icons text-sm">lock_open</span>
                  <span>Confirm Settlement & Release Ornaments</span>
                </button>
              </div>
            </div>
          }

          <!-- TAB 3: PAYMENT HISTORY -->
          @if (activeTab() === 'history') {
            <div class="space-y-3">
              @if (record().interestPayments.length === 0) {
                <div class="py-8 text-center text-xs text-neutral-400">
                  <span class="material-icons text-3xl mb-1 text-neutral-300">receipt_long</span>
                  <p>No interest payments recorded yet.</p>
                </div>
              } @else {
                <div class="space-y-2">
                  @for (pay of record().interestPayments; track pay.id) {
                    <div class="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between text-xs">
                      <div>
                        <div class="flex items-center space-x-2">
                          <span class="font-bold text-neutral-900">₹{{ pay.amount | number:'1.0-0' }}</span>
                          <span class="px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700 text-[10px] font-medium">
                            {{ pay.paymentMode }}
                          </span>
                          <span class="text-[10px] text-neutral-400">#{{ pay.receiptNo }}</span>
                        </div>
                        <div class="text-[11px] text-neutral-500 mt-0.5">
                          Date: {{ pay.date }} • Covered: {{ pay.monthsCovered }} month(s)
                          @if (pay.notes) {
                            <span class="italic"> • "{{ pay.notes }}"</span>
                          }
                        </div>
                      </div>
                      <span class="material-icons text-emerald-600 text-base">check_circle</span>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class GirwaInterestModal {
  readonly service = inject(JewelleryService);
  readonly record = input.required<GirwaRecord>();
  readonly dismiss = output<void>();

  readonly activeTab = signal<'payment' | 'settle' | 'history'>('payment');

  readonly paymentForm = new FormGroup({
    date: new FormControl<string>(new Date().toISOString().split('T')[0], { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    monthsCovered: new FormControl<number>(1, { nonNullable: true, validators: [Validators.required, Validators.min(0.1)] }),
    paymentMode: new FormControl<'Cash' | 'UPI' | 'Bank Transfer'>('Cash', { nonNullable: true, validators: [Validators.required] }),
    notes: new FormControl<string>('', { nonNullable: true })
  });

  readonly settlementNotesControl = new FormControl<string>('');
  readonly handoverConfirmedControl = new FormControl<boolean>(false);

  financials = computed(() => this.service.calculateGirwaFinancials(this.record()));

  setPreset(amount: number, months: number) {
    this.paymentForm.patchValue({
      amount: Math.round(amount),
      monthsCovered: Math.max(0.5, +months.toFixed(1))
    });
  }

  onRecordPayment() {
    if (this.paymentForm.invalid) return;
    const val = this.paymentForm.getRawValue();
    this.service.addGirwaInterestPayment(this.record().id, {
      date: val.date,
      amount: Number(val.amount),
      monthsCovered: Number(val.monthsCovered),
      paymentMode: val.paymentMode,
      notes: val.notes.trim() || undefined
    });
    this.dismiss.emit();
  }

  onConfirmSettlement() {
    if (!this.handoverConfirmedControl.value) return;
    this.service.releaseGirwa(this.record().id, this.settlementNotesControl.value?.trim());
    this.dismiss.emit();
  }
}
