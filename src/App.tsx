/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
import InstagramFeed from './components/InstagramFeed';
import HelpCenter from './components/HelpCenter';
import LegalPolicies from './components/LegalPolicies';
import TrackOrder from './components/TrackOrder';
import { Sparkles, ArrowRight, Instagram, Mail, Info, Store, Heart, ShoppingBag, ShieldAlert } from 'lucide-react';

function AppContent() {
  const { 
    currentUser, activePage, setActivePage, stores, products, vouchers, 
    toggleFollowStore, followedStores, login, signup, authOpen, setAuthOpen
  } = useApp();

  // Overlay component states
  const [cartOpen, setCartOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPayOrder, setSelectedPayOrder] = useState<any | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [trackedOrderId, setTrackedOrderId] = useState<string>('');

  // Trigger simulated payment flow on pending or previous orders
  const handleOpenCheckoutWithOrder = (order: any) => {
    setSelectedPayOrder(order);
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f4f2e9] text-[#111111] font-sans antialiased selection:bg-red-800 selection:text-white" id="main-maternal-app">
      
      {/* Header Navigation Navigation Bar */}
      <Header 
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setActivePage('dashboard-user')}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenChat={() => setChatOpen(true)}
      />

      {/* Pages switcher Routing Layout */}
      <main className="flex-grow">
        {activePage === 'home' && (
          <div className="space-y-12 pb-16" id="home-view">
            
            {/* Automatic Carousel banners */}
            <HeroCarousel />

            {/* HMTS Integration Portal Section */}
            <section className="max-w-7xl mx-auto px-4 md:px-8" id="hmts-integration-banner">
              <div className="bg-gradient-to-r from-[#991b1b] to-black text-white border-2 border-black p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 maternal-shadow">
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
            <section className="max-w-7xl mx-auto px-4 md:px-8 mt-12 bg-[#111] text-[#faf9f3] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 maternal-shadow" id="band-lookbook">
              <div className="space-y-3.5 max-w-xl font-mono">
                <span className="bg-red-800 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase inline-block">FALL WINTER VOLUME RELEASES</span>
                <h3 className="font-serif text-3.5xl font-black text-white leading-tight uppercase tracking-tighter">RAW MEETS COUTURE</h3>
                <p className="text-xs text-gray-400 leading-relaxed uppercase">
                  Toko Sipil menyediakan dark, punk, dan hard-edged urban designs rooted securely di dalam estetika merchandise band. Connect dengan belasan vendor pilihan yang mendistribusikan barang original dengan escrow yang aman.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => setActivePage('shop')}
                    className="bg-white text-black font-extrabold hover:bg-transparent hover:text-white hover:border-white transition border-2 border-white px-5 py-2.5 text-xs tracking-wider cursor-pointer"
                  >
                    DISCOVER NOW
                  </button>
                </div>
              </div>

              <div className="w-full md:w-80 h-80 border-4 border-[#333] overflow-hidden maternal-shadow-sm flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500" 
                  alt="lookbook representation" 
                  className="w-full h-full object-cover grayscale"
                  referrerPolicy="no-referrer"
                />
              </div>
            </section>

          </div>
        )}

        {activePage === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8" id="catalog-view">
            {/* Renders ProductGrid loaded standalone with full categories sliders */}
            <ProductGrid 
              onSelectProduct={(p) => setSelectedProduct(p)} 
              standalone={true} 
            />
          </div>
        )}

        {activePage === 'stores' && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6" id="stores-view">
            <div>
              <h2 className="font-serif text-3.5xl font-extrabold uppercase tracking-tight">ACTIVE BRANDS REGISTRY</h2>
              <p className="font-mono text-[10px] text-gray-500 mt-1 uppercase">VERIFIED AND AUTHORIZED STREETWEAR VENDORS DISTRIBUTED WORLDWIDE</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {stores.map((s) => {
                const followingThis = followedStores.includes(s.id);
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
                      <span className="text-gray-400">{s.followersCount} Followers</span>
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
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-12" id="about-editorial-view">
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
          <div className="max-w-xl mx-auto px-4 md:px-8 py-12" id="contact-feedback-view">
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
            <DashboardAdmin />
          ) : (
            <div className="p-12 text-center text-red-800 font-mono text-sm leading-snug">
              <ShieldAlert className="w-10 h-10 inline-block text-red-800 mb-2" />
              <p className="font-bold">AKSES TIDAK DI-IZINKAN (FORBIDDEN)</p>
            </div>
          )
        )}

        {activePage === 'dashboard-seller' && (
          (currentUser?.role === Role.SELLER || (currentUser && stores.some(s => s.userId === currentUser.id))) ? (
            <DashboardSeller />
          ) : (
            <div className="p-12 text-center text-red-800 font-mono text-sm leading-snug">
              <ShieldAlert className="w-10 h-10 inline-block text-red-800 mb-2" />
              <p className="font-bold">AKSES TOKO BUTUH PERSETUJUAN SELLER AKTIF</p>
            </div>
          )
        )}

        {activePage === 'dashboard-user' && (
          <DashboardUser 
            onOpenCheckout={handleOpenCheckoutWithOrder} 
            onOpenStoreApply={() => {}} 
            onOpenChat={() => setChatOpen(true)}
            onTrackOrder={(id) => {
              setTrackedOrderId(id);
              setActivePage('track-order');
            }}
          />
        )}

        {activePage === 'instagram' && (
          <InstagramFeed />
        )}

        {activePage === 'help-center' && (
          <HelpCenter />
        )}

        {activePage === 'legal-policies' && (
          <LegalPolicies />
        )}

        {activePage === 'track-order' && (
          <TrackOrder 
            initialOrderId={trackedOrderId} 
            onBack={() => {
              setActivePage('dashboard-user');
              setTrackedOrderId('');
            }}
          />
        )}
      </main>

      {/* FOOTER: Minimalist Raw Gothic Streetstyle */}
      <footer className="bg-[#111111] text-[#f4f2e9] border-t-4 border-black font-mono text-xs select-none">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo identity column */}
          <div className="space-y-4">
            <span className="font-serif text-3xl font-bold tracking-tighter text-white">TOKO SIPIL Alternative</span>
            <p className="text-[10px] text-gray-500 uppercase leading-snug">
              Kavling Toko Sipil, Est 2026. Alt Fashion multi-vendor platform, supporting raw, independent, and high-fidelity streetwear designers.
            </p>
          </div>

          {/* Nav quick column */}
          <div className="space-y-2">
            <span className="font-serif font-bold text-red-600 uppercase text-xs">PORTAL DIRECTORY</span>
            <div className="flex flex-col gap-1 text-[10px] text-gray-400">
              <button onClick={() => setActivePage('home')} className="text-left hover:text-white transition cursor-pointer">Halaman Utama</button>
              <button onClick={() => setActivePage('shop')} className="text-left hover:text-white transition cursor-pointer">Katalog Rilis</button>
              <button onClick={() => setActivePage('stores')} className="text-left hover:text-white transition cursor-pointer">Daftar Store</button>
              <button onClick={() => setActivePage('about')} className="text-left hover:text-white transition cursor-pointer">Manifes Alternatif</button>
            </div>
          </div>

          {/* Help, Medsos and Legal layout quick links column */}
          <div className="space-y-2">
            <span className="font-serif font-bold text-red-605 uppercase text-xs">BANTUAN & MEDSOS</span>
            <div className="flex flex-col gap-1 text-[10px] text-gray-400">
              <button onClick={() => setActivePage('help-center')} className="text-left hover:text-white transition cursor-pointer">Pusat Bantuan (FAQ)</button>
              <button onClick={() => setActivePage('track-order')} className="text-left hover:text-white transition cursor-pointer text-amber-400 font-bold">Lacak Pengiriman 🚚</button>
              <button onClick={() => setActivePage('instagram')} className="text-left hover:text-white transition cursor-pointer">Instagram @hmts_unikom</button>
              <button onClick={() => setActivePage('legal-policies')} className="text-left hover:text-white transition cursor-pointer">Kebijakan & Syarat</button>
              <a href="https://www.instagram.com/hmts_unikom/" target="_blank" rel="noopener noreferrer" className="text-left hover:text-white transition cursor-pointer">Instagram (Eksternal) ↗</a>
            </div>
          </div>

          {/* Social connections newsletter box */}
          <div className="space-y-3">
            <span className="font-serif font-bold text-red-610 uppercase text-xs">ARCHIVE CORRESPONDENCE</span>
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
          <span>© 2026 TOKO SIPIL ALTERNATIVE. COBLONG TECH LABS INC. ALL DESIGN INTELLECTUAL RESERVED.</span>
        </div>
      </footer>

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
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
