/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, memoryLocalCache, doc, setDoc, getDocs, collection } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  User, Role, Store, StoreApplication, Product, Category, Order, OrderStatus,
  Wallet, WalletTransaction, BankAccount, Withdrawal, Chat, Message, Review,
  Voucher, Banner, Settings, ApplicationStatus, BankVerificationStatus, WithdrawalStatus,
  DiagnosticReport, AndroidConfig, AppNotification
} from '../src/types';

const DB_PATH = path.join(process.cwd(), 'db.json');
const DB_BACKUP_PATH = path.join(process.cwd(), 'db_backup.json');

// Initialize Firebase lazily to prevent load-time crashes when configuration is incomplete or missing
let firestoreInstance: any = null;

export function getFirestoreDb() {
  if (firestoreInstance) return firestoreInstance;
  try {
    const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreInstance = initializeFirestore(firebaseApp, {
      localCache: memoryLocalCache(),
      experimentalForceLongPolling: true,
    }, firebaseConfig.firestoreDatabaseId);
    return firestoreInstance;
  } catch (error) {
    console.error('⚠️ Failed to initialize Firestore SDK lazily:', error);
    return null;
  }
}

export interface FullDatabase {
  users: User[];
  storeApplications: StoreApplication[];
  stores: Store[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  wallets: Wallet[];
  walletTransactions: WalletTransaction[];
  bankAccounts: BankAccount[];
  withdrawals: Withdrawal[];
  chats: Chat[];
  messages: Message[];
  reviews: Review[];
  vouchers: Voucher[];
  banners: Banner[];
  settings: Settings;
  follows: { userId: string; storeId: string; }[];
  diagnosticReports?: DiagnosticReport[];
  androidConfig?: AndroidConfig;
  notifications?: AppNotification[];
}

const TABLE_KEYS: (keyof FullDatabase)[] = [
  'users',
  'storeApplications',
  'stores',
  'products',
  'categories',
  'orders',
  'wallets',
  'walletTransactions',
  'bankAccounts',
  'withdrawals',
  'chats',
  'messages',
  'reviews',
  'vouchers',
  'banners',
  'settings',
  'follows',
  'diagnosticReports',
  'androidConfig',
  'notifications'
];

// In-memory cache
let cachedDb: FullDatabase | null = null;
// Track last saved state to avoid redundant Firestore writes
let lastSavedStateJson: { [key: string]: string } = {};

// Helper to load fallback seed data
function getInitialSeedData(): FullDatabase {
  return {
    users: [
      { id: 'usr_admin', name: 'Super Admin Toko Sipil', email: 'admin@tokosipil.com', role: Role.SUPER_ADMIN, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
      { id: 'usr_pegawai', name: 'Ahmad Staff', email: 'pegawai@tokosipil.com', role: Role.PEGAWAI, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      { id: 'usr_seller', name: 'Vendy Toko Sipil Seller', email: 'seller@tokosipil.com', role: Role.SELLER, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
      { id: 'usr_buyer', name: 'Iyasya Buyer', email: 'buyer@tokosipil.com', role: Role.BUYER, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    ],
    storeApplications: [
      {
        id: 'app_maternal',
        userId: 'usr_seller',
        name: 'Toko Sipil',
        username: 'maternal',
        ownerName: 'Vendy Toko Sipil',
        phone: '08123456789',
        email: 'seller@tokosipil.com',
        address: 'Jl. Dipati Ukur No.40, Bandung, Jawa Barat',
        nik: '3273010101010001',
        ktpPhoto: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500',
        logo: 'https://images.unsplash.com/photo-1599305445671-32c63a5036f0?w=150',
        bankName: 'BCA',
        bankAccount: '1234567890',
        bankAccountName: 'Vendy Toko Sipil',
        status: ApplicationStatus.APPROVED,
        createdAt: new Date().toISOString()
      },
      {
        id: 'app_pending_toko',
        userId: 'usr_buyer',
        name: 'Karnaval Store',
        username: 'karnaval',
        ownerName: 'Iyasya',
        phone: '08987654321',
        email: 'buyer@tokosipil.com',
        address: 'Jl. Sudirman No.80, Bandung, Jawa Barat',
        nik: '3273020202020002',
        ktpPhoto: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
        bankName: 'Mandiri',
        bankAccount: '9876543210',
        bankAccountName: 'Iyasya Store Client',
        status: ApplicationStatus.PENDING,
        createdAt: new Date().toISOString()
      }
    ],
    stores: [
      {
        id: 'str_maternal',
        userId: 'usr_seller',
        name: 'Toko Sipil',
        username: 'maternal',
        description: 'Toko Sipil - Born to rule. Raw alternative gothic fashion and dark subculture merch.',
        logo: 'https://images.unsplash.com/photo-1599305445671-32c63a5036f0?w=150&h=150&fit=crop',
        banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop',
        rating: 4.8,
        followersCount: 1240,
        createdAt: new Date().toISOString()
      }
    ],
    categories: [
      { id: 'cat_tshirts', name: 'T-Shirts', slug: 't-shirts', icon: 'Shirt' },
      { id: 'cat_hoodies', name: 'Hoodies', slug: 'hoodies', icon: 'Flame' },
      { id: 'cat_jackets', name: 'Jackets', slug: 'jackets', icon: 'Scissors' },
      { id: 'cat_pants', name: 'Pants', slug: 'pants', icon: 'Square' },
      { id: 'cat_accessories', name: 'Accessories', slug: 'accessories', icon: 'Sparkles' },
    ],
    products: [
      {
        id: 'prod_jiraga',
        storeId: 'str_maternal',
        storeName: 'Toko Sipil',
        name: 'JIRAGA T-Shirt',
        sku: 'MT-JRG-01',
        description: 'Cotton combed 24s lightweight. Heavy gothic illustration print on the chest. Raw edges, pre-shrunk for maximum comfort and style.',
        price: 219000,
        discount: 0,
        weight: 250,
        stock: 45,
        categoryId: 'cat_tshirts',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Off-White'],
        images: [
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&fit=crop',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&fit=crop',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&fit=crop',
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&fit=crop',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&fit=crop'
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod_pinion',
        storeId: 'str_maternal',
        storeName: 'Toko Sipil',
        name: 'PINION T-Shirt',
        sku: 'MT-PIN-02',
        description: 'High definition blueprint prints detailing fallen angel skeletons. Signature Toko Sipil cut with relaxed shoulder fitment.',
        price: 219000,
        discount: 10,
        weight: 250,
        stock: 30,
        categoryId: 'cat_tshirts',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['White', 'Black'],
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&fit=crop',
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&fit=crop',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&fit=crop',
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&fit=crop',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&fit=crop'
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod_geose',
        storeId: 'str_maternal',
        storeName: 'Toko Sipil',
        name: 'GEOSE Technical T-Shirt',
        sku: 'MT-GEO-03',
        description: 'Tactical elements integrated with high-tech nylon side panellings. Raw alternative urban streetwear design.',
        price: 329000,
        discount: 0,
        weight: 290,
        stock: 12,
        categoryId: 'cat_tshirts',
        sizes: ['M', 'L', 'XL'],
        colors: ['Black Charcoal'],
        images: [
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&fit=crop',
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&fit=crop',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&fit=crop',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&fit=crop',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&fit=crop'
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod_bristle',
        storeId: 'str_maternal',
        storeName: 'Toko Sipil',
        name: 'BRISTLE Devil Graphic',
        sku: 'MT-BRS-04',
        description: 'Stark skull illustration styled with fire embers on premium combed standard. Essential gothic staple piece of maternal records.',
        price: 219000,
        discount: 0,
        weight: 240,
        stock: 50,
        categoryId: 'cat_tshirts',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black'],
        images: [
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&fit=crop',
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&fit=crop',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&fit=crop',
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&fit=crop',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&fit=crop'
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod_vortex',
        storeId: 'str_maternal',
        storeName: 'Toko Sipil',
        name: 'VORTEX Heavyweight Hoodie',
        sku: 'MT-VXH-05',
        description: 'Thick 400gsm cotton fleece. Embossed gothic lettering, heavy drawstrings, metal aglets, and dual utility slash pockets.',
        price: 549000,
        discount: 15,
        weight: 800,
        stock: 15,
        categoryId: 'cat_hoodies',
        sizes: ['M', 'L', 'XL', 'XXL'],
        colors: ['Triple Black', 'Smoke Grey'],
        images: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&fit=crop',
          'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&fit=crop',
          'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&fit=crop',
          'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&fit=crop',
          'https://images.unsplash.com/photo-1601612620171-011966016897?w=600&fit=crop'
        ],
        createdAt: new Date().toISOString()
      }
    ],
    orders: [
      {
        id: 'ord_sample_1',
        buyerId: 'usr_buyer',
        buyerName: 'Iyasya Buyer',
        storeId: 'str_maternal',
        storeName: 'Toko Sipil',
        items: [
          {
            productId: 'prod_jiraga',
            name: 'JIRAGA T-Shirt',
            price: 219000,
            discountPrice: 219000,
            quantity: 1,
            size: 'M',
            color: 'Black',
            image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=150'
          }
        ],
        address: {
          receiver: 'Iyasya',
          phone: '08987654321',
          detail: 'Kost Raw Alternative, No 5A, Coblong',
          city: 'Bandung'
        },
        courier: 'J&T Express (Regular)',
        shippingCost: 15000,
        discount: 0,
        platformFee: 2000,
        totalProductPrice: 219000,
        totalAmount: 236000,
        status: OrderStatus.COMPLETED,
        paymentMethod: 'GoPay',
        resiNo: 'JT9812491244',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'ord_sample_2',
        buyerId: 'usr_buyer',
        buyerName: 'Iyasya Buyer',
        storeId: 'str_maternal',
        storeName: 'Toko Sipil',
        items: [
          {
            productId: 'prod_pinion',
            name: 'PINION T-Shirt',
            price: 219000,
            discountPrice: 197100,
            quantity: 2,
            size: 'L',
            color: 'White',
            image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=150'
          }
        ],
        address: {
          receiver: 'Iyasya',
          phone: '08987654321',
          detail: 'Kost Raw Alternative, No 5A, Coblong',
          city: 'Bandung'
        },
        courier: 'Sicepat (Regular)',
        shippingCost: 12000,
        discount: 10000,
        platformFee: 2000,
        totalProductPrice: 394200,
        totalAmount: 398200,
        status: OrderStatus.SHIPPED,
        paymentMethod: 'BCA Virtual Account',
        paymentDetails: {
          vaNumber: '11223344556677',
          bank: 'BCA'
        },
        resiNo: 'SI98248102422',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ],
    wallets: [
      {
        storeId: 'str_maternal',
        balance: 450000,
        heldBalance: 374490,
        totalEarnings: 824490,
        totalWithdrawn: 100000
      }
    ],
    walletTransactions: [
      {
        id: 'tx_init_1',
        storeId: 'str_maternal',
        amount: 208050,
        type: 'CREDIT',
        description: 'Pelepasan dana pesanan ord_sample_1',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tx_init_2',
        storeId: 'str_maternal',
        amount: 100000,
        type: 'DEBIT',
        description: 'Penarikan dana Rekening BCA - Berhasil',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    bankAccounts: [
      {
        id: 'bk_maternal',
        sellerId: 'usr_seller',
        bankName: 'BCA',
        accountNumber: '1234567890',
        accountHolder: 'Vendy Toko Sipil',
        proofPhoto: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500',
        nik: '3273010101010001',
        ktpPhoto: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500',
        status: BankVerificationStatus.APPROVED,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    withdrawals: [
      {
        id: 'wd_sample_1',
        sellerId: 'usr_seller',
        amount: 100000,
        bankName: 'BCA',
        accountNumber: '1234567890',
        accountHolder: 'Vendy Toko Sipil',
        status: WithdrawalStatus.COMPLETED,
        notes: 'Sudah ditransfer ke rekening BCA seller.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chats: [
      {
        id: 'cht_sample_1',
        buyerId: 'usr_buyer',
        buyerName: 'Iyasya Buyer',
        sellerId: 'str_maternal',
        sellerName: 'Toko Sipil',
        lastMessage: 'Halo kak, apakah barang JIRAGA ready size L?',
        updatedAt: new Date().toISOString()
      }
    ],
    messages: [
      {
        id: 'msg_1',
        chatId: 'cht_sample_1',
        senderId: 'usr_buyer',
        text: 'Halo kak, JIRAGA t-shirt ada size L?',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'msg_2',
        chatId: 'cht_sample_1',
        senderId: 'usr_seller',
        text: 'Hai kak! Ready banget t-shirt JIRAGA size L. Sisa beberapa pcs lagi yaa, buruan order.',
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
      },
      {
        id: 'msg_3',
        chatId: 'cht_sample_1',
        senderId: 'usr_buyer',
        text: 'Okee siap langsung saya checkout & bayar yaa',
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
      }
    ],
    reviews: [
      {
        id: 'rev_1',
        productId: 'prod_jiraga',
        buyerId: 'usr_buyer',
        buyerName: 'Iyasya Buyer',
        rating: 5,
        text: 'Bahan adem premium tebal combed 24s sablon gothic parah! Top seller Toko Sipil.',
        image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=200',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    vouchers: [
      {
        id: 'vch_platform_1',
        code: 'TOKO50',
        type: 'PLATFORM',
        discountType: 'NOMINAL',
        amount: 50000,
        minPurchase: 300000,
        active: true
      },
      {
        id: 'vch_maternal_10',
        code: 'VOUCHER10',
        type: 'STORE',
        discountType: 'PERCENTAGE',
        amount: 10,
        minPurchase: 100000,
        storeId: 'str_maternal',
        active: true
      }
    ],
    banners: [
      {
        id: 'ban_1',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&h=600&fit=crop',
        title: 'Toko Sipil Records - Darkness Unleashed',
        url: '/shop',
        active: true
      },
      {
        id: 'ban_2',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=600&fit=crop',
        title: 'Black & Cream Gothic Modern Archive',
        url: '/shop?category=t-shirts',
        active: true
      }
    ],
    settings: {
      commissionPercent: 5
    },
    follows: [
      { userId: 'usr_buyer', storeId: 'str_maternal' }
    ],
    diagnosticReports: [],
    androidConfig: {
      appName: 'Toko Sipil Official',
      packageName: 'com.tokosipil.official',
      appVersion: '1.0.0',
      versionCode: '1',
      serverUrl: 'https://ais-dev-ao4ij3eqewiigwwcl4kr6t-934223265379.asia-southeast1.run.app',
      statusBarColor: '#0b2545',
      splashStyle: 'gothic',
      enableGPS: true,
      enableCamera: true,
      enablePush: false,
      enableHardwareAcc: true
    },
    notifications: []
  };
}

// Initial direct synchronous load of local db.json for fast boot fallback
export function loadDb(): FullDatabase {
  if (cachedDb) {
    return cachedDb;
  }

  // Fallback to local db.json on startup
  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (!data.follows) data.follows = [];
      if (!data.diagnosticReports) data.diagnosticReports = [];
      if (!data.notifications) data.notifications = [];
      if (!data.androidConfig) {
        data.androidConfig = getInitialSeedData().androidConfig;
      }
      cachedDb = data;
      // Capture JSON string of each table
      TABLE_KEYS.forEach(key => {
        lastSavedStateJson[key] = JSON.stringify(cachedDb?.[key] || []);
      });
      return data;
    } catch (e) {
      console.error("Error reading database file, attempting recovery from backup", e);
    }
  }

  // Attempt backup restore
  if (fs.existsSync(DB_BACKUP_PATH)) {
    try {
      const raw = fs.readFileSync(DB_BACKUP_PATH, 'utf-8');
      const data = JSON.parse(raw);
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
      cachedDb = data;
      TABLE_KEYS.forEach(key => {
        lastSavedStateJson[key] = JSON.stringify(cachedDb?.[key] || []);
      });
      return data;
    } catch (e) {
      console.error("Error recovery from backup failed", e);
    }
  }

  // Use seed data
  const initial = getInitialSeedData();
  cachedDb = initial;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    fs.writeFileSync(DB_BACKUP_PATH, JSON.stringify(initial, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed saving seed file", err);
  }

  TABLE_KEYS.forEach(key => {
    lastSavedStateJson[key] = JSON.stringify(initial[key] || []);
  });
  return initial;
}

let activeInitPromise: Promise<FullDatabase> | null = null;

// Global initialization logic called when server boots
export async function initDb(): Promise<FullDatabase> {
  if (activeInitPromise) {
    return activeInitPromise;
  }

  activeInitPromise = (async () => {
    console.log('🔄 Initializing database sync with Firestore...');
    
    // Make sure local cachedDb is initialized
    const db = loadDb();

    try {
      const dbInstance = getFirestoreDb();
      if (!dbInstance) {
        console.warn('⚠️ Firestore is not available, skipping cloud sync.');
        cachedDb = db;
        return db;
      }
      const querySnapshot = await getDocs(collection(dbInstance, 'tables'));
      if (querySnapshot.empty) {
        console.log('📤 Firestore is empty! Uploading initial seed data to Cloud Firestore...');
        // Upload every table as a document in parallel
        const uploadPromises = TABLE_KEYS.map(async (key) => {
          const tableRef = doc(dbInstance, 'tables', key);
          await setDoc(tableRef, { data: db[key] });
          lastSavedStateJson[key] = JSON.stringify(db[key]);
        });
        await Promise.all(uploadPromises);
        console.log('✅ Firestore seeding completed successfully!');
      } else {
        console.log('📥 Loading data from Firestore...');
        querySnapshot.forEach((docSnap) => {
          const key = docSnap.id as keyof FullDatabase;
          if (TABLE_KEYS.includes(key)) {
            const docData = docSnap.data();
            if (docData && docData.data !== undefined) {
              (db as any)[key] = docData.data;
              lastSavedStateJson[key] = JSON.stringify(docData.data);
            }
          }
        });
        // Sync local file with Firestore data for fast offline fallback
        try {
          fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
          fs.writeFileSync(DB_BACKUP_PATH, JSON.stringify(db, null, 2), 'utf-8');
        } catch (err) {
          // Safe to ignore in read-only environments
        }
        console.log('✅ Firestore sync loaded successfully!');
      }
    } catch (error) {
      console.error('❌ Failed to sync with Firestore, using local filesystem database instead:', error);
    }

    cachedDb = db;
    return db;
  })();

  try {
    const result = await activeInitPromise;
    return result;
  } finally {
    activeInitPromise = null;
  }
}

// Save database to memory, local filesystem, and cloud Firestore
export async function saveDb(data: FullDatabase): Promise<void> {
  cachedDb = data;

  // 1. Save locally to db.json (instant synchronous write)
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    fs.writeFileSync(DB_BACKUP_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // Safe to ignore in read-only filesystems (e.g., Vercel)
  }

  // 2. Perform delta sync to Firestore and await to prevent container freezing
  const dbInstance = getFirestoreDb();
  const syncPromises = dbInstance ? TABLE_KEYS.map(async (key) => {
    const currentJson = JSON.stringify(data[key]);
    if (currentJson !== lastSavedStateJson[key]) {
      // Data has changed, sync it!
      lastSavedStateJson[key] = currentJson;
      try {
        const tableRef = doc(dbInstance, 'tables', key);
        await setDoc(tableRef, { data: data[key] });
      } catch (error) {
        console.error(`❌ Failed to sync table [${key}] with Firestore:`, error);
      }
    }
  }) : [];

  await Promise.all(syncPromises);
}
