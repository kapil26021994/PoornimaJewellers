export type CategoryType = 'Gold' | 'Silver' | 'Diamond' | 'Artificial';
export type MetalType = '24K Gold' | '22K Gold' | '18K Gold' | '14K Gold' | '925 Silver' | 'Pure Silver' | 'Platinum' | 'Brass/Alloy';
export type AppTheme = 'light' | 'dark' | 'gold-luxury' | 'blue-white';

export interface Product {
  id: string;
  name: string;
  code: string;
  category: CategoryType;
  metalType: MetalType;
  purity: string;
  grossWeight: number; // in grams
  netWeight: number; // in grams
  stoneWeight?: number; // in grams
  makingCharges: number; // in INR
  purchasePrice?: number; // in INR
  jewelleryRate: number; // in INR per gram or total rate (Jewellery Bhav)
  sellingPrice: number; // in INR
  quantity: number;
  minStockThreshold?: number;
  image: string;
  images?: string[];
  videoUrl?: string;
  videoLabel?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  grossWeight: number;
  netWeight: number;
  weight: number;
  purity?: string;
  jewelleryRate?: number;
  unitPrice: number;
  makingCharges?: number;
  discount: number;
  total: number;
}

export interface OldJewelleryDetails {
  hasOldJewellery: boolean;
  grossWeight: number;
  netWeight: number;
  ratePerGram: number;
  totalValue: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  billType: 'Estimate' | 'GST';
  items: SaleItem[];
  subtotal: number;
  discountTotal: number;
  oldJewellery?: OldJewelleryDetails;
  gstRate: number; // e.g., 3% for jewellery in India, 0% for estimate
  gstAmount: number;
  grandTotal: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  date: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
}

export interface PurchaseItem {
  productId?: string;
  productName: string;
  category: CategoryType;
  weight: number;
  ratePerGram: number;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNo: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  date: string;
  status: 'Received' | 'Ordered';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalPurchases: number;
  loyaltyPoints: number;
  lastVisit: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  metalSupplied: string;
  balanceDue: number;
}

export interface Expense {
  id: string;
  title: string;
  category: 'Rent' | 'Salary' | 'Utilities' | 'Hallmarking & Testing' | 'Marketing' | 'Maintenance' | 'Other';
  amount: number;
  date: string;
  notes: string;
  paidBy: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  currency: string;
  goldRate24k: number;
  goldRate22k: number;
  silverRate: number;
  gstPercentage: number;
  defaultLowStockThreshold: number;
  theme: AppTheme;
}

export type GirwaStatus = 'Active' | 'Released' | 'Defaulted';

export interface GirwaItem {
  itemName: string;
  metalType: MetalType;
  purity: string;
  grossWeight: number; // in grams
  netWeight: number; // in grams
  itemDescription?: string;
  valuationAmount: number; // Estimated gold/silver value
}

export interface GirwaInterestPayment {
  id: string;
  date: string;
  amount: number;
  monthsCovered: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
  receiptNo: string;
  notes?: string;
}

export interface GirwaRecord {
  id: string;
  girwaNo: string; // e.g. "GRV-2026-001"
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerAadhaar?: string;
  items: GirwaItem[];
  totalGrossWeight: number;
  totalNetWeight: number;
  totalValuation: number;
  loanAmount: number; // Principal ₹ given to customer
  interestRateMonthly: number; // e.g. 1.5% or 2.0% per month
  startDate: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  closedDate?: string;
  status: GirwaStatus; // 'Active' | 'Released' | 'Defaulted'
  interestPayments: GirwaInterestPayment[];
  storageLockerNo?: string; // Locker / Box # where jewellery is stored safely
  notes?: string;
}

