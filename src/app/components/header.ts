import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';
import { PwaInstall } from './pwa-install';
import { Customer, Product, Sale } from '../models/jewellery.model';

interface DesktopTabItem {
  id: string;
  label: string;
  icon: string;
}

type SearchScope = 'all' | 'inventory' | 'customers' | 'sales';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, PwaInstall],
  template: `
    <!-- Fixed Top App Bar (uses real OS status bar & safe area inset) -->
    <header class="relative w-full bg-neutral-900 text-neutral-100 shadow-md border-b border-amber-500/20 pt-[env(safe-area-inset-top)]">
      <!-- Live Bullion Rates Ticker -->
      <div class="bg-amber-500/15 text-amber-300 text-[11px] leading-tight py-0.5 px-3 lg:px-6 border-b border-amber-500/10">
        <div class="max-w-4xl lg:max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div class="flex items-center space-x-2.5 lg:space-x-4 overflow-x-auto whitespace-nowrap scrollbar-none min-w-0">
            @if (service.ratesLiveSource()) {
              <span class="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[9px] font-bold text-emerald-300 shrink-0">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LIVE</span>
              </span>
            }
            <span class="flex items-center font-medium tabular-nums">
              <span class="material-icons text-amber-400 mr-0.5" [style.fontSize.px]="12">trending_up</span>
              22K: <strong class="ml-1 text-white">₹{{ settings().goldRate22k | number:'1.0-0' }}/g</strong>
            </span>
            <span class="flex items-center font-medium tabular-nums">
              <span class="material-icons text-amber-400 mr-0.5" [style.fontSize.px]="12">bolt</span>
              24K: <strong class="ml-1 text-white">₹{{ settings().goldRate24k | number:'1.0-0' }}/g</strong>
            </span>
            <span class="flex items-center font-medium tabular-nums">
              <span class="material-icons text-slate-300 mr-0.5" [style.fontSize.px]="12">filter_vintage</span>
              Silver: <strong class="ml-1 text-white">₹{{ settings().silverRate | number:'1.0-2' }}/g</strong>
            </span>
          </div>

          <div class="flex items-center space-x-2 shrink-0">
            <div class="hidden sm:flex items-center text-amber-200/80 text-[10px]">
              GST: {{ settings().gstPercentage }}% Inc.
            </div>
            <button
              type="button"
              (click)="service.refreshLiveRates(true)"
              [disabled]="service.isLoadingRates()"
              class="w-5 h-5 rounded-full bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 flex items-center justify-center transition cursor-pointer disabled:opacity-60"
              title="Refresh Live Gold & Silver Rates">
              <span class="material-icons" [class.animate-spin]="service.isLoadingRates()" [style.fontSize.px]="12">refresh</span>
            </button>
          </div>
        </div>
      </div>

      <!-- App Bar Content -->
      <div class="max-w-4xl lg:max-w-7xl mx-auto px-3 lg:px-6 py-1.5 lg:py-2 flex items-center justify-between gap-2">
        <div class="flex items-center space-x-2.5 min-w-0 shrink-0">
          <div class="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-md shadow-amber-500/25 text-neutral-950 font-bold shrink-0">
            <span class="material-icons text-lg lg:text-xl">diamond</span>
          </div>
          <div class="min-w-0">
            <h1 class="font-bold text-sm sm:text-base lg:text-lg leading-tight text-white tracking-wide truncate max-w-[155px] sm:max-w-[220px] lg:max-w-none">
              {{ settings().shopName }}
            </h1>
            <p class="text-[10px] lg:text-[11px] leading-tight text-neutral-400 truncate max-w-[155px] sm:max-w-[220px] lg:max-w-none">{{ settings().tagline }}</p>
          </div>
        </div>

        <!-- Global Search Bar (Tablet & Desktop inline) -->
        <div class="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-3 relative">
          <div class="flex flex-1 min-w-0 items-center gap-2 rounded-xl border border-neutral-700 px-3 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition">
            <span class="material-icons text-amber-400/90 shrink-0 pointer-events-none" [style.fontSize.px]="17">search</span>
            <input
              type="search"
              aria-label="Global search across inventory, customers and sales"
              [value]="service.globalSearchQuery()"
              (input)="onGlobalSearchInput($event)"
              (focus)="openResultsIfQuery()"
              (keydown.escape)="closeResults()"
              placeholder="Search inventory, customers, sales invoices..."
              class="flex-1 min-w-0 pr-16 py-1.5 bg-transparent border-0 text-xs text-white placeholder-neutral-400 outline-none focus:ring-0" />
          </div>
          @if (service.globalSearchQuery()) {
            <div class="absolute inset-y-0 right-1.5 flex items-center space-x-1">
              <span class="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold tabular-nums">
                {{ totalMatchCount() }}
              </span>
              <button
                type="button"
                (click)="clearGlobalSearch()"
                class="w-5 h-5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer"
                title="Clear Global Search">
                <span class="material-icons" [style.fontSize.px]="14">close</span>
              </button>
            </div>
          }
        </div>

        <div class="flex items-center space-x-1.5 sm:space-x-2 lg:space-x-3 shrink-0">
          <!-- Mobile Global Search Toggle -->
          <button
            type="button"
            (click)="toggleMobileSearch()"
            [class]="isMobileSearchOpen() || service.globalSearchQuery() ? 'bg-amber-500 text-neutral-950 border-amber-400' : 'bg-neutral-800 hover:bg-neutral-700 text-amber-400 border-neutral-700'"
            class="md:hidden relative w-8 h-8 rounded-full border flex items-center justify-center transition active:scale-95 shadow-sm cursor-pointer"
            title="Global Search">
            <span class="material-icons text-base">{{ isMobileSearchOpen() ? 'close' : 'search' }}</span>
            @if (service.globalSearchQuery() && !isMobileSearchOpen()) {
              <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-neutral-900"></span>
            }
          </button>

          <div class="hidden sm:block text-right leading-tight">
            <div class="text-[11px] font-semibold text-white">{{ settings().ownerName }}</div>
            <div class="text-[10px] text-amber-400">{{ settings().phone }}</div>
          </div>
          <app-pwa-install></app-pwa-install>
          <button
            type="button"
            (click)="sectionChange.emit('settings')"
            class="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-amber-400 border border-neutral-700 transition active:scale-95 shadow-sm cursor-pointer"
            title="Shop Settings">
            <span class="material-icons text-base">settings</span>
          </button>
        </div>
      </div>

      <!-- Mobile Expandable Global Search Strip (< md) -->
      @if (isMobileSearchOpen() || service.globalSearchQuery()) {
        <div class="md:hidden px-3 pb-2 pt-0.5 border-t border-white/10">
          <div class="relative flex items-center gap-2 rounded-xl border border-neutral-700 px-3 focus-within:border-amber-400 transition">
            <span class="material-icons text-amber-400 shrink-0 pointer-events-none" [style.fontSize.px]="16">search</span>
            <input
              type="search"
              aria-label="Search inventory, customers and sales"
              [value]="service.globalSearchQuery()"
              (input)="onGlobalSearchInput($event)"
              (focus)="openResultsIfQuery()"
              (keydown.escape)="closeResults()"
              placeholder="Search items, customers, invoices..."
              class="flex-1 min-w-0 pr-16 py-1.5 bg-transparent border-0 text-xs text-white placeholder-neutral-400 outline-none focus:ring-0" />
            @if (service.globalSearchQuery()) {
              <div class="absolute inset-y-0 right-1.5 flex items-center space-x-1">
                <span class="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold tabular-nums">
                  {{ totalMatchCount() }}
                </span>
                <button
                  type="button"
                  (click)="clearGlobalSearch()"
                  class="w-5 h-5 rounded-full text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer"
                  title="Clear Global Search">
                  <span class="material-icons" [style.fontSize.px]="14">close</span>
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Desktop-Only Horizontal Tabs Bar (>= 1024px) -->
      <div
        role="tablist"
        aria-label="Desktop Navigation Tabs"
        class="hidden lg:flex items-center gap-1.5 max-w-7xl mx-auto px-6 pt-1 pb-2 border-t border-white/10 overflow-x-auto scrollbar-none">
        @for (tab of desktopTabs; track tab.id) {
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="activeSection() === tab.id"
            (click)="sectionChange.emit(tab.id)"
            [class]="activeSection() === tab.id
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
              : 'text-neutral-300 hover:text-white hover:bg-white/10 font-medium'"
            class="px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer shrink-0">
            <span class="material-icons" [style.fontSize.px]="16">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
            @if (tab.id === 'inventory' && service.lowStockProducts().length > 0) {
              <span
                [class]="activeSection() === 'inventory' ? 'bg-red-600 text-white' : 'bg-red-500/90 text-white'"
                class="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold leading-tight">
                {{ service.lowStockProducts().length }}
              </span>
            }
          </button>
        }
      </div>

      <!-- Global Search Results Dropdown Panel -->
      @if (isResultsOpen() && service.globalSearchQuery().trim().length > 0) {
        <button
          type="button"
          aria-label="Close global search results"
          (click)="closeResults()"
          class="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] cursor-default"></button>

        <div class="absolute left-2.5 right-2.5 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl top-full mt-1.5 z-50 bg-white text-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
          <!-- Scope Filter Header -->
          <div class="px-3 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <button
                type="button"
                (click)="searchScope.set('all')"
                [class]="searchScope() === 'all' ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100 font-semibold'"
                class="px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition cursor-pointer">
                All ({{ totalMatchCount() }})
              </button>
              <button
                type="button"
                (click)="searchScope.set('inventory')"
                [class]="searchScope() === 'inventory' ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100 font-semibold'"
                class="px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition cursor-pointer">
                Inventory ({{ matchedProducts().length }})
              </button>
              <button
                type="button"
                (click)="searchScope.set('customers')"
                [class]="searchScope() === 'customers' ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100 font-semibold'"
                class="px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition cursor-pointer">
                Customers ({{ matchedCustomers().length }})
              </button>
              <button
                type="button"
                (click)="searchScope.set('sales')"
                [class]="searchScope() === 'sales' ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100 font-semibold'"
                class="px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition cursor-pointer">
                Sales ({{ matchedSales().length }})
              </button>
            </div>

            <div class="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                (click)="clearGlobalSearch()"
                class="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer">
                Clear
              </button>
              <button
                type="button"
                (click)="closeResults()"
                class="w-6 h-6 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center cursor-pointer"
                title="Close">
                <span class="material-icons" [style.fontSize.px]="14">close</span>
              </button>
            </div>
          </div>

          <!-- Results List -->
          <div class="max-h-[62dvh] overflow-y-auto divide-y divide-neutral-100">
            @if (totalMatchCount() === 0) {
              <div class="p-8 text-center space-y-2">
                <span class="material-icons text-3xl text-neutral-300">search_off</span>
                <div class="text-xs font-bold text-neutral-800">
                  No matches for "{{ service.globalSearchQuery().trim() }}"
                </div>
                <p class="text-[11px] text-neutral-500">
                  Try searching by jewellery name, SKU code, customer phone, or invoice number.
                </p>
              </div>
            } @else {
              <!-- Inventory Section -->
              @if ((searchScope() === 'all' || searchScope() === 'inventory') && matchedProducts().length > 0) {
                <div class="p-2.5 space-y-1">
                  <div class="flex items-center justify-between px-1.5 pb-1">
                    <span class="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 flex items-center space-x-1">
                      <span class="material-icons text-amber-600" [style.fontSize.px]="14">inventory_2</span>
                      <span>Inventory ({{ matchedProducts().length }})</span>
                    </span>
                    <button
                      type="button"
                      (click)="jumpToSectionFiltered('inventory')"
                      class="text-[11px] font-bold text-amber-700 hover:text-amber-800 cursor-pointer">
                      View in Inventory →
                    </button>
                  </div>

                  @for (prod of matchedProducts().slice(0, 5); track prod.id) {
                    <button
                      type="button"
                      (click)="selectProductResult(prod)"
                      class="w-full px-2.5 py-2 rounded-xl hover:bg-amber-50/70 flex items-center justify-between gap-2.5 text-left transition cursor-pointer">
                      <div class="flex items-center space-x-2.5 min-w-0">
                        <img
                          [src]="prod.image"
                          [alt]="prod.name"
                          referrerpolicy="no-referrer"
                          class="w-9 h-9 rounded-lg object-cover border border-neutral-200 shrink-0" />
                        <div class="min-w-0">
                          <div class="text-xs font-bold text-neutral-900 truncate">{{ prod.name }}</div>
                          <div class="text-[10px] text-neutral-500 truncate">
                            {{ prod.code }} • {{ prod.metalType }} • {{ prod.netWeight }}g
                          </div>
                        </div>
                      </div>
                      <div class="text-right shrink-0">
                        <div class="text-xs font-extrabold text-neutral-950 tabular-nums">
                          ₹{{ prod.sellingPrice | number:'1.0-0' }}
                        </div>
                        <span
                          [class]="service.isLowStock(prod) ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'"
                          class="px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                          {{ prod.quantity }} pcs
                        </span>
                      </div>
                    </button>
                  }
                </div>
              }

              <!-- Customers Section -->
              @if ((searchScope() === 'all' || searchScope() === 'customers') && matchedCustomers().length > 0) {
                <div class="p-2.5 space-y-1">
                  <div class="flex items-center justify-between px-1.5 pb-1">
                    <span class="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 flex items-center space-x-1">
                      <span class="material-icons text-amber-600" [style.fontSize.px]="14">people</span>
                      <span>Customers ({{ matchedCustomers().length }})</span>
                    </span>
                    <button
                      type="button"
                      (click)="jumpToSectionFiltered('customers')"
                      class="text-[11px] font-bold text-amber-700 hover:text-amber-800 cursor-pointer">
                      View in Customers →
                    </button>
                  </div>

                  @for (cust of matchedCustomers().slice(0, 5); track cust.id) {
                    <button
                      type="button"
                      (click)="selectCustomerResult(cust)"
                      class="w-full px-2.5 py-2 rounded-xl hover:bg-amber-50/70 flex items-center justify-between gap-2.5 text-left transition cursor-pointer">
                      <div class="flex items-center space-x-2.5 min-w-0">
                        <div class="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {{ cust.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="min-w-0">
                          <div class="text-xs font-bold text-neutral-900 truncate">{{ cust.name }}</div>
                          <div class="text-[10px] text-neutral-500 truncate">{{ cust.phone }} • {{ cust.loyaltyPoints }} pts</div>
                        </div>
                      </div>
                      <div class="text-right shrink-0">
                        <div class="text-xs font-extrabold text-neutral-950 tabular-nums">
                          ₹{{ cust.totalPurchases | number:'1.0-0' }}
                        </div>
                        <span class="text-[9px] text-neutral-500">Spent</span>
                      </div>
                    </button>
                  }
                </div>
              }

              <!-- Sales Records Section -->
              @if ((searchScope() === 'all' || searchScope() === 'sales') && matchedSales().length > 0) {
                <div class="p-2.5 space-y-1">
                  <div class="flex items-center justify-between px-1.5 pb-1">
                    <span class="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 flex items-center space-x-1">
                      <span class="material-icons text-amber-600" [style.fontSize.px]="14">point_of_sale</span>
                      <span>Sales Records ({{ matchedSales().length }})</span>
                    </span>
                    <button
                      type="button"
                      (click)="jumpToSectionFiltered('sales')"
                      class="text-[11px] font-bold text-amber-700 hover:text-amber-800 cursor-pointer">
                      View in Sales →
                    </button>
                  </div>

                  @for (sale of matchedSales().slice(0, 5); track sale.id) {
                    <button
                      type="button"
                      (click)="selectSaleResult(sale)"
                      class="w-full px-2.5 py-2 rounded-xl hover:bg-amber-50/70 flex items-center justify-between gap-2.5 text-left transition cursor-pointer">
                      <div class="flex items-center space-x-2.5 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                          <span class="material-icons" [style.fontSize.px]="17">receipt_long</span>
                        </div>
                        <div class="min-w-0">
                          <div class="flex items-center space-x-1.5">
                            <span class="text-xs font-bold text-neutral-900 truncate">{{ sale.customerName }}</span>
                            <span class="px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-mono text-[9px] font-semibold shrink-0">
                              {{ sale.invoiceNo }}
                            </span>
                          </div>
                          <div class="text-[10px] text-neutral-500 truncate">
                            {{ sale.date }} • {{ sale.paymentMode }}
                            @if (sale.items[0]) {
                              <span> • {{ sale.items[0].productName }}</span>
                            }
                          </div>
                        </div>
                      </div>
                      <div class="text-right shrink-0">
                        <div class="text-xs font-extrabold text-neutral-950 tabular-nums">
                          ₹{{ sale.grandTotal | number:'1.0-0' }}
                        </div>
                        <span class="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold">
                          {{ sale.status }}
                        </span>
                      </div>
                    </button>
                  }
                </div>
              }
            }
          </div>
        </div>
      }
    </header>
  `
})
export class Header {
  readonly service = inject(JewelleryService);
  readonly settings = this.service.settings;

  readonly activeSection = input<string>('dashboard');
  readonly sectionChange = output<string>();

  readonly isMobileSearchOpen = signal<boolean>(false);
  readonly isResultsOpen = signal<boolean>(false);
  readonly isQuickActionsOpen = signal<boolean>(false);
  readonly searchScope = signal<SearchScope>('all');

  readonly desktopTabs: DesktopTabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
    // { id: 'catalog', label: 'Catalog', icon: 'menu_book' },
    { id: 'sales', label: 'Sales', icon: 'point_of_sale' },
    { id: 'customers', label: 'Customers', icon: 'people' },
    { id: 'girwa', label: 'Girwa (गिरवी)', icon: 'account_balance_wallet' },
    { id: 'purchases', label: 'Purchases', icon: 'local_mall' },
    // { id: 'suppliers', label: 'Suppliers', icon: 'business' },
    // { id: 'expenses', label: 'Expenses', icon: 'receipt' },
    { id: 'reports', label: 'Reports', icon: 'assessment' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  readonly matchedProducts = computed<Product[]>(() => {
    const q = this.service.globalSearchQuery().toLowerCase().trim();
    if (!q) return [];
    return this.service.products().filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.metalType.toLowerCase().includes(q) ||
        p.purity.toLowerCase().includes(q)
    );
  });

  readonly matchedCustomers = computed<Customer[]>(() => {
    const q = this.service.globalSearchQuery().toLowerCase().trim();
    if (!q) return [];
    return this.service.customers().filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  });

  readonly matchedSales = computed<Sale[]>(() => {
    const q = this.service.globalSearchQuery().toLowerCase().trim();
    if (!q) return [];
    return this.service.sales().filter(
      s =>
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

  readonly totalMatchCount = computed(
    () =>
      this.matchedProducts().length +
      this.matchedCustomers().length +
      this.matchedSales().length
  );

  onGlobalSearchInput(event: Event) {
    const inputEl = event.target as HTMLInputElement | null;
    const value = inputEl?.value ?? '';
    this.service.setGlobalSearchQuery(value);
    this.isResultsOpen.set(value.trim().length > 0);
  }

  openResultsIfQuery() {
    if (this.service.globalSearchQuery().trim().length > 0) {
      this.isResultsOpen.set(true);
    }
  }

  toggleMobileSearch() {
    const next = !this.isMobileSearchOpen();
    this.isMobileSearchOpen.set(next);
    if (!next) {
      this.isResultsOpen.set(false);
    } else if (this.service.globalSearchQuery().trim().length > 0) {
      this.isResultsOpen.set(true);
    }
  }

  closeResults() {
    this.isResultsOpen.set(false);
  }

  clearGlobalSearch() {
    this.service.clearGlobalSearch();
    this.isResultsOpen.set(false);
    this.searchScope.set('all');
  }

  jumpToSectionFiltered(section: 'inventory' | 'customers' | 'sales') {
    const query = this.service.globalSearchQuery();
    if (section === 'inventory') this.service.inventorySearchQuery.set(query);
    if (section === 'customers') this.service.customersSearchQuery.set(query);
    if (section === 'sales') this.service.salesSearchQuery.set(query);
    this.isResultsOpen.set(false);
    this.sectionChange.emit(section);
  }

  selectProductResult(product: Product) {
    this.service.inventorySearchQuery.set(product.code);
    this.isResultsOpen.set(false);
    this.sectionChange.emit('inventory');
  }

  selectCustomerResult(customer: Customer) {
    this.service.customersSearchQuery.set(customer.name);
    this.isResultsOpen.set(false);
    this.sectionChange.emit('customers');
  }

  selectSaleResult(sale: Sale) {
    this.service.salesSearchQuery.set(sale.invoiceNo);
    this.isResultsOpen.set(false);
    this.sectionChange.emit('sales');
  }

  toggleQuickActions() {
    this.isQuickActionsOpen.update(v => !v);
  }

  triggerQuickSale() {
    this.isQuickActionsOpen.set(false);
    this.service.isQuickSaleModalOpen.set(true);
  }

  triggerQuickPurchase() {
    this.isQuickActionsOpen.set(false);
    this.service.isQuickPurchaseModalOpen.set(true);
  }

  triggerQuickExpense() {
    this.isQuickActionsOpen.set(false);
    this.service.isQuickExpenseModalOpen.set(true);
  }

  jumpTo(section: string) {
    this.isQuickActionsOpen.set(false);
    this.sectionChange.emit(section);
  }
}
