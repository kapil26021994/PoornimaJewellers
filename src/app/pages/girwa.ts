import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';
import { GirwaRecord } from '../models/jewellery.model';
import { GirwaModal } from './girwa-modal';
import { GirwaReceiptModal } from './girwa-receipt-modal';
import { GirwaInterestModal } from './girwa-interest-modal';

@Component({
  selector: 'app-girwa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, GirwaModal, GirwaReceiptModal, GirwaInterestModal],
  template: `
    <div class="space-y-5 pb-20">
      <!-- Page Header & Action Bar -->
      <div class="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center space-x-3">
          <div class="w-11 h-11 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
            <span class="material-icons text-2xl">account_balance_wallet</span>
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">Girwa / Pawn Ledger (गिरवी खाता)</h2>
              <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                Sarafa Gold Loan
              </span>
            </div>
            <p class="text-xs text-neutral-500">
              Manage pledged jewellery collateral, loan disbursal, monthly interest tracking & release slips
            </p>
          </div>
        </div>

        <button
          (click)="openCreateModal()"
          type="button"
          class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-amber-500/25 active:scale-95 shrink-0">
          <span class="material-icons text-base">add</span>
          <span>New Girwa Entry (+ नया गिरवी रखें)</span>
        </button>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <!-- Active Girwa Count -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div class="flex items-center justify-between text-neutral-500 mb-1">
            <span class="text-[11px] font-semibold">Active Loans (सक्रिय)</span>
            <span class="material-icons text-amber-500 text-base">lock</span>
          </div>
          <div class="text-xl sm:text-2xl font-extrabold text-neutral-900 tabular-nums">
            {{ service.totalActiveGirwaCount() }}
          </div>
          <div class="text-[10px] text-neutral-400 mt-0.5">Pawn accounts open</div>
        </div>

        <!-- Total Disbursed Loan -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div class="flex items-center justify-between text-neutral-500 mb-1">
            <span class="text-[11px] font-semibold">Total Loan Disbursed</span>
            <span class="material-icons text-amber-600 text-base">currency_rupee</span>
          </div>
          <div class="text-xl sm:text-2xl font-extrabold text-neutral-900 tabular-nums">
            ₹{{ service.totalActiveGirwaLoan() | number:'1.0-0' }}
          </div>
          <div class="text-[10px] text-neutral-400 mt-0.5">Active principal lent</div>
        </div>

        <!-- Collateral Gold Weight -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div class="flex items-center justify-between text-neutral-500 mb-1">
            <span class="text-[11px] font-semibold">Pledged Gold Metal</span>
            <span class="material-icons text-amber-500 text-base">diamond</span>
          </div>
          <div class="text-xl sm:text-2xl font-extrabold text-amber-800 tabular-nums">
            {{ service.totalActiveGirwaGoldWeight() | number:'1.2-3' }}g
          </div>
          <div class="text-[10px] text-neutral-400 mt-0.5">Net gold weight in vault</div>
        </div>

        <!-- Collateral Silver Weight -->
        <div class="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div class="flex items-center justify-between text-neutral-500 mb-1">
            <span class="text-[11px] font-semibold">Pledged Silver Metal</span>
            <span class="material-icons text-slate-400 text-base">filter_vintage</span>
          </div>
          <div class="text-xl sm:text-2xl font-extrabold text-slate-800 tabular-nums">
            {{ service.totalActiveGirwaSilverWeight() | number:'1.2-3' }}g
          </div>
          <div class="text-[10px] text-neutral-400 mt-0.5">Net silver weight in vault</div>
        </div>

        <!-- Monthly Interest Income -->
        <div class="bg-neutral-900 text-white p-3.5 sm:p-4 rounded-xl border border-neutral-800 shadow-xs col-span-2 lg:col-span-1">
          <div class="flex items-center justify-between text-amber-400 mb-1">
            <span class="text-[11px] font-semibold">Monthly Interest</span>
            <span class="material-icons text-amber-400 text-base">trending_up</span>
          </div>
          <div class="text-xl sm:text-2xl font-extrabold text-amber-300 tabular-nums">
            ₹{{ service.totalGirwaMonthlyInterest() | number:'1.0-0' }}
          </div>
          <div class="text-[10px] text-neutral-400 mt-0.5">Per month interest revenue</div>
        </div>
      </div>

      <!-- Search & Filters Bar -->
      <div class="bg-white p-3 sm:p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <span class="material-icons text-sm">search</span>
          </span>
          <input
            type="text"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            placeholder="Search by customer name, phone, girwa #, locker..."
            class="w-full pl-8 pr-8 py-2 rounded-lg border border-neutral-300 text-xs text-neutral-900 placeholder-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
          @if (searchQuery()) {
            <button
              type="button"
              (click)="searchQuery.set('')"
              class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer">
              <span class="material-icons text-xs">close</span>
            </button>
          }
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <!-- Status Filter Tabs -->
          <div class="flex p-0.5 bg-neutral-100 rounded-lg border border-neutral-200">
            <button
              type="button"
              (click)="selectedStatus.set('ALL')"
              [class]="selectedStatus() === 'ALL' ? 'bg-white shadow-xs font-bold text-neutral-900' : 'text-neutral-600'"
              class="px-2.5 py-1.5 rounded-md transition cursor-pointer text-[11px]">
              All ({{ service.girwa().length }})
            </button>
            <button
              type="button"
              (click)="selectedStatus.set('Active')"
              [class]="selectedStatus() === 'Active' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-neutral-600'"
              class="px-2.5 py-1.5 rounded-md transition cursor-pointer text-[11px]">
              Active ({{ service.totalActiveGirwaCount() }})
            </button>
            <button
              type="button"
              (click)="selectedStatus.set('Released')"
              [class]="selectedStatus() === 'Released' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-neutral-600'"
              class="px-2.5 py-1.5 rounded-md transition cursor-pointer text-[11px]">
              Released
            </button>
            <button
              type="button"
              (click)="selectedStatus.set('Defaulted')"
              [class]="selectedStatus() === 'Defaulted' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'text-neutral-600'"
              class="px-2.5 py-1.5 rounded-md transition cursor-pointer text-[11px]">
              Defaulted
            </button>
          </div>

          <!-- Metal Filter -->
          <select
            (change)="onMetalFilterChange($event)"
            class="px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs bg-white text-neutral-700 outline-none">
            <option value="ALL">All Metals (सोना/चांदी)</option>
            <option value="GOLD">Gold Only (सोना)</option>
            <option value="SILVER">Silver Only (चांदी)</option>
          </select>
        </div>
      </div>

      <!-- Girwa Records List -->
      @if (filteredRecords().length === 0) {
        <div class="bg-white p-10 rounded-2xl border border-neutral-200 text-center space-y-3">
          <div class="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <span class="material-icons text-3xl">account_balance_wallet</span>
          </div>
          <div>
            <h3 class="font-bold text-neutral-900 text-base">No Girwa records found</h3>
            <p class="text-xs text-neutral-500 max-w-md mx-auto mt-1">
              @if (searchQuery() || selectedStatus() !== 'ALL' || selectedMetal() !== 'ALL') {
                Try adjusting your search criteria or filter options to find records.
              } @else {
                Record your first customer pawn pledge against gold or silver ornaments to start tracking interest and collateral.
              }
            </p>
          </div>
          <button
            type="button"
            (click)="openCreateModal()"
            class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs inline-flex items-center space-x-1 cursor-pointer">
            <span class="material-icons text-sm">add</span>
            <span>Create New Girwa</span>
          </button>
        </div>
      } @else {
        <div class="space-y-3">
          @for (record of filteredRecords(); track record.id) {
            @let fin = service.calculateGirwaFinancials(record);
            <div class="bg-white rounded-xl border border-neutral-200 shadow-xs hover:border-amber-400/70 transition p-4 sm:p-5 space-y-4">
              <!-- Top Row: Girwa No, Status, Date & Actions -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div class="flex items-center space-x-2.5">
                  <span class="font-mono font-extrabold text-sm text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                    #{{ record.girwaNo }}
                  </span>
                  <!-- Status Badge -->
                  <span
                    [class]="record.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                             record.status === 'Released' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                             'bg-rose-100 text-rose-800 border-rose-300'"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center space-x-1">
                    <span class="w-1.5 h-1.5 rounded-full"
                          [class]="record.status === 'Active' ? 'bg-emerald-500 animate-pulse' :
                                   record.status === 'Released' ? 'bg-blue-500' : 'bg-rose-500'"></span>
                    <span>{{ record.status }}</span>
                  </span>

                  @if (record.storageLockerNo) {
                    <span class="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold flex items-center">
                      <span class="material-icons text-xs mr-0.5">lock</span>
                      {{ record.storageLockerNo }}
                    </span>
                  }
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center space-x-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    (click)="openReceipt(record)"
                    class="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                    title="View & Print Girvi Parcha Slip">
                    <span class="material-icons text-xs">description</span>
                    <span>Parcha</span>
                  </button>

                  <button
                    type="button"
                    (click)="openInterestModal(record)"
                    class="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center space-x-1 transition cursor-pointer shadow-xs"
                    title="Record interest payment or settle loan">
                    <span class="material-icons text-xs">payments</span>
                    <span>Interest / Release</span>
                  </button>

                  <button
                    type="button"
                    (click)="openEditModal(record)"
                    class="w-7 h-7 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition cursor-pointer"
                    title="Edit Record">
                    <span class="material-icons text-sm">edit</span>
                  </button>

                  <button
                    type="button"
                    (click)="deleteRecord(record)"
                    class="w-7 h-7 rounded-lg hover:bg-rose-50 text-neutral-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                    title="Delete Record">
                    <span class="material-icons text-sm">delete</span>
                  </button>
                </div>
              </div>

              <!-- Main Details Grid -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <!-- Col 1: Customer Details -->
                <div class="space-y-1">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Customer Information</span>
                  <div class="font-bold text-sm text-neutral-950">{{ record.customerName }}</div>
                  <div class="text-neutral-600 flex items-center">
                    <span class="material-icons text-xs mr-1 text-neutral-400">call</span>
                    {{ record.customerPhone }}
                  </div>
                  @if (record.customerAadhaar) {
                    <div class="text-neutral-500 flex items-center text-[11px]">
                      <span class="material-icons text-xs mr-1 text-neutral-400">badge</span>
                      Aadhaar: {{ record.customerAadhaar }}
                    </div>
                  }
                  @if (record.customerAddress) {
                    <div class="text-neutral-500 text-[11px] truncate">
                      {{ record.customerAddress }}
                    </div>
                  }
                  <div class="text-[10px] text-neutral-400 pt-1">
                    Pledge Date: <span class="text-neutral-700 font-semibold">{{ record.startDate }}</span>
                    @if (record.closedDate) {
                      • Released: <span class="text-blue-700 font-semibold">{{ record.closedDate }}</span>
                    }
                  </div>
                </div>

                <!-- Col 2: Collateral Ornaments -->
                <div class="space-y-1.5 bg-neutral-50/80 p-3 rounded-lg border border-neutral-200">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Pledged Collateral</span>
                    <span class="text-[10px] font-semibold text-neutral-500">{{ record.items.length }} item(s)</span>
                  </div>
                  <div class="space-y-1 max-h-24 overflow-y-auto pr-1">
                    @for (item of record.items; track item.itemName + $index) {
                      <div class="flex items-center justify-between text-[11px]">
                        <span class="font-semibold text-neutral-800 truncate mr-2">{{ item.itemName }}</span>
                        <div class="text-right shrink-0">
                          <span class="font-mono text-neutral-900 font-medium">{{ item.netWeight }}g</span>
                          <span class="text-[10px] text-neutral-500 ml-1">({{ item.metalType }})</span>
                        </div>
                      </div>
                    }
                  </div>
                  <div class="pt-1.5 border-t border-neutral-200 flex items-center justify-between text-[11px]">
                    <span class="text-neutral-500">Net Wt: <strong class="text-neutral-900">{{ record.totalNetWeight | number:'1.2-3' }}g</strong></span>
                    <span class="text-neutral-500">Valuation: <strong class="text-amber-900">₹{{ record.totalValuation | number:'1.0-0' }}</strong></span>
                  </div>
                </div>

                <!-- Col 3: Financials & Interest Status -->
                <div class="space-y-1.5 bg-amber-50/50 p-3 rounded-lg border border-amber-200/80">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">Financial & Interest Status</span>
                  
                  <div class="flex justify-between items-baseline">
                    <span class="text-neutral-600">Principal Loan:</span>
                    <span class="font-bold text-sm text-neutral-950">₹{{ record.loanAmount | number:'1.0-0' }}</span>
                  </div>

                  <div class="flex justify-between items-center text-[11px]">
                    <span class="text-neutral-500">Interest Rate:</span>
                    <span class="font-semibold text-neutral-800">{{ record.interestRateMonthly }}% / mo (₹{{ fin.monthlyInterestAmount }})</span>
                  </div>

                  <div class="flex justify-between items-center text-[11px]">
                    <span class="text-neutral-500">Duration Elapsed:</span>
                    <span class="font-medium text-neutral-700">{{ fin.elapsedMonths }} mo ({{ fin.elapsedDays }} days)</span>
                  </div>

                  <div class="flex justify-between items-center text-[11px]">
                    <span class="text-neutral-500">Accrued Interest:</span>
                    <span class="font-semibold text-neutral-800">₹{{ fin.totalInterestAccrued | number:'1.0-0' }}</span>
                  </div>

                  <div class="flex justify-between items-center text-[11px]">
                    <span class="text-neutral-500">Interest Paid:</span>
                    <span class="font-semibold text-emerald-700">₹{{ fin.totalInterestPaid | number:'1.0-0' }}</span>
                  </div>

                  <div class="pt-1.5 border-t border-amber-200 flex justify-between items-center text-xs">
                    <span class="font-bold text-neutral-700">
                      {{ record.status === 'Released' ? 'Settled Total:' : 'Pending to Settle:' }}
                    </span>
                    <span class="font-extrabold text-amber-950 text-sm">
                      ₹{{ (record.status === 'Released' ? record.loanAmount : fin.totalPayableToRelease) | number:'1.0-0' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Notes / Remarks if present -->
              @if (record.notes) {
                <div class="text-[11px] text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded border border-neutral-200 flex items-center">
                  <span class="material-icons text-neutral-400 text-xs mr-1.5">info</span>
                  <span class="italic">{{ record.notes }}</span>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>

    <!-- Modals -->
    @if (isCreateOrEditOpen()) {
      <app-girwa-modal
        [record]="selectedRecordForEdit()"
        (dismiss)="closeModal()"
        (saved)="onRecordSaved($event)">
      </app-girwa-modal>
    }

    @if (isReceiptOpen() && selectedRecordForReceipt()) {
      <app-girwa-receipt-modal
        [record]="selectedRecordForReceipt()!"
        (dismiss)="isReceiptOpen.set(false)">
      </app-girwa-receipt-modal>
    }

    @if (isInterestOpen() && selectedRecordForInterest()) {
      <app-girwa-interest-modal
        [record]="selectedRecordForInterest()!"
        (dismiss)="isInterestOpen.set(false)">
      </app-girwa-interest-modal>
    }
  `
})
export class Girwa {
  readonly service = inject(JewelleryService);

  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('ALL');
  readonly selectedMetal = signal<'ALL' | 'GOLD' | 'SILVER'>('ALL');

  readonly isCreateOrEditOpen = signal<boolean>(false);
  readonly selectedRecordForEdit = signal<GirwaRecord | null>(null);

  readonly isReceiptOpen = signal<boolean>(false);
  readonly selectedRecordForReceipt = signal<GirwaRecord | null>(null);

  readonly isInterestOpen = signal<boolean>(false);
  readonly selectedRecordForInterest = signal<GirwaRecord | null>(null);

  readonly filteredRecords = computed(() => {
    let list = this.service.girwa();
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();
    const metal = this.selectedMetal();

    if (q) {
      list = list.filter(r =>
        r.girwaNo.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.toLowerCase().includes(q) ||
        (r.storageLockerNo && r.storageLockerNo.toLowerCase().includes(q)) ||
        (r.customerAadhaar && r.customerAadhaar.toLowerCase().includes(q)) ||
        r.items.some(i => i.itemName.toLowerCase().includes(q))
      );
    }

    if (status !== 'ALL') {
      list = list.filter(r => r.status === status);
    }

    if (metal !== 'ALL') {
      list = list.filter(r => {
        if (metal === 'GOLD') return r.items.some(i => i.metalType.includes('Gold'));
        if (metal === 'SILVER') return r.items.some(i => i.metalType.includes('Silver'));
        return true;
      });
    }

    return list;
  });

  onSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  onMetalFilterChange(event: Event) {
    this.selectedMetal.set((event.target as HTMLSelectElement).value as 'ALL' | 'GOLD' | 'SILVER');
  }

  openCreateModal() {
    this.selectedRecordForEdit.set(null);
    this.isCreateOrEditOpen.set(true);
  }

  openEditModal(record: GirwaRecord) {
    this.selectedRecordForEdit.set(record);
    this.isCreateOrEditOpen.set(true);
  }

  closeModal() {
    this.isCreateOrEditOpen.set(false);
    this.selectedRecordForEdit.set(null);
  }

  onRecordSaved(record: GirwaRecord) {
    this.closeModal();
    // Open receipt parcha automatically on creation
    this.selectedRecordForReceipt.set(record);
    this.isReceiptOpen.set(true);
  }

  openReceipt(record: GirwaRecord) {
    this.selectedRecordForReceipt.set(record);
    this.isReceiptOpen.set(true);
  }

  openInterestModal(record: GirwaRecord) {
    this.selectedRecordForInterest.set(record);
    this.isInterestOpen.set(true);
  }

  deleteRecord(record: GirwaRecord) {
    if (confirm(`Are you sure you want to delete Girwa record #${record.girwaNo} for ${record.customerName}?`)) {
      this.service.deleteGirwa(record.id);
    }
  }
}
