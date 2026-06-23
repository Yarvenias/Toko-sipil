/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Store, Product, Category, Order, Chat, Banner, Settings, Role, Voucher, OrderStatus } from '../types';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: number;
}

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
  activePage: 'home' | 'shop' | 'stores' | 'about' | 'contact' | 'dashboard-admin' | 'dashboard-seller' | 'dashboard-user' | 'instagram' | 'help-center' | 'legal-policies' | 'track-order' | 'android-builder';
  setActivePage: (p: 'home' | 'shop' | 'stores' | 'about' | 'contact' | 'dashboard-admin' | 'dashboard-seller' | 'dashboard-user' | 'instagram' | 'help-center' | 'legal-policies' | 'track-order' | 'android-builder') => void;
  refreshAllData: () => Promise<void>;
  
  // Toast Notifications
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  
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
  const [activePage, setActivePage] = useState<'home' | 'shop' | 'stores' | 'about' | 'contact' | 'dashboard-admin' | 'dashboard-seller' | 'dashboard-user' | 'instagram' | 'help-center' | 'legal-policies' | 'track-order' | 'android-builder'>('home');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

  // Toast States & Controls
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      id,
      title,
      message,
      type,
      createdAt: Date.now()
    };
    setToasts(prev => [...prev, newToast]);

    // Automatically remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Comparators for orders status change tracking
  const prevOrdersRef = useRef<Order[]>([]);
  const isFirstLoadRef = useRef<boolean>(true);

  // Reset tracking on user switch
  useEffect(() => {
    isFirstLoadRef.current = true;
    prevOrdersRef.current = [];
  }, [currentUser]);

  // Track order status changes
  useEffect(() => {
    if (orders.length === 0) {
      return;
    }

    if (isFirstLoadRef.current) {
      prevOrdersRef.current = orders;
      isFirstLoadRef.current = false;
      return;
    }

    orders.forEach((newOrder) => {
      const oldOrder = prevOrdersRef.current.find(o => o.id === newOrder.id);
      
      // If order exists and status has changed
      if (oldOrder && oldOrder.status !== newOrder.status) {
        let title = 'Pembaruan Status Pesanan';
        let message = `Pesanan #${newOrder.id.slice(0, 8)} dari store ${newOrder.storeName} kini berstatus: ${newOrder.status}`;
        let type: 'info' | 'success' | 'warning' | 'error' = 'info';

        switch (newOrder.status) {
          case OrderStatus.PENDING:
            title = 'Pesanan Dibuat';
            message = `Selesaikan pembayaran pesanan Anda di ${newOrder.storeName} sebesar Rp${newOrder.totalAmount.toLocaleString('id-ID')}.`;
            type = 'info';
            break;
          case OrderStatus.DP_PAID:
            title = 'DP Berhasil Dibayar 💳';
            message = `Uang muka untuk produk pre-order Anda di ${newOrder.storeName} telah sukses diverifikasi!`;
            type = 'success';
            break;
          case OrderStatus.PAID:
            title = 'Pembayaran Diterima ✓';
            message = `Pembayaran untuk pesanan di ${newOrder.storeName} sukses diverifikasi. Penjual akan segera memproses barang Anda!`;
            type = 'success';
            break;
          case OrderStatus.SHIPPED:
            title = 'Pesanan Dikirim 🚚';
            message = `Kabar gembira! Paket pesanan dari ${newOrder.storeName} sedang meluncur. ${newOrder.resiNo ? `Resi: ${newOrder.resiNo}` : ''}`;
            type = 'success';
            break;
          case OrderStatus.DELIVERED:
            title = 'Pesanan Tiba di Tujuan 🏠';
            message = `Paket dari ${newOrder.storeName} telah diserahkan kurir ke almat penerima. Silakan periksa paket Anda.`;
            type = 'success';
            break;
          case OrderStatus.COMPLETED:
            title = 'Pesanan Selesai 🎉';
            message = `Transaksi selesai! Dana pesanan telah dicairkan ke dompet penjual ${newOrder.storeName}. Terima kasih telah berbelanja!`;
            type = 'info';
            break;
          case OrderStatus.CANCELLED:
            title = 'Pesanan Dibatalkan ✕';
            message = `Pesanan di ${newOrder.storeName} telah dibatalkan.`;
            type = 'error';
            break;
          case OrderStatus.FAILED:
            title = 'Pembayaran Gagal';
            message = `Transaksi pesanan di ${newOrder.storeName} gagal diselesaikan oleh sistem payment gateway.`;
            type = 'error';
            break;
        }

        // Trigger a beautiful notification
        addToast(title, message, type);
      }
    });

    // Update snapshot
    prevOrdersRef.current = orders;
  }, [orders]);

  // Real-time Order status polling every 7 seconds
  useEffect(() => {
    if (!currentUser) return;

    const timer = setInterval(() => {
      // Fetch fresh order updates
      let storeIdQuery = '';
      if (currentUser.role === Role.SELLER) {
        fetch(`/api/stores`)
          .then(r => r.json() as Promise<Store[]>)
          .then(list => list.find(s => s.userId === currentUser.id))
          .then(currentStore => {
            const storeIdQuery = currentStore ? `&storeId=${currentStore.id}` : '';
            return fetch(`/api/orders?buyerId=${currentUser.id}${storeIdQuery}&role=${currentUser.role}`);
          })
          .then(res => {
            if (res.ok) return res.json();
          })
          .then(data => {
            if (data) setOrders(data);
          })
          .catch(err => console.error('Error polling orders:', err));
      } else {
        fetch(`/api/orders?buyerId=${currentUser.id}&role=${currentUser.role}`)
          .then(res => {
            if (res.ok) return res.json();
          })
          .then(data => {
            if (data) setOrders(data);
          })
          .catch(err => console.error('Error polling orders:', err));
      }
    }, 7000);

    return () => clearInterval(timer);
  }, [currentUser]);

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

  // Monitor session validity to enforce "1 account 1 device" in real-time
  useEffect(() => {
    if (!currentUser || currentUser.isGuest) return;

    let isChecking = false;

    const verifySession = async () => {
      if (isChecking) return;
      isChecking = true;
      try {
        const res = await fetch('/api/auth/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            sessionToken: currentUser.sessionToken || ''
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.valid === false) {
            console.warn('[Session Security] Real-time check failed: session logged in on other device.');
            localStorage.removeItem('maternal_user');
            setCurrentUser(null);
            clearCart();
            setActivePage('home');
            addToast(
              "SESI BERAKHIR",
              "Akun Anda telah masuk di perangkat lain. Sesi di perangkat ini kedaluwarsa secara otomatis.",
              "error"
            );
          }
        }
      } catch (e) {
        console.error('[Session Security] Error checking session status:', e);
      } finally {
        isChecking = false;
      }
    };

    // Run diagnostic check immediately when focus / session state updates
    verifySession();

    // Check periodically every 15 seconds to catch active multi-device overlays
    const interval = setInterval(verifySession, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

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
    addToast("KERANJANG BELANJA", `Berhasil menambah ${quantity}x ${product.name} (${size})`, "success");
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    const targetItem = cart.find(item => item.product.id === productId && item.selectedSize === size && item.selectedColor === color);
    const label = targetItem ? targetItem.product.name : "Item";
    const filt = cart.filter(item => 
      !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
    );
    handleSetCart(filt);
    addToast("DELETED FROM CART", `Menghapus "${label}" dari keranjang.`, "info");
  };

  const updateCartQty = (productId: string, size: string, color: string, qty: number) => {
    const mutable = cart.map(item => {
      if (item.product.id === productId && item.selectedSize === size && item.selectedColor === color) {
        return { ...item, quantity: Math.max(1, qty) };
      }
      return item;
    });
    handleSetCart(mutable);
    addToast("QTY UPDATED", "Jumlah pesanan berhasil diperbarui.", "info");
  };

  const clearCart = () => {
    handleSetCart([]);
    setAppliedVoucher(null);
  };

  const applyVoucherCode = async (code: string): Promise<string | null> => {
    const normalized = code.toUpperCase();
    const vch = vouchers.find(v => v.code === normalized && v.active);
    if (!vch) return "Kode voucher tidak berlaku atau telah kedaluwarsa.";

    if (vch.productId) {
      const productItems = cart.filter(item => item.product.id === vch.productId);
      if (productItems.length === 0) {
        const targetProd = products.find(p => p.id === vch.productId);
        const prodName = targetProd ? targetProd.name : "produk terkait";
        return `Voucher ini hanya berlaku untuk pembelian produk "${prodName}".`;
      }
      const productSubtotal = productItems.reduce((sum, item) => {
        const discountedItemPrice = item.product.price * (1 - item.product.discount / 100);
        return sum + (discountedItemPrice * item.quantity);
      }, 0);
      if (productSubtotal < vch.minPurchase) {
        return `Minimal pembelian produk ini untuk menggunakan voucher adalah Rp${vch.minPurchase.toLocaleString('id-ID')}.`;
      }
    } else if (vch.storeId) {
      const storeItems = cart.filter(item => item.product.storeId === vch.storeId);
      if (storeItems.length === 0) {
        return `Voucher ini hanya berlaku untuk produk dari toko yang bersangkutan.`;
      }
      const storeSubtotal = storeItems.reduce((sum, item) => {
        const discountedItemPrice = item.product.price * (1 - item.product.discount / 100);
        return sum + (discountedItemPrice * item.quantity);
      }, 0);
      if (storeSubtotal < vch.minPurchase) {
        return `Minimal pembelian dari toko ini untuk memakai voucher adalah Rp${vch.minPurchase.toLocaleString('id-ID')}.`;
      }
    } else {
      const subtotal = cart.reduce((sum, item) => {
        const discountedItemPrice = item.product.price * (1 - item.product.discount / 100);
        return sum + (discountedItemPrice * item.quantity);
      }, 0);

      if (subtotal < vch.minPurchase) {
        return `Minimal pembelian untuk menggunakan voucher ini adalah Rp${vch.minPurchase.toLocaleString('id-ID')}.`;
      }
    }

    setAppliedVoucher(vch);
    addToast("PROMO TERPASANG", `Voucher diskon ${vch.discountPercent}% berhasil digunakan!`, "success");
    return null; // success
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    addToast("PROMO DILEPAS", "Voucher belanja telah dilepaskan.", "info");
  };

  const toggleWishlist = (productId: string) => {
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }
    const prod = products.find(p => p.id === productId);
    const label = prod ? prod.name : "Produk";
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
      addToast("WISHLIST UPDATED", `"${label}" dihapus dari daftar favorit Anda.`, "info");
    } else {
      setWishlist([...wishlist, productId]);
      addToast("WISHLIST UPDATED", `"${label}" ditambahkan ke daftar favorit!`, "success");
    }
  };

  const toggleFollowStore = async (storeId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const targetStore = stores.find(s => s.id === storeId);
    const storeName = targetStore ? targetStore.name : "Toko";
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
          addToast("TOKO DIIKUTI", `Anda sekarang mengikuti store "${storeName}"!`, "success");
        } else {
          setFollowedStores(followedStores.filter(id => id !== storeId));
          addToast("BATAL IKUTI", `Berhenti mengikuti store "${storeName}".`, "info");
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
      addToast("LOGIN STATUS", `Selamat datang kembali, ${data.user.name}!`, "success");
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
      addToast("SIGNUP STATUS", `Registrasi berhasil! Silakan masuk dengan email Anda.`, "success");
      return null;
    } catch (e) {
      console.error(e);
      return 'Koneksi ke server gagal.';
    }
  };

  const logout = () => {
    const userLabel = currentUser ? currentUser.name : "Pengguna";
    localStorage.removeItem('maternal_user');
    setCurrentUser(null);
    clearCart();
    setActivePage('home');
    addToast("LOGOUT STATUS", `Sampai jumpa lagi, ${userLabel}!`, "info");
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
      toasts,
      addToast,
      removeToast,
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
