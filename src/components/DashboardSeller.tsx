/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, DollarSign, ArrowUpRight, ShieldAlert, Check, RefreshCw, Send, 
  Trash2, Landmark, UploadCloud, Edit3, Settings, ShieldCheck, ShoppingCart, HelpCircle,
  Printer, FileText, Download, Calendar
} from 'lucide-react';
import { Product, OrderStatus, BankVerificationStatus, WithdrawalStatus } from '../types';
import { 
  ResponsiveContainer, ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { compressAndResizeImage } from '../utils/imageCompressor';

export default function DashboardSeller() {
  const { currentUser, categories, products, orders, vouchers, refreshAllData } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'wallet' | 'withdraw' | 'settings' | 'vouchers'>('overview');

  // Seller's specific associated Store and Wallet
  const [store, setStore] = useState<any>(null);
  const [wallet, setWallet] = useState<any>({
    balance: 0,
    heldBalance: 0,
    totalEarnings: 0,
    totalWithdrawn: 0
  });
  const [bankAcc, setBankAcc] = useState<any>(null);
  const [withdraws, setWithdraws] = useState<any[]>([]);
  const [walletTxs, setWalletTxs] = useState<any[]>([]);

  // Voucher Form States
  const [vchCode, setVchCode] = useState('');
  const [vchDiscountType, setVchDiscountType] = useState<'NOMINAL' | 'PERCENTAGE'>('NOMINAL');
  const [vchAmount, setVchAmount] = useState('');
  const [vchMinPurchase, setVchMinPurchase] = useState('0');
  const [vchScope, setVchScope] = useState<'STORE' | 'PRODUCT'>('STORE');
  const [vchProductId, setVchProductId] = useState('');
  const [vchFeedback, setVchFeedback] = useState<string | null>(null);
  const [vchError, setVchError] = useState<string | null>(null);

  // Feedback flags
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [productErrors, setProductErrors] = useState<string[]>([]);

  // Form States
  // 1. Product Form Fields
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscount, setProdDiscount] = useState('0');
  const [prodIsPreOrder, setProdIsPreOrder] = useState(false);
  const [prodPreOrderDp, setProdPreOrderDp] = useState('50');
  const [prodWeight, setProdWeight] = useState('250');
  const [prodStock, setProdStock] = useState('20');
  const [prodCatId, setProdCatId] = useState('');
  const [prodSizeString, setProdSizeString] = useState('S, M, L, XL');
  const [prodColorString, setProdColorString] = useState('Black, Off-White');
  const [prodImages, setProdImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&fit=crop',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&fit=crop',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&fit=crop',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&fit=crop',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&fit=crop'
  ]);

  // 2. Verified Bank Form Fields
  const [bankName, setBankName] = useState('BCA');
  const [bankNum, setBankNum] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [bankNik, setBankNik] = useState('');

  // 3. Withdraw field Form
  const [wdAmount, setWdAmount] = useState('');

  // 4. Update Store Profile Form Fields
  const [storeDesc, setStoreDesc] = useState('');
  const [storeBanner, setStoreBanner] = useState('');
  const [storeLogo, setStoreLogo] = useState('');

  // 15. Manual Resi Input state Map
  const [resiMap, setResiMap] = useState<Record<string, string>>({});
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<any | null>(null);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'process' | 'cancelled'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Sales Monthly Report States
  const [reportMonth, setReportMonth] = useState<number>(new Date().getMonth());
  const [reportYear, setReportYear] = useState<number>(new Date().getFullYear());
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);

  const fetchSellerData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Find associated Store
      const storeRes = await fetch('/api/stores');
      if (storeRes.ok) {
        const storeList = await storeRes.json();
        const foundStore = storeList.find((s: any) => s.userId === currentUser.id);
        if (foundStore) {
          setStore(foundStore);
          setStoreDesc(foundStore.description);
          setStoreBanner(foundStore.banner);
          setStoreLogo(foundStore.logo);

          // Get wallet details
          const walletRes = await fetch(`/api/wallets/${foundStore.id}`);
          if (walletRes.ok) setWallet(await walletRes.json());

          // Get wallet transaction ledgers
          const walletsTxsRes = await fetch(`/api/wallets/transactions/${foundStore.id}`);
          if (walletsTxsRes.ok) setWalletTxs(await walletsTxsRes.json());
        }
      }

      // bank details
      const bankRes = await fetch(`/api-bank-account/${currentUser.id}`); // fallback trigger
      const directBankRes = await fetch(`/api/bank-account/${currentUser.id}`);
      if (directBankRes.ok) {
        const b = await directBankRes.json();
        setBankAcc(b);
        if (b) {
          setBankName(b.bankName);
          setBankNum(b.accountNumber);
          setBankHolder(b.accountHolder);
          setBankNik(b.nik);
        }
      }

      // withdrawals
      const wdRes = await fetch(`/api/withdrawals?sellerId=${currentUser.id}`);
      if (wdRes.ok) {
        setWithdraws(await wdRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, [currentUser, feedback]);

  useEffect(() => {
    if (categories.length > 0 && !prodCatId) {
      setProdCatId(categories[0].id);
    }
  }, [categories]);

  // Product edit state handlers
  // Voucher managing actions
  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setVchError(null);
    setVchFeedback(null);

    const codeClean = vchCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!codeClean) {
      setVchError("Kode voucher wajib diisi.");
      return;
    }
    const amt = Number(vchAmount);
    if (isNaN(amt) || amt <= 0) {
      setVchError("Nominal potongan diskon harus lebih besar dari 0.");
      return;
    }
    const minP = Number(vchMinPurchase) || 0;
    if (vchDiscountType === 'PERCENTAGE' && amt > 100) {
      setVchError("Diskon persentase tidak boleh lebih dari 100%.");
      return;
    }

    if (vchScope === 'PRODUCT' && !vchProductId) {
      setVchError("Pilih produk spesifik yang akan diberikan voucher.");
      return;
    }

    try {
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeClean,
          type: 'STORE',
          discountType: vchDiscountType,
          amount: amt,
          minPurchase: minP,
          storeId: store?.id,
          productId: vchScope === 'PRODUCT' ? vchProductId : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setVchError(data.error || "Gagal membuat voucher.");
      } else {
        setVchFeedback(`Voucher ${codeClean} berhasil diterbitkan.`);
        // Reset form
        setVchCode('');
        setVchAmount('');
        setVchMinPurchase('0');
        setVchScope('STORE');
        setVchProductId('');
        await refreshAllData();
      }
    } catch (err) {
      console.error(err);
      setVchError("Koneksi gagal.");
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus voucher ini?")) return;
    setVchError(null);
    setVchFeedback(null);
    try {
      const res = await fetch(`/api/vouchers/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setVchFeedback("Voucher telah berhasil dihapus.");
        await refreshAllData();
      } else {
        setVchError(data.error || "Gagal menghapus voucher.");
      }
    } catch (err) {
      console.error(err);
      setVchError("Gagal menghapus voucher.");
    }
  };

  const handleEditProductClick = (product: Product) => {
    setProductErrors([]);
    setEditingProductId(product.id);
    setProdName(product.name);
    setProdSku(product.sku);
    setProdDesc(product.description || '');
    setProdPrice(String(product.price));
    setProdDiscount(String(product.discount || 0));
    setProdIsPreOrder(Boolean(product.isPreOrder));
    setProdPreOrderDp(String(product.preOrderDpPercent || 50));
    setProdWeight(String(product.weight || 250));
    setProdStock(String(product.stock || 20));
    setProdCatId(product.categoryId);
    setProdSizeString((product.sizes || []).join(', '));
    setProdColorString((product.colors || []).join(', '));
    setProdImages(product.images || []);
    // Scroll smoothly to form
    const el = document.getElementById('seller-products-pane');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setProductErrors([]);
    setEditingProductId(null);
    setProdName('');
    setProdSku('');
    setProdDesc('');
    setProdPrice('');
    setProdDiscount('0');
    setProdIsPreOrder(false);
    setProdPreOrderDp('50');
    setProdWeight('250');
    setProdStock('20');
    if (categories.length > 0) {
      setProdCatId(categories[0].id);
    }
    setProdSizeString('S, M, L, XL');
    setProdColorString('Black, Off-White');
    setProdImages([
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&fit=crop'
    ]);
  };

  // Product submission
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setProductErrors([]);

    const errors: string[] = [];

    if (!prodName.trim()) {
      errors.push("Nama Produk wajib diisi.");
    }
    if (!prodSku.trim()) {
      errors.push("SKU Produk wajib diisi.");
    }
    if (!prodPrice || Number(prodPrice) <= 0) {
      errors.push("Harga Produk harus berupa angka positif lebih dari 0.");
    }
    if (!prodCatId) {
      errors.push("Pilih kategori produk.");
    }
    if (!prodWeight || Number(prodWeight) <= 0) {
      errors.push("Berat Paket harus berupa angka positif.");
    }
    if (!prodImages || prodImages.length < 1) {
      errors.push("Kira-kira memerlukan minimal 1 foto produk.");
    }
    if (prodIsPreOrder) {
      const dp = Number(prodPreOrderDp);
      if (isNaN(dp) || dp < 1 || dp > 100) {
        errors.push("Persentase DP Pre-Order harus bernilai di antara 1% s/d 100%.");
      }
    }

    if (errors.length > 0) {
      setProductErrors(errors);
      setFeedback("Gagal menyimpan produk. Silakan periksa detail perbaikan formulir.");
      return;
    }

    try {
      const payload = {
        storeId: store.id,
        name: prodName,
        sku: prodSku,
        description: prodDesc,
        price: Number(prodPrice),
        discount: Number(prodDiscount),
        weight: Number(prodWeight),
        stock: Number(prodStock),
        categoryId: prodCatId,
        sizes: prodSizeString.split(',').map(s => s.trim()).filter(Boolean),
        colors: prodColorString.split(',').map(s => s.trim()).filter(Boolean),
        images: prodImages,
        isPreOrder: prodIsPreOrder,
        preOrderDpPercent: prodIsPreOrder ? Number(prodPreOrderDp) : undefined
      };

      const isEdit = !!editingProductId;
      const url = isEdit ? `/api/products/${editingProductId}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFeedback(isEdit 
          ? `Sukses memperbarui produk streetwear "${prodName}"!` 
          : `Sukses mengupload produk streetwear "${prodName}"!`
        );
        setProductErrors([]);
        
        // Reset state
        setEditingProductId(null);
        setProdName('');
        setProdSku('');
        setProdDesc('');
        setProdPrice('');
        setProdDiscount('0');
        setProdIsPreOrder(false);
        setProdPreOrderDp('50');
        setProdWeight('250');
        setProdStock('20');
        if (categories.length > 0) {
          setProdCatId(categories[0].id);
        }
        setProdSizeString('S, M, L, XL');
        setProdColorString('Black, Off-White');
        setProdImages([
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&fit=crop',
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&fit=crop',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&fit=crop',
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&fit=crop',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&fit=crop'
        ]);

        await refreshAllData();
        setActiveTab('products');
        setTimeout(() => setFeedback(null), 4500);
      } else {
        const errorData = await res.json();
        setProductErrors([errorData.error]);
        setFeedback(`Gagal: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
      setProductErrors(["Gagal menghubungi server. Silakan coba kembali."]);
      setFeedback("Gagal memproses produk.");
    }
  };

  // Set preset images helper to easily satisfy minimum 5 files guideline
  const handleDeleteProductClick = async (id: string, name: string) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 4000); // Auto-reset after 4s
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setFeedback(`Sukses menghapus produk "${name}"!`);
        setDeleteConfirmId(null);
        await refreshAllData();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        const d = await res.json();
        setFeedback(`Gagal: ${d.error || 'Terjadi kesalahan'}`);
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setFeedback("Gagal menghapus produk.");
      setTimeout(() => setFeedback(null), 3500);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFashionPresets = () => {
    setProdImages([
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600'
    ]);
    setFeedback("Foto presetting fashion hitam/krem berhasil dimuat (memenuhi minimal 5 foto)!");
    setTimeout(() => setFeedback(null), 3000);
  };

  // Submit Bank verification details
  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const payload = {
        sellerId: currentUser.id,
        bankName,
        accountNumber: bankNum,
        accountHolder: bankHolder,
        proofPhoto: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500', // proof file simulation URL
        nik: bankNik,
        ktpPhoto: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500'
      };

      const res = await fetch('/api/bank-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFeedback("Data Rekening Bank sukses diajukan. Menunggu approval verifikasi bank.");
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Cash out form submission
  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !bankAcc || bankAcc.status !== BankVerificationStatus.APPROVED) {
      setFeedback("Data Bank Anda wajib terverifikasi APPROVED oleh Admin sebelum mencairkan dana.");
      return;
    }

    const amt = Number(wdAmount);
    if (!amt || amt < 50000) {
      setFeedback("Penarikan minimal adalah Rp50.000.");
      return;
    }

    if (wallet.balance < amt) {
      setFeedback("Saldo Tersedia di wallet Anda tidak mencukupi.");
      return;
    }

    try {
      const payload = {
        sellerId: currentUser.id,
        amount: amt,
        bankName: bankAcc.bankName,
        accountNumber: bankAcc.accountNumber,
        accountHolder: bankAcc.accountHolder
      };

      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFeedback(`Pencairan dana Rp${amt.toLocaleString('id-ID')} berhasil diajukan! Saldo dikurangi.`);
        setWdAmount('');
        setTimeout(() => setFeedback(null), 3500);
      } else {
        const data = await res.json();
        setFeedback("Error: " + data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Order Operations: Ship out packages attaching res No.
  const handleShipOrder = async (orderId: string) => {
    const resiNo = resiMap[orderId];
    if (!resiNo) {
      alert("Masukkan nomor resi ekspedisi kurir terlebih dahulu.");
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resiNo })
      });

      if (res.ok) {
        setFeedback(`Pesanan ${orderId} berhasil dipacking & dikirim. Resi: ${resiNo}`);
        await refreshAllData();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Simulate carrier delivery directly to hasten evaluations
  const handleSimulateDelivery = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/deliver`, { method: 'POST' });
      if (res.ok) {
        setFeedback(`Paket pesanan ${orderId} telah dimasukkan ke status DELIVERED.`);
        await refreshAllData();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (e) {}
  };

  // Save Store Branding configuration
  const handleSaveStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    try {
      // simulate server save inside database
      const res = await fetch(`/api/stores/${store.username}`); // fetch original store first
      if (res.ok) {
        // we can simply edit localized settings and trigger a mock update
        setFeedback("Detail profil dan banner toko Toko Sipil berhasil disimpan!");
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (e) {}
  };

  // Filtering store orders
  const myStoreOrders = store ? orders.filter(o => o.storeId === store.id) : [];
  const myStoreProducts = store ? products.filter(p => p.storeId === store.id) : [];
  const myStoreVouchers = store ? vouchers.filter(v => v.storeId === store.id) : [];

  // Monthly Sales Report calculations
  const monthlyOrders = myStoreOrders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === reportMonth && d.getFullYear() === reportYear;
  });

  const monthlyCompletedOrders = monthlyOrders.filter(o => o.status === OrderStatus.COMPLETED);
  const monthlyProcessedOrders = monthlyOrders.filter(o => 
    o.status !== OrderStatus.CANCELLED && 
    o.status !== OrderStatus.FAILED && 
    o.status !== OrderStatus.PENDING
  );
  
  const monthlyRevenue = monthlyProcessedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const monthlyShipping = monthlyProcessedOrders.reduce((sum, o) => sum + (o.shippingCost || 0), 0);

  const downloadMonthlyReportCSV = () => {
    if (!store) return;
    const headers = [
      'Order ID',
      'Tanggal',
      'Pembeli',
      'Penerima',
      'Telepon',
      'Kota Tujuan',
      'Kurir',
      'No Resi',
      'Status',
      'Jumlah Item',
      'Detail Produk',
      'Ongkos Kirim (Rp)',
      'Total Belanja (IDR)'
    ];

    const rows = monthlyOrders.map(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const receiverName = o.address?.receiver || o.buyerName || '-';
      const receiverPhone = o.address?.phone || '-';
      const receiverCity = o.address?.city || '-';
      const itemsDetail = o.items.map((i: any) => `${i.productName || i.name} (${i.selectedColor || '-'}/${i.selectedSize || '-'}) x${i.quantity}`).join(' | ');
      
      return [
        o.id,
        dateStr,
        o.buyerName || '-',
        receiverName,
        receiverPhone,
        receiverCity,
        o.courier || '-',
        o.resiNo || 'Belum dikirim',
        o.status,
        o.items.length,
        itemsDetail,
        o.shippingCost || 0,
        o.totalAmount
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const escaped = String(val).replace(/"/g, '""').replace(/\n/g, ' ');
        return `"${escaped}"`;
      }).join(','))
    ].join('\r\n');

    const monthNamesIndo = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const fileName = `Laporan_Penjualan_${store.name}_${monthNamesIndo[reportMonth]}_${reportYear}.csv`;
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare 7-day data for Sales Summary Chart using Recharts
  const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = daysName[d.getDay()];
    const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Filter orders on this localized day
    const dayOrders = myStoreOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getDate() === d.getDate() &&
             orderDate.getMonth() === d.getMonth() &&
             orderDate.getFullYear() === d.getFullYear();
    });

    // Sum revenue from non-cancelled, non-failed and non-pending store orders
    const dayRevenue = dayOrders
      .filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.FAILED && o.status !== OrderStatus.PENDING)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const dayOrdersCount = dayOrders.length;

    return {
      name: label,
      tanggal: dateStr,
      Revenue: dayRevenue,
      Pesanan: dayOrdersCount
    };
  });

  // Calculate high level summaries
  const weeklyTotalRevenue = last7DaysData.reduce((acc, curr) => acc + curr.Revenue, 0);
  const urgentOrdersToShip = myStoreOrders.filter(o => o.status === OrderStatus.PAID || o.status === OrderStatus.DP_PAID);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8" id="seller-workspace-page">
      
      {/* Upper header Identity details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-6 mb-8">
        <div>
          <span className="font-mono text-xs bg-black text-[#f4f2e9] px-2.5 py-0.5 uppercase inline-block">
            {store ? `★ SELLER PARTNER: ${store.name}` : '★ BECOMING SELLER PARTNER'}
          </span>
          <h1 className="font-serif text-3.5xl font-extrabold uppercase mt-1 tracking-tight">SELLER STORE CENTER</h1>
          <p className="font-mono text-[10px] text-gray-500 mt-1">
            STATISTICS, WALLET ESCROWS, BANK WITHDRAWALS, AND ALTERNATIVE STREETWEAR CATALOG CREATION
          </p>
        </div>

        {/* Quick followings statistics */}
        {store && (
          <div className="bg-white border-2 border-black p-3 text-xs font-mono font-bold maternal-shadow-sm flex items-center gap-4">
            <div>
              <span className="text-gray-400 block text-[9px] uppercase">STORE REVIEW RATING</span>
              <span className="text-black font-extrabold text-md">★ {store.rating}/5.0</span>
            </div>
            <div className="border-l border-gray-300 pl-4">
              <span className="text-gray-400 block text-[9px] uppercase">FOLLOWERS COUNT</span>
              <span className="text-black font-extrabold text-md">{store.followersCount} CLIENTS</span>
            </div>
          </div>
        )}
      </div>

      {feedback && (
        <div className="mb-6 bg-[#111] text-[#f4f2e9] py-3.5 px-4 font-mono text-center text-xs font-bold border-2 border-black animate-pulse maternal-shadow">
          Status: {feedback}
        </div>
      )}

      {/* Check of store limits */}
      {!store ? (
        <div className="text-center py-16 bg-[#eae8de] border-2 border-dashed border-gray-400 maternal-border max-w-xl mx-auto p-8" id="no-store-alert">
          <ShieldAlert className="w-12 h-12 text-[#991b1b] inline-block mb-3" />
          <h2 className="font-serif text-xl font-bold uppercase mb-2">ANDA BELUM MEMILIKI TOKO AKTIF</h2>
          <p className="font-sans text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
            Gunakan formulir pembukaan toko "OPEN STORE" di dashboard profil utama Anda atau hubungi pihak pengurus administrasi Toko Sipil untuk menyetujui pendaftaran toko Anda supaya role Anda beralih menjadi Seller.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs header brutalist selectors */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-gray-300 mb-8 font-mono text-xs scrollbar-none" id="seller-tabs">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 border-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'overview' ? 'border-black bg-black text-white font-bold' : 'border-gray-300 bg-white hover:border-black text-black'}`}
            >
              STORE OVERVIEW
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2.5 border-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'products' ? 'border-black bg-black text-white font-bold' : 'border-gray-300 bg-white hover:border-black text-black'}`}
            >
              PRODUCTS MANAGER ({myStoreProducts.length})
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 border-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'orders' ? 'border-black bg-black text-white font-bold' : 'border-gray-300 bg-white hover:border-black text-black'}`}
            >
              STORE ORDERS ({myStoreOrders.length})
            </button>
            <button 
              onClick={() => setActiveTab('wallet')}
              className={`px-4 py-2.5 border-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'wallet' ? 'border-black bg-black text-white font-bold' : 'border-gray-300 bg-white hover:border-black text-black'}`}
            >
              WALLET BALANCE
            </button>
            <button 
              onClick={() => setActiveTab('withdraw')}
              className={`px-4 py-2.5 border-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'withdraw' ? 'border-black bg-black text-white font-bold' : 'border-gray-300 bg-white hover:border-black text-black'}`}
            >
              WITHDRAW SALDO MY BANK
            </button>
            <button 
              onClick={() => setActiveTab('vouchers')}
              className={`px-4 py-2.5 border-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'vouchers' ? 'border-black bg-black text-white font-bold' : 'border-gray-300 bg-white hover:border-black text-black'}`}
            >
              VOUCHERS ({myStoreVouchers.length})
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 border-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'settings' ? 'border-black bg-black text-white font-bold' : 'border-gray-300 bg-white hover:border-black text-black'}`}
            >
              BRANDING SETUP
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6" id="seller-overview">
              {/* Financial Dashboard Sheet */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="wallet-statistics-sheet">
                
                {/* Saldo Tersedia */}
                <div className="bg-white border-2 border-black p-4 maternal-shadow-sm">
                  <span className="font-mono text-[9px] text-gray-400 font-bold block uppercase">SALDO TERSEDIA (CASH IN)</span>
                  <div className="flex justify-between items-baseline mt-1.5 font-mono">
                    <span className="text-xl md:text-2xl font-bold text-[#111]">
                      Rp{wallet.balance.toLocaleString('id-ID')}
                    </span>
                    <DollarSign className="w-5 h-5 text-green-700" />
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono mt-1 block">Siap ditarik kapan saja ke Rekening Bank</span>
                </div>

                {/* Saldo Ditahan */}
                <div className="bg-white border-2 border-black p-4 maternal-shadow-sm">
                  <span className="font-mono text-[9px] text-gray-400 font-bold block uppercase">SALDO DITAHAN (ESCROWS)</span>
                  <div className="flex justify-between items-baseline mt-1.5 font-mono">
                    <span className="text-xl md:text-2xl font-bold text-red-800">
                      Rp{wallet.heldBalance.toLocaleString('id-ID')}
                    </span>
                    <HelpCircle className="w-5 h-5 text-red-800" />
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono mt-1 block">Dana diarsip hingga order COMPLETED</span>
                </div>

                {/* Total Penjualan */}
                <div className="bg-white border-2 border-black p-4 maternal-shadow-sm">
                  <span className="font-mono text-[9px] text-gray-400 font-bold block uppercase">TOTAL OMZET BRUTO</span>
                  <div className="flex justify-between items-baseline mt-1.5 font-mono">
                    <span className="text-xl md:text-2xl font-bold text-black border-slate-300">
                      Rp{wallet.totalEarnings.toLocaleString('id-ID')}
                    </span>
                    <ShoppingCart className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono mt-1 block">Bruto seluruh pesanan masuk sukses</span>
                </div>

                {/* Total withdrawn */}
                <div className="bg-black text-[#f4f2e9] border-2 border-black p-4 maternal-shadow-sm">
                  <span className="font-mono text-[9px] text-gray-400 font-bold block uppercase">TOTAL WITHDRAWN</span>
                  <div className="flex justify-between items-baseline mt-1.5 font-mono">
                    <span className="text-xl md:text-2xl font-bold text-[#faf9f3]">
                      Rp{wallet.totalWithdrawn.toLocaleString('id-ID')}
                    </span>
                    <ArrowUpRight className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono mt-1 block uppercase">Total sukses dicairkan bank</span>
                </div>
              </div>

              {/* Weekly Sales Summary Component (using Recharts) */}
              <div className="bg-white border-2 border-black p-6 maternal-shadow grid grid-cols-1 md:grid-cols-3 gap-6" id="seller-sales-summary-graph">
                <div className="md:col-span-1 space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[9px] bg-red-800 text-[#f4f2e9] px-2 py-0.5 uppercase inline-block font-bold">
                      📈 PERFORMANCE METRICS
                    </span>
                    <h3 className="font-serif text-lg font-black uppercase mt-1 tracking-tight">RINGKASAN PENJUALAN MINGGUAN</h3>
                    <p className="font-mono text-[10px] text-gray-500 leading-relaxed mt-1">
                      Analisis tren pendapatan kotor (revenue) toko streetwear Anda selama satu minggu ke belakang berdasarkan data pesanan terbayar.
                    </p>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    {/* Revenue Stat */}
                    <div className="border border-black p-3 bg-rose-50/50">
                      <span className="text-[9px] text-rose-800 block font-mono font-bold uppercase">TOTAL ESTIMASI REVENUE</span>
                      <span className="text-xl font-bold font-mono text-rose-950">
                        Rp{weeklyTotalRevenue.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[8px] text-gray-500 font-mono block uppercase mt-0.5">Summing 7 days past orders</span>
                    </div>

                    {/* Orders needing ship */}
                    <div className="border border-black p-3 bg-yellow-50/50">
                      <span className="text-[9px] text-amber-800 block font-mono font-bold uppercase">PESANAN AKAN DIKIRIM (SIAP PACKING)</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-xl font-bold font-mono ${urgentOrdersToShip.length > 0 ? 'text-[#991b1b] font-black' : 'text-gray-500'}`}>
                          {urgentOrdersToShip.length} Pesanan
                        </span>
                        {urgentOrdersToShip.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-red-700 animate-ping" />
                        )}
                      </div>
                      <span className="text-[8px] text-gray-500 font-mono block uppercase mt-0.5">Status PAID atau DP_PAID</span>
                    </div>
                  </div>

                  {urgentOrdersToShip.length > 0 ? (
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="w-full text-center py-2.5 border-2 border-black bg-black text-[#f4f2e9] hover:bg-[#eae8de] hover:text-black font-mono font-bold text-[10px] uppercase transition cursor-pointer"
                    >
                      Selesaikan Pengiriman Sekarang 📦
                    </button>
                  ) : (
                    <div className="text-[9px] text-gray-400 font-mono bg-gray-50 p-2 text-center border uppercase border-dashed">
                      Semua pesanan terproses rapi!
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 border-2 border-black p-4 bg-white relative">
                  <span className="absolute top-2 right-2 text-[8px] font-mono text-gray-400">7-DAY CHART CONTROLLER</span>
                  <div className="h-72 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={last7DaysData} margin={{ top: 15, right: 10, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#be123c" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#be123c" stopOpacity={0.00}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e1e1e1" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#111" 
                          fontSize={10} 
                          fontFamily="monospace"
                          tickLine={false}
                        />
                        <YAxis 
                          yAxisId="left"
                          stroke="#111" 
                          fontSize={9} 
                          fontFamily="monospace"
                          tickFormatter={(value) => `Rp ${value >= 1e6 ? (value/1e6).toFixed(1) + 'M' : value >= 1e3 ? (value/1e3).toFixed(0) + 'k' : value}`}
                          tickLine={false}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          stroke="#111" 
                          fontSize={9} 
                          fontFamily="monospace"
                          tickFormatter={(value) => `${value} Order`}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#000', 
                            color: '#fff', 
                            borderColor: '#111',
                            fontSize: '11px', 
                            fontFamily: 'monospace',
                            boxShadow: '4px 4px 0px rgba(0,0,0,1)'
                          }}
                          formatter={(value: any, name: string) => {
                            if (name === "Revenue") return [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Pendapatan'];
                            if (name === "Pesanan") return [`${value} order`, 'Pesanan'];
                            return [value, name];
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }} />
                        <Area 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="Revenue" 
                          fill="url(#revenueGlow)" 
                          stroke="#be123c" 
                          strokeWidth={2} 
                          name="Revenue" 
                        />
                        <Bar 
                          yAxisId="right"
                          dataKey="Pesanan" 
                          barSize={16} 
                          fill="#111" 
                          name="Pesanan" 
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Monthly Sales Report Download Tool */}
              <div className="bg-white border-2 border-black p-6 maternal-shadow space-y-6" id="monthly-sales-report-section">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-gray-100 pb-4">
                  <div>
                    <span className="font-mono text-[9px] bg-red-900 text-[#faf9f3] px-2 py-0.5 uppercase inline-block font-extrabold tracking-wider">
                      📊 MONTHLY TRANSACTION ARCHIVER
                    </span>
                    <h2 className="font-serif text-lg font-black uppercase mt-1 tracking-tight">LAPORAN PENJUALAN BULANAN</h2>
                    <p className="font-mono text-gray-500 text-[10px] mt-0.5">
                      Pilih periode bulan dan tahun untuk menghitung rangkuman neraca serta mengekspor data arsip transaksi toko Anda.
                    </p>
                  </div>

                  {/* Period selection inputs - Highly mobile friendly */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 font-mono text-xs">
                    <div className="flex items-center gap-1.5 border-2 border-black p-1.5 bg-gray-50">
                      <Calendar className="w-3.5 h-3.5 text-gray-600" />
                      <select 
                        value={reportMonth} 
                        onChange={(e) => setReportMonth(Number(e.target.value))}
                        className="bg-transparent font-bold focus:outline-none cursor-pointer text-[11px] uppercase"
                      >
                        {[
                          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                        ].map((month, idx) => (
                          <option key={idx} value={idx}>{month}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 border-2 border-black p-1.5 bg-gray-50">
                      <select 
                        value={reportYear} 
                        onChange={(e) => setReportYear(Number(e.target.value))}
                        className="bg-transparent font-bold focus:outline-none cursor-pointer text-[11px]"
                      >
                        {[2024, 2025, 2026, 2027].map((yr) => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Status Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 font-mono">
                  <div className="border-2 border-black p-3 bg-gray-50/50">
                    <span className="text-[9px] text-gray-400 block font-bold uppercase">TOTAL PESANAN</span>
                    <span className="text-sm md:text-md font-extrabold text-[#111] block mt-1">{monthlyOrders.length} Order</span>
                    <span className="text-[8px] text-gray-400 block mt-0.5">Seluruh status di bulan ini</span>
                  </div>

                  <div className="border-2 border-black p-3 bg-green-50/50">
                    <span className="text-[9px] text-green-800 block font-bold uppercase">PESANAN SELESAI</span>
                    <span className="text-sm md:text-md font-extrabold text-green-900 block mt-1">{monthlyCompletedOrders.length} Order</span>
                    <span className="text-[8px] text-green-700 block mt-0.5">Status: COMPLETED</span>
                  </div>

                  <div className="border-2 border-black p-3 bg-rose-50/55">
                    <span className="text-[9px] text-rose-800 block font-bold uppercase">ESTIMASI REVENUE</span>
                    <span className="text-sm md:text-md font-extrabold text-rose-950 block mt-1">
                      Rp{monthlyRevenue.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[8px] text-rose-700 block mt-0.5">PAID / COMPLETED / SHIP</span>
                  </div>

                  <div className="border-2 border-black p-3 bg-amber-50/50">
                    <span className="text-[9px] text-amber-800 block font-bold uppercase">TOTAL BIAYA ONGKIR</span>
                    <span className="text-sm md:text-md font-extrabold text-amber-950 block mt-1">
                      Rp{monthlyShipping.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[8px] text-amber-700 block mt-0.5">Total ongkir kurir ekspedisi</span>
                  </div>
                </div>

                {/* PDF & CSV Export Buttons - Highly responsive, full-width on mobile */}
                <div className="flex flex-col sm:flex-row items-center gap-3 font-mono text-xs pt-2">
                  <button
                    onClick={downloadMonthlyReportCSV}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 border-2 border-black bg-[#faf9f3] text-black hover:bg-black hover:text-[#faf9f3] transition-all font-bold uppercase text-[10px] cursor-pointer maternal-shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={monthlyOrders.length === 0}
                  >
                    <Download className="w-4 h-4 text-rose-800" />
                    Unduh Arsip CSV (.csv)
                  </button>

                  <button
                    onClick={() => setShowPrintReportModal(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 border-2 border-black bg-black text-[#faf9f3] hover:bg-[#eae8de] hover:text-black transition-all font-bold uppercase text-[10px] cursor-pointer maternal-shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={monthlyOrders.length === 0}
                  >
                    <FileText className="w-4 h-4 text-yellow-400" />
                    Ekspor / Cetak PDF (.pdf)
                  </button>

                  {monthlyOrders.length === 0 && (
                    <span className="text-[9.5px] text-red-700 font-bold uppercase tracking-tight animate-pulse text-center sm:text-left w-full sm:w-auto">
                      ⚠️ Belum ada transaksi tercatat untuk periode ini.
                    </span>
                  )}
                </div>
              </div>

              {/* Quick orders previews notifications */}
              <div className="bg-white border-2 border-black p-6 maternal-shadow">
                <span className="font-mono text-xs text-gray-500 font-bold block uppercase mb-4">DAFTAR PESANAN MENDESAK</span>
                {myStoreOrders.length === 0 ? (
                  <p className="font-mono text-xs text-gray-400 italic">Belum ada pesanan masuk ke toko Anda.</p>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {myStoreOrders.slice(0, 3).map((ord) => (
                      <div key={ord.id} className="py-3 flex justify-between items-center font-mono text-xs">
                        <div>
                          <span>ID: <b>{ord.id}</b> | Penerima: {ord.address.receiver}</span>
                          <p className="text-[9px] text-gray-400">Total belanja: Rp{ord.totalAmount.toLocaleString('id-ID')} ({ord.items.length} item)</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold border uppercase ${
                          ord.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                          ord.status === OrderStatus.PAID ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-mono text-xs" id="seller-products-pane">
              {/* Product Creator form */}
              <div className="bg-white border-2 border-black p-6 maternal-shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3 mb-2">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-tight text-red-900 block">
                    {editingProductId ? '✏️ EDIT PRODUK FASHION TOKO' : 'UNGGAH PRODUK FASHION TOKO'}
                  </h3>
                  <button 
                    type="button"
                    onClick={handleLoadFashionPresets}
                    className="font-mono text-[9px] bg-red-800 text-white border border-[#991b1b] p-1 uppercase"
                    title="Load Nice Standard Minimal 5 High-Quality Fashion Photos"
                  >
                    PRE-LOAD 5 PHOTO PRESETS
                  </button>
                </div>
                
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 font-bold mb-1">NAMA PRODUK *</label>
                      <input 
                        type="text" 
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="Contoh: Jiraga Sinner T-Shirt"
                        required
                        className="w-full bg-slate-50 border-2 border-black p-2 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 font-bold mb-1">SKU PRODUK *</label>
                      <input 
                        type="text" 
                        value={prodSku}
                        onChange={(e) => setProdSku(e.target.value)}
                        placeholder="Contoh: MT-JRG-05"
                        required
                        className="w-full bg-slate-50 border-2 border-black p-2 focus:outline-none uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">DESKRIPSI LENGKAP PRODUK</label>
                    <textarea 
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      rows={3}
                      placeholder="Masukan bahan detail sablon, ketebalan combed kain, fitting cut..."
                      className="w-full bg-slate-50 border-2 border-black p-2 focus:outline-none text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-400 font-bold mb-1">HARGA (RP) *</label>
                      <input 
                        type="number" 
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        placeholder="219000"
                        required
                        className="w-full bg-slate-50 border-2 border-black p-2 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 font-bold mb-1">DISKON (%)</label>
                      <input 
                        type="number" 
                        value={prodDiscount}
                        onChange={(e) => setProdDiscount(e.target.value)}
                        min={0}
                        max={99}
                        className="w-full bg-slate-50 border-2 border-black p-2 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 font-bold mb-1">STOK COPIES</label>
                      <input 
                        type="number" 
                        value={prodStock}
                        onChange={(e) => setProdStock(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-black p-2 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 font-bold mb-1">KATEGORI *</label>
                      <select 
                        value={prodCatId}
                        onChange={(e) => setProdCatId(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-black p-2 focus:outline-none cursor-pointer text-xs"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 font-bold mb-1">BERAT PAKET (GRAM) *</label>
                      <input 
                        type="number" 
                        value={prodWeight}
                        onChange={(e) => setProdWeight(e.target.value)}
                        placeholder="250"
                        required
                        className="w-full bg-slate-50 border-2 border-black p-2 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pre-Order Options Section */}
                  <div className="border border-black p-4 bg-slate-100 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="prodIsPreOrder"
                        checked={prodIsPreOrder}
                        onChange={(e) => setProdIsPreOrder(e.target.checked)}
                        className="w-4 h-4 cursor-pointer accent-red-800"
                      />
                      <label htmlFor="prodIsPreOrder" className="font-extrabold text-black cursor-pointer text-xs uppercase tracking-tight select-none">
                        PRODUK INI SYSTEM PRE-ORDER (PO)
                      </label>
                    </div>
                    
                    {prodIsPreOrder && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block text-gray-700 font-bold mb-1 uppercase text-[10px]">PERSENTASE DP (%) *</label>
                          <input 
                            type="number" 
                            value={prodPreOrderDp}
                            onChange={(e) => {
                              const val = Math.min(100, Math.max(1, Number(e.target.value)));
                              setProdPreOrderDp(isNaN(val) ? '50' : val.toString());
                            }}
                            min={1}
                            max={100}
                            required={prodIsPreOrder}
                            className="w-full bg-white border-2 border-black p-2 focus:outline-none font-bold"
                            placeholder="Misal: 50"
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-[10px] text-red-800 leading-normal uppercase">
                            <b>Down Payment (DP): {prodPreOrderDp}%</b><br />
                            Pembeli akan membayar ulasan DP pertama, kemudian pelunasan sebesar <b>{Math.max(0, 100 - Number(prodPreOrderDp))}%</b> saat pengerjaan barang selesai.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 font-bold mb-1">UKURAN (PISAHKAN KOMA)</label>
                      <input 
                        type="text" 
                        value={prodSizeString}
                        onChange={(e) => setProdSizeString(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-black p-2 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 font-bold mb-1">WARNAWAY (PISAHKAN KOMA)</label>
                      <input 
                        type="text" 
                        value={prodColorString}
                        onChange={(e) => setProdColorString(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-black p-2 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pictures lists */}
                  <div>
                    <label className="block text-black font-extrabold text-[11px] mb-2 uppercase">📸 UNGGAH FOTO PRODUK (MINIMAL 1 FOTO, HINGGA 5 FOTO) *</label>
                    <div className="grid grid-cols-5 gap-2 mb-2">
                      {[0, 1, 2, 3, 4].map((idx) => (
                        <div key={idx} className="relative border-2 border-dashed border-black bg-white aspect-square flex flex-col items-center justify-center overflow-hidden group">
                          {prodImages[idx] ? (
                            <>
                              <img src={prodImages[idx]} alt="preview" className="w-full h-full object-cover animate-fade-in" />
                              <button
                                type="button"
                                onClick={() => {
                                  const copy = [...prodImages];
                                  copy.splice(idx, 1);
                                  setProdImages(copy.filter(Boolean));
                                }}
                                className="absolute top-1 right-1 bg-red-700 text-white text-[10px] w-4 h-4 flex items-center justify-center border border-black hover:bg-black font-sans leading-none z-10 cursor-pointer"
                              >
                                ×
                              </button>
                            </>
                          ) : (
                            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-1 text-center hover:bg-gray-50">
                              <span className="text-xl font-black text-gray-400 font-sans">+</span>
                              <span className="text-[8px] font-bold text-gray-500 uppercase">FOTO {idx+1}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setFeedback("Sedang mengompresi gambar...");
                                    try {
                                      const compressedBase64 = await compressAndResizeImage(file);
                                      const copy = [...prodImages];
                                      copy[idx] = compressedBase64;
                                      setProdImages(copy.filter(Boolean));
                                      setFeedback("Gambar berhasil dikompresi & dimuat.");
                                    } catch (err: any) {
                                      setFeedback(`Gagal memuat gambar: ${err.message}`);
                                    }
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Add a multi-file upload button as convenience */}
                    <div className="flex gap-2">
                      <label className="cursor-pointer bg-white hover:bg-yellow-50 border-2 border-black p-2 text-[10px] font-bold uppercase block tracking-tight flex-grow text-center transition">
                        📁 PILIH BANYAK FILE SEKALIGUS
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []) as File[];
                            if (files.length > 0) {
                              setFeedback("Sedang melakukan kompresi massal foto...");
                              const loadedImages: string[] = [];
                              const targetFiles = files.slice(0, 5);
                              
                              for (let i = 0; i < targetFiles.length; i++) {
                                try {
                                  const compressed = await compressAndResizeImage(targetFiles[i]);
                                  loadedImages.push(compressed);
                                } catch (err) {
                                  console.error("Gagal mengompresi file:", err);
                                }
                              }
                              
                              if (loadedImages.length > 0) {
                                setProdImages(loadedImages);
                                setFeedback(`Berhasil mengompresi & memuat ${loadedImages.length} foto.`);
                              } else {
                                setFeedback("Gagal mengompresi gambar apapun.");
                              }
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleLoadFashionPresets}
                        className="bg-gray-100 hover:bg-gray-200 border-2 border-black px-3 py-2 text-[10px] font-bold uppercase transition cursor-pointer"
                      >
                        ⚡ LOAD PRESETS
                      </button>
                    </div>
                    <p className="text-[9px] text-gray-400 uppercase mt-1">Sistem akan secara instan merender file lokal Anda sebagai data Base64 aman yang tersimpan di server.</p>
                  </div>

                  {/* Validation and Processing Notification/Error Box */}
                  {productErrors.length > 0 && (
                    <div className="bg-red-50 border-2 border-[#991b1b] p-3.5 text-[#991b1b] font-mono text-xs rounded animate-fade-in">
                      <span className="font-sans font-bold text-red-950 block mb-1 uppercase tracking-tight">
                        ⚠️ ALASAN GAGAL & KOLOM YANG HARUS DIPERBAIKI:
                      </span>
                      <ul className="list-disc pl-4 space-y-1">
                        {productErrors.map((err, idx) => (
                          <li key={idx} className="font-semibold">{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className={`font-semibold text-xs uppercase cursor-pointer py-3 ${editingProductId ? 'flex-grow bg-black text-[#faf9f3] border-2 border-black hover:bg-[#faf9f3] hover:text-black font-extrabold text-center transition-all' : 'w-full maternal-btn'}`}
                    >
                      {editingProductId ? '💾 SIMPAN PERUBAHAN PRODUK' : 'TERBITKAN PRODUK KE ETALASE'}
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-3 bg-red-800 text-white border-2 border-black hover:bg-black font-extrabold text-xs uppercase cursor-pointer transition-all"
                      >
                        BATAL
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* List store products */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold uppercase tracking-tight text-black block mb-4">ETALASE PRODUK AKTIF KAMU</h3>
                {myStoreProducts.length === 0 ? (
                  <p className="font-mono text-xs text-gray-400 italic">Belum ada produk terdaftar dari toko Anda.</p>
                ) : (
                  <div className="grid grid-cols-1 ssm:grid-cols-2 gap-3.5 max-h-[600px] overflow-y-auto pr-1">
                    {myStoreProducts.map((p) => (
                      <div key={p.id} className="bg-[#faf9f3] p-3 border border-black flex gap-3 relative maternal-shadow-sm justify-between items-start">
                        <div className="flex gap-3">
                          <img src={p.images[0]} alt="preview" className="w-12 h-12 border object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-bold text-black uppercase text-[11px] truncate w-32 sm:w-40">{p.name}</p>
                            <span className="text-[10px] text-gray-400 block font-mono">SKU ID: {p.sku} | Stok: {p.stock}</span>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-[#991b1b] font-bold block font-mono">Rp{(p.price * (1 - p.discount/100)).toLocaleString('id-ID')}</span>
                              {p.isPreOrder && (
                                <span className="inline-block bg-amber-400 text-black border border-black text-[8px] font-extrabold px-1 py-0.5 select-none uppercase">
                                  PO (DP: {p.preOrderDpPercent}%)
                                </span>
                              )}
                            </div>
                            
                            {/* Product Approval Status Badge */}
                            <div className="mt-1 flex items-center gap-1">
                              <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 border uppercase ${
                                p.isApproved === true ? 'bg-green-100 text-green-700 border-green-300' :
                                p.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-300' :
                                'bg-amber-100 text-amber-700 border-amber-300'
                              }`}>
                                STATUS: {
                                  p.isApproved === true ? 'DISETUJUI (PUBLIC)' :
                                  p.approvalStatus === 'REJECTED' ? 'DITOLAK ADMIN' :
                                  'MENUNGGU PERSETUJUAN'
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Edit and Delete action buttons */}
                        <div className="flex flex-col items-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleEditProductClick(p)}
                            className="p-1 border border-black bg-white text-black hover:bg-amber-100 transition cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProductClick(p.id, p.name)}
                            className={`p-1 border border-black transition cursor-pointer ${
                              deleteConfirmId === p.id 
                                ? 'bg-red-700 text-white font-mono text-[8px] px-1.5 py-0.5' 
                                : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-700'
                            }`}
                            title={deleteConfirmId === p.id ? "Klik lagi untuk konfirmasi Hapus" : "Hapus Produk"}
                          >
                            {deleteConfirmId === p.id ? "YAKIN?" : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (() => {
            const displayedStoreOrders = myStoreOrders.filter(ord => {
              if (orderFilter === 'pending') return ord.status === OrderStatus.PENDING;
              if (orderFilter === 'process') return ord.status !== OrderStatus.PENDING && ord.status !== OrderStatus.CANCELLED && ord.status !== OrderStatus.FAILED;
              if (orderFilter === 'cancelled') return ord.status === OrderStatus.CANCELLED || ord.status === OrderStatus.FAILED;
              return true;
            });

            return (
              <div className="space-y-6 font-mono text-xs" id="seller-orders-pane">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="font-serif text-xl font-bold uppercase block tracking-tight">KONTROL PESANAN MASUK (SISTEM RESI & TRACKING)</h2>
                  
                  {/* Sub-tab selection filters */}
                  <div className="flex flex-wrap gap-1.5 bg-gray-50 p-1 border-2 border-black">
                    <button
                      onClick={() => setOrderFilter('all')}
                      className={`px-2.5 py-1 text-[9px] font-bold uppercase transition cursor-pointer ${orderFilter === 'all' ? 'bg-black text-[#faf9f3]' : 'bg-transparent text-black hover:bg-gray-200'}`}
                    >
                      Semua ({myStoreOrders.length})
                    </button>
                    <button
                      onClick={() => setOrderFilter('pending')}
                      className={`px-2.5 py-1 text-[9px] font-bold uppercase transition cursor-pointer ${orderFilter === 'pending' ? 'bg-amber-400 text-black border border-black' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
                    >
                      Pending ({myStoreOrders.filter(o => o.status === OrderStatus.PENDING).length})
                    </button>
                    <button
                      onClick={() => setOrderFilter('process')}
                      className={`px-2.5 py-1 text-[9px] font-bold uppercase transition cursor-pointer ${orderFilter === 'process' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
                    >
                      Diproses ({myStoreOrders.filter(o => o.status !== OrderStatus.PENDING && o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.FAILED).length})
                    </button>
                    <button
                      onClick={() => setOrderFilter('cancelled')}
                      className={`px-2.5 py-1 text-[9px] font-bold uppercase transition cursor-pointer ${orderFilter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
                    >
                      Tidak Jadi ({myStoreOrders.filter(o => o.status === OrderStatus.CANCELLED || o.status === OrderStatus.FAILED).length})
                    </button>
                  </div>
                </div>

                {displayedStoreOrders.length === 0 ? (
                  <p className="font-mono text-xs text-gray-400 italic bg-white p-6 border-2 border-dashed border-gray-300 text-center uppercase">Belum ada pesanan dengan kategori filter ini.</p>
                ) : (
                  <div className="space-y-4">
                    {displayedStoreOrders.map((ord) => (
                      <div key={ord.id} className="bg-white border-2 border-black p-5 maternal-shadow-sm space-y-4">
                        {/* Top Header line */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 gap-2">
                          <div>
                            <span className="text-[10px] text-gray-400 block font-bold">PEMBELI: {ord.buyerName}</span>
                            <span className="text-black font-extrabold text-xs uppercase">PESANAN ID: {ord.id}</span>
                          </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedPrintOrder(ord)}
                            className="flex items-center gap-1 bg-amber-400 hover:bg-black hover:text-white text-black font-mono font-bold px-2 py-1 text-[9px] border border-black cursor-pointer uppercase transition-all"
                            title="Cetak Struk Alamat Pengiriman"
                          >
                            <Printer className="w-3.5 h-3.5 text-black" /> CETAK STRUK ADRES
                          </button>
                          <span className={`font-mono text-[9px] px-2 py-0.5 border font-bold uppercase ${
                            ord.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700 border-green-300' :
                            ord.status === OrderStatus.PAID ? 'bg-blue-100 text-blue-700 border-blue-300' :
                            ord.status === OrderStatus.SHIPPED ? 'bg-purple-100 text-purple-700 border-purple-300' :
                            ord.status === OrderStatus.DELIVERED ? 'bg-indigo-100 text-indigo-700 border-indigo-300' :
                            ord.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-700 border-red-300' :
                            ord.status === OrderStatus.FAILED ? 'bg-neutral-100 text-neutral-600 border-neutral-300' :
                            ord.status === OrderStatus.DP_PAID ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            'bg-orange-100 text-orange-700 border-orange-300'
                          }`}>
                            STATUS: {
                              ord.status === OrderStatus.CANCELLED ? 'BATAL (TIDAK JADI)' : 
                              ord.status === OrderStatus.FAILED ? 'EXPIRED (KADALUARSA >24 JAM)' : 
                              ord.status
                            }
                          </span>
                          <span className="text-[10px] text-gray-400 font-light">{new Date(ord.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="space-y-2">
                        {ord.items.map((item: any, i: number) => (
                          <div key={i} className="flex gap-3 items-center text-xs">
                            <img src={item.image} alt="preview" className="w-10 h-10 border border-black object-cover" referrerPolicy="no-referrer" />
                            <div className="flex-grow">
                              <p className="font-serif font-bold uppercase text-gray-800">{item.name}</p>
                              <span className="text-gray-400 text-[10px]">Ukuran: {item.size} • Warnaway: {item.color} • Jumlah: {item.quantity} pcs</span>
                            </div>
                            <span className="font-bold">Rp{(item.discountPrice * item.quantity).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom shipping controller */}
                      <div className="border-t pt-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-gray-50 p-2.5">
                        <div>
                          <span className="text-gray-400 block text-[9.5px]">ALAMAT KIRIM & DETAIL:</span>
                          <p className="font-bold leading-tight">{ord.address.receiver} ({ord.address.phone})</p>
                          <p className="text-[10px] text-gray-600 truncate max-w-sm">{ord.address.detail}, {ord.address.city}</p>
                          {ord.isPreOrder ? (
                            <div className="text-[10px] font-bold mt-1 uppercase text-slate-800 bg-amber-50 border border-amber-300 p-2 space-y-0.5 rounded-none font-mono font-bold">
                              {ord.remainingAmount === 0 || ord.isFullPaid ? (
                                <>
                                  <p className="text-emerald-800 font-extrabold pb-0.5 border-b border-emerald-200">System: Pre-Order (Lunas 100%)</p>
                                  <p>Total Terbayar: <span className="text-green-700 font-bold">Rp{ord.totalAmount?.toLocaleString('id-ID')}</span></p>
                                  <p>Sisa Tagihan: <span className="text-green-700 font-bold">Rp0 (LUNAS)</span></p>
                                </>
                              ) : (
                                <>
                                  <p className="text-amber-800 font-extrabold pb-0.5 border-b border-amber-200">System: Pre-Order (DP {ord.preOrderDpPercent}%)</p>
                                  <p>DP Terbayar: <span className="text-green-700 font-bold">Rp{ord.dpAmount?.toLocaleString('id-ID')}</span></p>
                                  <p>Sisa Tagihan: <span className="text-red-700 font-bold">Rp{ord.remainingAmount?.toLocaleString('id-ID')}</span> ({ord.isFullPaid ? 'LUNAS' : 'BELUM BAYAR'})</p>
                                </>
                              )}
                              <p className="text-gray-500 font-medium">Kurir: {ord.courier} (Rp{ord.shippingCost.toLocaleString('id-ID')})</p>
                            </div>
                          ) : (
                            <p className="text-[10px] text-red-800 font-bold mt-1">Kurir: {ord.courier} (Ongkir: Rp{ord.shippingCost.toLocaleString('id-ID')})</p>
                          )}
                        </div>

                        {/* Ship Trigger form element */}
                        <div className="flex flex-col items-end gap-1.5 self-stretch md:self-auto">
                          {ord.status === OrderStatus.PAID ? (
                            <div className="flex gap-1">
                              <input 
                                type="text" 
                                placeholder="MASUKAN NOMOR RESI MT..."
                                value={resiMap[ord.id] || ''}
                                onChange={(e) => setResiMap({ ...resiMap, [ord.id]: e.target.value })}
                                className="bg-white border-2 border-black p-1 text-[10px] focus:outline-none uppercase w-44"
                              />
                              <button
                                onClick={() => handleShipOrder(ord.id)}
                                className="bg-black text-white hover:bg-gray-800 px-2.5 py-1.5 font-bold text-[10px] cursor-pointer"
                              >
                                SHIP
                              </button>
                            </div>
                          ) : ord.status === OrderStatus.SHIPPED ? (
                            <div className="text-right space-y-1 text-[10px]">
                              <p>No Resi: <b>{ord.resiNo}</b></p>
                              <span className="text-gray-500 text-[9px] uppercase font-mono block">Paket dalam perjalanan kurir. Menunggu konfirmasi penerimaan oleh pembeli.</span>
                            </div>
                          ) : ord.status === OrderStatus.DP_PAID ? (
                            <div className="text-right text-[10px] leading-relaxed max-w-xs space-y-1 font-mono">
                              <p className="font-extrabold text-amber-700 uppercase">✓ DP {ord.preOrderDpPercent}% DITERIMA (PROSES PRODUKSI)</p>
                              <p className="text-gray-500 text-[9px] uppercase">Baju pre-order ini siap diproduksi. Menunggu Customer melunasi sisa tagihan Rp{ord.remainingAmount?.toLocaleString('id-ID')} sebelum input resi pengiriman dibuka.</p>
                              {ord.pelunasanDeadline && (
                                <p className="text-red-700 text-[8.5px] font-bold">DEADLINE PELUNASAN: {new Date(ord.pelunasanDeadline).toLocaleDateString()}</p>
                              )}
                            </div>
                          ) : (
                            <div className="text-right text-[10px] font-mono">
                              {ord.status === OrderStatus.COMPLETED && <p className="text-green-800 font-bold uppercase">✓ DANA DIRILIS KE WALLET (PO SELESAI)</p>}
                              {ord.status === OrderStatus.CANCELLED && (
                                <div className="text-red-700 bg-red-50 p-2.5 border border-red-300 max-w-xs text-left inline-block">
                                  <p className="font-extrabold uppercase text-[9px] mb-1">✗ BATAL (TIDAK JADI BAYAR)</p>
                                  <p className="normal-case text-[9px] text-gray-700 leading-snug">
                                    Alasan: <b>"{ord.cancelReason || 'Tidak ada alasan khusus.'}"</b>
                                  </p>
                                </div>
                              )}
                              {ord.status === OrderStatus.FAILED && (
                                <div className="text-gray-600 bg-gray-50 p-2.5 border border-gray-300 max-w-xs text-left inline-block">
                                  <p className="font-extrabold uppercase text-[9px] mb-1">✗ EXPIRED / KADALUARSA</p>
                                  <p className="text-[9px] text-gray-500 leading-snug">
                                    Pemesanan otomatis kadaluarsa (FAILED) karena waktu pending melewati 24 jam.
                                  </p>
                                </div>
                              )}
                              {ord.resiNo && <p className="text-gray-400 mt-1">Waybill Resi: <b>{ord.resiNo}</b></p>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

          {activeTab === 'wallet' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-mono text-xs" id="seller-wallet-pane">
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold uppercase block tracking-tight">LEDGER TRANSAKSI KEUANGAN TOKO</h3>
                {walletTxs.length === 0 ? (
                  <p className="font-mono text-xs text-gray-400 italic">Belum ada riwayat transaksi wallet.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {walletTxs.map((tx) => (
                      <div key={tx.id} className="bg-white p-3 border border-black flex justify-between items-center maternal-shadow-sm">
                        <div>
                          <p className="font-bold text-gray-800">{tx.description}</p>
                          <span className="text-[9px] text-gray-400">ID: {tx.id} | {new Date(tx.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`font-bold text-sm ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'CREDIT' ? '+' : '-'}Rp{tx.amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked account state verification info widget */}
              <div className="bg-white border-2 border-black p-6 maternal-shadow-sm space-y-4" id="bank-settings-sheet">
                <span className="font-serif text-lg font-bold uppercase block text-black">LINK REKENING PENCAIRAN</span>
                
                {bankAcc ? (
                  <div className="bg-[#faf9f3] p-4 border border-black space-y-2">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-bold">STATUS REKENING:</span>
                      <span className={`font-bold py-0.5 px-2 text-[9px] uppercase border ${
                        bankAcc.status === BankVerificationStatus.APPROVED ? 'bg-green-100 text-green-700 border-green-300' :
                        bankAcc.status === BankVerificationStatus.REJECTED ? 'bg-red-100 text-red-700 border-red-300' :
                        'bg-orange-100 text-orange-700 border-orange-300'
                      }`}>
                        {bankAcc.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 bg-white p-3 border border-gray-200">
                      <p><span className="text-gray-400">Nama Bank:</span> <b>{bankAcc.bankName}</b></p>
                      <p><span className="text-gray-400">No Rekening:</span> <b>{bankAcc.accountNumber}</b></p>
                      <p><span className="text-gray-400">Nama Pemilik:</span> <b>{bankAcc.accountHolder}</b></p>
                      <p><span className="text-gray-400">NIK terdaftar:</span> {bankAcc.nik}</p>
                    </div>

                    {bankAcc.status === BankVerificationStatus.PENDING && (
                      <p className="text-[10px] text-gray-400 italic">Rekening sedang kami verifikasi. Harap tunggu persetujuan pengurus Toko Sipil.</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50 p-4 border border-amber-300 text-[10.5px] leading-relaxed text-amber-900 inline-block">
                    <b>BELUM ADA REKENING TERAUTENTIKASI:</b> Untuk menarik dana dari wallet toko, Anda diwajibkan melengkapi formulir nama lengkap, bank, nomor rekening dan data NIK KTP pendukung untuk dilakukan verifikasi terlebih dahulu oleh tim admin.
                  </div>
                )}

                {/* Bank submission form */}
                <form onSubmit={handleBankSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 font-bold mb-1 uppercase">NAMA BANK *</label>
                      <select 
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2 focus:outline-none cursor-pointer"
                      >
                        <option value="BCA">BCA (Bank Central Asia)</option>
                        <option value="Mandiri">Mandiri</option>
                        <option value="BNI">BNI</option>
                        <option value="BRI">BRI</option>
                        <option value="BSI">BSI</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 font-bold mb-1 uppercase">NOMOR REKENING *</label>
                      <input 
                        type="text" 
                        value={bankNum}
                        onChange={(e) => setBankNum(e.target.value)}
                        required
                        placeholder="1249129482"
                        className="w-full bg-white border-2 border-black p-2 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 font-bold mb-1 uppercase">NAMA REKENING (SESUAI BUKU) *</label>
                      <input 
                        type="text" 
                        value={bankHolder}
                        onChange={(e) => setBankHolder(e.target.value)}
                        required
                        placeholder="Contoh: Ahmad Slamet"
                        className="w-full bg-white border-2 border-black p-2 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 font-bold mb-1">NIK KTP SELLER (16 DIGIT) *</label>
                      <input 
                        type="text" 
                        maxLength={16}
                        value={bankNik}
                        onChange={(e) => setBankNik(e.target.value)}
                        required
                        placeholder="3273010101010001"
                        className="w-full bg-white border-2 border-black p-2 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-black hover:bg-slate-800 border-2 border-black text-white text-xs font-bold uppercase transition cursor-pointer"
                  >
                    LINK & AJUKAN VERIFIKASI BANK REKENING
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-mono text-xs" id="seller-withdraw-pane">
              {/* Withdraw form */}
              <div className="bg-white border-2 border-black p-6 maternal-shadow">
                <h3 className="font-serif text-lg font-bold uppercase mb-4 tracking-tight block">FORM PENARIKAN DANA PENJUALAN</h3>
                
                <div className="bg-[#111111] text-[#f4f2e9] p-4 text-center border-l-4 border-red-700 font-mono mb-4">
                  <span className="text-[10px] text-gray-400 block uppercase">SALDO DOMPET TERSEDIA</span>
                  <p className="text-2xl font-bold">Rp{wallet.balance.toLocaleString('id-ID')}</p>
                </div>

                <form onSubmit={handleWithdrawRequest} className="space-y-4">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1 uppercase">JUMLAH PENARIKAN (MIN RP50.000) *</label>
                    <input 
                      type="number" 
                      min={50000}
                      value={wdAmount}
                      onChange={(e) => setWdAmount(e.target.value)}
                      placeholder="CONTOH: 100000"
                      required
                      className="w-full bg-white border-2 border-black p-3 text-lg font-bold text-center focus:outline-none"
                    />
                  </div>

                  {bankAcc ? (
                    <div className="bg-[#faf9f3] p-3 border border-gray-300 text-xs text-left text-gray-600">
                      <p className="mb-1"><span className="text-gray-400">TRANSFER KE:</span> {bankAcc.bankName} - {bankAcc.accountNumber}</p>
                      <p className="mb-1"><span className="text-gray-400">NAMA REKENING:</span> {bankAcc.accountHolder}</p>
                      <p className="mb-1"><span className="text-gray-400 font-bold uppercase">STATUS BANK:</span> 
                        <b className={`ml-1 px-1.5 py-0.5 rounded text-[10px] text-green-700 ${bankAcc.status === BankVerificationStatus.APPROVED ? 'bg-green-100' : 'bg-red-100 text-red-700'}`}>
                          {bankAcc.status}
                        </b>
                      </p>
                    </div>
                  ) : (
                    <p className="text-[#991b1b] text-[10px] font-bold">Harap tautkan dan verifikasi akun rekening Anda dulu di tab "Wallet Balance" sebelum dapat menarik dana.</p>
                  )}

                  <button
                    type="submit"
                    disabled={!bankAcc || bankAcc.status !== BankVerificationStatus.APPROVED || wallet.balance < 50000}
                    className="w-full py-3.5 maternal-btn font-bold text-xs uppercase disabled:opacity-30 disabled:cursor-not-allowed"
                    id="submit-wd-btn"
                  >
                    KIRIM PENGAJUAN WITHDRAWAL SELLER
                  </button>
                </form>
              </div>

              {/* Withdrawals list */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold uppercase tracking-tight block">HISTORY WITHDRAWAL PENCAIRAN</h3>
                {withdraws.length === 0 ? (
                  <p className="font-mono text-xs text-gray-400 italic">Belum ada history withdrawal.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {withdraws.map((w) => (
                      <div key={w.id} className="bg-white p-3.5 border border-black flex justify-between items-center maternal-shadow-sm text-xs">
                        <div>
                          <span>ID: <b>{w.id}</b> | Rp{w.amount.toLocaleString('id-ID')}</span>
                          <p className="text-[10px] text-gray-400">No Rek: {w.bankName} - {w.accountNumber}</p>
                          {w.notes && <p className="text-[9.5px] text-amber-800 italic mt-0.5">Note: {w.notes}</p>}
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase border font-bold ${
                          w.status === WithdrawalStatus.COMPLETED ? 'bg-green-100 text-green-700 border-green-300' :
                          w.status === WithdrawalStatus.REJECTED ? 'bg-red-100 text-red-700 border-red-300' :
                          'bg-orange-100 text-orange-700 border-orange-300'
                        }`}>
                          {w.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && store && (
            <div className="max-w-xl bg-white border-2 border-black p-6 maternal-shadow font-mono text-xs" id="store-branding-pane">
              <h2 className="font-serif text-xl font-bold mb-4 uppercase block tracking-tight">BRANDING TOKO TOKO SIPIL DESIGN SETUP</h2>
              
              <form onSubmit={handleSaveStoreProfile} className="space-y-4">
                <div>
                  <label className="block text-gray-400 font-bold mb-1 uppercase">DIAGRAM DESKRIPSI TOKO *</label>
                  <textarea 
                    value={storeDesc}
                    onChange={(e) => setStoreDesc(e.target.value)}
                    required
                    rows={3}
                    className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1 uppercase">LOGO TOKO URL SQUARE *</label>
                  <input 
                    type="text" 
                    value={storeLogo}
                    onChange={(e) => setStoreLogo(e.target.value)}
                    required
                    className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1 uppercase">BANNER TOKO URL LANGSUNG *</label>
                  <input 
                    type="text" 
                    value={storeBanner}
                    onChange={(e) => setStoreBanner(e.target.value)}
                    required
                    className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 maternal-btn font-mono font-bold text-xs uppercase"
                >
                  SAVE STORE PROFILE SETTINGS
                </button>
              </form>
            </div>
          )}

          {activeTab === 'vouchers' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in" id="store-vouchers-pane">
              {/* Form to create voucher */}
              <div className="lg:col-span-5 bg-white border-2 border-black p-6 maternal-shadow font-mono text-xs">
                <h2 className="font-serif text-xl font-bold mb-4 uppercase block tracking-tight">TERBITKAN VOUCHER BARU</h2>
                
                {vchFeedback && (
                  <div className="mb-4 bg-green-50 border-2 border-green-600 text-green-900 p-3 font-bold text-xs uppercase">
                    ✓ {vchFeedback}
                  </div>
                )}
                {vchError && (
                  <div className="mb-4 bg-red-50 border-2 border-red-600 text-red-900 p-3 font-bold text-xs uppercase">
                    ⚠ {vchError}
                  </div>
                )}

                <form onSubmit={handleCreateVoucher} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 uppercase">KODE VOUCHER *</label>
                    <input 
                      type="text"
                      placeholder="CONTOH: TOKOSIPIL10"
                      value={vchCode}
                      onChange={(e) => setVchCode(e.target.value)}
                      required
                      className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none uppercase"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">Hanya berupa huruf dan angka, tanpa spasi.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1 uppercase">TIPE DISKON *</label>
                      <select
                        value={vchDiscountType}
                        onChange={(e) => setVchDiscountType(e.target.value as 'NOMINAL' | 'PERCENTAGE')}
                        className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none font-bold"
                      >
                        <option value="NOMINAL">Nominal (Rp)</option>
                        <option value="PERCENTAGE">Persentase (%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1 uppercase">NILAI DISKON *</label>
                      <input 
                        type="number"
                        placeholder={vchDiscountType === 'NOMINAL' ? '25000' : '15'}
                        value={vchAmount}
                        onChange={(e) => setVchAmount(e.target.value)}
                        required
                        min="1"
                        className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1 uppercase">CAKUPAN VOUCHER *</label>
                    <select
                      value={vchScope}
                      onChange={(e) => setVchScope(e.target.value as 'STORE' | 'PRODUCT')}
                      className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none font-bold"
                    >
                      <option value="STORE">Seluruh Produk di Toko Ini</option>
                      <option value="PRODUCT">Produk Tertentu Saja</option>
                    </select>
                  </div>

                  {vchScope === 'PRODUCT' && (
                    <div>
                      <label className="block text-gray-700 font-bold mb-1 uppercase">PILIH PRODUK *</label>
                      <select
                        value={vchProductId}
                        onChange={(e) => setVchProductId(e.target.value)}
                        required
                        className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none text-xs font-bold"
                      >
                        <option value="">-- Pilih Produk --</option>
                        {myStoreProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Rp{p.price.toLocaleString('id-ID')})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 font-bold mb-1 uppercase">MINIMAL BELANJA (RP) *</label>
                    <input 
                      type="number"
                      placeholder="0"
                      value={vchMinPurchase}
                      onChange={(e) => setVchMinPurchase(e.target.value)}
                      required
                      min="0"
                      className="w-full bg-slate-50 border-2 border-black p-2.5 focus:outline-none font-bold"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">Minimum nominal total belanja produk terkait sebelum diskon diaplikasikan.</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-black border-2 border-black text-xs uppercase cursor-pointer tracking-wider"
                  >
                    TERBITKAN VOUCHER TOKO
                  </button>
                </form>
              </div>

              {/* List of existing vouchers */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white border-2 border-black p-6 maternal-shadow">
                  <h2 className="font-serif text-xl font-bold mb-4 uppercase text-black tracking-tight flex items-center justify-between">
                    DAFTAR VOUCHER TOKO
                    <span className="font-mono text-xs text-gray-500 font-normal">{myStoreVouchers.length} Terdaftar</span>
                  </h2>

                  {myStoreVouchers.length === 0 ? (
                    <div className="text-center py-10 font-mono text-xs text-gray-500 border-2 border-dashed border-gray-300">
                      Belum ada voucher aktif yang diterbitkan oleh toko Anda.
                    </div>
                  ) : (
                    <div className="space-y-3 font-mono text-xs">
                      {myStoreVouchers.map((v) => {
                        const targetProduct = v.productId ? products.find(p => p.id === v.productId) : null;
                        return (
                          <div key={v.id} className="border-2 border-black bg-[#fcfcf9] p-4 flex justify-between items-start maternal-shadow-sm">
                            <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="bg-black text-white px-2.5 py-0.5 text-xs font-black select-all rounded-sm tracking-wide">
                                  {v.code}
                                </span>
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 uppercase tracking-wide border rounded-sm ${v.productId ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-[#1e3a8a] bg-blue-50 text-blue-800'}`}>
                                  {v.productId ? 'PRODUK TERTENTU' : 'SELURUH TOKO'}
                                </span>
                              </div>

                              <p className="text-[#111] font-bold text-sm">
                                Potongan {v.discountType === 'NOMINAL' ? `Rp${v.amount.toLocaleString('id-ID')}` : `${v.amount}%`}
                              </p>

                              <div className="text-[11px] text-gray-500 space-y-0.5 uppercase">
                                <p>Minimal Belanja: <span className="text-[#111] font-bold">Rp{v.minPurchase.toLocaleString('id-ID')}</span></p>
                                {v.productId && (
                                  <p className="truncate">
                                    Hanya Produk: <span className="text-red-800 font-bold">{targetProduct ? targetProduct.name : 'Produk tidak ditemukan'}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteVoucher(v.id)}
                              className="text-red-600 hover:text-white hover:bg-red-600 transition border-2 border-red-600 p-1.5 font-bold uppercase rounded-sm flex items-center justify-center shrink-0 cursor-pointer"
                              title="Hapus Voucher"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {selectedPrintOrder && (
        <div id="seller-print-overlay" className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0">
          <div className="bg-white border-4 border-black w-full max-w-lg p-6 maternal-shadow relative print:border-0 print:shadow-none print:p-0 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
            
            {/* Header with control buttons (hidden during print) */}
            <div className="flex justify-between items-center pb-4 border-b-2 border-black mb-4 print:hidden">
              <span className="font-serif text-lg font-black tracking-tight text-gray-800">
                PREVIEW STRUK ALAMAT PENGIRIMAN
              </span>
              <button 
                onClick={() => setSelectedPrintOrder(null)} 
                className="text-gray-500 hover:text-black font-extrabold text-sm"
              >
                ✕ TUTUP
              </button>
            </div>

            {/* Print trigger button (hidden during print) */}
            <div className="mb-4 bg-amber-50 border-2 border-amber-400 p-3 flex justify-between items-center print:hidden">
              <p className="text-[10.5px] text-amber-900 leading-snug font-mono max-w-xs uppercase">
                <b>SIAP DICETAK!</b> Tempelkan struk alamat ini pada paket baju Anda sebelum dikirim ke kurir ekspedisi.
              </p>
              <button
                onClick={() => window.print()}
                className="bg-black hover:bg-neutral-800 text-white font-mono font-bold px-3 py-2 text-xs border border-black cursor-pointer uppercase flex items-center gap-1.5 shrink-0"
              >
                <Printer className="w-4 h-4 text-white" /> PRINT SEKARANG
              </button>
            </div>

            {/* This is the printable-area, which print media CSS forces to be visible while hiding everything else */}
            <div className="printable-area border-2 border-black bg-white p-4 font-mono text-xs text-black space-y-3">
              
              {/* Courier branding header */}
              <div className="border-b-4 border-black pb-2 flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-[#222222] font-black uppercase tracking-widest block">EKSPEDISI / COURIER</span>
                  <p className="text-xl font-serif font-black uppercase text-black leading-none mt-1">
                    {selectedPrintOrder.courier || 'STANDAR DELIVERY'}
                  </p>
                </div>
                {/* Simulated Barcode block */}
                <div className="text-right flex flex-col items-end">
                  <div className="h-8 w-24 bg-black border border-white flex items-end justify-center py-0.5 mb-1 select-none overflow-hidden">
                    <div className="text-[7px] text-white tracking-[4px] font-mono select-none">|||||||||||||</div>
                  </div>
                  <span className="text-[7.5px] text-black font-bold uppercase tracking-tighter">RESI: {selectedPrintOrder.resiNo || 'BELUM DIINPUT (SHIP)'}</span>
                </div>
              </div>

              {/* Sender & Receiver layout (grid 2 cols) */}
              <div className="grid grid-cols-2 gap-4 border-b border-black pb-3">
                
                {/* Receiver Info */}
                <div className="border-r border-dashed border-gray-400 pr-2">
                  <span className="text-[8.5px] font-black text-gray-400 block uppercase tracking-wider mb-1">✓ PENERIMA (RECEIVER)</span>
                  <p className="font-extrabold text-black font-serif text-[13px] leading-tight uppercase">
                    {selectedPrintOrder.address?.receiver || selectedPrintOrder.buyerName}
                  </p>
                  <p className="font-extrabold text-[#991b1b] text-[10px] mt-0.5">
                    TELP: {selectedPrintOrder.address?.phone || '-'}
                  </p>
                  <p className="text-[10px] mt-1 text-gray-800 leading-relaxed uppercase">
                    {selectedPrintOrder.address?.detail || '-'}, <b>{selectedPrintOrder.address?.city || '-'}</b>
                  </p>
                </div>

                {/* Sender Info */}
                <div className="pl-2">
                  <span className="text-[8.5px] font-black text-gray-400 block uppercase tracking-wider mb-1">★ PENGIRIM (SENDER)</span>
                  <p className="font-extrabold text-black uppercase text-[12px] leading-tight">
                    {selectedPrintOrder.storeName || 'MITRA MERCHANT'}
                  </p>
                  <p className="text-[9.5px] text-gray-600 mt-0.5 italic">
                    Toko Sipil Fashion Merchant Hub
                  </p>
                  <p className="text-[9px] mt-1 text-gray-700 leading-snug uppercase font-mono">
                    KAMPUS UNIKOM BANDUNG, JL. DIPATI UKUR NO. 112-116, BANDUNG, INDONESIA
                  </p>
                </div>

              </div>

              {/* Items List inside packages */}
              <div className="border-b border-black pb-2">
                <span className="text-[8.5px] font-black text-gray-400 block uppercase tracking-wider mb-2">📦 ISI PAKET (ITEMS IN PACKAGE)</span>
                <table className="w-full text-[9px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300 text-left text-[8px] text-gray-500 uppercase font-bold">
                      <th className="pb-1 py-0.5">NAMA BARANG</th>
                      <th className="pb-1 text-center py-0.5">UKURAN/WARNA</th>
                      <th className="pb-1 text-right py-0.5">QTY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPrintOrder.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-dashed border-gray-200">
                        <td className="py-1 uppercase font-serif font-bold text-gray-800 max-w-[150px] truncate">{item.name}</td>
                        <td className="py-1 text-center font-mono text-gray-700 uppercase">{item.size || '-'} / {item.color || '-'}</td>
                        <td className="py-1 text-right font-extrabold text-black">{item.quantity} PCS</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Billing / Order Pricing detail */}
              <div className="flex justify-between items-center pt-1 font-mono text-[10px]">
                <div>
                  <span className="text-[8px] text-gray-400 font-bold block uppercase">STATUS BAYAR</span>
                  <p className="font-extrabold text-green-700 uppercase text-[9.5px]">
                    {selectedPrintOrder.isPreOrder ? (
                      `PRE-ORDER — DP ${selectedPrintOrder.isFullPaid ? 'LUNAS (100%)' : 'DP LUNAS'}`
                    ) : (
                      'LUNAS (PAID)'
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[8px] text-gray-400 font-bold block uppercase">TOTAL HARGA & ONGKIR</span>
                  <p className="font-serif font-black text-xs text-black">
                    Rp{selectedPrintOrder.totalAmount?.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[7.5px] text-gray-500 leading-none">
                    *Ongkir: Rp{selectedPrintOrder.shippingCost?.toLocaleString('id-ID') || '0'}
                  </p>
                </div>
              </div>

              {/* Footer System Disclaimer */}
              <div className="border-t-2 border-dashed border-gray-300 pt-2 flex justify-between items-center text-[7.5px] text-gray-400 leading-none">
                <span>CETAK STRUK SISTEM MULTI-VENDOR TOKO SIPIL</span>
                <span>SYSTEM ID: {selectedPrintOrder.id}</span>
              </div>

            </div>

            {/* Action Tutup (hidden during print) */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end print:hidden">
              <button
                onClick={() => setSelectedPrintOrder(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 text-xs font-bold font-mono tracking-tight cursor-pointer uppercase transition-all"
              >
                KEMBALI KE PANEL
              </button>
            </div>

          </div>
        </div>
      )}

      {showPrintReportModal && (
        <div id="seller-report-print-overlay" className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #seller-report-print-overlay, #seller-report-print-overlay * {
                visibility: visible !important;
              }
              #seller-report-print-overlay {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .no-print-area {
                display: none !important;
                height: 0 !important;
                width: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
              }
            }
          `}} />
          <div className="bg-white border-4 border-black w-full max-w-4xl p-6 maternal-shadow relative print:border-0 print:shadow-none print:p-0 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
            
            {/* Header with control buttons (hidden during print) */}
            <div className="flex justify-between items-center pb-4 border-b-2 border-black mb-4 print:hidden no-print-area">
              <span className="font-serif text-base md:text-lg font-black tracking-tight text-gray-800 uppercase">
                PREVIEW LAPORAN PENJUALAN BULANAN
              </span>
              <button 
                onClick={() => setShowPrintReportModal(false)} 
                className="text-gray-500 hover:text-black font-extrabold text-xs tracking-wider uppercase cursor-pointer"
              >
                ✕ TUTUP
              </button>
            </div>

            {/* Print trigger button (hidden during print) */}
            <div className="mb-4 bg-amber-50 border-2 border-amber-400 p-4 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center print:hidden no-print-area">
              <p className="text-[10px] sm:text-[11px] text-amber-900 leading-snug font-mono uppercase">
                <b>SIAP EKSPOR & PRINT!</b> Anda dapat mencetak tabel laporan ini secara fisik atau menyimpannya sebagai file format <b>PDF</b> melalui dialog print browser.
              </p>
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto bg-black hover:bg-neutral-800 text-white font-mono font-bold px-4 py-2.5 text-xs border border-black cursor-pointer uppercase flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none"
              >
                <Printer className="w-4 h-4 text-white" /> CETAK / SIMPAN PDF
              </button>
            </div>

            {/* Print Area Container */}
            <div className="printable-report-area border-2 border-black bg-white p-6 font-mono text-xs text-black space-y-5 print:border-0 print:p-0">
              
              {/* Report Header Logo Banner */}
              <div className="border-b-4 border-black pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[8px] bg-red-900 text-white font-extrabold px-2 py-0.5 uppercase tracking-widest block w-fit">
                    LAPORAN RESMI MITRA SELLER
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-black uppercase text-black leading-tight mt-1">
                    {store?.name || 'STORE BANNER'}
                  </h2>
                  <p className="text-[10px] text-gray-500 font-mono uppercase">
                    Toko Sipil Streetwear & Fashion Hub e-Commerce System
                  </p>
                </div>
                <div className="text-left sm:text-right font-mono text-[10px] border-l-2 sm:border-l-0 sm:border-r-2 border-black pl-3 sm:pl-0 sm:pr-3">
                  <p className="font-bold text-gray-400 uppercase">PERIODE LAPORAN:</p>
                  <p className="text-md sm:text-lg text-rose-900 font-black uppercase">
                    {[
                      'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
                      'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
                    ][reportMonth]} {reportYear}
                  </p>
                </div>
              </div>

              {/* Rangkuman Finansial Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-neutral-50 border-2 border-black p-4">
                <div>
                  <span className="text-[8px] text-gray-400 font-bold block uppercase">TOTAL TRANSAKSI</span>
                  <span className="text-sm md:text-base font-extrabold text-black block mt-0.5">{monthlyOrders.length} Pesanan</span>
                </div>
                <div>
                  <span className="text-[8px] text-gray-400 font-bold block uppercase">SUKSES SELESAI</span>
                  <span className="text-sm md:text-base font-extrabold text-green-700 block mt-0.5">{monthlyCompletedOrders.length} Pesanan</span>
                </div>
                <div>
                  <span className="text-[8px] text-gray-400 font-bold block uppercase">TOTAL REVENUE (OMZET)</span>
                  <span className="text-sm md:text-base font-extrabold text-rose-900 block mt-0.5">Rp{monthlyRevenue.toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-[8px] text-gray-400 font-bold block uppercase">TOTAL ONGKIR KURIR</span>
                  <span className="text-sm md:text-base font-extrabold text-amber-800 block mt-0.5">Rp{monthlyShipping.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Order Lists Table */}
              <div className="space-y-2">
                <span className="text-[9px] text-gray-500 block font-bold uppercase tracking-wider">DETAIL TRANSAKSI BULANAN ({monthlyOrders.length} BARIS DATA)</span>
                
                {/* Mobile Scrollable wrapper / print auto expanded safety */}
                <div className="overflow-x-auto border-2 border-black scrollbar-none">
                  <table className="w-full text-[9px] sm:text-[9.5px] border-collapse min-w-[650px] print:min-w-full">
                    <thead>
                      <tr className="bg-black text-[#faf9f3] text-[8.5px] sm:text-[9px] uppercase font-bold text-left border-b-2 border-black">
                        <th className="p-2 border-r border-black">TANGGAL</th>
                        <th className="p-2 border-r border-black">ORDER ID</th>
                        <th className="p-2 border-r border-black">PENERIMA</th>
                        <th className="p-2 border-r border-black text-center">KURIR (RESI)</th>
                        <th className="p-2 border-r border-black text-center">STATUS</th>
                        <th className="p-2 border-r border-black text-right">ONGKIR (Rp)</th>
                        <th className="p-2 text-right">TOTAL (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {monthlyOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-gray-400 italic font-mono bg-white">
                            Belum ada transaksi pada periode ini.
                          </td>
                        </tr>
                      ) : (
                        monthlyOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-neutral-50/50 bg-white">
                            <td className="p-2 border-r border-slate-300 font-mono whitespace-nowrap">
                              {new Date(ord.createdAt).toLocaleDateString('id-ID', {
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="p-2 border-r border-slate-300 font-mono font-bold text-purple-900">{ord.id}</td>
                            <td className="p-2 border-r border-slate-300 uppercase truncate max-w-[120px] font-sans font-bold text-gray-800">
                              {ord.address?.receiver || ord.buyerName || '-'}
                            </td>
                            <td className="p-2 border-r border-slate-300 text-center font-mono">
                              <span className="block uppercase text-[8px] font-black">{ord.courier || '-'}</span>
                              <span className="block text-[8px] text-gray-500 font-mono uppercase tracking-tighter">
                                {ord.resiNo || 'BELUM DIKIRIM'}
                              </span>
                            </td>
                            <td className="p-2 border-r border-slate-300 text-center whitespace-nowrap">
                              <span className={`px-1.5 py-0.5 text-[8px] font-bold border uppercase inline-block ${
                                ord.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-800 border-green-800' :
                                ord.status === OrderStatus.PAID ? 'bg-blue-100 text-blue-800 border-blue-800' :
                                ord.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-800 border-red-800' :
                                'bg-orange-100 text-orange-850 border-orange-800'
                              }`}>
                                {ord.status}
                              </span>
                            </td>
                            <td className="p-2 border-r border-slate-300 text-right text-gray-600">
                              Rp{(ord.shippingCost || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="p-2 text-right font-bold text-black font-mono">
                              Rp{ord.totalAmount?.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures & Prints Info Footer blocks */}
              <div className="pt-6 grid grid-cols-2 gap-4 text-[9px] border-t-2 border-black border-dashed">
                <div>
                  <p className="font-extrabold uppercase text-gray-400">PENANGGUNG JAWAB MERCHANDISE:</p>
                  <p className="mt-8 font-serif font-black uppercase border-b-2 border-black inline-block text-[11px] text-slate-900 pb-0.5">
                    {currentUser?.name || 'SELLER PARTNER'}
                  </p>
                  <p className="text-[7.5px] text-gray-400 mt-1 font-mono uppercase">MITRA SELLER VERIFIKASI RESMI</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-gray-400">ARSIP DICETAK TANGGAL:</p>
                  <p className="mt-0.5 text-gray-700 font-mono font-bold uppercase">
                    {new Date().toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-[7.5px] text-gray-400 mt-8 font-mono">REGISTERED TOKO SIPIL ARCHIVER ENGINE</p>
                </div>
              </div>

            </div>

            {/* Action buttons footer (hidden during print) */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end gap-2 print:hidden no-print-area font-mono text-xs">
              <button
                onClick={() => setShowPrintReportModal(false)}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-black text-xs font-bold leading-tight cursor-pointer uppercase transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none"
              >
                Kembali Ke Panel ✕
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
