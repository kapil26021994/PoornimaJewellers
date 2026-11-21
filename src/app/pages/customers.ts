import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';
import { CustomerModal } from './customer-modal';
import { CustomerDetail } from './customer-detail';
import { Customer } from '../models/jewellery.model';

type TierFilter = 'All' | 'VIP' | 'Gold' | 'Standard';
type CustomerSort = 'spend' | 'points' | 'name';

@Component({
  selector: 'app-customers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, CustomerModal, CustomerDetail],
  template: `
    <div class="space-y-3 lg:space-y-2.5 pb-24 lg:pb-6 relative min-h-[75vh]">
      <!-- Desktop-Only 4-Column Customer KPI Strip (>= 1024px) -->
      <div class="hidden lg:grid lg:grid-cols-4 gap-3">
        <div class="bg-white rounded-2xl p-3.5 border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Directory Clients</span>
            <span class="text-xl font-extrabold text-neutral-900 tabular-nums mt-0.5 block">{{ desktopCustomers().length }}</span>
            <span class="text-[11px] text-neutral-500 tabular-nums">{{ service.customers().length }} total registered</span>
          </div>
          <div class="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
            <span class="material-icons text-xl">groups</span>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-3.5 border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Lifetime Spend</span>
            <span class="text-xl font-extrabold text-neutral-950 tabular-nums mt-0.5 block">₹{{ desktopTotalSpend() | number:'1.0-0' }}</span>
            <span class="text-[11px] text-neutral-500 tabular-nums">Avg ₹{{ desktopAvgSpend() | number:'1.0-0' }} / client</span>
          </div>
          <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <span class="material-icons text-xl">payments</span>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-3.5 border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Loyalty Points Pool</span>
            <span class="text-xl font-extrabold text-emerald-900 tabular-nums mt-0.5 block">{{ desktopTotalPoints() | number:'1.0-0' }} pts</span>
            <span class="text-[11px] text-neutral-500">Redeemable reward balance</span>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <span class="material-icons text-xl">stars</span>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-3.5 border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">VIP Clients (₹1L+)</span>
            <span class="text-xl font-extrabold text-neutral-900 tabular-nums mt-0.5 block">{{ desktopVipCount() }}</span>
            <span class="text-[11px] text-neutral-500">High-value repeat patrons</span>
          </div>
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
            <span class="material-icons text-xl">workspace_premium</span>
          </div>
        </div>
      </div>

      <!-- Mobile & Tablet Compact Search + 3-Col Summary (< 1024px, Preserved) -->
      <div class="lg:hidden bg-white p-3 rounded-3xl shadow-xs border border-neutral-200 space-y-2.5">
        <div class="flex items-center gap-2.5">
          <div class="relative flex-1 min-w-0">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
              <span class="material-icons" [style.fontSize.px]="16">search</span>
            </span>
            <input
              type="text"
              [value]="searchQuery()"
              (input)="onSearchInput($event)"
              placeholder="Search customer name or phone..."
              class="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none transition" />
            @if (searchQuery()) {
              <button
                type="button"
                (click)="searchQuery.set('')"
                class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                title="Clear Search">
                <span class="material-icons" [style.fontSize.px]="16">close</span>
              </button>
            }
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 pt-0.5">
          <div class="bg-neutral-50 rounded-2xl px-2.5 py-1.5 border border-neutral-100">
            <span class="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Clients</span>
            <span class="text-xs font-extrabold text-neutral-900 tabular-nums">{{ filteredCustomers().length }}</span>
          </div>
          <div class="bg-amber-50/70 rounded-2xl px-2.5 py-1.5 border border-amber-200/60">
            <span class="text-[9px] font-bold uppercase tracking-wider text-amber-700 block">Total Spend</span>
            <span class="text-xs font-extrabold text-neutral-950 tabular-nums">₹{{ totalCustomerSpend() | number:'1.0-0' }}</span>
          </div>
          <div class="bg-emerald-50/70 rounded-2xl px-2.5 py-1.5 border border-emerald-200/60">
            <span class="text-[9px] font-bold uppercase tracking-wider text-emerald-700 block">Total Points</span>
            <span class="text-xs font-extrabold text-emerald-900 tabular-nums">{{ totalPoints() | number:'1.0-0' }}</span>
          </div>
        </div>
      </div>

      <!-- Desktop-Only Unified Search, Segment Filter & Primary CTA Toolbar (>= 1024px) -->
      <div class="hidden lg:flex items-center justify-between gap-3 bg-white px-4 py-3 rounded-2xl border border-neutral-200 shadow-xs">
        <div class="flex items-center space-x-3 flex-1 min-w-0">
          <div class="relative w-72 xl:w-80 shrink-0">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
              <span class="material-icons" [style.fontSize.px]="16">search</span>
            </span>
            <input
              type="text"
              [value]="searchQuery()"
              (input)="onSearchInput($event)"
              placeholder="Search name, phone, email, city..."
              class="w-full pl-9 pr-8 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none transition" />
            @if (searchQuery()) {
              <button
                type="button"
                (click)="searchQuery.set('')"
                class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                title="Clear Search">
                <span class="material-icons" [style.fontSize.px]="15">close</span>
              </button>
            }
          </div>

          <div class="flex items-center space-x-1 overflow-x-auto scrollbar-none">
            @for (tier of tierFilters; track tier.id) {
              <button
                type="button"
                (click)="selectedTier.set(tier.id)"
                [class]="selectedTier() === tier.id
                  ? 'bg-neutral-900 text-amber-300 border-neutral-900 font-bold'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200 font-semibold'"
                class="px-2.5 py-1 rounded-full border text-[11px] whitespace-nowrap transition cursor-pointer shrink-0">
                {{ tier.label }}
              </button>
            }
          </div>
        </div>

        <div class="flex items-center space-x-2.5 shrink-0">
          <button
            type="button"
            (click)="cycleSort()"
            class="px-2.5 py-1.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-[11px] font-semibold text-neutral-700 inline-flex items-center space-x-1 transition cursor-pointer whitespace-nowrap shrink-0"
            title="Change Sort Order">
            <span class="material-icons text-neutral-500" [style.fontSize.px]="14">sort</span>
            <span>{{ getSortLabel() }}</span>
          </button>

          <span class="text-[11px] font-semibold text-neutral-500 tabular-nums whitespace-nowrap">
            {{ desktopCustomers().length }} {{ desktopCustomers().length === 1 ? 'client' : 'clients' }}
          </span>

          <button
            type="button"
            (click)="isAddModalOpen.set(true)"
            class="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-3.5 py-2 rounded-xl text-xs inline-flex items-center space-x-1.5 shadow-xs transition cursor-pointer whitespace-nowrap shrink-0">
            <span class="material-icons text-base">person_add</span>
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      <!-- Desktop Compact Directory Table (>= 1024px) -->
      <div class="hidden lg:block">
        @if (desktopCustomers().length === 0) {
          <div class="bg-white rounded-2xl p-10 text-center border border-neutral-200 shadow-xs space-y-2">
            <span class="material-icons text-4xl text-neutral-300">people</span>
            <h4 class="font-bold text-neutral-800 text-sm">No customers match this view</h4>
            <p class="text-xs text-neutral-500">
              {{ searchQuery() || selectedTier() !== 'All' ? 'Try clearing your search or tier filter.' : 'Add your first jewellery client to get started.' }}
            </p>
            @if (searchQuery() || selectedTier() !== 'All') {
              <button
                type="button"
                (click)="resetDesktopFilters()"
                class="mt-1 px-3.5 py-1.5 rounded-xl bg-neutral-900 text-amber-300 text-xs font-bold cursor-pointer">
                Reset Filters
              </button>
            }
          </div>
        } @else {
          <div class="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-neutral-50 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    <th class="pl-3 pr-2 py-2">Client</th>
                    <th class="px-2 py-2">Phone & Address</th>
                    <th class="px-2 py-2">Last Visit</th>
                    <th class="px-2 py-2">Tier</th>
                    <th class="px-2 py-2 text-right">Loyalty Points</th>
                    <th class="px-2 py-2 text-right">Lifetime Spend</th>
                    <th class="pl-2 pr-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100 text-xs">
                  @for (cust of desktopCustomers(); track cust.id) {
                    <tr class="hover:bg-amber-50/40 transition-colors">
                      <td class="pl-3 pr-2 py-1.5 whitespace-nowrap">
                        <div class="flex items-center space-x-2.5 min-w-0">
                          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 border border-amber-300/70 flex items-center justify-center font-bold text-xs shrink-0">
                            {{ getInitials(cust.name) }}
                          </div>
                          <div class="min-w-0 leading-tight">
                            <div class="font-bold text-neutral-900 truncate max-w-[200px]">{{ cust.name }}</div>
                            <div class="text-[10px] text-neutral-500 truncate max-w-[200px]">{{ cust.email || 'No email recorded' }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-2 py-1.5 leading-tight max-w-[260px]">
                        <div class="font-semibold text-neutral-800 tabular-nums whitespace-nowrap">{{ cust.phone }}</div>
                        <div class="text-[10px] text-neutral-500 truncate">{{ cust.address || '—' }}</div>
                      </td>
                      <td class="px-2 py-1.5 whitespace-nowrap text-neutral-600 tabular-nums">
                        {{ cust.lastVisit || '—' }}
                      </td>
                      <td class="px-2 py-1.5 whitespace-nowrap">
                        <span [class]="getTierClass(cust)" class="inline-flex items-center space-x-1 text-[11px] font-bold">
                          <span class="material-icons" [style.fontSize.px]="13">{{ getTierIcon(cust) }}</span>
                          <span>{{ getTierLabel(cust) }}</span>
                        </span>
                      </td>
                      <td class="px-2 py-1.5 text-right whitespace-nowrap font-bold text-emerald-800 tabular-nums">
                        {{ cust.loyaltyPoints | number:'1.0-0' }} pts
                      </td>
                      <td class="px-2 py-1.5 text-right whitespace-nowrap font-extrabold text-neutral-950 tabular-nums">
                        ₹{{ cust.totalPurchases | number:'1.0-0' }}
                      </td>
                      <td class="pl-2 pr-3 py-1.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          (click)="selectedCustomer.set(cust)"
                          class="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-[11px] font-bold inline-flex items-center space-x-1 transition cursor-pointer">
                          <span class="material-icons" [style.fontSize.px]="13">person</span>
                          <span>Profile</span>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>

      <!-- Mobile & Tablet Native Contact Directory List (< 1024px, Preserved) -->
      <div class="lg:hidden">
        @if (filteredCustomers().length === 0) {
          <div class="bg-white rounded-3xl p-10 text-center border border-neutral-200 shadow-xs">
            <span class="material-icons text-4xl text-neutral-300 mb-2">people</span>
            <h4 class="font-bold text-neutral-800 text-sm">No customers found</h4>
            <p class="text-xs text-neutral-500 mt-1">Try searching with a different name or phone number.</p>
          </div>
        } @else {
          <div class="rounded-3xl border border-neutral-200 shadow-xs divide-y divide-neutral-100 grid grid-cols-1 overflow-hidden">
            @for (cust of filteredCustomers(); track cust.id) {
              <button
                type="button"
                (click)="selectedCustomer.set(cust)"
                class="w-full px-3.5 py-3 bg-white border-0 flex items-center justify-between gap-3 text-left hover:bg-amber-50/40 active:bg-amber-50/80 transition cursor-pointer group">
                <div class="flex items-center space-x-3 min-w-0 flex-1">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 border border-amber-300/70 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                    {{ getInitials(cust.name) }}
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex items-center space-x-1.5">
                      <span class="font-bold text-xs sm:text-sm text-neutral-900 truncate">{{ cust.name }}</span>
                      <span class="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 rounded-full shrink-0 leading-none">
                        {{ cust.loyaltyPoints }} pts
                      </span>
                    </div>
                    <div class="text-[11px] text-neutral-600 truncate mt-0.5">
                      {{ cust.phone }}
                      @if (cust.lastVisit) {
                        <span class="text-neutral-400"> • Last: {{ cust.lastVisit }}</span>
                      }
                    </div>
                    @if (cust.address) {
                      <div class="text-[10px] text-neutral-400 truncate">{{ cust.address }}</div>
                    }
                  </div>
                </div>

                <div class="flex items-center space-x-1.5 shrink-0">
                  <div class="text-right">
                    <div class="text-xs sm:text-sm font-extrabold text-neutral-950 tabular-nums">
                      ₹{{ cust.totalPurchases | number:'1.0-0' }}
                    </div>
                    <span class="text-[9px] text-neutral-400 uppercase font-semibold block leading-none mt-0.5">Spent</span>
                  </div>
                  <span class="material-icons text-neutral-400 group-hover:text-amber-600 transition" [style.fontSize.px]="18">chevron_right</span>
                </div>
              </button>
            }
          </div>
        }
      </div>

      <!-- Mobile Material 3 Floating Action Button (FAB) -->
      <div class="fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom))] right-5 z-30 lg:hidden">
        <button
          type="button"
          (click)="isAddModalOpen.set(true)"
          class="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-3 rounded-2xl shadow-xl shadow-amber-500/30 flex items-center space-x-2 transition hover:scale-105 active:scale-95 cursor-pointer border border-amber-400/50">
          <span class="material-icons text-xl">person_add</span>
          <span class="text-xs font-bold tracking-wide">Add Customer</span>
        </button>
      </div>

      <!-- Modals -->
      @if (isAddModalOpen()) {
        <app-customer-modal (dismiss)="isAddModalOpen.set(false)"></app-customer-modal>
      }

      @if (selectedCustomer()) {
        <app-customer-detail [customer]="selectedCustomer()!" (dismiss)="selectedCustomer.set(null)"></app-customer-detail>
      }
    </div>
  `
})
export class Customers {
  readonly service = inject(JewelleryService);

  readonly searchQuery = this.service.customersSearchQuery;
  readonly isAddModalOpen = signal<boolean>(false);
  readonly selectedCustomer = signal<Customer | null>(null);

  readonly selectedTier = signal<TierFilter>('All');
  readonly sortBy = signal<CustomerSort>('spend');

  readonly tierFilters: readonly { id: TierFilter; label: string }[] = [
    { id: 'All', label: 'All Clients' },
    { id: 'VIP', label: 'VIP (₹1L+)' },
    { id: 'Gold', label: 'Gold (500+ pts)' },
    { id: 'Standard', label: 'Standard' }
  ];

  readonly filteredCustomers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return this.service.customers().filter(
      c =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  });

  readonly desktopCustomers = computed(() => {
    const tier = this.selectedTier();
    const sort = this.sortBy();

    const filtered = this.filteredCustomers().filter(c => {
      if (tier === 'VIP') return c.totalPurchases >= 100000;
      if (tier === 'Gold') return c.loyaltyPoints >= 500;
      if (tier === 'Standard') return c.totalPurchases < 100000 && c.loyaltyPoints < 500;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'points') return b.loyaltyPoints - a.loyaltyPoints;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return b.totalPurchases - a.totalPurchases;
    });
  });

  readonly totalCustomerSpend = computed(() =>
    this.filteredCustomers().reduce((sum, c) => sum + c.totalPurchases, 0)
  );

  readonly totalPoints = computed(() =>
    this.filteredCustomers().reduce((sum, c) => sum + c.loyaltyPoints, 0)
  );

  readonly desktopTotalSpend = computed(() =>
    this.desktopCustomers().reduce((sum, c) => sum + c.totalPurchases, 0)
  );

  readonly desktopAvgSpend = computed(() => {
    const list = this.desktopCustomers();
    return list.length === 0 ? 0 : Math.round(this.desktopTotalSpend() / list.length);
  });

  readonly desktopTotalPoints = computed(() =>
    this.desktopCustomers().reduce((sum, c) => sum + c.loyaltyPoints, 0)
  );

  readonly desktopVipCount = computed(() =>
    this.desktopCustomers().filter(c => c.totalPurchases >= 100000).length
  );

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    this.searchQuery.set(input?.value ?? '');
  }

  cycleSort(): void {
    const current = this.sortBy();
    if (current === 'spend') {
      this.sortBy.set('points');
    } else if (current === 'points') {
      this.sortBy.set('name');
    } else {
      this.sortBy.set('spend');
    }
  }

  getSortLabel(): string {
    const sort = this.sortBy();
    if (sort === 'points') return 'Sort: Points';
    if (sort === 'name') return 'Sort: Name A–Z';
    return 'Sort: Top Spend';
  }

  resetDesktopFilters(): void {
    this.searchQuery.set('');
    this.selectedTier.set('All');
  }

  getTierLabel(cust: Customer): string {
    if (cust.totalPurchases >= 100000) return 'VIP Client';
    if (cust.loyaltyPoints >= 500) return 'Gold Tier';
    return 'Standard';
  }

  getTierIcon(cust: Customer): string {
    if (cust.totalPurchases >= 100000) return 'workspace_premium';
    if (cust.loyaltyPoints >= 500) return 'stars';
    return 'person_outline';
  }

  getTierClass(cust: Customer): string {
    if (cust.totalPurchases >= 100000) return 'text-amber-700';
    if (cust.loyaltyPoints >= 500) return 'text-emerald-700';
    return 'text-neutral-600';
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}
