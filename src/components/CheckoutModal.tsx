/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, CreditCard, Landmark, Truck, RefreshCw, CheckCircle, Info, Landmark as BankIcon, ArrowRight } from 'lucide-react';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccessPay: () => void;
  initialOrder?: any;
}

export default function CheckoutModal({ onClose, onSuccessPay, initialOrder }: CheckoutModalProps) {
  const { currentUser, cart, appliedVoucher, clearCart, refreshAllData } = useApp();
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );

  const [receiver, setReceiver] = useState(currentUser?.addressReceiver || currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.addressPhone || currentUser?.phone || '08123456789');
  const [province, setProvince] = useState(currentUser?.addressProvince || 'Jawa Barat');
  const [city, setCity] = useState(currentUser?.addressCity || 'Bandung');
  const [district, setDistrict] = useState(currentUser?.addressDistrict || '');
  const [subdistrict, setSubdistrict] = useState(currentUser?.addressSubdistrict || '');
  const [rtrw, setRtrw] = useState(currentUser?.addressRTRW || '');
  const [addressDetail, setAddressDetail] = useState(currentUser?.addressDetail || 'Jalan Ganesha No. 10');
  const [courier, setCourier] = useState('J&T Express (Regular)');
  const [paymentMethod, setPaymentMethod] = useState('BCA Virtual Account');

  // Calculated variables state
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [totals, setTotals] = useState({
    totalProductPrice: 0,
    shippingCost: 0,
    platformFee: 2000,
    discount: 0,
    paymentAdminFee: 0,
    totalAmount: 0,
    totalWeight: 0
  });

  // Midtrans flow step
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'snap' | 'pelunasan_method_select'>('form');
  const [preOrderPaymentOption, setPreOrderPaymentOption] = useState<'dp' | 'lunas'>('dp');
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [simulatedPaying, setSimulatedPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Dynamic Midtrans config exposure
  const [midtransConfig, setMidtransConfig] = useState<{ active: boolean; clientKey: string; isProduction: boolean } | null>(null);

  // Cancellation States
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReasonText, setCancelReasonText] = useState('Tidak jadi membeli / ingin mengubah detail pesanan');
  const [loadingPelunasan, setLoadingPelunasan] = useState(false);

  // Auto transition to billing screen when initialOrder is provided
  useEffect(() => {
    if (initialOrder) {
      if (initialOrder.status === 'DP_PAID') {
        setCreatedOrder(initialOrder);
        setPaymentMethod(initialOrder.paymentMethod || 'BCA Virtual Account');
        setCheckoutStep('pelunasan_method_select');
      } else {
        setCreatedOrder(initialOrder);
        setCheckoutStep('snap');
      }
    }
  }, [initialOrder]);

  // 1. Fetch config and inject official snap.js script if active
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/midtrans-config');
        if (res.ok) {
          const data = await res.json();
          setMidtransConfig(data);
          
          if (data.active && data.clientKey) {
            const snapScriptUrl = data.isProduction 
              ? 'https://app.midtrans.com/snap/snap.js' 
              : 'https://app.sandbox.midtrans.com/snap/snap.js';
              
            const existingScript = document.getElementById('midtrans-snap-script') as HTMLScriptElement;
            if (existingScript) {
              if (existingScript.src !== snapScriptUrl) {
                existingScript.remove();
                const script = document.createElement('script');
                script.src = snapScriptUrl;
                script.id = 'midtrans-snap-script';
                script.setAttribute('data-client-key', data.clientKey);
                document.body.appendChild(script);
              }
            } else {
              const script = document.createElement('script');
              script.src = snapScriptUrl;
              script.id = 'midtrans-snap-script';
              script.setAttribute('data-client-key', data.clientKey);
              document.body.appendChild(script);
            }
          }
        }
      } catch (e) {
        console.error('[Midtrans Script Loader] Failed to load config:', e);
      }
    };
    fetchConfig();
  }, []);

  // 2. Automatically launch Snap Popup once order is initialized & snap token is acquired
  useEffect(() => {
    if (checkoutStep === 'snap' && createdOrder?.usedRealMidtrans && createdOrder?.snapToken) {
      triggerMidtransSnap();
    }
  }, [checkoutStep, createdOrder]);

  const triggerMidtransSnap = () => {
    const snapToken = createdOrder?.snapToken;
    if (!snapToken) return;

    const win = window as any;
    if (win.snap) {
      win.snap.pay(snapToken, {
        onSuccess: async function(result: any) {
          console.log('[Midtrans Snap] Payment success result:', result);
          await markOrderAsPaidSuccess();
        },
        onPending: async function(result: any) {
          console.log('[Midtrans Snap] Payment pending result:', result);
          // Standard bank transfer or QRIS may take time, we can mark local state
          alert('Pembayaran pending/diproses. Silakan selesaikan tagihan Anda sesuai instruksi Midtrans.');
        },
        onError: function(result: any) {
          console.error('[Midtrans Snap] Payment error result:', result);
          alert('Pembayaran Midtrans gagal atau terjadi kesalahan.');
        },
        onClose: function() {
          console.log('[Midtrans Snap] Customer closed the Snap popup window');
        }
      });
    } else {
      console.error('[Midtrans Snap] SDK is not loaded. Instantiating retry...');
      // Direct redirect backup if popup library blocked or failing
      if (createdOrder?.snapRedirectUrl) {
        const confirmRedirect = window.confirm('Dukungan pop-up Snap diblokir atau belum terinisiasi. Apakah Anda ingin dialihkan ke halaman pemrosesan Midtrans langsung?');
        if (confirmRedirect) {
          window.open(createdOrder.snapRedirectUrl, '_blank');
        }
      } else {
        alert('Gagal mendeteksi script Midtrans Snap SDK. Silakan periksa koneksi Anda.');
      }
    }
  };

  const markOrderAsPaidSuccess = async () => {
    if (!createdOrder) return;
    setSimulatedPaying(true);
    try {
      const res = await fetch(`/api/orders/${createdOrder.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setPaymentSuccess(true);
        clearCart();
        await refreshAllData();
      }
    } catch (e) {
      console.error('[Midtrans UI] Sync status update failed:', e);
    } finally {
      setSimulatedPaying(false);
    }
  };

  // Auto recalculate pricing parameters when options change
  const calculateCosts = async () => {
    if (cart.length === 0) return;
    setLoadingCalc(true);
    try {
      const payload = {
        items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })),
        city,
        courier,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
        paymentMethod
      };

      const res = await fetch('/api/checkout/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setTotals(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCalc(false);
    }
  };

  useEffect(() => {
    calculateCosts();
  }, [city, courier, cart, paymentMethod]);

  const handleInitiatePelunasan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!createdOrder) return;
    setLoadingPelunasan(true);
    try {
      const res = await fetch(`/api/orders/${createdOrder.id}/pelunasan-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod })
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setCreatedOrder(updatedOrder);
        setCheckoutStep('snap');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Gagal menyiapkan tagihan pelunasan DP di Midtrans.');
        onClose();
      }
    } catch (e: any) {
      console.error(e);
      alert('Terjadi kesalahan koneksi saat menyiapkan tagihan pelunasan.');
      onClose();
    } finally {
      setLoadingPelunasan(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiver || !phone || !addressDetail || !city || !province || !district || !subdistrict || !rtrw) {
      alert("Mohon lengkapi seluruh kolom alamat pengiriman.");
      return;
    }
    
    try {
      const isPreOrderOrder = cart.some(item => item.product.isPreOrder);
      const preOrderItem = cart.find(item => item.product.isPreOrder);
      const preOrderDpPercent = preOrderItem ? (preOrderItem.product.preOrderDpPercent || 50) : 50;
      
      const dpProductAmount = isPreOrderOrder 
        ? Math.round((totals.totalProductPrice - totals.discount) * (preOrderDpPercent / 100))
        : 0;
      const upfrontAmount = isPreOrderOrder 
        ? (dpProductAmount + totals.shippingCost + totals.platformFee + (totals.paymentAdminFee || 0))
        : totals.totalAmount;
      const remainingAmount = isPreOrderOrder 
        ? Math.max(0, totals.totalAmount - upfrontAmount)
        : 0;
 
      const orderPayload = {
        buyerId: currentUser?.id,
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          discountPrice: item.product.price * (1 - item.product.discount / 100),
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          image: item.product.images[0]
        })),
        address: { receiver, phone, detail: addressDetail, city, province, district, subdistrict, rtrw },
        courier,
        shippingCost: totals.shippingCost,
        discount: totals.discount,
        platformFee: totals.platformFee,
        totalProductPrice: totals.totalProductPrice,
        totalAmount: totals.totalAmount,
        paymentMethod,
        isPreOrder: isPreOrderOrder,
        preOrderDpPercent: isPreOrderOrder ? preOrderDpPercent : undefined,
        dpAmount: isPreOrderOrder ? (preOrderPaymentOption === 'lunas' ? totals.totalAmount : upfrontAmount) : undefined,
        remainingAmount: isPreOrderOrder ? (preOrderPaymentOption === 'lunas' ? 0 : remainingAmount) : undefined,
        isFullPaid: isPreOrderOrder ? (preOrderPaymentOption === 'lunas') : true
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedOrder(data.order);
        setCheckoutStep('snap');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Simulates Midtrans Instant Settlement webhook notifications
  const handleSimulatePayment = async () => {
    if (!createdOrder) return;
    setSimulatedPaying(true);
    try {
      const res = await fetch(`/api/orders/${createdOrder.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setPaymentSuccess(true);
        clearCart();
        await refreshAllData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulatedPaying(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!createdOrder) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${createdOrder.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: cancelReasonText || 'Tidak jadi membeli.' })
      });
      if (res.ok) {
        alert('Pesanan sukses dibatalkan / tidak jadi dibayar!');
        await refreshAllData();
        onClose();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Gagal membatalkan pesanan.');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan koneksi jaringan.');
    } finally {
      setCancelling(false);
    }
  };

  const isPreOrderOrder = cart.some(item => item.product.isPreOrder);
  const preOrderItem = cart.find(item => item.product.isPreOrder);
  const preOrderDpPercent = preOrderItem ? (preOrderItem.product.preOrderDpPercent || 50) : 50;
  
  const dpProductAmount = isPreOrderOrder 
    ? Math.round((totals.totalProductPrice - totals.discount) * (preOrderDpPercent / 100))
    : 0;

  const activeUpfrontAmount = isPreOrderOrder
    ? (preOrderPaymentOption === 'lunas' ? totals.totalAmount : (dpProductAmount + totals.shippingCost + totals.platformFee))
    : totals.totalAmount;
    
  const activeRemainingAmount = isPreOrderOrder
    ? (preOrderPaymentOption === 'lunas' ? 0 : Math.max(0, totals.totalAmount - (dpProductAmount + totals.shippingCost + totals.platformFee)))
    : 0;

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-start md:items-center justify-center p-2 sm:p-4 overflow-y-auto py-6 sm:py-8" id="checkout-overlay">
      <div className="bg-[#f4f2e9] border bg-brand-cream border-2 border-black max-w-4xl w-full h-auto md:max-h-[90vh] overflow-y-auto maternal-shadow-lg relative p-6 md:p-8 flex flex-col md:flex-row gap-6 my-auto" id="checkout-modal-card">
        
        {/* Close trigger top right */}
        {(checkoutStep === 'form' || checkoutStep === 'pelunasan_method_select') && (
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 z-40 p-1 bg-black text-white hover:bg-red-800 transition border-2 border-black cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {loadingPelunasan ? (
          <div className="w-full py-20 text-center flex flex-col items-center justify-center font-mono text-xs gap-3 mx-auto max-w-md" id="pelunasan-loading">
            <RefreshCw className="w-10 h-10 text-red-700 animate-spin" />
            <p className="font-extrabold uppercase tracking-widest text-[#111111] mt-2">Menyiapkan Pelunasan Midtrans...</p>
            <p className="text-[10px] text-gray-400 leading-normal max-w-xs">
              Kami sedang menyiapkan tagihan sisa pembayaran sisa DP Anda secara aman ke Midtrans. Mohon tunggu sejenak.
            </p>
          </div>
        ) : checkoutStep === 'pelunasan_method_select' ? (
          /* Specialized Pelunasan Payment Option Screen */
          <div className="w-full max-w-xl mx-auto py-4 font-mono text-xs" id="pelunasan-options-form-wrapper">
            <h2 className="font-serif text-2xl font-bold uppercase tracking-tight mb-4 inline-block border-b-4 border-amber-500 pb-1">
              PELUNASAN SISA TAGIHAN
            </h2>
            
            <form onSubmit={handleInitiatePelunasan} className="space-y-5" id="pelunasan-method-form">
              <div className="bg-amber-50 border-2 border-amber-400 p-4 font-mono text-xs space-y-2 text-amber-950">
                <p className="font-extrabold text-amber-800 uppercase flex items-center gap-1.5 text-[10px]">
                  <Info className="w-4 h-4" /> KETERANGAN DETAIL PESANAN PRE-ORDER
                </p>
                <div className="pt-2 border-t border-amber-300 space-y-1 text-left">
                  <p><b>KODE PESANAN:</b> <span className="select-all font-bold">{createdOrder?.id}</span></p>
                  <p><b>TOKO PENYEDIA:</b> <span className="font-bold">{createdOrder?.storeName}</span></p>
                  <p><b>NAMA PENERIMA:</b> <span className="font-bold">{createdOrder?.address?.receiver}</span></p>
                  <p><b>TOTAL TRANSAKSI:</b> Rp{createdOrder?.totalAmount?.toLocaleString('id-ID')}</p>
                  <p><b>DP TELAH DIBAYAR:</b> Rp{createdOrder?.dpAmount?.toLocaleString('id-ID')}</p>
                </div>
                <div className="pt-2 border-t-2 border-amber-400 font-extrabold flex justify-between text-base text-red-800 bg-amber-100 p-2 mt-1">
                  <span>SISA LEKAS LUNAS:</span>
                  <span>Rp{createdOrder?.remainingAmount?.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="text-left">
                <label className="block font-extrabold text-gray-700 mb-1.5 uppercase flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-amber-800" /> PILIH METODE BAYAR PELUNASAN *
                </label>
                <select 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-white border-2 border-black px-3 py-2.5 rounded-none focus:outline-none focus:ring-0 cursor-pointer text-xs font-bold"
                >
                  <option value="BCA Virtual Account">BCA (Virtual Account)</option>
                  <option value="Mandiri Bill Payment">Mandiri Bill Payment</option>
                  <option value="BNI Virtual Account">BNI (Virtual Account)</option>
                  <option value="BRI Virtual Account">BRI (Virtual Account)</option>
                  <option value="QRIS Pindai">QRIS (Tampilkan QR Code untuk Scan / Screenshot)</option>
                  <option value="Aplikasi GoPay ShopeePay">Aplikasi GoPay / ShopeePay (Buka Aplikasi Otomatis)</option>
                </select>
                {createdOrder && createdOrder.remainingAmount < 10000 && (paymentMethod.includes('Virtual Account') || paymentMethod.includes('Mandiri')) && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-300 p-2 mt-1.5 font-mono font-bold uppercase leading-snug">
                    ⚠️ TOTAL SISA DI BAWAH Rp10.000: Virtual Account tidak didukung oleh Midtrans. Sistem otomatis dialihkan ke QRIS/GoPay di panel pembayaran.
                  </p>
                )}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/3 py-3 bg-white text-black font-bold uppercase hover:bg-gray-100 border-2 border-black cursor-pointer text-center"
                >
                  BATAL / KEMBALI
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-2/3 py-3 bg-red-800 text-white font-black uppercase hover:bg-black transition border-2 border-black cursor-pointer text-center shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5"
                >
                  <span>BAYAR PELUNASAN SEKARANG</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : checkoutStep === 'form' ? (
          /* Checkout Inputs step */
          <>
            {/* Input fields */}
            <div className="w-full md:w-3/5" id="checkout-form-column">
              <h2 className="font-serif text-2xl font-bold uppercase tracking-tight mb-4">DELIVERY BILLING DETAILS</h2>
              
              <form onSubmit={handlePlaceOrder} className="space-y-4 font-mono text-xs" id="billing-form">
                
                {/* Name */}
                <div>
                  <label className="block font-bold text-gray-500 mb-1">NAMA PENERIMA / RECEIVER *</label>
                  <input 
                    type="text" 
                    value={receiver} 
                    onChange={(e) => setReceiver(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-black px-3 py-2 rounded-none placeholder-gray-400 focus:outline-none"
                    placeholder="Contoh: Iyasya Ahmad"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-bold text-gray-500 mb-1">TELEPON / PHONE *</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-black px-3 py-2 rounded-none focus:outline-none"
                  />
                </div>

                {/* Provinsi & Kota */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-500 mb-1">PROVINSI *</label>
                    <input 
                      type="text" 
                      value={province} 
                      onChange={(e) => setProvince(e.target.value)}
                      required
                      className="w-full bg-white border-2 border-black px-3 py-2 rounded-none focus:outline-none"
                      placeholder="Contoh: Jawa Barat"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-500 mb-1">KOTA / KABUPATEN *</label>
                    <select 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border-2 border-black px-3 py-2 rounded-none focus:outline-none cursor-pointer"
                    >
                      <option value="Kampus Unikom">Kampus UNIKOM Bandung (Gratis Ongkir)</option>
                      <option value="Bandung">Bandung</option>
                      <option value="Jakarta">Jakarta</option>
                      <option value="Surabaya">Surabaya</option>
                      <option value="Medan">Medan</option>
                      <option value="Makassar">Makassar</option>
                    </select>
                  </div>
                </div>

                {/* Kecamatan & Kelurahan */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-500 mb-1">KECAMATAN *</label>
                    <input 
                      type="text" 
                      value={district} 
                      onChange={(e) => setDistrict(e.target.value)}
                      required
                      className="w-full bg-white border-2 border-black px-3 py-2 rounded-none focus:outline-none"
                      placeholder="Contoh: Coblong"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-500 mb-1">KELURAHAN / DESA *</label>
                    <input 
                      type="text" 
                      value={subdistrict} 
                      onChange={(e) => setSubdistrict(e.target.value)}
                      required
                      className="w-full bg-white border-2 border-black px-3 py-2 rounded-none focus:outline-none"
                      placeholder="Contoh: Dago"
                    />
                  </div>
                </div>

                {/* RT / RW */}
                <div>
                  <label className="block font-bold text-gray-500 mb-1">RT / RW *</label>
                  <input 
                    type="text" 
                    value={rtrw} 
                    onChange={(e) => setRtrw(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-black px-3 py-2 rounded-none focus:outline-none"
                    placeholder="Contoh: RT 03 / RW 05"
                  />
                </div>

                {/* Address Detail */}
                <div>
                  <label className="block font-bold text-gray-500 mb-1">DETAIL ALAMAT LENGKAP & NO RUMAH *</label>
                  <textarea 
                    value={addressDetail} 
                    onChange={(e) => setAddressDetail(e.target.value)}
                    required
                    rows={2}
                    className="w-full bg-white border-2 border-black px-3 py-2 rounded-none focus:outline-none"
                    placeholder="Masukan nama jalan, nomor rumah, gedung atau nomor kamar kost..."
                  />
                </div>

                {/* Courier selection RajaOngkir integration rates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-500 mb-1 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> KURIR EKSPEDISI *
                    </label>
                    <select 
                      value={courier} 
                      onChange={(e) => setCourier(e.target.value)}
                      className="w-full bg-white border-2 border-black px-2 py-2 rounded-none focus:outline-none focus:ring-0 cursor-pointer text-xs"
                    >
                      <option value="J&T Express (Regular)">J&T Regular (Regular)</option>
                      <option value="Sicepat (Regular)">SiCepat Regular (Regular)</option>
                      <option value="JNE YES">JNE ONS (YES Direct)</option>
                      <option value="AnterAja NextDay">AnterAja (NextDay)</option>
                      <option value="POS Indonesia kilat">POS Indonesia (Kilat Khusus)</option>
                      <option value="None/Kampus">None/Kampus (Gratis Ongkir)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-500 mb-1 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" /> METODE BAYAR *
                    </label>
                    <select 
                      value={paymentMethod} 
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-white border-2 border-black px-2 py-2 rounded-none focus:outline-none focus:ring-0 cursor-pointer text-xs"
                    >
                      <option value="BCA Virtual Account">BCA (Virtual Account)</option>
                      <option value="Mandiri Bill Payment">Mandiri Bill Payment</option>
                      <option value="BNI Virtual Account">BNI (Virtual Account)</option>
                      <option value="BRI Virtual Account">BRI (Virtual Account)</option>
                      <option value="QRIS Pindai">QRIS (Tampilkan QR Code untuk Scan / Screenshot)</option>
                      <option value="Aplikasi GoPay ShopeePay">Aplikasi GoPay / ShopeePay (Buka Aplikasi Otomatis)</option>
                    </select>
                    {totals.totalAmount < 10000 && (paymentMethod.includes('Virtual Account') || paymentMethod.includes('Mandiri')) && (
                      <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-300 p-1.5 mt-1 font-mono font-bold uppercase leading-snug">
                        ⚠️ TOTAL DI BAWAH Rp10.000: Virtual Account tidak didukung oleh Midtrans. Sistem otomatis dialihkan ke QRIS/GoPay di panel pembayaran.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3.5 maternal-btn font-bold text-xs"
                  >
                    PLACE ORDER & LAUNCH MIDTRANS
                  </button>
                </div>
              </form>
            </div>

            {/* Price Details Column */}
            <div className="w-full md:w-2/5 md:border-l border-gray-300 md:pl-6 flex flex-col justify-between" id="checkout-totals-column">
              <div>
                <h3 className="font-serif text-lg font-bold uppercase tracking-tight mb-4">ORDER INVOICE DETAILS</h3>
                
                {/* List items in checkout */}
                <div className="space-y-3 mb-6 max-h-52 overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const price = item.product.price * (1 - item.product.discount / 100);
                    return (
                      <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-2.5 items-center font-mono text-xs">
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name} 
                          className="w-10 h-10 border border-black object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-grow">
                          <p className="font-bold line-clamp-1 truncate text-gray-800 uppercase text-[11px]">{item.product.name}</p>
                          <span className="text-[10px] text-gray-400">Qty: {item.quantity} | {item.selectedSize}</span>
                        </div>
                        <span className="font-bold">Rp{(price * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotals elements */}
                <div className="border-t-2 border-black pt-4 space-y-2 font-mono text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>SEEDED SUB-TOTAL:</span>
                    <span className="text-black font-bold">Rp{totals.totalProductPrice.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600">
                    <span className="flex items-center gap-1">ONGKIR SIMULASI:</span>
                    {loadingCalc ? (
                      <RefreshCw className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                    ) : (
                      <div className="text-right">
                        {city === 'Kampus Unikom' && (
                          <span className="inline-block bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 border border-green-300 mr-2 uppercase">
                            UNIKOM FREE
                          </span>
                        )}
                        <span className="text-black font-semibold">Rp{totals.shippingCost.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>

                  {totals.discount > 0 && (
                    <div className="flex justify-between text-green-700 bg-green-50 p-1 border border-green-100">
                      <span>VOUCHER DISKON:</span>
                      <span>-Rp{totals.discount.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-2">
                    <span>CORE PLATFORM FEE:</span>
                    <span>Rp{totals.platformFee.toLocaleString('id-ID')}</span>
                  </div>

                  {totals.paymentAdminFee > 0 && (
                    <div className="flex justify-between text-red-700 bg-red-50 p-1.5 border border-red-200 font-mono text-[10.5px] font-bold">
                      <span>BIAYA PENANGANAN SISTEM:</span>
                      <span>Rp{totals.paymentAdminFee.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                   {/* Calculations Total amount */}
                  <div className="pt-2 flex justify-between font-bold text-black text-sm">
                    <span>ESTIMASI TOTAL:</span>
                    <span className="text-black">Rp{totals.totalAmount.toLocaleString('id-ID')}</span>
                  </div>

                  {isPreOrderOrder && (
                    <div className="bg-amber-50 border-2 border-amber-400 p-3 flex flex-col gap-2 text-xs text-amber-950 font-mono mt-2" id="preorder-payment-selector">
                      <p className="font-extrabold text-amber-800 flex items-center gap-1 uppercase text-[10px]">
                        <Info className="w-3.5 h-3.5" /> PRODUK PRE-ORDER (DP {preOrderDpPercent}%)
                      </p>
                      
                      <p className="text-[10px] text-amber-900 font-bold uppercase mt-1">Pilih Opsi Pembayaran:</p>
                      
                      <div className="grid grid-cols-2 gap-2 mt-1" id="payment-options-grid">
                        {/* Option A: Bayar DP */}
                        <button
                          type="button"
                          onClick={() => setPreOrderPaymentOption('dp')}
                          className={`p-2 border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                            preOrderPaymentOption === 'dp'
                              ? 'bg-amber-900 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold'
                              : 'bg-white text-black border-black/30 hover:border-black/60'
                          }`}
                          id="select-pay-dp"
                        >
                          <span className="font-extrabold text-[9px] tracking-tight">1. BAYAR DP ({preOrderDpPercent}%)</span>
                          <span className={`text-[11px] font-bold font-mono mt-0.5 ${preOrderPaymentOption === 'dp' ? 'text-amber-200' : 'text-red-700'}`}>
                            Rp{(dpProductAmount + totals.shippingCost + totals.platformFee).toLocaleString('id-ID')}
                          </span>
                        </button>

                        {/* Option B: Bayar Lunas */}
                        <button
                          type="button"
                          onClick={() => setPreOrderPaymentOption('lunas')}
                          className={`p-2 border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                            preOrderPaymentOption === 'lunas'
                              ? 'bg-amber-900 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold'
                              : 'bg-white text-black border-black/30 hover:border-black/60'
                          }`}
                          id="select-pay-lunas"
                        >
                          <span className="font-extrabold text-[9px] tracking-tight">2. BAYAR LUNAS (100%)</span>
                          <span className={`text-[11px] font-bold font-mono mt-0.5 ${preOrderPaymentOption === 'lunas' ? 'text-amber-200' : 'text-red-700'}`}>
                            Rp{totals.totalAmount.toLocaleString('id-ID')}
                          </span>
                        </button>
                      </div>

                      {/* Informative description text */}
                      <div className="border-t border-amber-300 mt-1 pt-1.5 text-[9px] uppercase font-bold text-amber-800 leading-normal">
                        {preOrderPaymentOption === 'dp' ? (
                          <p>Membayar DP sekarang. Sisa pelunasan (Rp{activeRemainingAmount.toLocaleString('id-ID')}) jatuh tempo nanti.</p>
                        ) : (
                          <p className="text-emerald-800">Membayar lunas penuh sekarang. Tanpa pelunasan sisa tagihan.</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-between font-bold text-black text-sm border-t border-gray-200" id="estimasi-bayar-wrapper">
                    <span>ESTIMASI BAYAR SEKARANG:</span>
                    <span className="text-red-700">Rp{activeUpfrontAmount.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="bg-gray-100 border border-gray-300 p-2 text-[10px] text-gray-500 mt-2 rounded flex items-start gap-1">
                    <Info className="w-3.5 h-3.5 text-black flex-shrink-0 mt-0.5" />
                    <p>Estimasi berat paket: {(totals.totalWeight / 1000).toFixed(1)} Kg. Kurir ongkir dihitung otomatis dari Kota Bandung.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* SNAP payment checkout overlay step */
          <div className="w-full text-center py-6 flex flex-col items-center justify-center font-mono max-w-xl mx-auto" id="midtrans-gateway-simulation">
            {paymentSuccess ? (
              /* Success payments display */
              <div className="space-y-4" id="success-state">
                <CheckCircle className="w-16 h-16 text-green-600 inline-block" />
                <h2 className="font-serif text-3xl font-bold uppercase tracking-tight text-green-800">PEMBAYARAN SUKSES!</h2>
                <div className="bg-white p-4 border border-black text-xs text-left">
                  <p className="mb-1"><span className="text-gray-400 font-bold">NOMOR INVOICE:</span> {createdOrder?.id}</p>
                  <p className="mb-1"><span className="text-gray-400 font-bold">WAKTU BAYAR:</span> {new Date().toLocaleTimeString()}</p>
                  <p className="mb-1"><span className="text-gray-400 font-bold">METODE PAYMENT:</span> {createdOrder?.paymentMethod}</p>
                  {createdOrder?.isPreOrder ? (
                    <>
                      <p className="mb-1 uppercase text-amber-700 font-extrabold"><span className="text-gray-400 font-bold">SISTEM:</span> Pre-Order (DP {createdOrder?.preOrderDpPercent}%)</p>
                      <p className="mb-1"><span className="text-gray-400 font-bold">DP DIBAYAR:</span> Rp{createdOrder?.dpAmount?.toLocaleString('id-ID')}</p>
                      <p className="mb-1"><span className="text-gray-400 font-bold">SISA PELUNASAN:</span> Rp{createdOrder?.remainingAmount?.toLocaleString('id-ID')}</p>
                    </>
                  ) : (
                    <p className="mb-1"><span className="text-gray-400 font-bold">TOTAL SUKSES:</span> Rp{createdOrder?.totalAmount.toLocaleString('id-ID')}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Terima kasih, pembayaran snap Midtrans telah diselesaikan. Tagihan komisi platform disisihkan otomatis, order dipindahkan ke antrean seller toko {createdOrder?.storeName} untuk dipacking.
                </p>
                <div className="pt-4 flex gap-2">
                  <button 
                    onClick={() => { onClose(); onSuccessPay(); }}
                    className="maternal-btn px-6 font-bold"
                  >
                    BUKA PROGRESS ORDERAN SAYA
                  </button>
                </div>
              </div>
            ) : createdOrder?.usedRealMidtrans ? (
              /* REAL MIDTRANS PORTAL OVERLAY TRIGGER BLOCK */
              <div className="w-full space-y-6" id="real-midtrans-view">
                <div className="bg-[#111111] text-white p-4 text-center maternal-border relative">
                  <span className="font-serif text-sm font-bold tracking-wider text-green-500 block">MIDTRANS SECURE SNAP GATEWAY</span>
                  <p className="text-[10px] text-gray-400 uppercase mt-1">PEMBAYARAN RESMI TOKO SIPIL</p>
                </div>

                <div className="bg-white p-6 border-2 border-dashed border-green-500 maternal-shadow-sm text-center font-mono">
                  <div className="space-y-3 text-xs mb-6 text-left">
                    <p className="border-b pb-1.5"><b className="text-gray-500">KODE PESANAN:</b> <span className="font-bold text-black select-all">{createdOrder?.id}</span></p>
                    <p className="border-b pb-1.5">
                      <b className="text-gray-500">
                        {createdOrder?.status === 'DP_PAID' ? 'SISA PELUNASAN DP:' : 'TOTAL INVOICE:'}
                      </b>{' '}
                      <span className="font-bold text-red-700">
                        Rp{(createdOrder?.status === 'DP_PAID' ? createdOrder?.remainingAmount : createdOrder?.totalAmount)?.toLocaleString('id-ID')}
                      </span>
                    </p>
                    <p className="border-b pb-1.5"><b className="text-gray-500">METODE PILIHAN:</b> <span className="uppercase">{createdOrder?.paymentMethod}</span></p>
                    <p><b className="text-gray-500">STATUS SEKARANG:</b> <span className="text-orange-600 font-bold uppercase animate-pulse">MENUNGGU PEMBAYARAN...</span></p>
                  </div>

                  <div className="bg-green-50 p-4 border border-green-200 rounded text-left text-xs text-green-800 space-y-2 mb-4">
                    <p className="font-bold flex items-center gap-1">
                      <Info className="w-4 h-4 text-green-700" /> WIDGET SNAP AKAN TERBUKA SECARA OTOMATIS
                    </p>
                    <p className="text-[11px] leading-relaxed text-green-700">
                      Jika pop-up Midtrans tertutup atau tidak muncul karena diblokir oleh browser Anda, silakan klik tombol di bawah ini untuk membuka menu pembayaran resmi Midtrans dengan aman.
                    </p>
                  </div>

                  {/* Optimized Mobile & QRIS Guidance Section */}
                  <div className="bg-amber-50 border-2 border-black p-4 text-left font-mono text-xs mb-6">
                    <span className="font-sans font-bold text-amber-900 text-[9px] uppercase tracking-wider block mb-2 px-1.5 py-0.5 bg-amber-200 w-fit">
                      {isMobile ? "📱 DETEKSI HP: SMARTPHONE" : "💡 PETUNJUK QRIS / DEEPLINK MOBILE"}
                    </span>
                    <p className="text-[11px] font-bold text-black mb-2 leading-snug">
                      Pembayaran QRIS / GoPay di HP kadang otomatis meminta buka aplikasi GoPay. Jika Anda ingin melakukan Scan QR Code atau memproses pembayaran dari HP lain:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1.5 text-[10.5px] text-gray-700">
                      <li>
                        Klik tombol <b className="text-black uppercase">"BUKA PORTAL PEMBAYARAN (TAB BARU)"</b> di bawah ini.
                      </li>
                      <li>
                        <b>Metode QRIS Pindai:</b> Pilih <b className="text-black">QRIS</b> pada portal Midtrans. Kode QR akan muncul di layar. Silakan ambil <b className="text-amber-950 border-b border-amber-900">Tangkapan Layar (Screenshot)</b> kode QR tersebut.
                      </li>
                      <li>
                        Buka aplikasi bank Anda atau e-wallet Anda (GoPay, OVO, Dana, ShopeePay), pilih menu <b className="text-black">Scan/QR</b>, lalu pilih pilihan <b className="text-black">Unggah Gambar (pilih tangkapan layar tadi)</b> untuk membayar.
                      </li>
                      <li>
                        <b>Metode GoPay/Aplikasi:</b> Jika Anda memiliki aplikasi GoPay/ShopeePay langsung di HP ini, pilih metode tersebut untuk membuka aplikasi dompet digital Anda dan bayar otomatis.
                      </li>
                    </ol>
                  </div>

                  <div className="space-y-2.5">
                    {isMobile ? (
                      <>
                        {createdOrder?.snapRedirectUrl && (
                          <a
                            href={createdOrder.snapRedirectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-4 bg-green-700 hover:bg-neutral-900 text-white font-black transition border-2 border-black cursor-pointer uppercase flex items-center justify-center gap-2 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)] text-xs"
                          >
                            <span>🚀 BUKA PORTAL PEMBAYARAN (TAB BARU)</span>
                          </a>
                        )}
                        <button
                          onClick={triggerMidtransSnap}
                          className="w-full py-2.5 bg-slate-100 text-black font-semibold hover:bg-slate-200 transition border-2 border-black cursor-pointer uppercase flex items-center justify-center text-xs"
                        >
                          <span>📱 Coba Tampilkan Widget Popup Iframe</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={triggerMidtransSnap}
                          className="w-full py-3.5 bg-green-700 text-white font-black hover:bg-black transition border-2 border-black cursor-pointer uppercase flex items-center justify-center gap-2"
                        >
                          <span>BAYAR MELALUI BINDING MIDTRANS</span>
                        </button>

                        {createdOrder?.snapRedirectUrl && (
                          <a
                            href={createdOrder.snapRedirectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-3 bg-white text-black font-semibold hover:bg-gray-100 transition border-2 border-black cursor-pointer uppercase flex items-center justify-center text-xs"
                          >
                            BUKA PORTAL DI TAB BARU
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-center text-[10px] text-gray-400">
                  <p>Menunggu verifikasi instan dari server perbankan Midtrans.</p>
                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={onClose}
                      className="underline hover:text-gray-900 cursor-pointer"
                    >
                      Kembali & Tutup
                    </button>
                    {createdOrder?.status !== 'DP_PAID' && (
                      <button 
                        onClick={() => setShowCancelConfirm(true)}
                        className="underline text-red-700 font-extrabold hover:text-black cursor-pointer uppercase"
                      >
                        BATALKAN PESANAN (TIDAK JADI MEMBAYAR)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Core Snap Active Screen Gateway (MOCK SIMULATION FOR STANDALONE) */
              <div className="w-full space-y-6" id="snap-iframe-view bg-white p-4 border border-black">
                <div className="bg-[#111111] text-white p-4 text-center maternal-border relative">
                  <span className="font-serif top-4 left-4 text-sm font-bold tracking-wider text-red-600 block">MIDTRANS SNAP SANDBOX</span>
                  <p className="text-[10px] text-gray-400 uppercase mt-1">SECURE TRANSACTION PORTAL CLIENT</p>
                </div>

                <div className="bg-white p-6 border-2 border-dashed border-red-500 maternal-shadow-sm text-left font-mono">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <span>TO: <b>TOKO SIPIL ALTERNATIVE</b></span>
                    <span className="text-red-700 font-bold">SANDBOX ENVIRONMENT</span>
                  </div>

                  <div className="space-y-3 text-xs mb-6">
                    <p><b>Order ID tag:</b> {createdOrder?.id}</p>
                    {createdOrder?.isPreOrder ? (
                      <>
                        <div className="p-2 bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold uppercase tracking-tight">
                          PRE-ORDER SYSTEM (DP {createdOrder?.preOrderDpPercent}%)
                        </div>
                        <p><b>Total Nilai Pesanan:</b> Rp{createdOrder?.totalAmount.toLocaleString('id-ID')}</p>
                        <p><b>Uang Muka (DP) Tagihan Sekarang:</b> <span className="font-bold text-red-700 text-sm">Rp{createdOrder?.dpAmount?.toLocaleString('id-ID')}</span></p>
                        <p><b>Sisa Pelunasan (Nanti):</b> <span className="font-bold text-gray-500">Rp{createdOrder?.remainingAmount?.toLocaleString('id-ID')}</span></p>
                      </>
                    ) : (
                      <p><b>Subtotal invoice:</b> <span className="text-red-700 font-bold">Rp{createdOrder?.totalAmount.toLocaleString('id-ID')}</span></p>
                    )}
                    <p><b>Pilihan Metode:</b> {createdOrder?.paymentMethod}</p>
                    
                    {/* Simulated instructions details VA numbers based on banks selected */}
                    {createdOrder?.paymentDetails?.vaNumber ? (
                      <div className="bg-red-50 p-3 border border-red-200 mt-2">
                        <span className="text-red-800 font-bold flex items-center gap-1.5 uppercase text-[11px]">
                          <BankIcon className="w-4 h-4" /> REKENING BILING VIRTUAL ACCOUNT {createdOrder?.paymentDetails?.bank}:
                        </span>
                        <div className="text-md font-mono text-black select-all font-extrabold select-all cursor-pointer bg-white px-2 py-1 border border-black text-center mt-1.5 uppercase">
                          {createdOrder?.paymentDetails?.vaNumber}
                        </div>
                        <span className="text-[9px] text-gray-400 mt-1 block leading-tight">Salin kode bayar di atas untuk diselesaikan di simulasi perbankan.</span>
                      </div>
                    ) : (
                      <div className="mt-2 text-center flex flex-col items-center">
                        <span className="font-bold text-[10px] text-red-800 uppercase">PINDAI KODE QR GOPAY / QRIS:</span>
                        <img 
                          src={createdOrder?.paymentDetails?.qrUrl} 
                          alt="qris mock up text" 
                          className="w-40 h-40 border border-black mt-2" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-gray-500 leading-snug border-t pt-3 mb-4 flex items-start gap-1">
                    <Info className="w-3.5 h-3.5 text-black flex-shrink-0 mt-0.5" />
                    <span>Metode pembayaran Snap Midtrans Core API ini adalah gerbang pembayaran tiruan. Mengklik "BAYAR SEKARANG" di bawah ini akan memicu simulasi webhooks callback ke Express Backend untuk settlement waktu nyata.</span>
                  </p>

                  <button
                    onClick={handleSimulatePayment}
                    disabled={simulatedPaying}
                    className="w-full py-3 bg-red-800 text-white font-extrabold hover:bg-black transition border-2 border-black cursor-pointer uppercase flex items-center justify-center gap-2"
                  >
                    {simulatedPaying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>MENGIRIM NOTIFIKASI MIDTRANS...</span>
                      </>
                    ) : (
                      <span>BAYAR SEKARANG (SIMULASI MIDTRANS SETTLEMENT)</span>
                    )}
                  </button>

                  <div className="pt-3 border-t border-gray-200 mt-4 flex gap-2.5">
                    {createdOrder?.status !== 'DP_PAID' && (
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(true)}
                        className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 border border-red-500 font-extrabold cursor-pointer uppercase text-[10px] tracking-tight flex-grow text-center"
                      >
                        BATALKAN PESANAN (TIDAK JADI MEMBAYAR)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black border border-black font-semibold cursor-pointer uppercase text-[10px] text-center"
                    >
                      TUTUP
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CANCELLATION OVERLAY DIALOG */}
        {showCancelConfirm && (
          <div className="absolute inset-0 bg-[#f4f2e9]/95 backdrop-blur-xs z-50 flex flex-col justify-center p-6 sm:p-8 font-mono text-xs border-2 border-black">
            <div className="border-b-4 border-black pb-3 mb-4">
              <span className="font-serif text-lg font-black uppercase text-red-800 block">KONFIRMASI BATAL BAYAR & PESANAN</span>
              <p className="text-[10px] text-gray-500 mt-1 uppercase">Apakah Anda yakin tidak ingin melanjutkan pembayaran dan membatalkan pesanan ini?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                  Alasan Pembatalan / Tidak Jadi Bayar (Wajib Diisi):
                </label>
                <textarea
                  required
                  value={cancelReasonText}
                  onChange={(e) => setCancelReasonText(e.target.value)}
                  placeholder="Misal: Berubah pikiran, ingin mengganti ukuran baju/metode bayar, atau ingin menambah produk belanja..."
                  rows={4}
                  className="w-full bg-slate-50 border-2 border-black p-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelConfirm(false);
                  }}
                  disabled={cancelling}
                  className="px-4 py-2 bg-white text-black hover:bg-gray-100 border-2 border-black text-[10px] font-bold uppercase cursor-pointer"
                >
                  KEMBALI KE LAYAR BAYAR
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancelling || !cancelReasonText.trim()}
                  className="px-4 py-2 bg-red-800 text-white hover:bg-black text-[10px] font-bold uppercase border-2 border-black cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {cancelling ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>MEMBATALKAN...</span>
                    </>
                  ) : (
                    <span>YA, BATALKAN PESANAN INI</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
