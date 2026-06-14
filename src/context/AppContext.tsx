/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Store, Product, Category, Order, Chat, Banner, Settings, Role, Voucher } from '../types';

interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  stores: Store[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  banners: Banner[];
  settings: Settings | null;
  vouchers: Voucher[];
  cart: CartItem[];
  wishlist: string[]; // product IDs
  followedStores: string[]; // store IDs
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (catId: string) => void;
  activePage: 'home' | 'shop' | 'stores' | 'about' | 'contact' | 'dashboard-admin' | 'dashboard-seller' | 'dashboard-user' | 'instagram' | 'help-center' | 'legal-policies' | 'track-order';
  setActivePage: (p: 'home' | 'shop' | 'stores' | 'about' | 'contact' | 'dashboard-admin' | 'dashboard-seller' | 'dashboard-user' | 'instagram' | 'help-center' | 'legal-policies' | 'track-order') => void;
  refreshAllData: () => Promise<void>;
  
  // Cart Actions
  addToCart: (product: Product, quantity: number, size: string, color: string) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQty: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  appliedVoucher: Voucher | null;
  applyVoucherCode: (code: string) => Promise<string | null>; // returns message if successful or error
  removeVoucher: () => void;

  // Social & Personal actions
  toggleWishlist: (productId: string) => void;
  toggleFollowStore: (storeId: string) => Promise<boolean>;
  
  // Authentication Simulated actions
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, password: string, angkatan?: string, campus?: string) => Promise<string | null>;
  logout: () => void;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  userDashboardInitialTab: string;
  setUserDashboardInitialTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [userDashboardInitialTab, setUserDashboardInitialTab] = useState('profile');
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [followedStores, setFollowedStores] = useState<string[]>(['str_maternal']); // pre-follow Toko Sipil
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activePage, setActivePage] = useState<'home' | 'shop' | 'stores' | 'about' | 'contact' | 'dashboard-admin' | 'dashboard-seller' | 'dashboard-user' | 'instagram' | 'help-center' | 'legal-policies' | 'track-order'>('home');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

  const refreshAllData = async () => {
    try {
      const [pRes, sRes, cRes, bRes, stRes, vRes] = await Promise.all([
        fetch('/api/products?includeUnapproved=true'),
        fetch('/api/stores'),
        fetch('/api/categories'),
        fetch('/api/banners'),
        fetch('/api/settings'),
        fetch('/api/vouchers')
      ]);

      if (pRes.ok) setProducts(await pRes.json());
      if (sRes.ok) setStores(await sRes.json());
      if (cRes.ok) setCategories(await cRes.json());
      if (bRes.ok) setBanners(await bRes.json());
      if (stRes.ok) setSettings(await stRes.json());
      if (vRes.ok) setVouchers(await vRes.json());

      // If user is logged, fetch orders
      if (currentUser) {
        let storeIdQuery = '';
        if (currentUser.role === Role.SELLER) {
          const currentStore = await fetch(`/api/stores`).then(r => r.json() as Promise<Store[]>).then(list => list.find(s => s.userId === currentUser.id));
          if (currentStore) storeIdQuery = `&storeId=${currentStore.id}`;
        }
        
        const oRes = await fetch(`/api/orders?buyerId=${currentUser.id}${storeIdQuery}&role=${currentUser.role}`);
        if (oRes.ok) setOrders(await oRes.json());
      }
    } catch (e) {
      console.error("Failed to load platform data", e);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [currentUser]);

  // Try to restore user or require authenticating credentials
  useEffect(() => {
    const saved = localStorage.getItem('maternal_user');
    let loadedUser: User | null = null;
    if (saved) {
      try {
        loadedUser = JSON.parse(saved);
      } catch (e) {}
    }
    
    if (loadedUser) {
      setCurrentUser(loadedUser);
    }

    const savedCart = localStorage.getItem('maternal_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {}
    }
  }, []);

  const handleSetCurrentUser = (user: User | null) => {
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('maternal_user', JSON.stringify(user));
    } else {
      setCurrentUser(null);
      localStorage.removeItem('maternal_user');
    }
    setAppliedVoucher(null);
  };

  const handleSetCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('maternal_cart', JSON.stringify(newCart));
  };

  // Cart Management
  const addToCart = (product: Product, quantity: number, size: string, color: string) => {
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }
    const mutable = [...cart];
    const existing = mutable.find(item => 
      item.product.id === product.id && 
      item.selectedSize === size && 
      item.selectedColor === color
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      mutable.push({ product, quantity, selectedSize: size, selectedColor: color });
    }
    handleSetCart(mutable);
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    const filt = cart.filter(item => 
      !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
    );
    handleSetCart(filt);
  };

  const updateCartQty = (productId: string, size: string, color: string, qty: number) => {
    const mutable = cart.map(item => {
      if (item.product.id === productId && item.selectedSize === size && item.selectedColor === color) {
        return { ...item, quantity: Math.max(1, qty) };
      }
      return item;
    });
    handleSetCart(mutable);
  };

  const clearCart = () => {
    handleSetCart([]);
    setAppliedVoucher(null);
  };

  const applyVoucherCode = async (code: string): Promise<string | null> => {
    const normalized = code.toUpperCase();
    const vch = vouchers.find(v => v.code === normalized && v.active);
    if (!vch) return "Kode voucher tidak berlaku atau telah kedaluwarsa.";

    // calculate total cart size
    const subtotal = cart.reduce((sum, item) => {
      const discountedItemPrice = item.product.price * (1 - item.product.discount / 100);
      return sum + (discountedItemPrice * item.quantity);
    }, 0);

    if (subtotal < vch.minPurchase) {
      return `Minimal pembelian untuk menggunakan voucher ini adalah Rp${vch.minPurchase.toLocaleString('id-ID')}.`;
    }

    setAppliedVoucher(vch);
    return null; // success
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
  };

  const toggleWishlist = (productId: string) => {
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  const toggleFollowStore = async (storeId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/stores/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, storeId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.followed) {
          setFollowedStores([...followedStores, storeId]);
        } else {
          setFollowedStores(followedStores.filter(id => id !== storeId));
        }
        await refreshAllData();
        return data.followed;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return data.error || 'Terjadi kesalahan saat masuk.';
      }
      handleSetCurrentUser(data.user);
      await refreshAllData();
      return null;
    } catch (e) {
      console.error(e);
      return 'Koneksi ke server gagal.';
    }
  };

  const signup = async (name: string, email: string, password: string, angkatan?: string, campus?: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, angkatan, campus })
      });
      const data = await res.json();
      if (!res.ok) {
        return data.error || 'Terjadi kesalahan saat registrasi.';
      }
      return null;
    } catch (e) {
      console.error(e);
      return 'Koneksi ke server gagal.';
    }
  };

  const logout = () => {
    localStorage.removeItem('maternal_user');
    setCurrentUser(null);
    clearCart();
    setActivePage('home');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser: handleSetCurrentUser,
      stores,
      products,
      categories,
      orders,
      banners,
      settings,
      vouchers,
      cart,
      wishlist,
      followedStores,
      searchQuery,
      setSearchQuery,
      activeCategory,
      setActiveCategory,
      activePage,
      setActivePage,
      refreshAllData,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      appliedVoucher,
      applyVoucherCode,
      removeVoucher,
      toggleWishlist,
      toggleFollowStore,
      login,
      signup,
      logout,
      authOpen,
      setAuthOpen,
      userDashboardInitialTab,
      setUserDashboardInitialTab
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used inside the AppProvider context');
  }
  return context;
}
