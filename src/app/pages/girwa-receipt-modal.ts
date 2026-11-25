import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';
import { GirwaRecord } from '../models/jewellery.model';

@Component({
  selector: 'app-girwa-receipt-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[94dvh] flex flex-col overflow-hidden border border-amber-500/20 native-sheet">
        <!-- Header Actions -->
        <div class="bg-neutral-900 text-white px-4 pt-2.5 pb-3.5 sm:p-4 border-b border-amber-500/20 shrink-0">
          <div class="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-2.5 sm:hidden"></div>
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center space-x-2 min-w-0">
              <span class="material-icons text-amber-400 shrink-0" [style.fontSize.px]="20">description</span>
              <span class="font-bold text-xs sm:text-sm truncate">
                Girwa Parcha (गिरवी रसीद) #{{ record().girwaNo }}
              </span>
            </div>
            <div class="flex items-center space-x-2 shrink-0">
              <button (click)="printReceipt()" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition flex items-center cursor-pointer active:scale-95" type="button">
                <span class="material-icons mr-1" [style.fontSize.px]="14">print</span> Print
              </button>
              <button (click)="dismiss.emit()" class="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition cursor-pointer" type="button">
                <span class="material-icons" [style.fontSize.px]="16">close</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Printable Girvi Parcha Body -->
        <div class="p-3 sm:p-6 overflow-y-auto text-neutral-800 flex-1 bg-neutral-100/70">
          <div class="bg-white p-4 sm:p-6 rounded-xl shadow-xs border border-neutral-300 space-y-4 text-xs">
            <!-- Shop & Parcha Meta -->
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 border-b border-neutral-300 pb-3">
              <div class="min-w-0">
                <h1 class="text-base sm:text-xl font-extrabold text-neutral-950 flex items-center">
                  <span class="material-icons text-amber-600 mr-1.5 shrink-0" [style.fontSize.px]="20">diamond</span>
                  <span class="truncate">{{ settings.shopName }}</span>
                </h1>
                <p class="text-[11px] text-neutral-600 mt-0.5">{{ settings.address }}</p>
                <p class="text-[11px] text-neutral-600 mt-0.5">
                  Ph: {{ settings.phone }} | GSTIN: {{ settings.gstin }}
                </p>
              </div>
              <div class="text-left sm:text-right bg-amber-50 sm:bg-transparent p-2 sm:p-0 rounded border border-amber-200 sm:border-0 shrink-0">
                <div class="text-xs sm:text-base font-extrabold text-amber-800 tracking-wide uppercase">
                  GIRWA PLEDGE SLIP (गिरवी पर्चा)
                </div>
                <div class="text-[11px] font-mono font-bold text-neutral-900 mt-0.5">#{{ record().girwaNo }}</div>
                <div class="text-[10px] text-neutral-500">Date: {{ record().startDate }}</div>
                @if (record().storageLockerNo) {
                  <div class="text-[10px] font-semibold text-amber-700">Locker: {{ record().storageLockerNo }}</div>
                }
              </div>
            </div>

            <!-- Customer Details -->
            <div class="bg-neutral-50 p-3 rounded-lg border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span class="text-neutral-400 block uppercase font-bold text-[9px] tracking-wider">Customer / Borrower (गिरवीदार)</span>
                <strong class="text-neutral-900 text-xs sm:text-sm block mt-0.5">{{ record().customerName }}</strong>
                <span class="text-[11px] text-neutral-600 block">Ph: {{ record().customerPhone }}</span>
                @if (record().customerAddress) {
                  <span class="text-[11px] text-neutral-500 block">{{ record().customerAddress }}</span>
                }
              </div>
              <div class="sm:text-right">
                @if (record().customerAadhaar) {
                  <div class="text-[11px] text-neutral-600"><span class="font-bold">ID/Aadhaar:</span> {{ record().customerAadhaar }}</div>
                }
                <div class="text-[11px] text-neutral-600 mt-1">
                  <span class="font-bold">Status:</span> 
                  <span [class]="record().status === 'Active' ? 'text-amber-800 font-bold' : (record().status === 'Released' ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold')">
                    {{ record().status === 'Active' ? 'गिरवी चालू (Active)' : (record().status === 'Released' ? 'छुड़वाया गया (Released)' : 'Defaulted') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Pledged Ornaments Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-[11px] sm:text-xs min-w-[320px] border border-neutral-200">
                <thead class="bg-neutral-100 text-neutral-600 uppercase text-[10px]">
                  <tr>
                    <th class="py-2 px-2.5 font-bold border-b border-neutral-200">Pledged Ornament (आभूषण विवरण)</th>
                    <th class="py-2 px-2 font-bold text-center border-b border-neutral-200">Metal &amp; Purity</th>
                    <th class="py-2 px-2 font-bold text-center border-b border-neutral-200">Gross Wt</th>
                    <th class="py-2 px-2 font-bold text-center border-b border-neutral-200">Net Wt</th>
                    <th class="py-2 px-2.5 font-bold text-right border-b border-neutral-200">Est. Value (₹)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100">
                  @for (item of record().items; track item.itemName) {
                    <tr>
                      <td class="py-2.5 px-2.5">
                        <div class="font-bold text-neutral-900">{{ item.itemName }}</div>
                        @if (item.itemDescription) {
                          <div class="text-[10px] text-neutral-500">{{ item.itemDescription }}</div>
                        }
                      </td>
                      <td class="py-2.5 px-2 text-center text-neutral-700">{{ item.metalType }} ({{ item.purity }})</td>
                      <td class="py-2.5 px-2 text-center font-mono font-medium">{{ item.grossWeight }}g</td>
                      <td class="py-2.5 px-2 text-center font-mono font-bold text-neutral-900">{{ item.netWeight }}g</td>
                      <td class="py-2.5 px-2.5 text-right font-medium tabular-nums">₹{{ item.valuationAmount | number:'1.0-0' }}</td>
                    </tr>
                  }
                </tbody>
                <tfoot class="bg-neutral-50 font-bold border-t border-neutral-200">
                  <tr>
                    <td colspan="2" class="py-2 px-2.5 text-neutral-700">Total Collateral Weights</td>
                    <td class="py-2 px-2 text-center font-mono">{{ record().totalGrossWeight }}g</td>
                    <td class="py-2 px-2 text-center font-mono text-neutral-950">{{ record().totalNetWeight }}g</td>
                    <td class="py-2 px-2.5 text-right tabular-nums text-neutral-900">₹{{ record().totalValuation | number:'1.0-0' }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Loan & Interest Breakdown Box -->
            <div class="bg-amber-50/70 border border-amber-300 rounded-lg p-3 space-y-1.5 text-xs">
              <div class="flex justify-between text-neutral-800">
                <span class="font-bold">Principal Loan Amount (ऋण राशि):</span>
                <span class="text-sm font-extrabold text-neutral-950 tabular-nums">₹{{ record().loanAmount | number:'1.0-0' }}</span>
              </div>
              <div class="flex justify-between text-neutral-700">
                <span>Monthly Interest Rate (मासिक ब्याज दर):</span>
                <span class="font-bold">{{ record().interestRateMonthly }}% per month (₹{{ ((record().loanAmount * record().interestRateMonthly) / 100) | number:'1.0-0' }}/month)</span>
              </div>
              <div class="flex justify-between text-neutral-700">
                <span>Duration Elapsed:</span>
                <span>{{ financials().elapsedMonths }} Months ({{ financials().elapsedDays }} Days)</span>
              </div>
              <div class="flex justify-between text-neutral-700">
                <span>Total Interest Accrued (कुल अर्जित ब्याज):</span>
                <span class="tabular-nums font-bold">₹{{ financials().totalInterestAccrued | number:'1.0-0' }}</span>
              </div>
              @if (financials().totalInterestPaid > 0) {
                <div class="flex justify-between text-emerald-700">
                  <span>Interest Paid So Far (जमा ब्याज):</span>
                  <span class="tabular-nums font-bold">-₹{{ financials().totalInterestPaid | number:'1.0-0' }}</span>
                </div>
              }
              <div class="flex justify-between text-xs sm:text-sm font-black text-amber-950 pt-2 border-t border-amber-200">
                <span>Total Settlement Amount (छुड़ाने हेतु कुल देय राशि):</span>
                <span class="tabular-nums text-amber-800 text-sm sm:text-base">
                  {{ record().status === 'Released' ? '₹0 (Account Settled)' : ('₹' + (financials().totalPayableToRelease | number:'1.0-0')) }}
                </span>
              </div>
            </div>

            <!-- History of Interest Payments -->
            @if (record().interestPayments.length > 0) {
              <div class="space-y-1.5">
                <div class="font-bold text-[11px] text-neutral-800">Interest Payment Records (ब्याज भुगतान इतिहास):</div>
                <div class="space-y-1">
                  @for (pay of record().interestPayments; track pay.id) {
                    <div class="flex justify-between items-center text-[11px] bg-neutral-50 px-2.5 py-1 rounded border border-neutral-200">
                      <span>{{ pay.date }} • {{ pay.receiptNo }} ({{ pay.paymentMode }})</span>
                      <span class="font-bold text-emerald-800 tabular-nums">₹{{ pay.amount | number:'1.0-0' }} ({{ pay.monthsCovered }} mo)</span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Terms & Conditions (नियम व शर्तें) -->
            <div class="border-t border-neutral-300 pt-3 text-[10px] text-neutral-500 space-y-1">
              <div class="font-bold text-neutral-700 uppercase">Girwa Terms &amp; Conditions (गिरवी नियम):</div>
              <p>1. Pledged ornaments are safely insured and stored in the shop's certified high-security vault locker.</p>
              <p>2. Interest is charged on a monthly basis. Customer must clear interest periodically.</p>
              <p>3. If principal and interest remain unpaid beyond the mutually agreed period after repeated notices, the shop reserves the right to recover dues per standard pawn regulations.</p>
              <p>4. This slip must be produced in original along with valid government ID at the time of redemption/release.</p>
            </div>

            <!-- Signatures -->
            <div class="pt-6 border-t border-neutral-300 flex justify-between items-end text-[11px] text-neutral-600">
              <div class="text-center">
                <div class="w-32 border-b border-neutral-400 mb-1"></div>
                <span>Customer Signature (ग्राहक हस्ताक्षर)</span>
              </div>
              <div class="text-center">
                <div class="w-36 border-b border-neutral-400 mb-1"></div>
                <div class="font-bold text-neutral-900">{{ settings.shopName }}</div>
                <span class="text-[10px] text-neutral-400">Authorized Sarafa Signatory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GirwaReceiptModal {
  readonly service = inject(JewelleryService);
  readonly record = input.required<GirwaRecord>();
  readonly dismiss = output<void>();

  readonly settings = this.service.settings();

  financials() {
    return this.service.calculateGirwaFinancials(this.record());
  }

  printReceipt() {
    window.print();
  }
}
