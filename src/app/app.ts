import { Component, ChangeDetectionStrategy, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Header } from './components/header';
import { BottomNav, TabType } from './components/bottom-nav';
import { Toast } from './components/toast';
import { PwaInstallSheet } from './components/pwa-install';
import { PwaService } from './services/pwa.service';
import { Dashboard } from './pages/dashboard';
import { Inventory } from './pages/inventory';
import { Sales } from './pages/sales';
import { Customers } from './pages/customers';
import { More } from './pages/more';
import { Purchases } from './pages/purchases';
import { Suppliers } from './pages/suppliers';
import { Expenses } from './pages/expenses';
import { Reports } from './pages/reports';
import { Settings } from './pages/settings';
import { ProductCatalog } from './pages/catalog';
import { Girwa } from './pages/girwa';
import { SaleModal } from './pages/sale-modal';
import { PurchaseModal } from './pages/purchase-modal';
import { ExpenseModal } from './pages/expense-modal';
import { JewelleryService } from './services/jewellery.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    BottomNav,
    Toast,
    PwaInstallSheet,
    Dashboard,
    Inventory,
    Sales,
    Customers,
    More,
    Purchases,
    Suppliers,
    Expenses,
    Reports,
    Settings,
    ProductCatalog,
    Girwa,
    SaleModal,
    PurchaseModal,
    ExpenseModal
  ],
  templateUrl: './app.html'
})
export class App {
  private readonly platformId = inject(PLATFORM_ID);
  readonly pwa = inject(PwaService);
  readonly service = inject(JewelleryService);
  activeTab = signal<TabType>('dashboard');
  subView = signal<string | null>(null);

  readonly currentSection = computed(() => this.subView() ?? this.activeTab());

  onTabChange(tab: TabType) {
    this.activeTab.set(tab);
    this.subView.set(null);
  }

  onSubViewChange(view: string) {
    this.subView.set(view);
  }

  onDesktopSectionChange(section: string) {
    if (
      section === 'dashboard' ||
      section === 'inventory' ||
      section === 'sales' ||
      section === 'customers' ||
      section === 'more'
    ) {
      this.onTabChange(section);
      return;
    }
    this.onSubViewChange(section);
  }

  reloadApp(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    window.location.reload();
  }
}
