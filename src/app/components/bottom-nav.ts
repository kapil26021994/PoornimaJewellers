import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TabType = 'dashboard' | 'inventory' | 'sales' | 'customers' | 'more';

@Component({
  selector: 'app-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full'
  },
  imports: [CommonModule],
  template: `
    <nav class="w-full bg-neutral-900/95 border-t border-amber-500/20 shadow-2xl backdrop-blur-lg pb-[env(safe-area-inset-bottom,0px)]">
      <div class="max-w-4xl mx-auto grid grid-cols-5 h-12 px-1.5 py-0.5">
        <!-- Dashboard -->
        <button
          type="button"
          (click)="selectTab('dashboard')"
          class="flex flex-col items-center justify-center transition active:scale-95 group cursor-pointer">
          <div [class]="activeTab() === 'dashboard' ? 'bg-amber-500 text-neutral-950 font-bold scale-105' : 'text-neutral-400 group-hover:text-neutral-200'"
               class="w-10 h-5 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm">
            <span class="material-icons leading-none" [style.fontSize.px]="14">dashboard</span>
          </div>
          <span [class]="activeTab() === 'dashboard' ? 'text-amber-400 font-bold' : 'text-neutral-400'" class="text-[9px] leading-none tracking-tight mt-0.5">Dashboard</span>
        </button>

        <!-- Inventory -->
        <button
          type="button"
          (click)="selectTab('inventory')"
          class="flex flex-col items-center justify-center transition active:scale-95 group cursor-pointer">
          <div [class]="activeTab() === 'inventory' ? 'bg-amber-500 text-neutral-950 font-bold scale-105' : 'text-neutral-400 group-hover:text-neutral-200'"
               class="w-10 h-5 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm">
            <span class="material-icons leading-none" [style.fontSize.px]="14">inventory_2</span>
          </div>
          <span [class]="activeTab() === 'inventory' ? 'text-amber-400 font-bold' : 'text-neutral-400'" class="text-[9px] leading-none tracking-tight mt-0.5">Inventory</span>
        </button>

        <!-- Sales -->
        <button
          type="button"
          (click)="selectTab('sales')"
          class="flex flex-col items-center justify-center transition active:scale-95 group cursor-pointer">
          <div [class]="activeTab() === 'sales' ? 'bg-amber-500 text-neutral-950 font-bold scale-105' : 'text-neutral-400 group-hover:text-neutral-200'"
               class="w-10 h-5 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm">
            <span class="material-icons leading-none" [style.fontSize.px]="14">point_of_sale</span>
          </div>
          <span [class]="activeTab() === 'sales' ? 'text-amber-400 font-bold' : 'text-neutral-400'" class="text-[9px] leading-none tracking-tight mt-0.5">Sales</span>
        </button>

        <!-- Customers -->
        <button
          type="button"
          (click)="selectTab('customers')"
          class="flex flex-col items-center justify-center transition active:scale-95 group cursor-pointer">
          <div [class]="activeTab() === 'customers' ? 'bg-amber-500 text-neutral-950 font-bold scale-105' : 'text-neutral-400 group-hover:text-neutral-200'"
               class="w-10 h-5 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm">
            <span class="material-icons leading-none" [style.fontSize.px]="14">people</span>
          </div>
          <span [class]="activeTab() === 'customers' ? 'text-amber-400 font-bold' : 'text-neutral-400'" class="text-[9px] leading-none tracking-tight mt-0.5">Customers</span>
        </button>

        <!-- More -->
        <button
          type="button"
          (click)="selectTab('more')"
          class="flex flex-col items-center justify-center transition active:scale-95 group cursor-pointer">
          <div [class]="activeTab() === 'more' ? 'bg-amber-500 text-neutral-950 font-bold scale-105' : 'text-neutral-400 group-hover:text-neutral-200'"
               class="w-10 h-5 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm">
            <span class="material-icons leading-none" [style.fontSize.px]="14">menu</span>
          </div>
          <span [class]="activeTab() === 'more' ? 'text-amber-400 font-bold' : 'text-neutral-400'" class="text-[9px] leading-none tracking-tight mt-0.5">More</span>
        </button>
      </div>
    </nav>
  `
})
export class BottomNav {
  readonly activeTab = input<TabType>('dashboard');
  readonly tabChange = output<TabType>();

  selectTab(tab: TabType) {
    this.tabChange.emit(tab);
  }
}
