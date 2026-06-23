/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  PEGAWAI = 'PEGAWAI',
  SELLER = 'SELLER',
  BUYER = 'BUYER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  password?: string;
  angkatan?: string;
  campus?: string;
  isGuest?: boolean;
  username?: string;
  phone?: string;
  gender?: 'Laki-laki' | 'Perempuan' | 'Lainnya' | string;
  addressDetail?: string;
  addressCity?: string;
  addressProvince?: string;
  addressDistrict?: string;
  addressSubdistrict?: string;
  addressRTRW?: string;
  addressReceiver?: string;
  addressPhone?: string;
  addressLatLng?: { lat: number; lng: number };
  sessionToken?: string;
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface StoreApplication {
  id: string;
  userId: string;
  name: string;
  username: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  nik: string;
  ktpPhoto: string;
  logo: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface Store {
  id: string;
  userId: string;
  name: string;
  username: string;
  description: string;
  logo: string;
  banner: string;
  rating: number;
  followersCount: number;
  createdAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  discount: number; // percentage (e.g. 10 for 10% off)
  weight: number; // in grams
  stock: number;
  categoryId: string;
  sizes: string[]; // e.g. ["S", "M", "L", "XL"]
  colors: string[]; // e.g. ["Black", "White"]
  images: string[]; // List of 5 image URLs
  createdAt: string;
  isPreOrder?: boolean;
  preOrderDpPercent?: number; // percentage, e.g. 20 for 20% DP
  isApproved?: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  DP_PAID = 'DP_PAID', // Down Payment paid, awaiting final payment (pelunasan)
  PAID = 'PAID', // Midtrans settlement (fully paid)
  SHIPPED = 'SHIPPED', // Seller sent, has resi
  DELIVERED = 'DELIVERED', // Handed over to buyer
  COMPLETED = 'COMPLETED', // Funds released to seller
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  discountPrice: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  address: {
    receiver: string;
    phone: string;
    detail: string;
    city: string;
  };
  courier: string;
  shippingCost: number;
  discount: number;
  platformFee: number;
  totalProductPrice: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentDetails?: {
    vaNumber?: string;
    bank?: string;
    qrUrl?: string;
    billCode?: string;
  };
  resiNo?: string;
  createdAt: string;
  updatedAt: string;
  isPreOrder?: boolean;
  preOrderDpPercent?: number;
  dpAmount?: number;
  remainingAmount?: number;
  pelunasanDeadline?: string;
  isFullPaid?: boolean;
  cancelReason?: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  usedRealMidtrans?: boolean;
}

export interface Wallet {
  storeId: string;
  balance: number;
  heldBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
}

export interface WalletTransaction {
  id: string;
  storeId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  createdAt: string;
}

export enum BankVerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface BankAccount {
  id: string;
  sellerId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  proofPhoto: string;
  nik: string;
  ktpPhoto: string;
  status: BankVerificationStatus;
  createdAt: string;
}

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export interface Withdrawal {
  id: string;
  sellerId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: WithdrawalStatus;
  notes?: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  image?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  text: string;
  image?: string;
  createdAt: string;
}

export interface Voucher {
  id: string;
  code: string;
  type: 'PLATFORM' | 'STORE';
  discountType: 'NOMINAL' | 'PERCENTAGE';
  amount: number;
  minPurchase: number;
  storeId?: string; // null if platform wide
  productId?: string; // null if store wide
  active: boolean;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  url: string;
  active: boolean;
}

export interface Settings {
  commissionPercent: number; // e.g. 5 for 5%
  adminWhatsapp?: string; // e.g. "628123456789"
  appLogo?: string;
  appName?: string;
}

export interface AndroidConfig {
  appName: string;
  packageName: string;
  appVersion: string;
  versionCode: string;
  serverUrl: string;
  statusBarColor: string;
  splashStyle: 'minimal' | 'gothic' | 'streetwear';
  enableGPS: boolean;
  enableCamera: boolean;
  enablePush: boolean;
  enableHardwareAcc: boolean;
  customDownloadUrl?: string; // Persistent external download link (e.g. Google Drive) configured by Admin!
  lastUploadedSize?: number;  // Saved size of uploaded APK
  lastUploadedAt?: string;    // Saved timestamp of uploaded APK
}

export interface DiagnosticReport {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  issueType: string;
  description: string;
  status: 'PENDING' | 'RESOLVED';
  systemInfo: {
    userAgent: string;
    language: string;
    viewport: string;
    latencyMs: number;
    localStorageHealth: boolean;
  };
  timestamp: string;
}

