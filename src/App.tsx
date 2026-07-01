/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Role } from './types';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import ProductGrid from './components/ProductGrid';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import ChatDrawer from './components/ChatDrawer';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardSeller from './components/DashboardSeller';
import DashboardUser from './components/DashboardUser';
import HelpCenter from './components/HelpCenter';
import LegalPolicies from './components/LegalPolicies';
import TrackOrder from './components/TrackOrder';
import AndroidBuilder from './components/AndroidBuilder';
import { Sparkles, ArrowRight, Instagram, Mail, Info, Store, Heart, ShoppingBag, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, X, Home, ShoppingCart, User, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Analytics } from '@vercel/analytics/react';

function AppContent() {
  const { 
    currentUser, activePage, setActivePage, stores, products, vouchers, banners,
    toggleFollowStore, followedStores, login, signup, authOpen, setAuthOpen,
    toasts, removeToast, addToast, userDashboardInitialTab, setUserDashboardInitialTab, settings, cart
  } = useApp();

  // Overlay component states
  const [cartOpen, setCartOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPayOrder, setSelectedPayOrder] = useState<any | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [trackedOrderId, setTrackedOrderId] = useState<string>('');
  
  // Real-time tick timer for store follower fluctuation
  const [, setLiveTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setLiveTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle Midtrans redirect callback query parameters on app mount
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('order_id');
      const transStatus = params.get('transaction_status');
      const statusCode = params.get('status_code');

      if (orderId) {
        if (transStatus === 'settlement' || transStatus === 'capture' || statusCode === '200') {
          addToast(
            "PEMBAYARAN BERHASIL", 
            `Terima kasih! Pembayaran untuk Order ID ${orderId} sukses diproses.`, 
            "success"
          );
          setActivePage('dashboard-user');
          if (setUserDashboardInitialTab) {
            setUserDashboardInitialTab('orders');
          }
        } else if (transStatus === 'pending' || statusCode === '201') {
          addToast(
            "PEMBAYARAN DIPROSES", 
            `Transaksi pending. Silakan selesaikan tagihan Anda untuk Order ID ${orderId}.`, 
            "info"
          );
          setActivePage('dashboard-user');
          if (setUserDashboardInitialTab) {
            setUserDashboardInitialTab('orders');
          }
        } else if (transStatus === 'deny' || transStatus === 'cancel' || transStatus === 'expire') {
          addToast(
            "TRANSAKSI BATAL / GAGAL", 
            `Status pembayaran Midtrans untuk Order ID ${orderId}: ${transStatus.toUpperCase()}`, 
            "error"
          );
          setActivePage('dashboard-user');
          if (setUserDashboardInitialTab) {
            setUserDashboardInitialTab('orders');
          }
        }
        
        // Remove query parameters from Address Bar cleanly
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch (e) {
      console.error('[Callback Redirect Error]', e);
    }
  }, []);

  // Trigger simulated payment flow on pending or previous orders
  const handleOpenCheckoutWithOrder = (order: any) => {
    setSelectedPayOrder(order);
    setCheckoutOpen(true);
  };

  // Navigates and automatically scrolls to the top/center to ensure perfect mobile and desktop viewport positioning
  const navigateToPage = (page: typeof activePage) => {
    setActivePage(page);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between bg-[#f4f2e9] text-[#111111] font-sans antialiased selection:bg-red-800 selection:text-white ${['dashboard-admin', 'dashboard-seller', 'dashboard-user'].includes(activePage) ? 'h-screen overflow-hidden' : 'pb-20 lg:pb-0'}`} id="main-maternal-app">
      
      {/* Header Navigation Navigation Bar */}
      {activePage !== 'dashboard-admin' && activePage !== 'dashboard-user' && activePage !== 'dashboard-seller' && (
        <Header 
          onOpenCart={() => {
            setCartOpen(true);
            setChatOpen(false);
          }}
          onOpenWishlist={() => {
            setCartOpen(false);
            setChatOpen(false);
            if (setUserDashboardInitialTab) {
              setUserDashboardInitialTab('wishlist');
            }
            navigateToPage('dashboard-user');
          }}
          onOpenAuth={() => setAuthOpen(true)}
          onOpenChat={() => {
            setChatOpen(true);
            setCartOpen(false);
          }}
        />
      )}

      {/* Pages switcher Routing Layout */}
      <main className="flex-grow relative flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="w-full flex-grow flex flex-col"
          >
            {activePage === 'home' && (
              <div className="space-y-12 pb-16" id="home-view">
                
                {/* Automatic Carousel banners */}
                <HeroCarousel />

                {/* HMTS Integration Portal Section */}
                <section className="max-w-7xl mx-auto px-4 md:px-8" id="hmts-integration-banner">
                  <div className="bg-gradient-to-r from-brand-forest to-brand-pine text-white border-2 border-black p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 maternal-shadow">
                    <div className="space-y-2 max-w-2xl font-mono text-left">
                      <span className="bg-amber-500 text-black px-2.5 py-0.5 text-[9px] font-extrabold tracking-widest uppercase inline-block">
                        HMTS OFFICIAL TEAM & PARTNER
                      </span>
                      <h3 className="font-serif text-2xl md:text-3.5xl font-black text-white leading-tight uppercase tracking-tight">
                        SINERGI HMTS × TOKO SIPIL
                      </h3>
                      <p className="text-xs text-gray-200 leading-relaxed uppercase">
                        Toko Sipil didirikan dan dikembangkan sebagai wadah resmi inkubasi bisnis, merchandise angkatan, dan ekonomi kreatif oleh <span className="text-amber-400 font-extrabold font-serif text-sm">Himpunan Mahasiswa Teknik Sipil (HMTS)</span>. Akses portal kemahasiswaan dan berita sipil terkini melalui tautan resmi kami.
                      </p>
                    </div>
                    <div className="flex-shrink-0 w-full md:w-auto">
                      <a 
                        href="https://hmts.useyapi.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto inline-flex justify-center items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black border-2 border-black font-mono font-extrabold py-3 px-6 text-xs tracking-wider transition-colors duration-200 select-none cursor-pointer"
                      >
                        <span>KUNJUNGI WEBSITE HMTS ↗</span>
                      </a>
                    </div>
                  </div>
                </section>

                {/* Hot Releases / Trending Grid */}
                <section className="max-w-7xl mx-auto px-4 md:px-8" id="featured-releases-area">
                  <div className="flex justify-between items-baseline border-b border-black pb-4 mb-8">
                    <div>
                      <h2 className="font-serif text-2.5xl font-bold uppercase tracking-tight">TRENDING RELEASES</h2>
                      <p className="font-mono text-[9px] font-bold text-gray-500 uppercase mt-0.5">EXCLUSIVE NEW AND ARCHIVE SAMPLES DIRECT FROM SELLER BOUTIQUES</p>
                    </div>
                    <button 
                      onClick={() => setActivePage('shop')}
                      className="font-mono text-xs font-bold text-red-800 hover:text-black flex items-center gap-1 uppercase transition-all duration-300 cursor-pointer"
                    >
                      <span>SEE ALL ARCHIVE</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Renders basic grid without sorting row controls */}
                  <ProductGrid 
                    onSelectProduct={(p) => setSelectedProduct(p)} 
                    standalone={false} 
                  />
                </section>

                {/* Alternative Multi-Vendors list section */}
                <section className="max-w-7xl mx-auto px-4 md:px-8" id="street-brands-directory">
                  <div className="border-b border-black pb-4 mb-6">
                    <h3 className="font-serif text-xl font-bold uppercase">POPULAR CLOTHING STORES</h3>
                    <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mt-0.5 block">SUPPORT COUTURES INDEPENDENT SELLER ECOSYSTEMS</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stores.map((s) => {
                      const followingThis = followedStores.includes(s.id);
                      return (
                        <div 
                          key={s.id} 
                          className="bg-white border-2 border-black p-5 flex items-center justify-between gap-4 maternal-shadow-sm font-mono text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={s.logo} 
                              alt={s.name} 
                              className="w-12 h-12 rounded-none object-cover border-2 border-black flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="font-serif font-extrabold text-[#111] uppercase block tracking-tight">{s.name}</span>
                              <span className="text-[10px] text-gray-400 block mt-0.5 tracking-wider uppercase">Rating: ★ {s.rating}</span>
                            </div>
                          </div>

                          <button
                            onClick={async () => {
                              if (!currentUser) {
                                setAuthOpen(true);
                              } else {
                                await toggleFollowStore(s.id);
                              }
                            }}
                            className={`px-3 py-1.5 font-bold uppercase transition bg-black text-[#faf9f3] text-[9.5px] tracking-wide border-2 border-black hover:bg-transparent hover:text-black cursor-pointer ${
                              followingThis ? 'bg-red-800 border-red-800 text-white' : ''
                            }`}
                          >
                            {followingThis ? 'FOLLOWING' : 'FOLLOW'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Aesthetic Lookbook feature block */}
                {(!banners || banners.length <= 1) ? (
                  <section className="w-full border-t-4 border-b-4 border-black overflow-hidden mt-12 animate-fade-in" id="band-lookbook">
                    <div 
                      onClick={() => setActivePage('shop')}
                      className="w-full h-auto aspect-[21/9] md:aspect-[3/1] bg-brand-pine overflow-hidden cursor-pointer"
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&h=600&fit=crop" 
                        alt="Default lookbook banner representation" 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </section>
                ) : (
                  <div className="space-y-12 mt-12">
                    {banners.slice(1).map((b) => (
                      <section key={b.id} className="w-full border-t-4 border-b-4 border-black overflow-hidden animate-fade-in" id={`lookbook-${b.id}`}>
                        <div 
                          onClick={() => {
                            if (b.url && b.url.startsWith('/')) {
                              if (b.url === '/shop') setActivePage('shop');
                            } else if (b.url) {
                              window.open(b.url, '_blank');
                            }
                          }}
                          className="w-full h-auto aspect-[21/9] md:aspect-[3/1] bg-brand-pine overflow-hidden cursor-pointer"
                        >
                          <img 
                            src={b.image} 
                            alt={b.title || "Lookbook banner"} 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </section>
                    ))}
                  </div>
                )}

              </div>
            )}

            {activePage === 'shop' && (
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex-grow" id="catalog-view">
                {/* Renders ProductGrid loaded standalone with full categories sliders */}
                <ProductGrid 
                  onSelectProduct={(p) => setSelectedProduct(p)} 
                  standalone={true} 
                />
              </div>
            )}

            {activePage === 'stores' && (
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6 flex-grow" id="stores-view">
                <div>
                  <h2 className="font-serif text-3.5xl font-extrabold uppercase tracking-tight">ACTIVE BRANDS REGISTRY</h2>
                  <p className="font-mono text-[10px] text-gray-500 mt-1 uppercase">VERIFIED AND AUTHORIZED STREETWEAR VENDORS DISTRIBUTED WORLDWIDE</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                  {stores.map((s) => {
                    const followingThis = followedStores.includes(s.id);
                    const liveOffset = Math.floor(Math.sin((Date.now() + (s.id ? s.id.charCodeAt(0) : 0) * 1200) / 7500) * 3);
                    const followersVal = (s.followersCount || 1241) + liveOffset;
                    return (
                      <div key={s.id} className="bg-white border-2 border-black p-6 maternal-shadow flex flex-col justify-between gap-6">
                        <div className="flex gap-4 items-start font-mono text-xs">
                          <img 
                            src={s.logo} 
                            alt={s.logo} 
                            className="w-16 h-16 border-2 border-black object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h3 className="font-serif font-extrabold text-black text-lg uppercase leading-tight">{s.name}</h3>
                            <p className="text-gray-400 mt-0.5 italic">@{s.username}</p>
                            <p className="text-red-700 font-bold mt-1 text-[11px]">★ {s.rating} / 5.0 Rating</p>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <p className="font-mono text-[11px] text-gray-500 leading-snug line-clamp-3 h-12 uppercase">{s.description}</p>
                        </div>

                        <div className="flex justify-between items-center border-t pt-4 font-mono text-xs">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <span>{followersVal} Followers</span>
                            <span className="flex h-1.5 w-1.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-[7.5px] font-mono font-bold text-emerald-600 uppercase tracking-widest animate-pulse">LIVE</span>
                          </div>
                          <button
                            onClick={async () => {
                              if (!currentUser) {
                                setAuthOpen(true);
                              } else {
                                await toggleFollowStore(s.id);
                              }
                            }}
                            className="bg-black hover:bg-slate-800 px-4 py-2 text-white font-mono font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                          >
                            {followingThis ? '✓ FOLLOWING' : 'SUBSCRIBE / FOLLOW'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activePage === 'about' && (
              <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 flex-grow" id="about-editorial-view">
                <span className="font-mono text-xs bg-black text-[#f4f2e9] px-2.5 py-0.5 uppercase inline-block select-none">
                  EST. 2026 BAND CULTURE MANIFETS
                </span>
                <h1 className="font-serif text-4xl font-black uppercase tracking-tight text-brand-black mt-2 mb-6 leading-none">THE POWER OF ARCHIVE COUTURES</h1>
                
                <div className="font-mono text-xs leading-relaxed space-y-6 text-gray-700 uppercase" id="editorial-paragraph-text">
                  <p>
                    Toko Sipil adalah wadah ekosistem digital untuk merek fesyen berjiwa independen, gelap, modern, dan didedikasikan sepenuhnya bagi pencinta merch musik cadas dan streetwear fungsional.
                  </p>
                  
                  <div className="border-l-4 border-red-700 pl-4 py-1 italic bg-[#eae8de]">
                    "Kami percaya bahwa gaya busana adalah perpanjangan visual dari identitas musik dan perlawanan kultural. Kami mengkurasi vendor-vendor lokal terbaik untuk menjamin integritas desain asli."
                  </div>

                  <p>
                    Melalui platform multi-vendor terintegrasi ini, setiap vendor independen memiliki kendali penuh atas stok hoodies, caps, leather belts, dan tees buatan mereka, disinergikan dengan gerbang keamanan rekening escrow guna melindungi seluruh pembeli dari kesalahan cetak atau penipuan.
                  </p>
                </div>
              </div>
            )}

            {activePage === 'contact' && (
              <div className="max-w-xl mx-auto px-4 md:px-8 py-12 flex-grow" id="contact-feedback-view">
                <h2 className="font-serif text-3xl font-bold uppercase tracking-tight mb-4">CONNECT WITH ARCHIVISTS</h2>
                <p className="font-mono text-xs text-gray-500 mb-6 uppercase">Punya keluhan barang cacat atau butuh bantuan pendaftaran? Kirim feedback instan di bawah ini.</p>

                <form onSubmit={(e) => { e.preventDefault(); alert("Terima kasih, pesan koordinasi Anda telah diteruskan ke administrator!"); }} className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1 uppercase">EMAIL KAMU *</label>
                    <input type="email" placeholder="contoh@mail.com" required className="w-full bg-white border-2 border-black p-2.5 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1 uppercase">SUBJEK MASALAH *</label>
                    <input type="text" placeholder="Lapor barang cacat / Request akun seller" required className="w-full bg-white border-2 border-black p-2.5 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1 uppercase">DETAIL PESAN *</label>
                    <textarea rows={4} required placeholder="Ketik pesan Anda secara lengkap..." className="w-full bg-white border-2 border-black p-2.5 focus:outline-none" />
                  </div>

                  <button type="submit" className="w-full py-3 maternal-btn text-xs font-bold uppercase">
                    SEND MESSAGE NOW
                  </button>
                </form>
              </div>
            )}

            {/* Dynamic Secured Dashboards Renders */}
            {activePage === 'dashboard-admin' && (
              (currentUser?.role === Role.SUPER_ADMIN || currentUser?.role === Role.PEGAWAI) ? (
                <div className="flex-grow w-full flex flex-col"><DashboardAdmin /></div>
              ) : (
                <div className="p-12 text-center text-red-800 font-mono text-sm leading-snug flex-grow flex flex-col justify-center items-center">
                  <ShieldAlert className="w-10 h-10 inline-block text-red-800 mb-2" />
                  <p className="font-bold">AKSES TIDAK DI-IZINKAN (FORBIDDEN)</p>
                </div>
              )
            )}

            {activePage === 'dashboard-seller' && (
              (currentUser?.role === Role.SELLER || (currentUser && stores.some(s => s.userId === currentUser.id))) ? (
                <div className="flex-grow w-full flex flex-col"><DashboardSeller /></div>
              ) : (
                <div className="p-12 text-center text-red-800 font-mono text-sm leading-snug flex-grow flex flex-col justify-center items-center">
                  <ShieldAlert className="w-10 h-10 inline-block text-red-800 mb-2" />
                  <p className="font-bold">AKSES TOKO BUTUH PERSETUJUAN SELLER AKTIF</p>
                </div>
              )
            )}

            {activePage === 'dashboard-user' && (
              <div className="flex-grow w-full flex flex-col">
                <DashboardUser 
                  onOpenCheckout={handleOpenCheckoutWithOrder} 
                  onOpenStoreApply={() => {}} 
                  onOpenChat={() => setChatOpen(true)}
                  onTrackOrder={(id) => {
                    setTrackedOrderId(id);
                    setActivePage('track-order');
                  }}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                />
              </div>
            )}

            {activePage === 'help-center' && (
              <div className="flex-grow w-full flex flex-col"><HelpCenter /></div>
            )}

            {activePage === 'legal-policies' && (
              <div className="flex-grow w-full flex flex-col"><LegalPolicies /></div>
            )}

            {activePage === 'track-order' && (
              <div className="flex-grow w-full flex flex-col">
                <TrackOrder 
                  initialOrderId={trackedOrderId} 
                  onBack={() => {
                    setActivePage('dashboard-user');
                    setTrackedOrderId('');
                  }}
                />
              </div>
            )}

            {activePage === 'android-builder' && (
              <div className="flex-grow w-full flex flex-col"><AndroidBuilder /></div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER: Minimalist Raw Gothic Streetstyle */}
      {activePage !== 'dashboard-admin' && activePage !== 'dashboard-user' && activePage !== 'dashboard-seller' && (
        <footer className="bg-[#111111] text-[#f4f2e9] border-t-4 border-black font-mono text-xs select-none">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo identity column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src={settings?.appLogo || "/src/assets/images/toko_sipil_logo_1781875832848.jpg"} 
                alt={settings?.appName || "Logo Toko Sipil"} 
                className="w-7 h-7 rounded border border-gray-800 object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="font-serif text-3.5xl font-bold tracking-tighter text-white">{settings?.appName || "TOKO SIPIL"} ALTERNATIVE</span>
            </div>
            <p className="text-[10px] text-gray-500 uppercase leading-snug">
              Kavling {settings?.appName || "Toko Sipil"}, Est 2026. Alt Fashion multi-vendor platform, supporting civil architectural styles and high-fidelity streetwear designers.
            </p>
          </div>

          {/* Nav quick column */}
          <div className="space-y-2">
            <span className="font-serif font-bold text-red-600 uppercase text-xs">PORTAL DIRECTORY</span>
            <div className="flex flex-col gap-1 text-[10px] text-gray-400">
              <button onClick={() => navigateToPage('home')} className="text-left hover:text-white transition cursor-pointer">Halaman Utama</button>
              <button onClick={() => navigateToPage('shop')} className="text-left hover:text-white transition cursor-pointer">Katalog Rilis</button>
              <button onClick={() => navigateToPage('stores')} className="text-left hover:text-white transition cursor-pointer">Daftar Store</button>
              <button onClick={() => navigateToPage('about')} className="text-left hover:text-white transition cursor-pointer">Manifes Alternatif</button>
            </div>
          </div>

          {/* Help, Medsos and Legal layout quick links column */}
          <div className="space-y-2">
            <span className="font-serif font-bold text-red-600 uppercase text-xs">PUSAT BANTUAN</span>
            <div className="flex flex-col gap-1 text-[10px] text-gray-400">
              <button onClick={() => navigateToPage('help-center')} className="text-left hover:text-white transition cursor-pointer">Pusat Bantuan (FAQ)</button>
              <button onClick={() => navigateToPage('track-order')} className="text-left hover:text-white transition cursor-pointer text-amber-400 font-bold">Lacak Pengiriman 🚚</button>
              <button onClick={() => navigateToPage('legal-policies')} className="text-left hover:text-white transition cursor-pointer">Kebijakan & Syarat</button>
              <div className="flex items-center gap-2 pt-1.5">
                <a 
                  href="https://www.instagram.com/hmts_unikom/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-green-400 text-[#f4f2e9] transition cursor-pointer flex items-center justify-center border-2 border-[#f4f2e9]/20 hover:border-green-400 p-2 rounded-none maternal-shadow-sm bg-white/5"
                  title="Instagram @HMTS_UNIKOM"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Social connections newsletter box */}
          <div className="space-y-3">
            <span className="font-serif font-bold text-red-600 uppercase text-xs">ARCHIVE CORRESPONDENCE</span>
            <p className="text-[10px] text-gray-500 uppercase leading-relaxed">
              Daftarkan email Anda pada log telegram kami untuk mendapatkan perilisan katalog band dan aksesoris eksklusif pre-sale dari seller terverifikasi.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Email terdaftar sukses!"); }} className="flex mt-2">
              <input 
                type="email" 
                placeholder="you@email.com" 
                required 
                className="flex-grow bg-[#222222] border-none text-[11px] p-2 text-white focus:outline-none"
              />
              <button 
                type="submit" 
                className="bg-white text-black hover:bg-[#eae8de] font-bold px-3 py-2 text-[10px] flex items-center gap-1 cursor-pointer"
              >
                <span>REGISTER</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Legal licensing elements */}
        <div className="bg-[#0c0c0c] border-t border-gray-800 py-4 text-center text-[9px] text-gray-600 uppercase select-none">
          <span>© 2026 {String(settings?.appName || "TOKO SIPIL").toUpperCase()} ALTERNATIVE. COBLONG TECH LABS INC. ALL DESIGN INTELLECTUAL RESERVED.</span>
        </div>
      </footer>
      )}

      {/* Sliding Panes and Modal Overlays */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 font-mono">
          <CartDrawer 
            onClose={() => setCartOpen(false)} 
            onOpenCheckout={() => setCheckoutOpen(true)}
            onOpenAuth={() => setAuthOpen(true)}
          />
        </div>
      )}

      {chatOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 font-mono">
          <ChatDrawer onClose={() => setChatOpen(false)} />
        </div>
      )}

      {authOpen && (
        <AuthModal onClose={() => setAuthOpen(false)} />
      )}

      {checkoutOpen && (
        <CheckoutModal 
          onClose={() => { setCheckoutOpen(false); setSelectedPayOrder(null); }} 
          onSuccessPay={() => setActivePage('dashboard-user')}
          initialOrder={selectedPayOrder || undefined}
        />
      )}

      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onOpenChat={() => setChatOpen(true)}
          onOpenCheckout={() => {
            if (!currentUser) {
              setAuthOpen(true);
            } else {
              setCheckoutOpen(true);
            }
          }}
        />
      )}

      {/* Toast Notifications Panel */}
      <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full flex flex-col gap-3 pointer-events-none" id="global-toast-container">
        <AnimatePresence>
          {toasts && toasts.map((toast) => {
            let IconComponent = Info;
            let accentClass = "bg-blue-600";
            
            if (toast.type === "success") {
              IconComponent = CheckCircle2;
              accentClass = "bg-emerald-600";
            } else if (toast.type === "warning") {
              IconComponent = AlertTriangle;
              accentClass = "bg-amber-500";
            } else if (toast.type === "error") {
              IconComponent = XCircle;
              accentClass = "bg-rose-600";
            }

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
                className="pointer-events-auto w-full relative overflow-hidden bg-[#faf9f3] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 pr-10 flex gap-3.5 items-start select-none font-mono"
              >
                {/* Accent line on left side */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentClass}`} />
                
                <IconComponent className="w-5 h-5 text-black shrink-0 mt-0.5" />
                
                <div className="flex-grow space-y-1 text-left">
                  <h4 className="font-serif font-black text-xs uppercase tracking-tight text-black flex items-center gap-1.5">
                    {toast.title}
                  </h4>
                  <p className="text-[10px] leading-relaxed text-gray-700 uppercase">
                    {toast.message}
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-black transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Bar for Mobile and Tablet (Hidden on Desktop) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 rounded-t-[1.8rem] shadow-[0_-8px_30px_rgba(0,0,0,0.06)]" id="mobile-bottom-nav">
        <nav className="max-w-md mx-auto p-2 flex items-center justify-around">
          {/* Home */}
          <button
            onClick={() => navigateToPage('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 transition-all duration-200 cursor-pointer min-h-[44px] ${
              activePage === 'home'
                ? 'text-[#5856d6] bg-[#f2f1ff] font-bold scale-[1.02] rounded-2xl'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Home</span>
          </button>

          {/* Toko */}
          <button
            onClick={() => navigateToPage('shop')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 transition-all duration-200 cursor-pointer min-h-[44px] ${
              activePage === 'shop'
                ? 'text-[#5856d6] bg-[#f2f1ff] font-bold scale-[1.02] rounded-2xl'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Toko</span>
          </button>

          {/* Keranjang */}
          <button
            onClick={() => {
              setCartOpen(true);
              setChatOpen(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 transition-all duration-200 cursor-pointer min-h-[44px] relative ${
              cartOpen
                ? 'text-[#5856d6] bg-[#f2f1ff] font-bold scale-[1.02] rounded-2xl'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 mb-0.5" />
              {cart && cart.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#5856d6] text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                  {cart.length}
                </span>
              )}
            </div>
            <span className="text-[9px] uppercase tracking-wider font-bold">Keranjang</span>
          </button>

          {/* Riwayat */}
          <button
            onClick={() => {
              if (!currentUser) {
                setAuthOpen(true);
              } else {
                if (setUserDashboardInitialTab) {
                  setUserDashboardInitialTab('orders');
                }
                navigateToPage('dashboard-user');
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 transition-all duration-200 cursor-pointer min-h-[44px] ${
              activePage === 'dashboard-user' && userDashboardInitialTab === 'orders'
                ? 'text-[#5856d6] bg-[#f2f1ff] font-bold scale-[1.02] rounded-2xl'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Clock className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Riwayat</span>
          </button>

          {/* Profil */}
          <button
            onClick={() => {
              if (!currentUser) {
                setAuthOpen(true);
              } else {
                if (setUserDashboardInitialTab) {
                  setUserDashboardInitialTab('profile');
                }
                navigateToPage('dashboard-user');
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 transition-all duration-200 cursor-pointer min-h-[44px] ${
              activePage === 'dashboard-user' && userDashboardInitialTab !== 'orders'
                ? 'text-[#5856d6] bg-[#f2f1ff] font-bold scale-[1.02] rounded-2xl'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] uppercase tracking-wider font-bold">Profil</span>
          </button>
        </nav>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Analytics />
    </AppProvider>
  );
}
