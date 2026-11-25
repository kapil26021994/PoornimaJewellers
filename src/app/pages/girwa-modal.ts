import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JewelleryService } from '../services/jewellery.service';
import { GirwaItem, GirwaRecord, GirwaStatus, MetalType } from '../models/jewellery.model';

@Component({
  selector: 'app-girwa-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[94dvh] flex flex-col overflow-hidden border border-neutral-300">
        <!-- Modal Header -->
        <div class="bg-neutral-900 text-white px-4 py-3 sm:px-6 sm:py-3.5 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div class="flex items-center space-x-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
              <span class="material-icons text-lg">account_balance_wallet</span>
            </div>
            <div>
              <h3 class="font-bold text-sm sm:text-base text-white">
                {{ isEditMode() ? 'Edit Girwa Record (गिरवी विवरण बदलें)' : 'New Girwa Entry (नया गिरवी खाता)' }}
              </h3>
              <p class="text-[11px] text-neutral-400">
                Pawn pledge against gold & silver collateral (गिरवी आभूषण ऋण)
              </p>
            </div>
          </div>
          <button (click)="dismiss.emit()" type="button" class="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer">
            <span class="material-icons text-base">close</span>
          </button>
        </div>

        <!-- Form Body -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-neutral-800 text-xs">
          <!-- SECTION 1: CUSTOMER & STORAGE DETAILS -->
          <div class="bg-neutral-50 p-3.5 sm:p-4 rounded-xl border border-neutral-200 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-neutral-900 text-xs uppercase tracking-wide flex items-center">
                <span class="material-icons text-amber-600 mr-1 text-sm">person</span>
                1. Customer & Safe Locker Details (ग्राहक एवं लॉकर)
              </h4>
              <!-- Quick customer selection dropdown -->
              @if (!isEditMode() && existingCustomers().length > 0) {
                <div class="relative">
                  <select
                    (change)="onSelectExistingCustomer($event)"
                    class="px-2 py-1 text-[11px] bg-white border border-neutral-300 rounded-md text-neutral-700 focus:border-amber-500 outline-none">
                    <option value="">-- Choose Registered Customer --</option>
                    @for (cust of existingCustomers(); track cust.id) {
                      <option [value]="cust.id">{{ cust.name }} ({{ cust.phone }})</option>
                    }
                  </select>
                </div>
              }
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <span class="block font-semibold text-neutral-700 mb-1">Customer Name (ग्राहक नाम) *</span>
                <input
                  type="text"
                  formControlName="customerName"
                  placeholder="e.g. Ramesh Kumar"
                  class="w-full px-2.5 py-1.5 rounded border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
              </div>

              <div>
                <span class="block font-semibold text-neutral-700 mb-1">Phone Number (मोबाइल नंबर) *</span>
                <input
                  type="tel"
                  formControlName="customerPhone"
                  placeholder="e.g. 9876543210"
                  class="w-full px-2.5 py-1.5 rounded border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
              </div>

              <div>
                <span class="block font-semibold text-neutral-700 mb-1">Aadhaar / ID No. (पहचान पत्र / आधार)</span>
                <input
                  type="text"
                  formControlName="customerAadhaar"
                  placeholder="e.g. 5421-9876-1234"
                  class="w-full px-2.5 py-1.5 rounded border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
              </div>

              <div>
                <span class="block font-semibold text-neutral-700 mb-1">Locker / Box No. (सुरक्षित लॉकर नं.)</span>
                <input
                  type="text"
                  formControlName="storageLockerNo"
                  placeholder="e.g. LOCKER-B-14"
                  class="w-full px-2.5 py-1.5 rounded border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
              </div>

              <div class="sm:col-span-2 md:col-span-4">
                <span class="block font-semibold text-neutral-700 mb-1">Residential Address (पता)</span>
                <input
                  type="text"
                  formControlName="customerAddress"
                  placeholder="e.g. Ward 4, Sarafa Bazar, Jaipur"
                  class="w-full px-2.5 py-1.5 rounded border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
              </div>
            </div>
          </div>

          <!-- SECTION 2: PLEDGED ORNAMENTS (COLLATERAL) -->
          <div class="bg-neutral-50 p-3.5 sm:p-4 rounded-xl border border-neutral-200 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-bold text-neutral-900 text-xs uppercase tracking-wide flex items-center">
                  <span class="material-icons text-amber-600 mr-1 text-sm">diamond</span>
                  2. Pledged Ornaments Collateral (गिरवी रखे आभूषण)
                </h4>
                <p class="text-[10px] text-neutral-500">Add gold/silver items pledged by the customer as collateral</p>
              </div>
              <button
                type="button"
                (click)="addPledgedItem()"
                class="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] transition flex items-center space-x-1 cursor-pointer">
                <span class="material-icons text-xs">add</span>
                <span>Add Item (+ आभूषण जोड़ें)</span>
              </button>
            </div>

            <!-- Items FormArray -->
            <div class="space-y-3" formArrayName="items">
              @for (itemCtrl of itemsArray.controls; track $index) {
                <div [formGroupName]="$index" class="p-3 bg-white rounded-lg border border-neutral-300 space-y-2 relative">
                  <div class="flex items-center justify-between border-b border-neutral-200 pb-1.5">
                    <span class="font-bold text-neutral-800 text-[11px] flex items-center">
                      <span class="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center mr-1 font-bold">
                        {{ $index + 1 }}
                      </span>
                      Ornament #{{ $index + 1 }}
                    </span>
                    @if (itemsArray.length > 1) {
                      <button
                        type="button"
                        (click)="removePledgedItem($index)"
                        class="text-rose-600 hover:text-rose-700 flex items-center text-[10px] font-semibold cursor-pointer">
                        <span class="material-icons text-xs mr-0.5">delete</span> Remove
                      </button>
                    }
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    <!-- Item Name with datalist suggestions -->
                    <div class="col-span-2 relative">
                      <span class="block text-[11px] font-semibold text-neutral-700 mb-0.5">Item Name (आभूषण) *</span>
                      <input
                        type="text"
                        formControlName="itemName"
                        placeholder="e.g. Gold Haar, Payal..."
                        (input)="filterSuggestions($index, $event)"
                        (focus)="openSuggestions($index)"
                        class="w-full px-2 py-1 rounded border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-xs" />
                      
                      @if (activeItemSuggestIndex() === $index && filteredItemList().length > 0) {
                        <div class="absolute z-20 left-0 right-0 top-full mt-0.5 bg-white border border-neutral-300 rounded shadow-lg max-h-40 overflow-y-auto">
                          @for (opt of filteredItemList(); track opt) {
                            <button
                              type="button"
                              (click)="selectSuggestedItem($index, opt)"
                              class="w-full text-left px-2.5 py-1 text-[11px] hover:bg-amber-50 text-neutral-800 cursor-pointer border-b border-neutral-100 last:border-0">
                              {{ opt }}
                            </button>
                          }
                        </div>
                      }
                    </div>

                    <!-- Metal Type -->
                    <div>
                      <span class="block text-[11px] font-semibold text-neutral-700 mb-0.5">Metal Type *</span>
                      <select
                        formControlName="metalType"
                        (change)="onMetalTypeChange($index)"
                        class="w-full px-1.5 py-1 rounded border border-neutral-300 focus:border-amber-500 outline-none bg-white text-xs">
                        <option value="22K Gold">22K Gold</option>
                        <option value="24K Gold">24K Gold</option>
                        <option value="18K Gold">18K Gold</option>
                        <option value="14K Gold">14K Gold</option>
                        <option value="925 Silver">925 Silver</option>
                        <option value="Pure Silver">Pure Silver</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Brass/Alloy">Brass / Alloy</option>
                      </select>
                    </div>

                    <!-- Purity -->
                    <div>
                      <span class="block text-[11px] font-semibold text-neutral-700 mb-0.5">Purity (शुद्धता)</span>
                      <input
                        type="text"
                        formControlName="purity"
                        placeholder="e.g. 916 / 22K"
                        class="w-full px-2 py-1 rounded border border-neutral-300 focus:border-amber-500 outline-none text-xs" />
                    </div>

                    <!-- Gross Weight -->
                    <div>
                      <span class="block text-[11px] font-semibold text-neutral-700 mb-0.5">Gross Wt (g) *</span>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        formControlName="grossWeight"
                        (input)="onWeightInput($index)"
                        placeholder="0.000"
                        class="w-full px-2 py-1 rounded border border-neutral-300 focus:border-amber-500 outline-none text-xs" />
                    </div>

                    <!-- Net Weight -->
                    <div>
                      <span class="block text-[11px] font-semibold text-neutral-700 mb-0.5">Net Wt (g) *</span>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        formControlName="netWeight"
                        (input)="calculateItemValuation($index)"
                        placeholder="0.000"
                        class="w-full px-2 py-1 rounded border border-neutral-300 focus:border-amber-500 outline-none text-xs font-bold text-amber-900" />
                    </div>

                    <!-- Estimated Valuation Amount -->
                    <div class="col-span-2">
                      <div class="flex items-center justify-between mb-0.5">
                        <span class="text-[11px] font-semibold text-neutral-700">Valuation (अनुमानित मूल्य ₹) *</span>
                        <button
                          type="button"
                          (click)="calculateItemValuation($index)"
                          class="text-[10px] text-amber-700 hover:text-amber-800 underline font-semibold cursor-pointer">
                          Auto-Calc
                        </button>
                      </div>
                      <div class="relative">
                        <span class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-neutral-400 font-bold text-xs">₹</span>
                        <input
                          type="number"
                          min="0"
                          formControlName="valuationAmount"
                          placeholder="e.g. 120000"
                          class="w-full pl-5 pr-2 py-1 rounded border border-neutral-300 focus:border-amber-500 outline-none text-xs font-bold text-neutral-900" />
                      </div>
                    </div>

                    <!-- Description / Condition -->
                    <div class="col-span-2 sm:col-span-3 md:col-span-4">
                      <span class="block text-[11px] font-semibold text-neutral-700 mb-0.5">Condition & Hallmark remarks</span>
                      <input
                        type="text"
                        formControlName="itemDescription"
                        placeholder="e.g. HUID Hallmarked, minimal stones, good condition"
                        class="w-full px-2 py-1 rounded border border-neutral-300 focus:border-amber-500 outline-none text-xs" />
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Total Collateral Summary Banner -->
            <div class="p-3 bg-amber-50 rounded-lg border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span class="text-neutral-600">Total Gross:</span>
                <span class="ml-1 font-bold text-neutral-900">{{ computedTotalGrossWeight() | number:'1.2-3' }}g</span>
              </div>
              <div>
                <span class="text-neutral-600">Total Net Metal:</span>
                <span class="ml-1 font-bold text-amber-900">{{ computedTotalNetWeight() | number:'1.2-3' }}g</span>
              </div>
              <div>
                <span class="text-neutral-600">Total Valuation:</span>
                <span class="ml-1 font-extrabold text-neutral-950">₹{{ computedTotalValuation() | number:'1.0-0' }}</span>
              </div>
              <div>
                <span class="text-neutral-600">Max Rec. Loan (75% LTV):</span>
                <span class="ml-1 font-bold text-emerald-700">₹{{ computedMaxLoanRecommended() | number:'1.0-0' }}</span>
              </div>
            </div>
          </div>

          <!-- SECTION 3: LOAN TERMS & FINANCIALS -->
          <div class="bg-neutral-50 p-3.5 sm:p-4 rounded-xl border border-neutral-200 space-y-3">
            <h4 class="font-bold text-neutral-900 text-xs uppercase tracking-wide flex items-center">
              <span class="material-icons text-amber-600 mr-1 text-sm">currency_rupee</span>
              3. Loan & Monthly Interest Terms (ऋण राशि एवं मासिक ब्याज)
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <span class="block font-semibold text-neutral-700 mb-1">Loan Amount Given (ऋण राशि ₹) *</span>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="1"
                    formControlName="loanAmount"
                    placeholder="e.g. 75000"
                    class="w-full pl-6 pr-2.5 py-1.5 rounded border border-neutral-300 font-bold text-xs text-neutral-950 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
                </div>
              </div>

              <div>
                <span class="block font-semibold text-neutral-700 mb-1">Monthly Interest Rate (% प्रति माह) *</span>
                <div class="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    formControlName="interestRateMonthly"
                    placeholder="e.g. 1.5"
                    class="w-full px-2.5 py-1.5 rounded border border-neutral-300 font-semibold text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
                  <span class="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-neutral-500 text-xs font-semibold">%</span>
                </div>
              </div>

              <div>
                <span class="block font-semibold text-neutral-700 mb-1">Pledge Date (तारीख) *</span>
                <input
                  type="date"
                  formControlName="startDate"
                  class="w-full px-2.5 py-1.5 rounded border border-neutral-300 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
              </div>

              <div>
                <span class="block font-semibold text-neutral-700 mb-1">Agreed Due Date (अंतिम देय तारीख)</span>
                <input
                  type="date"
                  formControlName="dueDate"
                  class="w-full px-2.5 py-1.5 rounded border border-neutral-300 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
              </div>

              @if (isEditMode()) {
                <div>
                  <span class="block font-semibold text-neutral-700 mb-1">Status (स्थिति) *</span>
                  <select
                    formControlName="status"
                    class="w-full px-2.5 py-1.5 rounded border border-neutral-300 text-xs bg-white focus:border-amber-500 outline-none">
                    <option value="Active">Active (सक्रिय)</option>
                    <option value="Released">Released (छुड़ाया गया)</option>
                    <option value="Defaulted">Defaulted (डिफ़ॉल्ट)</option>
                  </select>
                </div>
              }

              <div class="sm:col-span-2" [class.md:col-span-4]="!isEditMode()" [class.md:col-span-3]="isEditMode()">
                <span class="block font-semibold text-neutral-700 mb-1">Special Terms / Remarks (शर्तें व टिप्पणी)</span>
                <input
                  type="text"
                  formControlName="notes"
                  placeholder="e.g. Interest payable on 10th of every month. Collateral stored in safe box #14."
                  class="w-full px-2.5 py-1.5 rounded border border-neutral-300 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
              </div>
            </div>

            <!-- Live Monthly Interest Calculation Box -->
            <div class="p-3 bg-neutral-900 text-white rounded-lg flex items-center justify-between text-xs">
              <div class="flex items-center space-x-2">
                <span class="material-icons text-amber-400 text-base">calculate</span>
                <span>Expected Monthly Interest (मासिक ब्याज कमाई):</span>
              </div>
              <div class="font-extrabold text-amber-300 text-sm">
                ₹{{ computedMonthlyInterest() | number:'1.0-0' }} / month
              </div>
            </div>
          </div>

          <!-- Action Footer Buttons -->
          <div class="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              (click)="dismiss.emit()"
              class="px-4 py-2 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="form.invalid"
              class="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-amber-600/20 disabled:opacity-50">
              <span class="material-icons text-sm">check_circle</span>
              <span>{{ isEditMode() ? 'Update Girwa Record' : 'Create Girwa & Generate Parcha' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class GirwaModal implements OnInit {
  readonly service = inject(JewelleryService);
  readonly record = input<GirwaRecord | null>(null);
  readonly dismiss = output<void>();
  readonly saved = output<GirwaRecord>();

  readonly existingCustomers = computed(() => this.service.customers());
  readonly isEditMode = computed(() => !!this.record());

  readonly popularJewelleryItems = [
    'Payal', 'Pajeb', 'Kadi', 'Aawale', 'Bichiya', 'Chhalla', 'Jhanjar', 'Todi',
    'Kada', 'Chudi', 'Bangadi', 'Patla', 'Bracelet', 'Anguthi', 'Ring', 'Hathphool',
    'Chain', 'Kanthi', 'Haar', 'Mala', 'Locket', 'Mangalsutra', 'Tanmaniya', 'Bali',
    'Jhumki', 'Tops', 'Karnphool', 'Nath', 'Nathni', 'Laung', 'Borla', 'Maang Tika',
    'Matha Patti', 'Murki', 'Coin', 'Silver Coin', 'Lucky', 'Gents Kada', 'Gents Chain',
    'Gents Ring', 'Baby Kada', 'Baby Payal', 'Baby Bichiya', 'Dori Locket', 'Pendant'
  ];

  readonly activeItemSuggestIndex = signal<number | null>(null);
  readonly currentQuery = signal<string>('');

  readonly filteredItemList = computed(() => {
    const q = this.currentQuery().toLowerCase().trim();
    if (!q) return this.popularJewelleryItems.slice(0, 15);
    return this.popularJewelleryItems.filter(item => item.toLowerCase().includes(q));
  });

  readonly form = new FormGroup({
    customerName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    customerPhone: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    customerAddress: new FormControl<string>('', { nonNullable: true }),
    customerAadhaar: new FormControl<string>('', { nonNullable: true }),
    storageLockerNo: new FormControl<string>('LOCKER-1', { nonNullable: true }),
    items: new FormArray<FormGroup>([]),
    loanAmount: new FormControl<number>(50000, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    interestRateMonthly: new FormControl<number>(1.5, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    startDate: new FormControl<string>(new Date().toISOString().split('T')[0], { nonNullable: true, validators: [Validators.required] }),
    dueDate: new FormControl<string>('', { nonNullable: true }),
    status: new FormControl<GirwaStatus>('Active', { nonNullable: true }),
    notes: new FormControl<string>('', { nonNullable: true })
  });

  get itemsArray(): FormArray<FormGroup> {
    return this.form.get('items') as FormArray<FormGroup>;
  }

  ngOnInit() {
    const existing = this.record();
    if (existing) {
      this.form.patchValue({
        customerName: existing.customerName,
        customerPhone: existing.customerPhone,
        customerAddress: existing.customerAddress || '',
        customerAadhaar: existing.customerAadhaar || '',
        storageLockerNo: existing.storageLockerNo || '',
        loanAmount: existing.loanAmount,
        interestRateMonthly: existing.interestRateMonthly,
        startDate: existing.startDate,
        dueDate: existing.dueDate || '',
        status: existing.status,
        notes: existing.notes || ''
      });

      existing.items.forEach(item => {
        this.itemsArray.push(this.createItemFormGroup(item));
      });
    } else {
      // Default 1 item
      this.addPledgedItem();
    }
  }

  createItemFormGroup(initial?: GirwaItem): FormGroup {
    return new FormGroup({
      itemName: new FormControl<string>(initial?.itemName || '', { nonNullable: true, validators: [Validators.required] }),
      metalType: new FormControl<MetalType>(initial?.metalType || '22K Gold', { nonNullable: true, validators: [Validators.required] }),
      purity: new FormControl<string>(initial?.purity || '916 / 22K', { nonNullable: true }),
      grossWeight: new FormControl<number>(initial?.grossWeight || 0, { nonNullable: true, validators: [Validators.required, Validators.min(0.001)] }),
      netWeight: new FormControl<number>(initial?.netWeight || 0, { nonNullable: true, validators: [Validators.required, Validators.min(0.001)] }),
      valuationAmount: new FormControl<number>(initial?.valuationAmount || 0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
      itemDescription: new FormControl<string>(initial?.itemDescription || '', { nonNullable: true })
    });
  }

  addPledgedItem() {
    this.itemsArray.push(this.createItemFormGroup());
  }

  removePledgedItem(index: number) {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
    }
  }

  onSelectExistingCustomer(event: Event) {
    const custId = (event.target as HTMLSelectElement).value;
    if (!custId) return;
    const cust = this.service.customers().find(c => c.id === custId);
    if (cust) {
      this.form.patchValue({
        customerName: cust.name,
        customerPhone: cust.phone,
        customerAddress: cust.address || ''
      });
    }
  }

  onMetalTypeChange(index: number) {
    const group = this.itemsArray.at(index);
    if (!group) return;
    const metal = group.get('metalType')?.value as MetalType;
    let defaultPurity = '916 / 22K';
    if (metal === '24K Gold') defaultPurity = '999 Fine';
    else if (metal === '22K Gold') defaultPurity = '916 / 22K';
    else if (metal === '18K Gold') defaultPurity = '750 / 18K';
    else if (metal === '14K Gold') defaultPurity = '585 / 14K';
    else if (metal === '925 Silver') defaultPurity = '92.5% Sterling';
    else if (metal === 'Pure Silver') defaultPurity = '999 Fine';
    else if (metal === 'Platinum') defaultPurity = '950 Platinum';
    else if (metal === 'Brass/Alloy') defaultPurity = 'Alloy';

    group.patchValue({ purity: defaultPurity });
    this.calculateItemValuation(index);
  }

  onWeightInput(index: number) {
    const group = this.itemsArray.at(index);
    if (!group) return;
    const gross = Number(group.get('grossWeight')?.value || 0);
    const currentNet = Number(group.get('netWeight')?.value || 0);
    if (currentNet === 0 || currentNet > gross) {
      group.patchValue({ netWeight: gross });
    }
    this.calculateItemValuation(index);
  }

  calculateItemValuation(index: number) {
    const group = this.itemsArray.at(index);
    if (!group) return;
    const metal = group.get('metalType')?.value as MetalType;
    const netWeight = Number(group.get('netWeight')?.value || 0);
    const settings = this.service.settings();

    let ratePerGram = settings.goldRate22k;
    if (metal === '24K Gold') ratePerGram = settings.goldRate24k;
    else if (metal === '22K Gold') ratePerGram = settings.goldRate22k;
    else if (metal === '18K Gold') ratePerGram = Math.round(settings.goldRate22k * 0.82);
    else if (metal === '14K Gold') ratePerGram = Math.round(settings.goldRate22k * 0.64);
    else if (metal === '925 Silver') ratePerGram = Math.round(settings.silverRate * 0.925);
    else if (metal === 'Pure Silver') ratePerGram = settings.silverRate;
    else if (metal === 'Platinum') ratePerGram = Math.round(settings.goldRate22k * 0.55);
    else if (metal === 'Brass/Alloy') ratePerGram = 100;

    const estimated = Math.round(netWeight * ratePerGram);
    group.patchValue({ valuationAmount: estimated });
  }

  filterSuggestions(index: number, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.currentQuery.set(val);
    this.activeItemSuggestIndex.set(index);
  }

  openSuggestions(index: number) {
    const group = this.itemsArray.at(index);
    if (!group) return;
    const val = group.get('itemName')?.value || '';
    this.currentQuery.set(val);
    this.activeItemSuggestIndex.set(index);
  }

  selectSuggestedItem(index: number, name: string) {
    const group = this.itemsArray.at(index);
    if (group) {
      group.patchValue({ itemName: name });
    }
    this.activeItemSuggestIndex.set(null);
  }

  computedTotalGrossWeight(): number {
    return this.itemsArray.controls.reduce((sum, c) => sum + Number(c.get('grossWeight')?.value || 0), 0);
  }

  computedTotalNetWeight(): number {
    return this.itemsArray.controls.reduce((sum, c) => sum + Number(c.get('netWeight')?.value || 0), 0);
  }

  computedTotalValuation(): number {
    return this.itemsArray.controls.reduce((sum, c) => sum + Number(c.get('valuationAmount')?.value || 0), 0);
  }

  computedMaxLoanRecommended(): number {
    return Math.round(this.computedTotalValuation() * 0.75);
  }

  computedMonthlyInterest(): number {
    const loan = Number(this.form.get('loanAmount')?.value || 0);
    const rate = Number(this.form.get('interestRateMonthly')?.value || 0);
    return Math.round((loan * rate) / 100);
  }

  onSubmit() {
    if (this.form.invalid) return;

    const val = this.form.getRawValue();
    const items: GirwaItem[] = this.itemsArray.controls.map(c => ({
      itemName: c.get('itemName')?.value,
      metalType: c.get('metalType')?.value,
      purity: c.get('purity')?.value,
      grossWeight: Number(c.get('grossWeight')?.value || 0),
      netWeight: Number(c.get('netWeight')?.value || 0),
      valuationAmount: Number(c.get('valuationAmount')?.value || 0),
      itemDescription: c.get('itemDescription')?.value || undefined
    }));

    const totalGross = items.reduce((s, i) => s + i.grossWeight, 0);
    const totalNet = items.reduce((s, i) => s + i.netWeight, 0);
    const totalVal = items.reduce((s, i) => s + i.valuationAmount, 0);

    const existing = this.record();
    if (existing) {
      this.service.updateGirwa(existing.id, {
        customerName: val.customerName,
        customerPhone: val.customerPhone,
        customerAddress: val.customerAddress || undefined,
        customerAadhaar: val.customerAadhaar || undefined,
        storageLockerNo: val.storageLockerNo || undefined,
        items,
        totalGrossWeight: totalGross,
        totalNetWeight: totalNet,
        totalValuation: totalVal,
        loanAmount: Number(val.loanAmount),
        interestRateMonthly: Number(val.interestRateMonthly),
        startDate: val.startDate,
        dueDate: val.dueDate || undefined,
        status: val.status,
        notes: val.notes || undefined
      });
      this.dismiss.emit();
    } else {
      const created = this.service.addGirwa({
        customerName: val.customerName,
        customerPhone: val.customerPhone,
        customerAddress: val.customerAddress || undefined,
        customerAadhaar: val.customerAadhaar || undefined,
        storageLockerNo: val.storageLockerNo || undefined,
        items,
        totalGrossWeight: totalGross,
        totalNetWeight: totalNet,
        totalValuation: totalVal,
        loanAmount: Number(val.loanAmount),
        interestRateMonthly: Number(val.interestRateMonthly),
        startDate: val.startDate,
        dueDate: val.dueDate || undefined,
        status: 'Active',
        notes: val.notes || undefined
      });
      this.saved.emit(created);
    }
  }
}
