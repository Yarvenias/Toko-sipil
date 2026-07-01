/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { 
  Search, Heart, ShoppingBag, User, LogOut, ShieldCheck, 
  Store, MessageSquare, Menu, X, Terminal, Instagram, Bell 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAuth: () => void;
  onOpenChat: () => void;
}

export default function Header({ onOpenCart, onOpenWishlist, onOpenAuth, onOpenChat }: HeaderProps) {
  const { 
    currentUser, activePage, setActivePage, searchQuery, setSearchQuery, cart, wishlist, logout, stores, settings, setUserDashboardInitialTab,
    userSidebarCollapsed, setUserSidebarCollapsed, userMobileSidebarOpen, setUserMobileSidebarOpen,
    sellerSidebarCollapsed, setSellerSidebarCollapsed, sellerMobileSidebarOpen, setSellerMobileSidebarOpen
  } = useApp();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/notifications?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/notifications/read-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (activePage !== 'shop' && e.target.value) {
      setActivePage('shop');
    }
  };

  const handleNavClick = (page: typeof activePage) => {
    setActivePage(page);
  };

  const handleWishlistClick = () => {
    if (setUserDashboardInitialTab) {
      setUserDashboardInitialTab('wishlist');
    }
    setActivePage('dashboard-user');
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-pine text-white border-b-2 border-black tracking-wide" id="maternal-header">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-0 flex-1 lg:flex-initial">
          {/* Hamburger button for dashboard sidebars */}
          {(activePage === 'dashboard-user' || activePage === 'dashboard-seller') && (
            <button
              onClick={() => {
                if (activePage === 'dashboard-user') {
                  if (window.innerWidth < 1024) {
                    setUserMobileSidebarOpen(!userMobileSidebarOpen);
                  } else {
                    setUserSidebarCollapsed(!userSidebarCollapsed);
                  }
                } else if (activePage === 'dashboard-seller') {
                  if (window.innerWidth < 1024) {
                    setSellerMobileSidebarOpen(!sellerMobileSidebarOpen);
                  } else {
                    setSellerSidebarCollapsed(!sellerSidebarCollapsed);
                  }
                }
              }}
              className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors flex items-center justify-center flex-shrink-0"
              title="Toggle Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 md:gap-2.5 font-sans text-base sm:text-lg md:text-xl lg:text-2xl font-black tracking-tighter cursor-pointer text-white hover:text-green-400 transition duration-300 group flex-shrink-0 min-w-0"
          >
            <img 
              src={settings?.appLogo || "/src/assets/images/toko_sipil_logo_1781875832848.jpg"} 
              alt={settings?.appName || "Logo Toko Sipil"} 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-gray-700 object-cover group-hover:scale-105 transition flex-shrink-0"
              referrerPolicy="no-referrer"
            />
            <span className="truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] md:max-w-none">{String(settings?.appName || "TOKO SIPIL").toUpperCase()}</span>
          </button>

          {/* Nav links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 font-sans text-xs tracking-wider">
            <button 
              onClick={() => handleNavClick('home')}
              className={`text-white hover:text-green-400 transition cursor-pointer ${activePage === 'home' ? 'font-bold underline decoration-green-400 underline-offset-4' : ''}`}
            >
              HOME
            </button>
            <button 
              onClick={() => handleNavClick('shop')}
              className={`text-white hover:text-green-400 transition cursor-pointer ${activePage === 'shop' ? 'font-bold underline decoration-green-400 underline-offset-4' : ''}`}
            >
              SHOP
            </button>
            <button 
              onClick={handleWishlistClick}
              className={`text-white hover:text-green-400 transition cursor-pointer ${activePage === 'dashboard-user' ? 'font-bold underline decoration-green-400 underline-offset-4' : ''}`}
            >
              WISHLIST
            </button>
            <button 
              onClick={() => handleNavClick('stores')}
              className={`text-white hover:text-green-400 transition cursor-pointer ${activePage === 'stores' ? 'font-bold underline decoration-green-400 underline-offset-4' : ''}`}
            >
              STORES
            </button>
            <button 
              onClick={() => handleNavClick('about')}
              className={`text-white hover:text-green-400 transition cursor-pointer ${activePage === 'about' ? 'font-bold underline decoration-green-400 underline-offset-4' : ''}`}
            >
              ABOUT
            </button>
            <button 
              onClick={() => handleNavClick('contact')}
              className={`text-white hover:text-green-400 transition cursor-pointer ${activePage === 'contact' ? 'font-bold underline decoration-green-400 underline-offset-4' : ''}`}
            >
              CONTACT
            </button>
            <button 
              onClick={() => handleNavClick('android-builder')}
              className={`text-white hover:text-green-400 tracking-wider transition cursor-pointer ${activePage === 'android-builder' ? 'font-bold underline decoration-green-400 underline-offset-4' : ''}`}
            >
              ANDROID APP 📱
            </button>
            <a 
              href="https://hmts.useyapi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-green-400 font-bold tracking-wider transition-colors duration-200 flex items-center gap-1"
            >
              HMTS WEB ↗
            </a>
          </nav>
        </div>

        {/* Middle: Integrated Realtime Search bar */}
        <div className="hidden md:flex items-center max-w-sm w-full relative" id="header-search">
          <input 
            type="text" 
            placeholder="Search items, categories, stores..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-brand-forest/20 text-white text-xs font-sans placeholder-white/40 py-1.5 pl-3 pr-8 rounded-none border border-white/20 focus:outline-none focus:border-green-400 transition-colors"
          />
          <Search className="w-4 h-4 text-white/40 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Right Buttons: User panel, wishlist, bag, mobile toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-4 flex-shrink-0">
          {/* Mobile Search Icon */}
          <button 
            onClick={() => {
              setShowMobileSearch(!showMobileSearch);
              setShowNotifMenu(false);
              setShowProfileMenu(false);
            }}
            className="md:hidden p-1 text-white hover:text-green-400 transition cursor-pointer flex items-center justify-center"
            id="mobile-search-trigger"
            title="Cari Produk"
          >
            <Search className="w-5 h-5" />
          </button>
          {/* Instagram Link (Desktop only) */}
          <a
            href="https://www.instagram.com/hmts_unikom/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex p-1 text-white hover:text-green-400 transition cursor-pointer items-center justify-center"
            title="Instagram HMTS Unikom"
          >
            <Instagram className="w-5 h-5 transition-colors duration-250" />
          </a>

          {/* Wishlist */}
          <button 
            onClick={() => {
              setShowNotifMenu(false);
              setShowProfileMenu(false);
              onOpenWishlist();
            }}
            className="relative p-1 text-white hover:text-green-400 transition cursor-pointer"
            id="wishlist-trigger-btn"
          >
            <Heart className="w-5 h-5 transition-colors duration-250" />
            <AnimatePresence mode="popLayout">
              {wishlist.length > 0 && (
                <motion.span 
                  key={wishlist.length}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 450, 
                    damping: 14
                  }}
                  className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-mono font-bold leading-none rounded-full w-[17px] h-[17px] flex items-center justify-center border border-black shadow-[1px_1px_0px_rgba(0,0,0,1)] select-none pointer-events-none"
                >
                  {wishlist.length}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Bag */}
          <button 
            onClick={() => {
              setShowNotifMenu(false);
              setShowProfileMenu(false);
              onOpenCart();
            }}
            className="relative p-1 text-white hover:text-green-400 transition cursor-pointer"
            id="cart-trigger-btn"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-mono leading-none rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* Realtime Chat Button */}
          {currentUser && (
            <button 
              onClick={() => {
                setShowNotifMenu(false);
                setShowProfileMenu(false);
                onOpenChat();
              }}
              className="p-1 text-white hover:text-green-400 transition cursor-pointer"
              id="chat-trigger-btn"
              title="Pesan"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}

          {/* Notification Button & Popover */}
          {currentUser && (
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowProfileMenu(false);
                }}
                className="relative p-1 text-white hover:text-green-400 transition cursor-pointer flex items-center justify-center"
                id="notif-trigger-btn"
                title="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-mono leading-none rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-11 bg-white border-2 border-black sm:w-80 maternal-shadow text-black font-mono text-xs z-50">
                  <div className="p-3 border-b-2 border-black bg-neutral-100 flex justify-between items-center">
                    <span className="font-bold uppercase tracking-wider text-black">NOTIFIKASI AKTIVITAS</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] text-green-700 hover:underline font-bold uppercase cursor-pointer"
                      >
                        Tandai Semua Dibaca
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-200">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-[11px] uppercase">
                        Tidak ada notifikasi baru.
                      </div>
                    ) : (
                      [...notifications].reverse().map((notif) => (
                        <div 
                          key={notif.id}
                          onClick={() => {
                            markAsRead(notif.id);
                            if (notif.link) {
                              if (notif.link.includes('chats')) {
                                if (currentUser.role === Role.SELLER) {
                                  setActivePage('dashboard-seller');
                                  // Switch to chat tab
                                  const chatsTab = document.querySelector('[id*="chats"]');
                                  if (chatsTab) (chatsTab as any).click();
                                } else {
                                  onOpenChat();
                                }
                              } else if (notif.type === 'ORDER') {
                                if (currentUser.role === Role.SELLER) {
                                  setActivePage('dashboard-seller');
                                } else {
                                  setActivePage('dashboard-user');
                                }
                              } else if (notif.type === 'PRODUCT') {
                                if (currentUser.role === Role.SELLER || currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.PEGAWAI) {
                                  setActivePage(currentUser.role === Role.SELLER ? 'dashboard-seller' : 'dashboard-admin');
                                }
                              }
                            }
                            setShowNotifMenu(false);
                          }}
                          className={`p-3 text-left transition-colors cursor-pointer hover:bg-neutral-50 ${!notif.isRead ? 'bg-amber-50/50 font-bold border-l-4 border-black' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-1 mb-1">
                            <span className="font-bold text-xs text-black block truncate pr-2 uppercase">
                              {notif.title}
                            </span>
                            <span className="text-[8px] text-gray-400 shrink-0 font-mono">
                              {new Date(notif.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-sans leading-normal">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Account Profile Controller */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifMenu(false);
              }}
              className="w-8 h-8 rounded-none border border-gray-600 bg-[#333] hover:border-white transition overflow-hidden cursor-pointer flex items-center justify-center text-xs font-mono text-white"
              id="profile-dropdown-trigger"
              title="Menu Profil"
            >
              {currentUser ? (
                currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  currentUser.name.substring(0, 2).toUpperCase()
                )
              ) : (
                <User className="w-5 h-5" />
              )}
            </button>

            {/* Profile Dropdown Overlay */}
            {showProfileMenu && (
              <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-11 bg-[#111111] border-2 border-black sm:w-64 maternal-shadow-sm font-mono text-xs z-50">
                {currentUser ? (
                  <div className="p-3 border-b border-gray-800">
                    <p className="font-bold text-white truncate">{currentUser.name}</p>
                    <span className="text-[10px] text-gray-400 bg-gray-900 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider inline-block mt-1">
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 border-b border-gray-800">
                    <p className="font-bold text-white uppercase">TOKO SIPIL MENU</p>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAuth();
                      }}
                      className="mt-2 w-full text-center bg-white text-black font-mono text-xs py-2 font-bold border-2 border-black hover:bg-[#111] hover:text-white transition cursor-pointer"
                    >
                      MASUK / LOGIN
                    </button>
                  </div>
                )}

                {/* Mobile Navigation Links (Unified in Profile Dropdown) */}
                <div className="lg:hidden p-2 border-b border-gray-800 flex flex-col gap-1 text-gray-300">
                  <div className="text-[10px] text-gray-500 font-bold tracking-wider uppercase px-2 py-1">MENU UTAMA</div>
                  <button 
                    onClick={() => { setActivePage('home'); setShowProfileMenu(false); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#222] hover:text-white transition flex items-center gap-2"
                  >
                    HOME
                  </button>
                  <button 
                    onClick={() => { setActivePage('shop'); setShowProfileMenu(false); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#222] hover:text-white transition flex items-center gap-2"
                  >
                    SHOP / CATALOG
                  </button>
                  <button 
                    onClick={() => { onOpenWishlist(); setShowProfileMenu(false); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#222] hover:text-white transition flex items-center gap-2"
                  >
                    WISHLIST ({wishlist.length})
                  </button>
                  <button 
                    onClick={() => { setActivePage('stores'); setShowProfileMenu(false); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#222] hover:text-white transition flex items-center gap-2"
                  >
                    STORES
                  </button>
                  <button 
                    onClick={() => { setActivePage('about'); setShowProfileMenu(false); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#222] hover:text-white transition flex items-center gap-2"
                  >
                    ABOUT US
                  </button>
                  <button 
                    onClick={() => { setActivePage('contact'); setShowProfileMenu(false); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#222] hover:text-white transition flex items-center gap-2"
                  >
                    CONTACT SUPPORT
                  </button>
                  <button 
                    onClick={() => { setActivePage('android-builder'); setShowProfileMenu(false); }}
                    className="w-full text-left px-2 py-1.5 text-amber-400 hover:bg-[#222] hover:text-amber-300 transition flex items-center gap-2 font-bold"
                  >
                    DOWNLOAD ANDROID APP 📱
                  </button>
                  <a 
                    href="https://hmts.useyapi.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full text-left px-2 py-1.5 text-red-400 hover:bg-[#222] hover:text-red-300 transition flex items-center gap-2 font-bold"
                  >
                    HMTS WEBSITE ↗
                  </a>
                </div>

                {currentUser && (
                  <div className="p-2 flex flex-col gap-1">
                    <div className="text-[10px] text-gray-500 font-bold tracking-wider uppercase px-2 py-1">AKUN SAYA</div>
                    
                    {/* Conditional Role-Based Panel Linkups */}
                    {currentUser.role === Role.SUPER_ADMIN && (
                      <button 
                        onClick={() => { setActivePage('dashboard-admin'); setShowProfileMenu(false); }}
                        className="w-full text-left px-2 py-1.5 text-gray-200 hover:bg-[#222] hover:text-white transition flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-red-500" />
                        SUPER ADMIN PANEL
                      </button>
                    )}

                    {currentUser.role === Role.PEGAWAI && (
                      <button 
                        onClick={() => { setActivePage('dashboard-admin'); setShowProfileMenu(false); }}
                        className="w-full text-left px-2 py-1.5 text-gray-200 hover:bg-[#222] hover:text-white transition flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-orange-500" />
                        STAFF MOD PANEL
                      </button>
                    )}

                    {(currentUser.role === Role.SELLER || (stores && stores.some(s => s.userId === currentUser.id))) && (
                      <button 
                        onClick={() => { setActivePage('dashboard-seller'); setShowProfileMenu(false); }}
                        className="w-full text-left px-2 py-1.5 text-gray-200 hover:bg-[#222] hover:text-white transition flex items-center gap-2"
                      >
                        <Store className="w-4 h-4 text-green-500" />
                        SELLER STORE DASH
                      </button>
                    )}

                    <button 
                      onClick={() => { setActivePage('dashboard-user'); setShowProfileMenu(false); }}
                      className="w-full text-left px-2 py-1.5 text-gray-200 hover:bg-[#222] hover:text-white transition flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      MY PROFILE & ORDERS
                    </button>

                    <button 
                      onClick={() => { onOpenChat(); setShowProfileMenu(false); }}
                      className="w-full text-left px-2 py-1.5 text-cyan-400 hover:bg-[#222] hover:text-cyan-300 transition flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      CHAT MESSAGES
                    </button>

                    <button 
                      onClick={() => { 
                        if (confirm("Apakah anda yakin untuk logout?")) {
                          logout(); 
                        }
                        setShowProfileMenu(false); 
                      }}
                      className="w-full text-left px-2 py-1.5 text-red-400 hover:bg-[#222] hover:text-red-300 transition border-t border-gray-800 flex items-center gap-2 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      LOGOUT ACCOUNT
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Expansion */}
      {showMobileSearch && (
        <div className="md:hidden bg-brand-forest/95 border-t border-white/10 px-4 py-3 flex items-center z-40 transition-all duration-300">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Cari produk, kategori, toko..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-black/30 text-white text-xs font-sans placeholder-white/40 py-2 pl-3 pr-8 rounded-none border border-white/20 focus:outline-none focus:border-green-400"
              autoFocus
            />
            <button
              onClick={() => {
                setSearchQuery("");
                setShowMobileSearch(false);
              }}
              className="absolute right-2.5 top-2.5 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
