import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AppTheme, Product, Sale, Purchase, Customer, Supplier, Expense, ShopSettings } from '../models/jewellery.model';

interface LiveRatesResponse {
  goldRate24k: number;
  goldRate22k: number;
  silverRate: number;
  xauUsd?: number;
  xagUsd?: number;
  usdInr?: number;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JewelleryService {
  private readonly platformId = inject(PLATFORM_ID);
  // Signals for state
  private productsSignal = signal<Product[]>([
    {
      id: 'p1',
      name: 'Royal Bridal Gold Necklace Set',
      code: 'JWL-G-1001',
      category: 'Gold',
      metalType: '22K Gold',
      purity: '916 Hallmarked',
      grossWeight: 54.5,
      netWeight: 52.0,
      stoneWeight: 2.5,
      makingCharges: 45000,
      purchasePrice: 320000,
      jewelleryRate: 6650,
      sellingPrice: 395000,
      quantity: 2,
      minStockThreshold: 3,
      image: '/images/p1.jpg',
      videoUrl: '/videos/reel-p1.mp4',
      videoLabel: 'Showroom Reel',
      createdAt: '2026-02-01'
    },
    {
      id: 'p2',
      name: 'Solitaire Diamond Engagement Ring',
      code: 'JWL-D-2001',
      category: 'Diamond',
      metalType: '18K Gold',
      purity: '750 Hallmarked',
      grossWeight: 4.8,
      netWeight: 4.2,
      stoneWeight: 0.6,
      makingCharges: 15000,
      purchasePrice: 95000,
      jewelleryRate: 7250,
      sellingPrice: 135000,
      quantity: 5,
      minStockThreshold: 3,
      image: '/images/p2.jpg',
      videoUrl: '/videos/reel-p2.mp4',
      videoLabel: 'Showroom Reel',
      createdAt: '2026-02-03'
    },
    {
      id: 'p3',
      name: 'Traditional Antique Jhumka Earrings',
      code: 'JWL-G-1002',
      category: 'Gold',
      metalType: '22K Gold',
      purity: '916 Hallmarked',
      grossWeight: 22.4,
      netWeight: 21.0,
      stoneWeight: 1.4,
      makingCharges: 12000,
      purchasePrice: 130000,
      jewelleryRate: 6650,
      sellingPrice: 158000,
      quantity: 3,
      minStockThreshold: 4,
      image: '/images/p3.jpg',
      videoUrl: '/videos/reel-p3.mp4',
      videoLabel: 'Showroom Reel',
      createdAt: '2026-02-05'
    },
    {
      id: 'p4',
      name: 'Sterling Silver Filigree Payal (Anklets)',
      code: 'JWL-S-3001',
      category: 'Silver',
      metalType: '925 Silver',
      purity: 'Sterling 925',
      grossWeight: 85.0,
      netWeight: 85.0,
      stoneWeight: 0,
      makingCharges: 2500,
      purchasePrice: 7000,
      jewelleryRate: 92.5,
      sellingPrice: 11500,
      quantity: 8,
      minStockThreshold: 4,
      image: '/images/p4.jpg',
      videoUrl: '/videos/reel-p4.mp4',
      videoLabel: 'Showroom Reel',
      createdAt: '2026-02-08'
    },
    {
      id: 'p5',
      name: 'Temple Laxmi Coin Haram',
      code: 'JWL-G-1003',
      category: 'Gold',
      metalType: '22K Gold',
      purity: '916 Hallmarked',
      grossWeight: 78.0,
      netWeight: 76.5,
      stoneWeight: 1.5,
      makingCharges: 60000,
      purchasePrice: 480000,
      jewelleryRate: 6650,
      sellingPrice: 585000,
      quantity: 1,
      minStockThreshold: 2,
      image: '/images/p5.jpg',
      videoUrl: '/videos/reel-p5.mp4',
      videoLabel: 'Showroom Reel',
      createdAt: '2026-02-10'
    },
    {
      id: 'p6',
      name: 'Zircon Designer Party Bracelet',
      code: 'JWL-A-4001',
      category: 'Artificial',
      metalType: 'Brass/Alloy',
      purity: 'Micro Gold Plated',
      grossWeight: 35.0,
      netWeight: 30.0,
      stoneWeight: 5.0,
      makingCharges: 1000,
      purchasePrice: 1500,
      jewelleryRate: 120,
      sellingPrice: 3800,
      quantity: 12,
      minStockThreshold: 5,
      image: '/images/p6.jpg',
      videoUrl: '/videos/reel-p6.mp4',
      videoLabel: 'Showroom Reel',
      createdAt: '2026-02-12'
    }
  ]);

  private static dateDaysAgo(daysAgo: number, timeStr: string): string {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${timeStr}`;
  }

  private salesSignal = signal<Sale[]>([
    {
      id: 's1',
      invoiceNo: 'INV-2026-007',
      customerName: 'Priya Sharma',
      customerPhone: '+91 98765 43210',
      billType: 'GST',
      items: [
        {
          productId: 'p2',
          productName: 'Solitaire Diamond Engagement Ring',
          productCode: 'JWL-D-2001',
          quantity: 1,
          grossWeight: 4.8,
          netWeight: 4.2,
          weight: 4.2,
          unitPrice: 135000,
          discount: 5000,
          total: 130000
        }
      ],
      subtotal: 130000,
      discountTotal: 5000,
      gstRate: 3,
      gstAmount: 3900,
      grandTotal: 133900,
      paymentMode: 'UPI',
      date: JewelleryService.dateDaysAgo(0, '14:30'),
      status: 'Completed'
    },
    {
      id: 's2',
      invoiceNo: 'INV-2026-006',
      customerName: 'Rajesh Verma',
      customerPhone: '+91 91234 56789',
      billType: 'GST',
      items: [
        {
          productId: 'p4',
          productName: 'Sterling Silver Filigree Payal (Anklets)',
          productCode: 'JWL-S-3001',
          quantity: 2,
          grossWeight: 90.0,
          netWeight: 85.0,
          weight: 85.0,
          unitPrice: 11500,
          discount: 1000,
          total: 22000
        }
      ],
      subtotal: 22000,
      discountTotal: 1000,
      gstRate: 3,
      gstAmount: 660,
      grandTotal: 22660,
      paymentMode: 'Cash',
      date: JewelleryService.dateDaysAgo(0, '11:15'),
      status: 'Completed'
    },
    {
      id: 's3',
      invoiceNo: 'INV-2026-005',
      customerName: 'Sunita Rao',
      customerPhone: '+91 99887 76655',
      billType: 'GST',
      items: [
        {
          productId: 'p3',
          productName: 'Traditional Antique Jhumka Earrings',
          productCode: 'JWL-G-1002',
          quantity: 1,
          grossWeight: 22.5,
          netWeight: 21.0,
          weight: 21.0,
          unitPrice: 158000,
          discount: 3000,
          total: 155000
        }
      ],
      subtotal: 158000,
      discountTotal: 3000,
      gstRate: 3,
      gstAmount: 4650,
      grandTotal: 159650,
      paymentMode: 'Card',
      date: JewelleryService.dateDaysAgo(1, '17:40'),
      status: 'Completed'
    },
    {
      id: 's4',
      invoiceNo: 'INV-2026-004',
      customerName: 'Kavita Iyer',
      customerPhone: '+91 98401 11223',
      billType: 'GST',
      items: [
        {
          productId: 'p6',
          productName: 'Zircon Designer Party Bracelet',
          productCode: 'JWL-A-4001',
          quantity: 3,
          grossWeight: 95.0,
          netWeight: 90.0,
          weight: 90.0,
          unitPrice: 3800,
          discount: 400,
          total: 11000
        }
      ],
      subtotal: 11400,
      discountTotal: 400,
      gstRate: 3,
      gstAmount: 330,
      grandTotal: 11330,
      paymentMode: 'UPI',
      date: JewelleryService.dateDaysAgo(2, '13:10'),
      status: 'Completed'
    },
    {
      id: 's5',
      invoiceNo: 'INV-2026-003',
      customerName: 'Arjun Nair',
      customerPhone: '+91 97310 55442',
      billType: 'GST',
      items: [
        {
          productId: 'p1',
          productName: 'Royal Bridal Gold Necklace Set',
          productCode: 'JWL-G-1001',
          quantity: 1,
          grossWeight: 56.0,
          netWeight: 52.0,
          weight: 52.0,
          unitPrice: 395000,
          discount: 10000,
          total: 385000
        }
      ],
      subtotal: 395000,
      discountTotal: 10000,
      gstRate: 3,
      gstAmount: 11550,
      grandTotal: 396550,
      paymentMode: 'Bank Transfer',
      date: JewelleryService.dateDaysAgo(3, '16:05'),
      status: 'Completed'
    },
    {
      id: 's6',
      invoiceNo: 'INV-2026-002',
      customerName: 'Meera Kapoor',
      customerPhone: '+91 98200 77889',
      billType: 'GST',
      items: [
        {
          productId: 'p2',
          productName: 'Solitaire Diamond Engagement Ring',
          productCode: 'JWL-D-2001',
          quantity: 1,
          grossWeight: 4.8,
          netWeight: 4.2,
          weight: 4.2,
          unitPrice: 135000,
          discount: 0,
          total: 135000
        }
      ],
      subtotal: 135000,
      discountTotal: 0,
      gstRate: 3,
      gstAmount: 4050,
      grandTotal: 139050,
      paymentMode: 'Card',
      date: JewelleryService.dateDaysAgo(4, '12:45'),
      status: 'Completed'
    },
    {
      id: 's7',
      invoiceNo: 'INV-2026-001',
      customerName: 'Deepak Malhotra',
      customerPhone: '+91 98112 33445',
      billType: 'Estimate',
      items: [
        {
          productId: 'p3',
          productName: 'Traditional Antique Jhumka Earrings',
          productCode: 'JWL-G-1002',
          quantity: 1,
          grossWeight: 22.5,
          netWeight: 21.0,
          weight: 21.0,
          unitPrice: 158000,
          discount: 8000,
          total: 150000
        }
      ],
      subtotal: 158000,
      discountTotal: 8000,
      gstRate: 0,
      gstAmount: 0,
      grandTotal: 150000,
      paymentMode: 'UPI',
      date: JewelleryService.dateDaysAgo(6, '15:20'),
      status: 'Completed'
    }
  ]);

  private purchasesSignal = signal<Purchase[]>([
    {
      id: 'pur-1',
      purchaseNo: 'PUR-2026-001',
      supplierId: 'sup-1',
      supplierName: 'Swarnagiri Bullion & Refiners',
      items: [
        {
          productId: 'p1',
          productName: 'Royal Bridal Gold Necklace Set',
          category: 'Gold',
          weight: 52.0,
          ratePerGram: 6150,
          total: 320000
        }
      ],
      totalAmount: 320000,
      date: '2026-02-01',
      status: 'Received'
    }
  ]);

  private customersSignal = signal<Customer[]>([
    {
      id: 'c1',
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      email: 'priya.sharma@gmail.com',
      address: '42, MG Road, Jubilee Hills, Hyderabad',
      totalPurchases: 133900,
      loyaltyPoints: 1330,
      lastVisit: '2026-02-15'
    },
    {
      id: 'c2',
      name: 'Rajesh Verma',
      phone: '+91 91234 56789',
      email: 'rajesh.v@yahoo.com',
      address: '15-A, Park Street, Kolkata',
      totalPurchases: 22660,
      loyaltyPoints: 226,
      lastVisit: '2026-02-15'
    },
    {
      id: 'c3',
      name: 'Sunita Rao',
      phone: '+91 99887 76655',
      email: 'sunita.rao@outlook.com',
      address: '78, Indiranagar, Bengaluru',
      totalPurchases: 450000,
      loyaltyPoints: 4500,
      lastVisit: '2026-02-10'
    }
  ]);

  private suppliersSignal = signal<Supplier[]>([
    {
      id: 'sup-1',
      name: 'Anand Kumar',
      companyName: 'Swarnagiri Bullion & Refiners',
      phone: '+91 98111 22333',
      email: 'anand@swarnagiribullion.com',
      metalSupplied: '22K & 18K Gold Bars',
      balanceDue: 50000
    },
    {
      id: 'sup-2',
      name: 'Vikram Mehta',
      companyName: 'Mehta Diamond Exporters',
      phone: '+91 98222 33444',
      email: 'vikram@mehtadiamonds.in',
      metalSupplied: 'Certified Cut Diamonds',
      balanceDue: 0
    },
    {
      id: 'sup-3',
      name: 'Suresh Jain',
      companyName: 'SilverCraft Solutions',
      phone: '+91 98333 44555',
      email: 'suresh@silvercraft.co.in',
      metalSupplied: '925 Sterling Silver Articles',
      balanceDue: 12000
    }
  ]);

  private expensesSignal = signal<Expense[]>([
    {
      id: 'exp-1',
      title: 'Showroom Monthly Rent',
      category: 'Rent',
      amount: 75000,
      date: '2026-02-01',
      notes: 'February 2026 rent paid to landlord',
      paidBy: 'Bank Transfer'
    },
    {
      id: 'exp-2',
      title: 'BIS Hallmarking Testing Fees',
      category: 'Hallmarking & Testing',
      amount: 4500,
      date: '2026-02-05',
      notes: 'For 15 gold articles batch testing',
      paidBy: 'UPI'
    }
  ]);

  private settingsSignal = signal<ShopSettings>({
    shopName: 'SwarnaMudra Fine Jewellers',
    tagline: 'Timeless Elegance & Certified Purity',
    ownerName: 'Manoj Kumar Jeweller',
    phone: '+91 94440 12345',
    email: 'contact@swarnamudrajewels.com',
    address: 'Grand Emporium, 1st Floor, Besant Road, T. Nagar, Chennai - 600017',
    gstin: '33AABCS1429B1Z8',
    currency: '₹',
    goldRate24k: 7580,
    goldRate22k: 6950,
    silverRate: 91.50,
    gstPercentage: 3,
    defaultLowStockThreshold: 3,
    theme: 'light'
  });

  private toastSignal = signal<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  private readonly isLoadingRatesSignal = signal<boolean>(false);
  private readonly ratesLiveSourceSignal = signal<boolean>(false);
  private readonly ratesUpdatedAtSignal = signal<string | null>(null);

  // Computed Properties
  readonly products = this.productsSignal.asReadonly();
  readonly sales = this.salesSignal.asReadonly();
  readonly purchases = this.purchasesSignal.asReadonly();
  readonly customers = this.customersSignal.asReadonly();
  readonly suppliers = this.suppliersSignal.asReadonly();
  readonly expenses = this.expensesSignal.asReadonly();
  readonly settings = this.settingsSignal.asReadonly();
  readonly toast = this.toastSignal.asReadonly();
  readonly isLoadingRates = this.isLoadingRatesSignal.asReadonly();
  readonly ratesLiveSource = this.ratesLiveSourceSignal.asReadonly();
  readonly ratesUpdatedAt = this.ratesUpdatedAtSignal.asReadonly();
  readonly currentTheme = computed(() => this.settingsSignal().theme);

  // Global & Synchronized Section Search Queries
  readonly globalSearchQuery = signal<string>('');
  readonly inventorySearchQuery = signal<string>('');
  readonly customersSearchQuery = signal<string>('');
  readonly salesSearchQuery = signal<string>('');

  setGlobalSearchQuery(query: string) {
    this.globalSearchQuery.set(query);
    this.inventorySearchQuery.set(query);
    this.customersSearchQuery.set(query);
    this.salesSearchQuery.set(query);
  }

  clearGlobalSearch() {
    this.setGlobalSearchQuery('');
  }

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('swarnamudra_theme');
      if (
        savedTheme === 'light' ||
        savedTheme === 'dark' ||
        savedTheme === 'gold-luxury' ||
        savedTheme === 'blue-white'
      ) {
        this.settingsSignal.update(current => ({ ...current, theme: savedTheme }));
      }

      effect(() => {
        const theme = this.settingsSignal().theme;
        this.applyThemeToDom(theme);
      });

      void this.refreshLiveRates(false);
      window.setInterval(() => {
        void this.refreshLiveRates(false);
      }, 60_000);
    }
  }

  private applyThemeToDom(theme: AppTheme) {
    if (!isPlatformBrowser(this.platformId)) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('swarnamudra_theme', theme);

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      const color =
        theme === 'gold-luxury'
          ? '#000000'
          : theme === 'dark'
            ? '#09090b'
            : theme === 'blue-white'
              ? '#1e3a8a'
              : '#171717';
      themeMeta.setAttribute('content', color);
    }
  }

  setTheme(theme: AppTheme) {
    this.settingsSignal.update(current => ({ ...current, theme }));
    const label =
      theme === 'gold-luxury'
        ? 'Gold / Luxury High-Contrast'
        : theme === 'dark'
          ? 'Obsidian Dark'
          : theme === 'blue-white'
            ? 'Royal Blue & White'
            : 'Light Classic';
    this.showToast(`Theme switched to ${label}.`);
  }

  async refreshLiveRates(showFeedback = false): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.isLoadingRatesSignal()) {
      return;
    }

    this.isLoadingRatesSignal.set(true);
    try {
      const response = await fetch('/api/rates', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as LiveRatesResponse;
      if (
        Number.isFinite(data.goldRate24k) &&
        Number.isFinite(data.goldRate22k) &&
        Number.isFinite(data.silverRate)
      ) {
        this.settingsSignal.update(current => ({
          ...current,
          goldRate24k: data.goldRate24k,
          goldRate22k: data.goldRate22k,
          silverRate: data.silverRate
        }));
        this.ratesLiveSourceSignal.set(true);
        this.ratesUpdatedAtSignal.set(data.updatedAt || new Date().toISOString());
        if (showFeedback) {
          this.showToast(`Live rates updated: 24K ₹${data.goldRate24k}/g • 22K ₹${data.goldRate22k}/g`);
        }
      }
    } catch {
      if (showFeedback) {
        this.showToast('Unable to reach live bullion feed right now.', 'error');
      }
    } finally {
      this.isLoadingRatesSignal.set(false);
    }
  }

  readonly totalProductsCount = computed(() => this.productsSignal().reduce((acc, p) => acc + p.quantity, 0));
  
  readonly totalGoldStockWeight = computed(() => {
    return this.productsSignal()
      .filter(p => p.category === 'Gold')
      .reduce((acc, p) => acc + (p.netWeight * p.quantity), 0);
  });

  readonly totalSilverStockWeight = computed(() => {
    return this.productsSignal()
      .filter(p => p.category === 'Silver')
      .reduce((acc, p) => acc + (p.netWeight * p.quantity), 0);
  });

  readonly todaysSalesTotal = computed(() => {
    return this.salesSignal().reduce((acc, s) => acc + s.grandTotal, 0);
  });

  readonly todaysPurchasesTotal = computed(() => {
    return this.purchasesSignal().reduce((acc, p) => acc + p.totalAmount, 0);
  });

  readonly estimatedProfit = computed(() => {
    const totalSalesRev = this.salesSignal().reduce((acc, s) => acc + s.subtotal, 0);
    // Estimated purchase cost of sold items (approx 80% of selling subtotal or calculated)
    const estimatedCost = totalSalesRev * 0.82;
    return Math.round(totalSalesRev - estimatedCost);
  });

  readonly lowStockProducts = computed(() =>
    this.productsSignal().filter(p => this.isLowStock(p))
  );

  getMinThreshold(product: Product): number {
    const raw = product.minStockThreshold ?? this.settingsSignal().defaultLowStockThreshold;
    return Math.max(0, Math.floor(Number(raw) || 0));
  }

  isLowStock(product: Product): boolean {
    const limit = this.getMinThreshold(product);
    return product.quantity < limit;
  }

  updateDefaultLowStockThreshold(threshold: number) {
    const safeLimit = Math.max(0, Math.floor(Number(threshold) || 0));
    this.settingsSignal.update(current => ({
      ...current,
      defaultLowStockThreshold: safeLimit
    }));
    this.showToast(`Default minimum stock limit set to ${safeLimit} pcs.`);
  }

  // Actions
  showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastSignal.set({ message, type });
    setTimeout(() => {
      if (this.toastSignal()?.message === message) {
        this.toastSignal.set(null);
      }
    }, 3500);
  }

  // Product CRUD
  addProduct(product: Omit<Product, 'id' | 'createdAt'>) {
    const newProduct: Product = {
      ...product,
      id: 'p_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.productsSignal.update(list => [newProduct, ...list]);
    this.showToast('Product added successfully to inventory!');
  }

  updateProduct(id: string, updated: Partial<Product>) {
    this.productsSignal.update(list => list.map(p => p.id === id ? { ...p, ...updated } : p));
    this.showToast('Product updated successfully!');
  }

  deleteProduct(id: string) {
    this.productsSignal.update(list => list.filter(p => p.id !== id));
    this.showToast('Product deleted from inventory.', 'info');
  }

  updateProductVideo(id: string, videoUrl: string | undefined, videoLabel?: string) {
    this.productsSignal.update(list =>
      list.map(p => (p.id === id ? { ...p, videoUrl, videoLabel } : p))
    );
    if (videoUrl) {
      this.showToast('Product showcase video saved!');
    } else {
      this.showToast('Product video removed.', 'info');
    }
  }

  bulkUpdateMakingCharges(
    ids: string[],
    mode: 'set' | 'increase' | 'decrease',
    value: number,
    unit: 'amount' | 'percent' = 'amount',
    adjustSellingPrice = true
  ) {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    const safeVal = Math.max(0, value);

    this.productsSignal.update(list =>
      list.map(p => {
        if (!idSet.has(p.id)) return p;

        let newCharges = p.makingCharges;
        if (mode === 'set') {
          newCharges = Math.round(safeVal);
        } else if (mode === 'increase') {
          const delta = unit === 'percent' ? (p.makingCharges * safeVal) / 100 : safeVal;
          newCharges = Math.round(p.makingCharges + delta);
        } else if (mode === 'decrease') {
          const delta = unit === 'percent' ? (p.makingCharges * safeVal) / 100 : safeVal;
          newCharges = Math.max(0, Math.round(p.makingCharges - delta));
        }

        const diff = newCharges - p.makingCharges;
        const newSellingPrice = adjustSellingPrice
          ? Math.max(0, p.sellingPrice + diff)
          : p.sellingPrice;

        return {
          ...p,
          makingCharges: newCharges,
          sellingPrice: newSellingPrice
        };
      })
    );

    this.showToast(`Updated making charges for ${ids.length} item${ids.length === 1 ? '' : 's'}!`);
  }

  bulkDeleteProducts(ids: string[]) {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    this.productsSignal.update(list => list.filter(p => !idSet.has(p.id)));
    this.showToast(`${ids.length} item${ids.length === 1 ? '' : 's'} deleted from inventory.`, 'info');
  }

  // Sale CRUD
  addSale(saleData: Omit<Sale, 'id' | 'invoiceNo' | 'date'>) {
    const invoiceNo = `INV-2026-${String(this.salesSignal().length + 1).padStart(3, '0')}`;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const newSale: Sale = {
      ...saleData,
      id: 's_' + Date.now(),
      invoiceNo,
      date: JewelleryService.dateDaysAgo(0, `${hh}:${min}`)
    };
    this.salesSignal.update(list => [newSale, ...list]);

    // Decrease product quantities
    for (const item of newSale.items) {
      this.productsSignal.update(prods => prods.map(p => {
        if (p.id === item.productId) {
          return { ...p, quantity: Math.max(0, p.quantity - item.quantity) };
        }
        return p;
      }));
    }

    this.showToast(`Sale created successfully! Invoice #${invoiceNo}`);
  }

  // Customer CRUD
  addCustomer(customer: Omit<Customer, 'id' | 'totalPurchases' | 'loyaltyPoints' | 'lastVisit'>) {
    const newCust: Customer = {
      ...customer,
      id: 'c_' + Date.now(),
      totalPurchases: 0,
      loyaltyPoints: 0,
      lastVisit: new Date().toISOString().split('T')[0]
    };
    this.customersSignal.update(list => [newCust, ...list]);
    this.showToast('Customer registered successfully!');
  }

  updateCustomer(id: string, updated: Partial<Customer>) {
    this.customersSignal.update(list => list.map(c => c.id === id ? { ...c, ...updated } : c));
    this.showToast('Customer details updated.');
  }

  deleteCustomer(id: string) {
    this.customersSignal.update(list => list.filter(c => c.id !== id));
    this.showToast('Customer removed.', 'info');
  }

  // Purchase CRUD
  addPurchase(purchase: Omit<Purchase, 'id' | 'purchaseNo' | 'date'>) {
    const purchaseNo = `PUR-2026-${String(this.purchasesSignal().length + 1).padStart(3, '0')}`;
    const newPur: Purchase = {
      ...purchase,
      id: 'pur_' + Date.now(),
      purchaseNo,
      date: new Date().toISOString().split('T')[0]
    };
    this.purchasesSignal.update(list => [newPur, ...list]);
    this.showToast(`Purchase recorded! #${purchaseNo}`);
  }

  // Supplier CRUD
  addSupplier(supplier: Omit<Supplier, 'id' | 'balanceDue'>) {
    const newSup: Supplier = {
      ...supplier,
      id: 'sup_' + Date.now(),
      balanceDue: 0
    };
    this.suppliersSignal.update(list => [newSup, ...list]);
    this.showToast('Supplier added successfully!');
  }

  updateSupplier(id: string, updated: Partial<Supplier>) {
    this.suppliersSignal.update(list => list.map(s => s.id === id ? { ...s, ...updated } : s));
    this.showToast('Supplier updated.');
  }

  // Expense CRUD
  addExpense(expense: Omit<Expense, 'id'>) {
    const newExp: Expense = {
      ...expense,
      id: 'exp_' + Date.now()
    };
    this.expensesSignal.update(list => [newExp, ...list]);
    this.showToast('Expense recorded successfully!');
  }

  updateSettings(newSettings: ShopSettings) {
    const activeTheme = newSettings.theme || this.settingsSignal().theme;
    this.settingsSignal.set({ ...newSettings, theme: activeTheme });
    this.showToast('Shop settings updated successfully!');
  }
}
