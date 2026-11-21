export type CategoryType = 'Gold' | 'Silver' | 'Diamond' | 'Artificial';
export type MetalType = '22K Gold' | '18K Gold' | '14K Gold' | '925 Silver' | 'Platinum' | 'Brass/Alloy';
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
  unitPrice: number;
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
