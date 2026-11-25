import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';
import { SaleModal } from './sale-modal';
import { InvoiceModal } from './invoice-modal';
import { SalesTrendChart } from '../components/sales-trend-chart';
import { Sale } from '../models/jewellery.model';

@Component({
  selector: 'app-sales',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, SaleModal, InvoiceModal, SalesTrendChart],
  template: `
    <div class="space-y-3 lg:space-y-2.5 pb-24 lg:pb-6 relative min-h-[75vh]">


                <!-- Desktop-Only Unified Search, Filter & Primary CTA Toolbar (>= 1024px) -->
      <div class="hidden lg:flex items-center justify-between gap-3 bg-white px-4 py-3 rounded-2xl border border-neutral-200 shadow-xs">
        <div class="flex items-center space-x-3 flex-1 min-w-0">
          <div class="flex w-72 xl:w-80 shrink-0 items-center gap-2 rounded-xl bg-neutral-50 border border-neutral-200 px-3 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20 transition">
            <span class="material-icons text-neutral-400 shrink-0 pointer-events-none" [style.fontSize.px]="16">search</span>
            <input
              type="text"
              [value]="searchQuery()"
              (input)="onSearchInput($event)"
              placeholder="Search invoice #, customer, item..."
              class="flex-1 min-w-0 py-1.5 bg-transparent border-0 text-xs outline-none focus:ring-0" />
            @if (searchQuery()) {
              <button
                type="button"
                (click)="searchQuery.set('')"
                class="text-neutral-400 hover:text-neutral-700 cursor-pointer shrink-0"
                title="Clear Search">
                <span class="material-icons leading-none" [style.fontSize.px]="15">close</span>
              </button>
            }
          </div>
        </div>

        <div class="flex items-center space-x-2.5 shrink-0">
          <span class="text-[11px] font-semibold text-neutral-500 tabular-nums">
            {{ filteredSales().length }} {{ filteredSales().length === 1 ? 'invoice' : 'invoices' }}
          </span>
          <button
            type="button"
            (click)="isSaleModalOpen.set(true)"
            class="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center space-x-1 shadow-xs transition cursor-pointer shrink-0">
            <span class="material-icons text-sm">add</span>
            <span>Add New Sale</span>
          </button>
        </div>
      </div>
      <!-- Sales Invoices: Compact Table on Desktop (>= lg), Native List on Mobile/Tablet (< lg) -->
      @if (filteredSales().length === 0) {
        <div class="bg-white rounded-3xl lg:rounded-2xl p-10 text-center border border-neutral-200 shadow-xs">
          <span class="material-icons text-4xl text-neutral-300 mb-2">receipt_long</span>
          <h4 class="font-bold text-neutral-800 text-sm">No sales invoices found</h4>
          <p class="text-xs text-neutral-500 mt-1">
            {{ searchQuery() || selectedPaymentMode() !== 'All' ? 'Try clearing or changing your search/payment filter.' : 'Tap Add New Sale to create your first bill.' }}
          </p>
        </div>
      } @else {
        <!-- Desktop Compact Sales Table (>= 1024px) -->
        <div class="hidden lg:block bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-neutral-50 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  <th class="pl-3 pr-2 py-2">Invoice # & Date</th>
                  <th class="px-2 py-2">Customer</th>
                  <th class="px-2 py-2">Jewellery Items</th>
                  <th class="px-2 py-2 text-center">Payment</th>
                  <th class="px-2 py-2 text-right">Subtotal / Disc</th>
                  <th class="px-2 py-2 text-right">GST</th>
                  <th class="px-2 py-2 text-right">Grand Total</th>
                  <th class="pl-2 pr-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100 text-xs">
                @for (sale of filteredSales(); track sale.id) {
                  <tr class="hover:bg-amber-50/40 transition-colors">
                    <td class="pl-3 pr-2 py-1.5 whitespace-nowrap leading-tight">
                      <div class="font-mono font-bold text-amber-700 text-[11px]">{{ sale.invoiceNo }}</div>
                      <div class="text-[10px] text-neutral-500">{{ sale.date }}</div>
                    </td>
                    <td class="px-2 py-1.5 whitespace-nowrap leading-tight">
                      <div class="font-bold text-neutral-900">{{ sale.customerName }}</div>
                      <div class="text-[10px] text-neutral-500">{{ sale.customerPhone }}</div>
                    </td>
                    <td class="px-2 py-1.5 leading-tight max-w-[240px]">
                      @if (sale.items[0]; as firstItem) {
                        <div class="font-semibold text-neutral-800 truncate">{{ firstItem.productName }}</div>
                        <div class="text-[10px] text-neutral-500">
                          {{ firstItem.productCode }} • {{ sale.items.length }} {{ sale.items.length === 1 ? 'item' : 'items' }}
                        </div>
                      } @else {
                        <span class="text-[10px] text-neutral-400">No items</span>
                      }
                    </td>
                    <td class="px-2 py-1.5 text-center whitespace-nowrap">
                      <span [class]="getModeBadgeClass(sale.paymentMode)" class="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold rounded-full">
                        <span class="material-icons" [style.fontSize.px]="12">{{ getModeIcon(sale.paymentMode) }}</span>
                        <span>{{ sale.paymentMode }}</span>
                      </span>
                    </td>
                    <td class="px-2 py-1.5 text-right whitespace-nowrap tabular-nums leading-tight">
                      <div class="font-semibold text-neutral-800">₹{{ sale.subtotal | number:'1.0-0' }}</div>
                      @if (sale.discountTotal > 0) {
                        <div class="text-[10px] text-emerald-700 font-semibold">-₹{{ sale.discountTotal | number:'1.0-0' }} disc</div>
                      }
                    </td>
                    <td class="px-2 py-1.5 text-right whitespace-nowrap text-neutral-600 tabular-nums">
                      <div>₹{{ sale.gstAmount | number:'1.0-0' }}</div>
                      <div class="text-[9px] text-neutral-400">{{ sale.gstRate }}%</div>
                    </td>
                    <td class="px-2 py-1.5 text-right whitespace-nowrap font-extrabold text-neutral-950 tabular-nums">
                      ₹{{ sale.grandTotal | number:'1.0-0' }}
                    </td>
                    <td class="pl-2 pr-3 py-1.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        (click)="openInvoice(sale)"
                        class="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-[11px] font-bold inline-flex items-center space-x-1 transition cursor-pointer">
                        <span class="material-icons" [style.fontSize.px]="13">receipt_long</span>
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile & Tablet Native Transaction List (< 1024px) -->
        <div class="lg:hidden bg-white rounded-3xl border border-neutral-200 shadow-xs divide-y divide-neutral-100 overflow-hidden">
          @for (sale of filteredSales(); track sale.id) {
            <button
              type="button"
              (click)="openInvoice(sale)"
              class="w-full px-3.5 py-3 flex items-center justify-between gap-3 text-left hover:bg-amber-50/40 active:bg-amber-50/80 transition cursor-pointer group">
              <div class="flex items-center space-x-3 min-w-0 flex-1">
                <div [class]="getModeIconClass(sale.paymentMode)"
                  class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border">
                  <span class="material-icons" [style.fontSize.px]="18">{{ getModeIcon(sale.paymentMode) }}</span>
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex items-center space-x-1.5">
                    <span class="font-bold text-xs sm:text-sm text-neutral-900 truncate">{{ sale.customerName }}</span>
                    <span class="px-1.5 py-0.5 text-[9px] font-mono font-semibold bg-neutral-100 text-neutral-600 rounded-md shrink-0">
                      {{ sale.invoiceNo }}
                    </span>
                  </div>
                  <div class="text-[11px] text-neutral-500 truncate mt-0.5">
                    {{ sale.date }} • {{ sale.items.length }} {{ sale.items.length === 1 ? 'item' : 'items' }}
                    @if (sale.items[0]) {
                      <span> • {{ sale.items[0].productName }}</span>
                    }
                  </div>
                </div>
              </div>

              <div class="flex items-center space-x-1.5 shrink-0">
                <div class="text-right">
                  <div class="text-xs sm:text-sm font-extrabold text-neutral-950 tabular-nums">
                    ₹{{ sale.grandTotal | number:'1.0-0' }}
                  </div>
                  <div class="flex items-center justify-end space-x-1 mt-0.5">
                    <span [class]="getModeBadgeClass(sale.paymentMode)" class="px-1.5 py-0.5 text-[9px] font-bold rounded-full leading-none">
                      {{ sale.paymentMode }}
                    </span>
                  </div>
                </div>
                <span class="material-icons text-neutral-400 group-hover:text-amber-600 transition" [style.fontSize.px]="18">chevron_right</span>
              </div>
            </button>
          }
        </div>
      }

      <!-- Mobile Material 3 Floating Action Button (FAB) -->
      <div class="fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom))] right-5 z-30 lg:hidden">
        <button
          type="button"
          (click)="isSaleModalOpen.set(true)"
          class="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-3 py-2 rounded-xl shadow-xl shadow-amber-500/30 flex items-center space-x-1.5 transition hover:scale-105 active:scale-95 cursor-pointer border border-amber-400/50">
          <span class="material-icons text-sm">add</span>
          <span class="text-[11px] font-bold tracking-wide">Add New Sale</span>
        </button>
      </div>

      <!-- Modals -->
      @if (isSaleModalOpen()) {
        <app-sale-modal (dismiss)="isSaleModalOpen.set(false)"></app-sale-modal>
      }

      @if (selectedInvoiceSale()) {
        <app-invoice-modal [sale]="selectedInvoiceSale()!" (dismiss)="selectedInvoiceSale.set(null)"></app-invoice-modal>
      }
    </div>
  `
})
export class Sales {
  readonly service = inject(JewelleryService);

  readonly paymentModes: ('All' | Sale['paymentMode'])[] = ['All', 'UPI', 'Cash', 'Card', 'Bank Transfer'];
  readonly selectedPaymentMode = signal<'All' | Sale['paymentMode']>('All');

  readonly searchQuery = this.service.salesSearchQuery;
  readonly isSaleModalOpen = signal<boolean>(false);
  readonly selectedInvoiceSale = signal<Sale | null>(null);

  readonly filteredSales = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const mode = this.selectedPaymentMode();
    return this.service.sales().filter(s => {
      if (mode !== 'All' && s.paymentMode !== mode) return false;
      if (!q) return true;
      return (
        s.invoiceNo.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.customerPhone.toLowerCase().includes(q) ||
        s.paymentMode.toLowerCase().includes(q) ||
        s.items.some(
          item =>
            item.productName.toLowerCase().includes(q) ||
            item.productCode.toLowerCase().includes(q)
        )
      );
    });
  });

  readonly totalRevenue = computed(() =>
    this.filteredSales().reduce((sum, s) => sum + s.grandTotal, 0)
  );

  readonly totalGst = computed(() =>
    this.filteredSales().reduce((sum, s) => sum + s.gstAmount, 0)
  );

  readonly totalDiscounts = computed(() =>
    this.filteredSales().reduce((sum, s) => sum + s.discountTotal, 0)
  );

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    this.searchQuery.set(input?.value ?? '');
  }

  getModeIcon(mode: Sale['paymentMode']): string {
    switch (mode) {
      case 'UPI':
        return 'qr_code_2';
      case 'Card':
        return 'credit_card';
      case 'Bank Transfer':
        return 'account_balance';
      default:
        return 'payments';
    }
  }

  getModeIconClass(mode: Sale['paymentMode']): string {
    switch (mode) {
      case 'UPI':
        return 'bg-indigo-50 text-indigo-600 border-indigo-200/70';
      case 'Card':
        return 'bg-amber-50 text-amber-600 border-amber-200/70';
      case 'Bank Transfer':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-emerald-50 text-emerald-600 border-emerald-200/70';
    }
  }

  getModeBadgeClass(mode: Sale['paymentMode']): string {
    switch (mode) {
      case 'UPI':
        return 'bg-indigo-50 text-indigo-700';
      case 'Card':
        return 'bg-amber-100 text-amber-800';
      case 'Bank Transfer':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-emerald-50 text-emerald-700';
    }
  }

  openInvoice(sale: Sale) {
    this.selectedInvoiceSale.set(sale);
  }
}
