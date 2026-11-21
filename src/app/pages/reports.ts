import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4 lg:space-y-5 pb-20 lg:pb-8">
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
        <h2 class="text-xl font-bold text-neutral-900 tracking-tight">Business Reports & Analytics</h2>
        <p class="text-xs text-neutral-500">Comprehensive daily sales, stock valuation and profit & loss statements</p>
      </div>

      <!-- Financial Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-neutral-200">
          <div class="text-neutral-500 text-xs font-medium">Total Gross Revenue</div>
          <div class="text-2xl font-extrabold text-neutral-900 mt-1 tabular-nums">₹{{ totalRevenue() | number:'1.0-0' }}</div>
          <div class="text-xs text-emerald-600 font-semibold mt-2 flex items-center">
            <span class="material-icons text-xs mr-1">arrow_upward</span> Verified Counter Receipts
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-neutral-200">
          <div class="text-neutral-500 text-xs font-medium">Total Bullion Purchases</div>
          <div class="text-2xl font-extrabold text-neutral-900 mt-1 tabular-nums">₹{{ totalPurchases() | number:'1.0-0' }}</div>
          <div class="text-xs text-amber-700 font-semibold mt-2 flex items-center">
            <span class="material-icons text-xs mr-1">inventory</span> Wholesale Inflow
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-neutral-200">
          <div class="text-neutral-500 text-xs font-medium">Net Estimated Profit</div>
          <div class="text-2xl font-extrabold text-emerald-700 mt-1 tabular-nums">₹{{ service.estimatedProfit() | number:'1.0-0' }}</div>
          <div class="text-xs text-neutral-500 font-semibold mt-2 flex items-center">
            <span class="material-icons text-xs mr-1">trending_up</span> After Margin Estimates
          </div>
        </div>
      </div>

      <!-- Side-by-Side Desktop Panels: Stock Valuation + P&L Statement -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <!-- Stock Valuation Report -->
        <div class="bg-white rounded-2xl p-6 border border-neutral-200 space-y-4">
          <h3 class="font-bold text-neutral-900 text-base flex items-center">
            <span class="material-icons text-amber-600 mr-2">pie_chart</span> Metal Stock Valuation Report
          </h3>

          <div class="grid grid-cols-2 gap-3.5 pt-2">
            <div class="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
              <span class="text-xs text-amber-900 block font-medium">Gold Stock Wt</span>
              <span class="text-lg font-extrabold text-amber-950 mt-1 block tabular-nums">{{ service.totalGoldStockWeight() | number:'1.1-1' }} g</span>
            </div>
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span class="text-xs text-slate-700 block font-medium">Silver Stock Wt</span>
              <span class="text-lg font-extrabold text-slate-900 mt-1 block tabular-nums">{{ service.totalSilverStockWeight() | number:'1.1-1' }} g</span>
            </div>
            <div class="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <span class="text-xs text-neutral-600 block font-medium">Total SKUs</span>
              <span class="text-lg font-extrabold text-neutral-900 mt-1 block tabular-nums">{{ service.products().length }} Items</span>
            </div>
            <div class="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <span class="text-xs text-neutral-600 block font-medium">Total Units</span>
              <span class="text-lg font-extrabold text-neutral-900 mt-1 block tabular-nums">{{ service.totalProductsCount() }} Pcs</span>
            </div>
          </div>
        </div>

        <!-- Profit & Loss Breakdown -->
        <div class="bg-white rounded-2xl p-6 border border-neutral-200 space-y-4">
          <h3 class="font-bold text-neutral-900 text-base flex items-center">
            <span class="material-icons text-amber-600 mr-2">account_balance</span> Profit & Loss Statement
          </h3>

          <div class="space-y-3 text-xs">
            <div class="flex justify-between py-2 border-b border-neutral-100">
              <span class="text-neutral-700">Gross Counter Sales Revenue</span>
              <span class="font-bold text-neutral-900 tabular-nums">₹{{ totalRevenue() | number:'1.0-0' }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-neutral-100">
              <span class="text-neutral-700">Cost of Goods Sold (COGS Estimate)</span>
              <span class="font-bold text-red-600 tabular-nums">-₹{{ (totalRevenue() * 0.82) | number:'1.0-0' }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-neutral-100">
              <span class="text-neutral-700">Total Operating Expenses (Rent, Utilities, Hallmarking)</span>
              <span class="font-bold text-red-600 tabular-nums">-₹{{ totalExpenses() | number:'1.0-0' }}</span>
            </div>
            <div class="flex justify-between py-3 text-sm font-extrabold text-neutral-950 border-t-2 border-neutral-300">
              <span>Net Operating Profit</span>
              <span class="text-emerald-700 text-base tabular-nums">₹{{ (totalRevenue() * 0.18 - totalExpenses()) | number:'1.0-0' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Reports {
  readonly service = inject(JewelleryService);

  readonly totalRevenue = computed(() => {
    return this.service.sales().reduce((acc, s) => acc + s.grandTotal, 0);
  });

  readonly totalPurchases = computed(() => {
    return this.service.purchases().reduce((acc, p) => acc + p.totalAmount, 0);
  });

  readonly totalExpenses = computed(() => {
    return this.service.expenses().reduce((acc, e) => acc + e.amount, 0);
  });
}
