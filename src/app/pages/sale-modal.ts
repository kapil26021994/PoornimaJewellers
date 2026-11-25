import { Component, inject, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { JewelleryService } from '../services/jewellery.service';

@Component({
  selector: 'app-sale-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-2 overflow-y-auto">
      <div class="bg-white rounded-none sm:rounded-sm shadow-2xl w-full max-h-[96vh] flex flex-col overflow-hidden border border-amber-500/20 native-sheet">
        <!-- Modal Header -->
        <div class="bg-neutral-900 text-white px-4 pt-2 pb-2.5 sm:px-4 sm:py-2.5 border-b border-amber-500/20 shrink-0">
          <div class="w-10 h-1 bg-neutral-700 rounded-none mx-auto mb-2 sm:hidden"></div>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2.5">
              <div class="w-8 h-8 rounded bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
                <span class="material-icons text-base">point_of_sale</span>
              </div>
              <div>
                <h3 class="font-bold text-sm sm:text-base text-white">New Counter Sale</h3>
                <p class="text-[11px] text-neutral-400">Multi-item cart, 10g Bhav rate & old exchange</p>
              </div>
            </div>
            <button (click)="dismiss.emit()" class="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition cursor-pointer" type="button">
              <span class="material-icons text-sm">close</span>
            </button>
          </div>
        </div>

        <!-- Form Body -->
        <form [formGroup]="saleForm" (ngSubmit)="onSubmit()" class="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1">
          <!-- Customer Details -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-neutral-50 p-3 rounded border border-neutral-200">
            <div>
              <label class="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-0.5">
                Customer Name *
                <input type="text" formControlName="customerName" placeholder="e.g. Priya Sharma" 
                  class="w-full mt-0.5 px-3 py-1.5 rounded border border-neutral-300 focus:border-amber-500 outline-none text-xs text-neutral-900 bg-white font-normal">
              </label>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-0.5">
                Customer Phone *
                <input type="text" formControlName="customerPhone" placeholder="+91 98765 43210" 
                  class="w-full mt-0.5 px-3 py-1.5 rounded border border-neutral-300 focus:border-amber-500 outline-none text-xs text-neutral-900 bg-white font-normal">
              </label>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-0.5">
                Customer Address
                <input type="text" formControlName="customerAddress" placeholder="Enter customer address"
                  class="w-full mt-0.5 px-3 py-1.5 rounded border border-neutral-300 focus:border-amber-500 outline-none text-xs text-neutral-900 bg-white font-normal">
              </label>
            </div>
          </div>

          <!-- Items Cart Section with Vertical Scroll & Square Compact Inputs -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-neutral-900 text-xs sm:text-sm flex items-center space-x-1.5">
                <span class="material-icons text-amber-600" [style.fontSize.px]="16">shopping_cart</span>
                <span>Cart Items ({{ itemsArray.controls.length }})</span>
              </h4>
              <button type="button" (click)="addItem()" class="bg-neutral-900 hover:bg-neutral-800 text-amber-300 px-3 py-1 rounded text-xs font-bold flex items-center space-x-1 transition cursor-pointer">
                <span class="material-icons" [style.fontSize.px]="14">add</span>
                <span>Add Item</span>
              </button>
            </div>

            <!-- Vertical Scroll Container for Cart Items -->
            <div formArrayName="items" class="max-h-60 overflow-x-auto overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              @for (itemCtrl of itemsArray.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="bg-neutral-50 p-2 sm:p-3 rounded border border-neutral-200/90 min-w-[1060px] w-full space-y-2">
                  <div class="grid items-start gap-2 text-xs" style="grid-template-columns: minmax(130px, 1.35fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(56px, 0.55fr) repeat(4, minmax(100px, 1fr)) 36px;">
                  <div class="min-w-0">
                    <div class="mb-1">
                      <label class="text-[10px] font-bold text-neutral-600 uppercase tracking-wide">Item *</label>
                    </div>
                    <select formControlName="productName"
                      class="w-full min-w-0 px-2 py-1.5 rounded border border-neutral-300 focus:border-amber-500 text-xs bg-white font-normal" title="Select Item">
                      <option value="">-- Select Item --</option>
                      @for (itemName of saleItemNameSuggestions; track itemName) {
                        <option [value]="itemName">{{ itemName }}</option>
                      }
                    </select>
                  </div>

                  <label class="block min-w-0 text-[10px] font-bold text-neutral-600 uppercase tracking-wide">
                    Purity
                    <select formControlName="purity" class="w-full mt-1 px-2 py-1.5 rounded border border-neutral-300 focus:border-amber-500 text-xs text-neutral-900 bg-white font-normal">
                      <option value="">Choose Purity</option>
                      <option value="22K Gold">22K Gold</option>
                      <option value="18K Gold">18K Gold</option>
                      <option value="925 Silver">925 Silver</option>
                      <option value="14K Gold">14K Gold</option>
                    </select>
                  </label>

                  <label class="block min-w-0 text-[10px] font-bold text-neutral-600 uppercase tracking-wide">
                    Gross Wt. (g)
                    <input type="number" formControlName="grossWeight" (input)="recalculate()" step="0.001"
                      class="w-full mt-1 px-2 py-1.5 rounded border border-neutral-300 focus:border-amber-500 text-xs bg-white font-normal" title="Gross Weight">
                  </label>

                  <label class="block min-w-0 text-[10px] font-bold text-neutral-600 uppercase tracking-wide">
                    Net Wt. (g)
                    <input type="number" formControlName="netWeight" (input)="onItemWeightOrBhavChange(i)" step="0.001"
                      class="w-full mt-1 px-2 py-1.5 rounded border border-neutral-300 focus:border-amber-500 text-xs bg-white font-normal" title="Net Weight">
                  </label>

                  <label class="block min-w-0 text-[10px] font-bold text-neutral-600 uppercase tracking-wide">
                    Pcs
                    <input type="number" formControlName="quantity" (input)="recalculate()" min="1"
                      class="w-full mt-1 px-2 py-1.5 rounded border border-neutral-300 focus:border-amber-500 text-xs bg-white text-center font-normal" title="Pieces">
                  </label>

                  <label class="block min-w-0 text-[10px] font-bold text-neutral-600 uppercase tracking-wide">
                    Rate
                    <input type="number" formControlName="jewelleryRate" (input)="onItemWeightOrBhavChange(i)"
                      class="w-full mt-1 px-2 py-1.5 rounded border border-amber-300 bg-amber-50/50 focus:border-amber-500 text-xs font-bold text-amber-950" title="Rate per 10 grams">
                  </label>

                  <label class="block min-w-0 text-[10px] font-bold text-neutral-600 uppercase tracking-wide">
                    Value
                    <input type="number" formControlName="unitPrice" (input)="recalculate()"
                      class="w-full mt-1 px-2 py-1.5 rounded border border-neutral-300 focus:border-amber-500 text-xs bg-white font-normal" title="Item Value">
                  </label>

                  <label class="block min-w-0 text-[10px] font-bold text-neutral-600 uppercase tracking-wide">
                    Making Charges
                    <div class="mt-1 flex items-center gap-1">
                      <input type="number" formControlName="makingChargePercent" (input)="recalculate()" min="0" step="0.1"
                        class="w-full min-w-0 px-2 py-1.5 rounded border border-neutral-300 focus:border-amber-500 text-xs bg-white font-normal" title="Making Charges Percentage">
                      <span class="text-xs text-neutral-500">%</span>
                    </div>
                    <span class="block mt-0.5 text-[9px] normal-case text-neutral-500">₹{{ getMakingCharges(i) | number:'1.0-0' }}</span>
                  </label>

                  <label class="block min-w-0 text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                    Amount (₹)
                    <input type="text" [value]="getItemTotal(i) | number:'1.0-0'" readonly
                      class="w-full mt-1 px-2 py-1.5 rounded border border-amber-300 bg-amber-50 text-xs font-extrabold text-amber-900 tabular-nums" title="Calculated Amount">
                  </label>
                  @if (itemsArray.controls.length > 1) {
                    <div class="min-w-0">
                      <div class="h-3 mt-1"></div>
                      <button type="button" (click)="removeItem(i)" class="w-8 h-8 inline-flex items-center justify-center rounded border border-red-200 bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 transition cursor-pointer" title="Remove Item" aria-label="Remove item">
                        <span class="material-icons leading-none" [style.fontSize.px]="14">delete</span>
                      </button>
                    </div>
                  }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Old Jewellery Exchange Checkbox & Fields -->
          <div class="bg-amber-50/50 p-3 rounded border border-amber-200 space-y-2">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" formControlName="hasOldJewellery" (change)="recalculate()"
                class="w-3.5 h-3.5 rounded-none text-amber-600 focus:ring-amber-500 border-neutral-300">
              <span class="text-xs font-bold text-neutral-900">Old Jewellery Exchange (Minus from Total)</span>
            </label>

            @if (saleForm.get('hasOldJewellery')?.value) {
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1.5 border-t border-amber-200/70">
                <div>
                  <label class="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-0.5">
                    Old Gross Wt (g)
                    <input type="number" formControlName="oldGrossWeight" (input)="recalculate()" step="0.001"
                      class="w-full mt-0.5 px-2.5 py-1.5 rounded border border-neutral-300 focus:border-amber-500 text-xs bg-white font-normal">
                  </label>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-0.5">
                    Old Net Wt (g) *
                    <input type="number" formControlName="oldNetWeight" (input)="recalculate()" step="0.001"
                      class="w-full mt-0.5 px-2.5 py-1.5 rounded border border-neutral-300 focus:border-amber-500 text-xs bg-white font-normal">
                  </label>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-0.5">
                    Old Bhav Rate (₹/g) *
                    <input type="number" formControlName="oldRatePerGram" (input)="recalculate()"
                      class="w-full mt-0.5 px-2.5 py-1.5 rounded border border-neutral-300 focus:border-amber-500 text-xs bg-white font-normal" placeholder="e.g. 6800">
                  </label>
                </div>
              </div>
              @if (oldJewelleryTotal() > 0) {
                <div class="flex justify-between items-center text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-200">
                  <span>Old Jewellery Exchange Deduction Value:</span>
                  <span class="tabular-nums">-₹{{ oldJewelleryTotal() | number:'1.0-0' }}</span>
                </div>
              }
            }
          </div>

          <!-- Payment and Bill Options -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-0.5">
                Payment Mode *
                <select formControlName="paymentMode" class="w-full mt-0.5 px-3 py-2 rounded border border-neutral-300 focus:border-amber-500 outline-none text-xs text-neutral-900 bg-white font-normal">
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                </select>
              </label>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-0.5">
                  Bill Option *
                  <select formControlName="billType" (change)="recalculate()" class="w-full mt-0.5 px-2.5 py-2 rounded border border-neutral-300 focus:border-amber-500 outline-none text-xs text-neutral-900 bg-white font-normal">
                    <option value="Estimate">Estimate</option>
                    <option value="GST">GST Invoice</option>
                  </select>
                </label>
              </div>
              @if (saleForm.get('billType')?.value === 'GST') {
                <div>
                  <label class="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-0.5">
                    GST % *
                    <input type="number" formControlName="gstRate" (input)="recalculate()" min="0" max="28" step="0.5"
                      class="w-full mt-0.5 px-2 py-2 rounded border border-neutral-300 focus:border-amber-500 text-xs bg-white font-normal">
                  </label>
                </div>
              }
            </div>
          </div>

          <!-- Bill Calculation Summary Box -->
          <div class="bg-amber-50/70 border border-amber-200 rounded p-3 space-y-1.5 text-xs">
            <div class="flex justify-between text-neutral-700">
              <span>Subtotal</span>
              <span class="font-bold">₹{{ subtotal() | number:'1.0-0' }}</span>
            </div>
            @if (discountTotal() > 0) {
              <div class="flex justify-between text-emerald-700">
                <span>Discount Total</span>
                <span class="font-bold">-₹{{ discountTotal() | number:'1.0-0' }}</span>
              </div>
            }
            @if (oldJewelleryTotal() > 0) {
              <div class="flex justify-between text-emerald-700 font-bold">
                <span>Old Jewellery Exchange Deduction</span>
                <span class="font-bold">-₹{{ oldJewelleryTotal() | number:'1.0-0' }}</span>
              </div>
            }
            @if (saleForm.get('billType')?.value === 'GST') {
              <div class="flex justify-between text-neutral-700">
                <span>GST ({{ saleForm.get('gstRate')?.value || 3 }}% Tax)</span>
                <span class="font-bold">₹{{ gstAmount() | number:'1.0-0' }}</span>
              </div>
            } @else {
              <div class="flex justify-between text-neutral-500 italic">
                <span>Estimate Bill (No GST added)</span>
                <span>₹0</span>
              </div>
            }
            <div class="flex justify-between text-sm font-extrabold text-neutral-950 pt-1.5 border-t border-amber-200">
              <span>Grand Total</span>
              <span class="text-amber-700 text-base">₹{{ grandTotal() | number:'1.0-0' }}</span>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end space-x-2.5 pt-3 border-t border-neutral-200 mt-2">
            <button type="button" (click)="dismiss.emit()" class="px-4 py-2 rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold transition cursor-pointer">
              Cancel
            </button>
            <button type="submit" [disabled]="saleForm.invalid" class="px-5 py-2 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition shadow-md shadow-amber-500/25 disabled:opacity-50 cursor-pointer">
              Complete Sale & Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SaleModal implements OnInit {
  readonly service = inject(JewelleryService);
  readonly fb = inject(FormBuilder);
  readonly dismiss = output<void>();
  readonly saleItemNameSuggestions = [
    'Payal', 'Pajeb', 'Kadi', 'Aawale', 'Bichiya', 'Chhalla', 'Jhanjar', 'Todi',
    'Kada', 'Chudi', 'Bangadi', 'Patla', 'Bracelet', 'Anguthi', 'Ring', 'Hathphool',
    'Chain', 'Kanthi', 'Haar', 'Mala', 'Locket', 'Mangalsutra', 'Tanmaniya', 'Bali',
    'Jhumki', 'Tops', 'Karnphool', 'Nath', 'Nathni', 'Laung', 'Borla', 'Maang Tika',
    'Matha Patti', 'Murki', 'Coin', 'Silver Coin', 'Lucky', 'Gents Kada', 'Gents Chain',
    'Gents Ring', 'Baby Kada', 'Baby Payal', 'Baby Bichiya', 'Dori Locket', 'Pendant'
  ];

  saleForm!: FormGroup;

  subtotal = signal<number>(0);
  discountTotal = signal<number>(0);
  oldJewelleryTotal = signal<number>(0);
  gstAmount = signal<number>(0);
  grandTotal = signal<number>(0);

  ngOnInit() {
    this.saleForm = this.fb.group({
      customerName: ['', Validators.required],
      customerPhone: ['', Validators.required],
      customerAddress: [''],
      billType: ['Estimate', Validators.required],
      gstRate: [3, [Validators.required, Validators.min(0)]],
      items: this.fb.array([this.createItemFormGroup()]),
      hasOldJewellery: [false],
      oldGrossWeight: [0],
      oldNetWeight: [0],
      oldRatePerGram: [0],
      paymentMode: ['UPI', Validators.required]
    });
  }

  get itemsArray(): FormArray {
    return this.saleForm.get('items') as FormArray;
  }

  createItemFormGroup(): FormGroup {
    return this.fb.group({
      productId: [''],
      productName: ['', Validators.required],
      productCode: ['MANUAL'],
      quantity: [1, [Validators.required, Validators.min(1)]],
      purity: ['', Validators.required],
      grossWeight: [0, [Validators.required, Validators.min(0)]],
      netWeight: [0, [Validators.required, Validators.min(0)]],
      jewelleryRate: [this.service.settings().goldRate22k * 10, [Validators.required, Validators.min(0)]],
      unitPrice: [0, [Validators.required, Validators.min(1)]],
      makingChargePercent: [0, [Validators.required, Validators.min(0)]],
      discount: [0]
    });
  }

  addItem() {
    this.itemsArray.push(this.createItemFormGroup());
    this.recalculate();
  }

  removeItem(index: number) {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
      this.recalculate();
    }
  }

  onItemWeightOrBhavChange(index: number) {
    const itemCtrl = this.itemsArray.at(index) as FormGroup;
    if (itemCtrl) {
      const val = itemCtrl.value;
      const net = Number(val.netWeight) || 0;
      const bhav10g = Number(val.jewelleryRate) || 0;
      if (net > 0 && bhav10g > 0) {
        const ratePerGram = bhav10g / 10;
        const suggestedPrice = Math.round(net * ratePerGram);
        itemCtrl.patchValue({ unitPrice: suggestedPrice }, { emitEvent: false });
      }
    }
    this.recalculate();
  }

  getItemTotal(index: number): number {
    const itemCtrl = this.itemsArray.at(index);
    if (!itemCtrl) return 0;
    const val = itemCtrl.value;
    const qty = Number(val.quantity) || 1;
    const price = Number(val.unitPrice) || 0;
    const makingCharges = this.getMakingCharges(index);
    const disc = Number(val.discount) || 0;
    return Math.max(0, (qty * (price + makingCharges)) - disc);
  }

  getMakingCharges(index: number): number {
    const itemCtrl = this.itemsArray.at(index);
    if (!itemCtrl) return 0;
    const value = Number(itemCtrl.get('unitPrice')?.value) || 0;
    const percentage = Number(itemCtrl.get('makingChargePercent')?.value) || 0;
    return Math.round(value * percentage / 100);
  }

  recalculate() {
    let totalSub = 0;
    let totalDisc = 0;

    for (const ctrl of this.itemsArray.controls) {
      const val = ctrl.value;
      const qty = Number(val.quantity) || 1;
      const price = Number(val.unitPrice) || 0;
      const makingCharges = Math.round(price * (Number(val.makingChargePercent) || 0) / 100);
      const disc = Number(val.discount) || 0;

      totalSub += qty * (price + makingCharges);
      totalDisc += disc;
    }

    this.subtotal.set(totalSub);
    this.discountTotal.set(totalDisc);

    const formVal = this.saleForm.value;
    let oldVal = 0;
    if (formVal.hasOldJewellery) {
      const oldNet = Number(formVal.oldNetWeight) || 0;
      const oldRate = Number(formVal.oldRatePerGram) || 0;
      oldVal = oldNet * oldRate;
    }
    this.oldJewelleryTotal.set(oldVal);

    const netTaxable = Math.max(0, totalSub - totalDisc - oldVal);

    let gst = 0;
    if (formVal.billType === 'GST') {
      const gstPct = Number(formVal.gstRate) || 3;
      gst = netTaxable * (gstPct / 100);
    }
    this.gstAmount.set(gst);
    this.grandTotal.set(Math.max(0, netTaxable + gst));
  }

  onSubmit() {
    if (this.saleForm.invalid) return;

    const val = this.saleForm.value;
    const items = this.itemsArray.controls.map((ctrl, index) => {
      const itemVal = ctrl.value;
      const prod = this.service.products().find(p => p.id === itemVal.productId);
      return {
        productId: itemVal.productId,
        productName: itemVal.productName || prod?.name || 'Jewellery Item',
        productCode: itemVal.productCode || prod?.code || 'JWL-SKU',
        quantity: Number(itemVal.quantity),
        purity: itemVal.purity || '',
        grossWeight: Number(itemVal.grossWeight),
        netWeight: Number(itemVal.netWeight),
        weight: Number(itemVal.netWeight),
        jewelleryRate: Number(itemVal.jewelleryRate),
        unitPrice: Number(itemVal.unitPrice),
        makingCharges: this.getMakingCharges(index),
        discount: Number(itemVal.discount),
        total: Math.max(0, (Number(itemVal.quantity) * (Number(itemVal.unitPrice) + this.getMakingCharges(index))) - Number(itemVal.discount))
      };
    });

    const payment = (val.paymentMode || 'UPI') as 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
    const billType = (val.billType || 'Estimate') as 'Estimate' | 'GST';

    const oldJewellery = val.hasOldJewellery ? {
      hasOldJewellery: true,
      grossWeight: Number(val.oldGrossWeight) || 0,
      netWeight: Number(val.oldNetWeight) || 0,
      ratePerGram: Number(val.oldRatePerGram) || 0,
      totalValue: this.oldJewelleryTotal()
    } : undefined;

    this.service.addSale({
      customerName: val.customerName || '',
      customerPhone: val.customerPhone || '',
      customerAddress: val.customerAddress || '',
      billType,
      items,
      subtotal: this.subtotal(),
      discountTotal: this.discountTotal(),
      oldJewellery,
      gstRate: billType === 'GST' ? (Number(val.gstRate) || 3) : 0,
      gstAmount: this.gstAmount(),
      grandTotal: this.grandTotal(),
      paymentMode: payment,
      status: 'Completed'
    });

    this.dismiss.emit();
  }
}
