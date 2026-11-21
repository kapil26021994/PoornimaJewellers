import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-more',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 pb-20">
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
        <h2 class="text-xl font-bold text-neutral-900 tracking-tight">More Management Tools</h2>
        <p class="text-xs text-neutral-500">Access purchases, suppliers, expenses, financial reports and settings</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Showroom Landing Page & Hindi Tutorial -->
        <button (click)="selectSubView.emit('landing')" type="button" class="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white p-5 rounded-2xl border-2 border-amber-500/50 hover:border-amber-400 transition flex items-center justify-between text-left group cursor-pointer sm:col-span-2 shadow-lg shadow-amber-500/10">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center group-hover:scale-110 transition shadow-md shadow-amber-500/30">
              <span class="material-icons text-2xl">storefront</span>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h4 class="font-bold text-white text-base">Showroom & Hindi Video Tutorial</h4>
                <span class="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">Hindi Voice</span>
              </div>
              <p class="text-xs text-amber-300/90">Store details, live bullion board & 7-module Hindi video walkthrough</p>
            </div>
          </div>
          <span class="material-icons text-amber-400 group-hover:translate-x-1 transition text-2xl">play_circle</span>
        </button>

        <!-- Digital Product Catalog -->
        <button (click)="selectSubView.emit('catalog')" type="button" class="bg-neutral-900 text-white p-5 rounded-2xl border border-amber-500/35 hover:border-amber-400 transition flex items-center justify-between text-left group cursor-pointer sm:col-span-2 shadow-sm">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center group-hover:scale-110 transition">
              <span class="material-icons text-2xl">menu_book</span>
            </div>
            <div>
              <h4 class="font-bold text-white text-base">Digital Product Catalog</h4>
              <p class="text-xs text-amber-300/90">Customer lookbook with price toggle, shortlist & WhatsApp sharing</p>
            </div>
          </div>
          <span class="material-icons text-amber-400 group-hover:translate-x-1 transition">chevron_right</span>
        </button>

        <!-- Purchases -->
        <button (click)="selectSubView.emit('purchases')" type="button" class="bg-white p-5 rounded-2xl border border-neutral-200 hover:border-amber-500/50 transition flex items-center justify-between text-left group cursor-pointer">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <span class="material-icons text-2xl">local_shipping</span>
            </div>
            <div>
              <h4 class="font-bold text-neutral-900 text-base">Bullion Purchases</h4>
              <p class="text-xs text-neutral-500">Wholesale stock inflows & supplier orders</p>
            </div>
          </div>
          <span class="material-icons text-neutral-400 group-hover:translate-x-1 transition">chevron_right</span>
        </button>

        <!-- Suppliers -->
        <button (click)="selectSubView.emit('suppliers')" class="bg-white p-5 rounded-2xl border border-neutral-200 hover:border-amber-500/50 transition flex items-center justify-between text-left group cursor-pointer">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <span class="material-icons text-2xl">factory</span>
            </div>
            <div>
              <h4 class="font-bold text-neutral-900 text-base">Suppliers Directory</h4>
              <p class="text-xs text-neutral-500">Certified refiners and credit ledgers</p>
            </div>
          </div>
          <span class="material-icons text-neutral-400 group-hover:translate-x-1 transition">chevron_right</span>
        </button>

        <!-- Expenses -->
        <button (click)="selectSubView.emit('expenses')" class="bg-white p-5 rounded-2xl border border-neutral-200 hover:border-amber-500/50 transition flex items-center justify-between text-left group cursor-pointer">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <span class="material-icons text-2xl">receipt</span>
            </div>
            <div>
              <h4 class="font-bold text-neutral-900 text-base">Shop Expenses</h4>
              <p class="text-xs text-neutral-500">Rent, salaries & hallmarking testing fees</p>
            </div>
          </div>
          <span class="material-icons text-neutral-400 group-hover:translate-x-1 transition">chevron_right</span>
        </button>

        <!-- Reports -->
        <button (click)="selectSubView.emit('reports')" class="bg-white p-5 rounded-2xl border border-neutral-200 hover:border-amber-500/50 transition flex items-center justify-between text-left group cursor-pointer">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <span class="material-icons text-2xl">bar_chart</span>
            </div>
            <div>
              <h4 class="font-bold text-neutral-900 text-base">Business Reports</h4>
              <p class="text-xs text-neutral-500">Stock valuation, sales & P&L statements</p>
            </div>
          </div>
          <span class="material-icons text-neutral-400 group-hover:translate-x-1 transition">chevron_right</span>
        </button>

        <!-- Settings -->
        <button (click)="selectSubView.emit('settings')" class="bg-white p-5 rounded-2xl border border-neutral-200 hover:border-amber-500/50 transition flex items-center justify-between text-left group cursor-pointer sm:col-span-2">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <span class="material-icons text-2xl">settings</span>
            </div>
            <div>
              <h4 class="font-bold text-neutral-900 text-base">Shop Settings</h4>
              <p class="text-xs text-neutral-500">Store profile, live gold rates & tax configuration</p>
            </div>
          </div>
          <span class="material-icons text-neutral-400 group-hover:translate-x-1 transition">chevron_right</span>
        </button>
      </div>
    </div>
  `
})
export class More {
  readonly selectSubView = output<string>();
}
