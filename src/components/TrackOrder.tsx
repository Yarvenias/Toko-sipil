import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import { 
  Search, Truck, MapPin, Calendar, Clock, ArrowLeft, 
  ExternalLink, MessageSquare, Package, User, Phone, 
  Compass, Navigation, CheckCircle, RefreshCw, Sparkles, Building
} from 'lucide-react';

interface TrackOrderProps {
  initialOrderId?: string;
  onBack?: () => void;
}

export default function TrackOrder({ initialOrderId, onBack }: TrackOrderProps) {
  const { orders, setActivePage } = useApp();
  const [searchQuery, setSearchQuery] = useState(initialOrderId || '');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialOrderId || null);
  const [simulatedCheckpoints, setSimulatedCheckpoints] = useState<any[]>([]);

  // Real-time API states
  const [apiTrackingData, setApiTrackingData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<number>(30);

  // Find order in global state or mock database
  const activeOrder = orders.find(
    o => o.id.toLowerCase() === selectedOrderId?.toLowerCase() || 
         (o.resiNo && o.resiNo.toLowerCase() === selectedOrderId?.toLowerCase())
  );

  // Fetch tracking details from backend (which integrates Binderbyte)
  const fetchTrackingStatus = async (orderIdOrResi: string, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderIdOrResi}/track-status`);
      if (res.ok) {
        const data = await res.json();
        setApiTrackingData(data);
        setLastRefreshed(new Date());
        setCountdown(30);
      }
    } catch (e) {
      console.error("Gagal mengambil status pelacakan real-time:", e);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Trigger fetch immediately when selected order changes
  useEffect(() => {
    if (selectedOrderId) {
      fetchTrackingStatus(selectedOrderId);
    } else {
      setApiTrackingData(null);
    }
  }, [selectedOrderId]);

  // Set up periodic automatic polling every 30s
  useEffect(() => {
    if (!selectedOrderId) return;
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchTrackingStatus(selectedOrderId, true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedOrderId]);

  // Auto-generate realistic shipping checkpoints based on order status and creation times (as a fallback)
  useEffect(() => {
    if (!activeOrder) {
      setSimulatedCheckpoints([]);
      return;
    }

    const orderTime = new Date(activeOrder.createdAt);
    const formatTime = (dateObj: Date, hourOffset: number, minuteOffset: number) => {
      const copy = new Date(dateObj.getTime());
      copy.setHours(copy.getHours() + hourOffset);
      copy.setMinutes(copy.getMinutes() + minuteOffset);
      return {
        date: copy.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        time: copy.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      };
    };

    const checkpoints = [];

    // All orders have Placement
    checkpoints.push({
      status: 'pending',
      title: 'Pesanan Berhasil Dibuat 📝',
      desc: 'Invoice pesanan telah diterbitkan oleh sistem TokoSipil.',
      ...formatTime(orderTime, 0, 0),
      done: true
    });

    // Payment step
    const isPaid = [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(activeOrder.status);
    const isDpPaid = activeOrder.status === OrderStatus.DP_PAID;

    if (isPaid || isDpPaid) {
      checkpoints.push({
        status: isDpPaid ? 'dp_paid' : 'paid',
        title: isDpPaid ? 'Pembayaran Uang Muka (DP) Terverifikasi 💳' : 'Pembayaran Lunas Terverifikasi & Aman 🟢',
        desc: isDpPaid 
          ? `DP sebesar ${activeOrder.preOrderDpPercent}% berhasil diterima sistem Escrow TokoSipil.` 
          : 'Sistem Escrow HMTS mengonfirmasi dana pembayaran lunas tersimpan dengan aman.',
        ...formatTime(orderTime, 0, 15),
        done: true
      });
    }

    // Processed step
    if (isPaid) {
      checkpoints.push({
        status: 'processing',
        title: 'Pesanan Diproses oleh Seller/Tenant 📦',
        desc: `Pihak toko [${activeOrder.storeName}] mengemas barang dan mempersiapkan logistik pengiriman.`,
        ...formatTime(orderTime, 1, 30),
        done: true
      });
    }

    // Shipped step
    const isShipped = [OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(activeOrder.status);
    if (isShipped) {
      checkpoints.push({
        status: 'shipped',
        title: 'Pesanan Diserahkan ke Kurir / Logistik 🚀',
        desc: `Paket diserahkan ke kurir [${activeOrder.courier || 'Kurir Sipil'}] dengan nomor resi pelacakan: ${activeOrder.resiNo || 'SIPIL-RESI-MOCK'}`,
        ...formatTime(orderTime, 4, 10),
        done: true
      });

      checkpoints.push({
        status: 'shipped_transit_1',
        title: 'Paket Melewati Hub Transit Bandung Timur 🏢',
        desc: 'Sortir logistik di gudang utama penyelarasan mahasiswa sipil selesai dilakukan.',
        ...formatTime(orderTime, 6, 45),
        done: true
      });

      checkpoints.push({
        status: 'shipped_transit_2',
        title: 'Kurir Sedang Mengirim ke Alamat Tujuan 🛵',
        desc: `Pesanan dibawa oleh kurir pengirim area ${activeOrder.address.city || 'Bandung'} menuju lokasi Anda.`,
        ...formatTime(orderTime, 8, 20),
        done: true
      });
    }

    // Delivered & Completed steps
    const isDelivered = [OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(activeOrder.status);
    if (isDelivered) {
      checkpoints.push({
        status: 'delivered',
        title: 'Pesanan Sukses Diterima Penerima 🎉',
        desc: `Diterima langsung oleh sdr/i [${activeOrder.address.receiver}]. Keadaan barang terkonfirmasi sangat baik.`,
        ...formatTime(orderTime, 9, 15),
        done: true
      });
    }

    if (activeOrder.status === OrderStatus.COMPLETED) {
      checkpoints.push({
        status: 'completed',
        title: 'Siklus Pembelanjaan Selesai Terarsip 🔒',
        desc: 'Dana escrow resmi dicairkan ke dompet seller. Terimakasih telah berkontribusi ke kas kasir HMTS!',
        ...formatTime(orderTime, 10, 0),
        done: true
      });
    }

    if (activeOrder.status === OrderStatus.CANCELLED) {
      checkpoints.push({
        status: 'cancelled',
        title: 'Pesanan Dibatalkan ✕',
        desc: activeOrder.cancelReason ? `Alasan: ${activeOrder.cancelReason}` : 'Pesanan ini resmi dibatalkan oleh pembeli / seller sistem.',
        ...formatTime(orderTime, 0, 45),
        done: true
      });
    }

    // Reverse list so latest checkpoint represents at the top
    setSimulatedCheckpoints(checkpoints.reverse());
  }, [activeOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSelectedOrderId(searchQuery.trim());
  };

  // Quick select logged buyer orders
  const buyerOrders = orders.map(o => ({
    id: o.id,
    store: o.storeName,
    status: o.status,
    resi: o.resiNo,
    total: o.totalAmount,
    date: new Date(o.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
  }));

  // Resolve active checkpoints to display (favoring live API tracking data)
  const getRenderedCheckpoints = () => {
    if (apiTrackingData && apiTrackingData.tracking && apiTrackingData.tracking.history && apiTrackingData.tracking.history.length > 0) {
      return apiTrackingData.tracking.history.map((h: any, idx: number) => {
        const dStr = h.date || '';
        let displayDate = dStr;
        let displayTime = '';
        
        try {
          const parsed = new Date(dStr);
          if (!isNaN(parsed.getTime())) {
            displayDate = parsed.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            displayTime = parsed.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
          }
        } catch (e) {}

        let title = 'UPDATE PENGIRIMAN 📦';
        const dLower = String(h.desc || '').toLowerCase();
        if (dLower.includes('delivered') || dLower.includes('sampai') || dLower.includes('diterima') || dLower.includes('terkirim')) {
          title = 'Pesanan Sukses Diterima 🎉';
        } else if (dLower.includes('kurir') || dLower.includes('with courier') || dLower.includes('antar') || dLower.includes('delivery')) {
          title = 'Kurir Sedang Mengirim ke Alamat Tujuan 🛵';
        } else if (dLower.includes('gudang') || dLower.includes('sorting') || dLower.includes('hub') || dLower.includes('processed') || dLower.includes('transit')) {
          title = 'Paket Transit / Di Gudang Sortir Hub 🏢';
        } else if (dLower.includes('shipment') || dLower.includes('terima oleh') || dLower.includes('received') || dLower.includes('diserahkan')) {
          title = 'Pesanan Diserahkan ke Kurir Logistik 🚀';
        } else if (dLower.includes('invoice') || dLower.includes('dibuat') || dLower.includes('system') || dLower.includes('terbitkan')) {
          title = 'Pesanan Berhasil Dibuat 📝';
        }

        return {
          title,
          desc: h.desc,
          date: displayDate,
          time: displayTime,
          done: true
        };
      });
    }

    return simulatedCheckpoints;
  };

  const currentCheckpoints = getRenderedCheckpoints();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 font-mono text-xs" id="track-order-portal-view">
      
      {/* Title Header area */}
      <div className="text-center space-y-3 mb-10">
        <span className="bg-black text-[#f4f2e9] px-3 py-1 font-extrabold uppercase tracking-widest inline-block text-[9px] border-2 border-black">
          SIPIL LOGISTICS CORE SYSTEM
        </span>
        <h1 className="font-serif text-3.5xl font-black text-black uppercase tracking-tight">
          LACAK PENGIRIMAN & PESANAN
        </h1>
        <p className="text-gray-500 uppercase max-w-lg mx-auto text-[10px] leading-normal">
          Masukkan kode Invoice pembayaran atau nomor resi kurir logistik untuk melacak detil transit, status keandalan pengemasan, serta kepastian posisi pesanan.
        </p>
      </div>

      {/* Main Search Input Box */}
      <div className="bg-white border-4 border-black p-6 maternal-shadow mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="MASUKKAN ID INVOICE (Misal: INV-xxxx) ATAU NOMOR RESI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-100 border-2 border-black pl-11 pr-4 py-3.5 rounded-none focus:outline-none placeholder-gray-400 font-bold text-xs uppercase"
            />
            <Search className="w-5 h-5 text-gray-500 absolute left-4 top-4" />
          </div>
          <button 
            type="submit"
            className="bg-black hover:bg-neutral-800 text-white font-black py-4 px-8 border-2 border-black tracking-widest uppercase transition shrink-0 cursor-pointer text-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-[1px] hover:translate-x-[3px] hover:translate-y-[3px]"
          >
            LACAK SEKARANG ➔
          </button>
        </form>

        {/* Suggest / Quick-links if logged user has existing orders */}
        {buyerOrders.length > 0 && (
          <div className="mt-4 border-t border-dashed border-gray-300 pt-3">
            <span className="text-[10px] text-gray-500 uppercase font-black block mb-2">PILIH CEPAT DARI TRANSAKSI ANDA:</span>
            <div className="flex flex-wrap gap-2">
              {buyerOrders.slice(0, 4).map((bo) => (
                <button 
                  key={bo.id}
                  onClick={() => {
                    setSearchQuery(bo.id);
                    setSelectedOrderId(bo.id);
                  }}
                  className={`px-3 py-1.5 border border-black font-extrabold text-[9px] uppercase transition cursor-pointer ${
                    selectedOrderId === bo.id 
                    ? 'bg-red-800 text-white border-red-800' 
                    : 'bg-neutral-50 text-black hover:bg-red-50'
                  }`}
                >
                  📦 {bo.store} ({bo.date}) - {bo.id.substring(0, 10).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Core Tracking Result Panel */}
      {selectedOrderId ? (
        activeOrder ? (
          <div className="space-y-6" id="tracking-inner-panel">
            
            {/* 1. Header Card Status summary info */}
            <div className="bg-white border-4 border-black p-6 md:p-8 maternal-shadow flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-3 uppercase">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif font-black text-xl text-black">INVOICE: #{activeOrder.id.toUpperCase()}</span>
                  <span className="bg-zinc-900 text-amber-400 border border-zinc-700 px-2 py-0.5 font-bold text-[9px]">
                    {apiTrackingData?.status || activeOrder.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-gray-600 text-[11px] leading-relaxed">
                  <div>
                    <span className="font-bold text-black block">PENGIRIM VENDOR</span>
                    <span>{activeOrder.storeName} Store</span>
                  </div>
                  <div>
                    <span className="font-bold text-black block">PENERIMA PAKET</span>
                    <span>{apiTrackingData?.tracking?.detail?.receiver || activeOrder.address.receiver} ({activeOrder.address.phone})</span>
                  </div>
                  <div>
                    <span className="font-bold text-black block">TANGGAL TRANSAKSI</span>
                    <span>{new Date(activeOrder.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })} WIB</span>
                  </div>
                  <div>
                    <span className="font-bold text-black block">METODE PENGIRIMAN</span>
                    <span className="font-bold text-red-800">{apiTrackingData?.tracking?.summary?.courier || activeOrder.courier} • {apiTrackingData?.tracking?.summary?.service || 'STANDARD'}</span>
                  </div>
                </div>
              </div>

              {/* Action bar and interactive simulate controllers with live polling and Binderbyte indicator */}
              <div className="border-t md:border-t-0 md:border-l border-dashed border-gray-300 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center gap-3 min-w-[220px]">
                <div className="bg-amber-50 border-2 border-black p-3 space-y-2 text-center rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <span className="text-[9px] text-[#991b1b] font-extrabold uppercase flex items-center justify-center gap-1.5 tracking-wider">
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    LIVE COURIER AUTOMATION
                  </span>
                  
                  <div className="text-[9.5px] uppercase font-mono space-y-1">
                    <p className={`font-bold ${apiTrackingData?.apiSource === 'binderbyte' ? 'text-green-700' : 'text-zinc-650'}`}>
                      SOURCE: {apiTrackingData?.apiSource === 'binderbyte' ? '🟢 BINDERBYTE REAL-TIME' : '⚡ COURIER SIMULATOR'}
                    </p>
                    <p className="text-gray-400 text-[8px]">
                      Refreshed: {lastRefreshed ? lastRefreshed.toLocaleTimeString('id-ID') : 'Just now'}
                    </p>
                    <p className="text-red-700 font-bold border border-red-200 bg-red-100 p-1 text-[8px] animate-pulse">
                      AUTO SYNCED IN {countdown}S
                    </p>
                  </div>

                  <button 
                    type="button"
                    onClick={() => fetchTrackingStatus(activeOrder.id)}
                    disabled={isLoading}
                    className="w-full bg-black hover:bg-neutral-800 text-white font-mono font-bold text-[9px] uppercase px-3 py-1.5 border-2 border-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'SYNCING...' : 'REFRESH STATUS'}
                  </button>
                </div>
                
                <a 
                  href={`https://wa.me/628123456789?text=Halo,%20saya%20ingin%20bertanya%20mengenai%20status%20order%20saya%20%23${activeOrder.id}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-4 border-2 border-black text-center flex items-center justify-center gap-2 uppercase tracking-tight text-[10px]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>CHAT SELLER VIA WHATSAPP</span>
                </a>
              </div>
            </div>

            {/* 2. Map & Dynamic Progress bar panel */}
            <div className="bg-zinc-900 text-white border-4 border-black p-6 maternal-shadow relative overflow-hidden" id="simulated-map-display">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
                <Compass className="w-56 h-56 text-white" />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-700 pb-3">
                  <span className="font-serif font-black text-xs uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 animate-bounce" />
                    SIMULASI PETA LOGISTIK TRANSIT ({apiTrackingData?.tracking?.detail?.origin || 'LOKAL BANDUNG'})
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">GPS: ACTIVE OK</span>
                </div>

                {/* Progress bar tracking */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-zinc-300 font-bold">
                    <span>GUDANG COBLONG TECH (BANDUNG)</span>
                    <span className="text-amber-400">STATUS TRANSIT PROGRESS</span>
                    <span>{apiTrackingData?.tracking?.detail?.destination || 'ALAMAT PRODI SIPIL UNIKOM'}</span>
                  </div>
                  
                  {/* Dynamic percentage track bar */}
                  <div className="w-full bg-zinc-800 h-5 border-2 border-black relative rounded-none p-0.5">
                    <div 
                      className="bg-gradient-to-r from-red-800 to-amber-500 h-full transition-all duration-1000 flex items-center justify-end pr-2 overflow-hidden"
                      style={{ 
                        width: (apiTrackingData?.status || activeOrder.status) === OrderStatus.COMPLETED || (apiTrackingData?.status || activeOrder.status) === OrderStatus.DELIVERED ? '100%' :
                               (apiTrackingData?.status || activeOrder.status) === OrderStatus.SHIPPED ? '75%' : 
                               (apiTrackingData?.status || activeOrder.status) === OrderStatus.PAID ? '35%' : '10%'
                      }}
                    >
                      <Truck className="w-3.5 h-3.5 text-white animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Simulated delivery address summary text */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-zinc-300 text-[10.5px] uppercase">
                  <div className="bg-zinc-950 p-3 border border-zinc-700">
                    <span className="font-extrabold text-[#f4f2e9] block text-[9.5px]">ALAMAT TUJUAN</span>
                    <span className="text-zinc-400 font-sans block mt-1 leading-snug">{activeOrder.address.detail}{activeOrder.address.rtrw ? `, RT/RW: ${activeOrder.address.rtrw}` : ''}{activeOrder.address.subdistrict ? `, KEL/DESA: ${activeOrder.address.subdistrict}` : ''}{activeOrder.address.district ? `, KEC: ${activeOrder.address.district}` : ''}, {activeOrder.address.city}{activeOrder.address.province ? `, ${activeOrder.address.province}` : ''}</span>
                  </div>
                  <div className="bg-zinc-950 p-3 border border-zinc-700">
                    <span className="font-extrabold text-[#f4f2e9] block text-[9.5px]">KURIR / SERVICE</span>
                    <span className="text-zinc-400 block mt-1 leading-snug truncate uppercase">{apiTrackingData?.tracking?.summary?.courier || activeOrder.courier} (REG)</span>
                  </div>
                  <div className="bg-zinc-950 p-3 border border-zinc-700">
                    <span className="font-extrabold text-[#f4f2e9] block text-[9.5px]">RESI PELACAKAN</span>
                    <span className="text-amber-400 block font-bold font-mono mt-1 select-all">{activeOrder.resiNo || 'SIPIL-MOCK-3001'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Detailed checkpoints list history */}
            <div className="bg-white border-4 border-black p-6 md:p-8 maternal-shadow">
              <h3 className="font-serif font-black text-gray-900 text-lg uppercase tracking-tight border-b-2 border-black pb-3.5 mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-red-800" />
                RIWAYAT TIMELINE PENGIRIMAN REAL-TIME
              </h3>

              {/* Vertical steppers */}
              <div className="relative pl-6 border-l-4 border-black space-y-8 ml-3 py-1.5" id="delivery-tracking-timeline">
                {currentCheckpoints.map((cp, idx) => (
                  <div key={idx} className="relative">
                    
                    {/* Circle Node Icon pointer */}
                    <div className="absolute -left-[35px] top-0 bg-white border-4 border-black rounded-full p-0.5 w-6 h-6 flex items-center justify-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-red-800 animate-ping' : 'bg-black'}`}></div>
                    </div>

                    <div className="space-y-1.5 font-mono">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className={`font-serif font-black text-sm uppercase ${idx === 0 ? 'text-red-800 text-base' : 'text-black'}`}>
                          {cp.title}
                        </h4>
                        <span className="text-[9.5px] text-gray-400 font-mono font-bold shrink-0">
                          ⏱ {cp.date} {cp.time ? `• ${cp.time}` : ''}
                        </span>
                      </div>
                      <p className="text-gray-650 font-sans text-xs uppercase leading-relaxed max-w-2xl">
                        {cp.desc}
                      </p>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Back options */}
            <div className="flex justify-between items-center pt-2">
              <button 
                onClick={onBack ? onBack : () => setActivePage('home')}
                className="bg-white hover:bg-neutral-50 text-black border-2 border-black font-extrabold uppercase px-4 py-2 flex items-center gap-1 cursor-pointer select-none shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>KEMBALI KE HALAMAN SEBELUMNYA</span>
              </button>
              <span className="text-[10px] text-gray-400 font-bold uppercase">SISTEM INTEGRASI CARGO TOKOSIPIL UNI-SYSTEM V4.0</span>
            </div>

          </div>
        ) : (
          <div className="bg-red-50 border-4 border-black p-8 text-center text-red-800 space-y-3 maternal-shadow" id="tracking-not-found">
            <Package className="w-12 h-12 mx-auto text-red-800 animate-pulse" />
            <h3 className="font-serif text-xl font-black uppercase">DATA PENGIRIMAN TIDAK DITEMUKAN</h3>
            <p className="max-w-md mx-auto text-[11px] leading-relaxed uppercase">
              Maaf, ID Invoice atau Nomor Resi <code className="bg-red-100 text-red-950 px-1.5 py-0.5 border border-red-300 font-bold">"{selectedOrderId}"</code> tidak terdaftar di log data kami. Harap pastikan kembali ketikan huruf besar/kecil Anda atau cari pesanan aktif di dashboard profil Pembeli Anda.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button 
                onClick={() => setSelectedOrderId(null)}
                className="bg-black text-white hover:bg-neutral-800 font-bold px-4 py-2 border-2 border-black cursor-pointer text-[10px] uppercase"
              >
                CARI ULANG
              </button>
              <button 
                onClick={onBack ? onBack : () => setActivePage('dashboard-user')}
                className="bg-white text-black hover:bg-zinc-100 font-bold px-4 py-2 border-2 border-black cursor-pointer text-[10px] uppercase"
              >
                BUKA PROFIL SAYA
              </button>
            </div>
          </div>
        )
      ) : (
        /* Standalone placeholder state when they haven't submitted any search */
        <div className="bg-white border-4 border-black p-8 text-center space-y-6 maternal-shadow">
          <div className="w-16 h-16 bg-red-50 rounded-full border-2 border-black flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8 text-red-800 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-black text-black uppercase">MENUNGGU NOMOR INVOICE ATAU RESI ANDA</h2>
            <p className="max-w-md mx-auto text-[10.5px] text-gray-500 uppercase leading-relaxed">
              Anda belum menyeleksi atau menginput invoice belanja. Silakan ketikkan kode order / invoice (misalnya <code className="font-bold text-black border-b border-black">INV-xxxx</code>) di bidang pencarian atas, atau klik salah satu transaksi aktif Pembeli Anda yang terdaftar pada log.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <button 
              onClick={onBack ? onBack : () => setActivePage('home')}
              className="bg-white hover:bg-neutral-50 text-black border-2 border-black font-extrabold uppercase px-5 py-2.5 flex items-center gap-1.5 cursor-pointer text-[10px] tracking-wide"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>KEMBALI KE EXPlORE UTAMA</span>
            </button>
          </div>
        </div>
      )}

      {/* Security notice footer box */}
      <div className="mt-12 bg-neutral-100 border-2 border-black p-5 flex items-start gap-4">
        <Compass className="w-6 h-6 text-red-800 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-gray-650 leading-relaxed text-[10px] uppercase">
          <span className="font-bold text-black block">INFORMASI JAMINAN LOGISTIK SIPIL</span>
          <p>
            Informasi pergerakan kiriman cargo didukung integrasi API kurir tepercaya serta pembinaan tim kurir internal HMTS. Seluruh kiriman diproteksi asuransi keselamatan barang konstruksi sipil. Untuk bantuan klaim retur barang retak, silakan ajukan di dashboard user maksimal 3x24 jam.
          </p>
        </div>
      </div>

    </div>
  );
}
