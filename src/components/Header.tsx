/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { 
  Search, Heart, ShoppingBag, User, LogOut, ShieldCheck, 
  Store, MessageSquare, Menu, X, Terminal 
} from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAuth: () => void;
  onOpenChat: () => void;
}

export default function Header({ onOpenCart, onOpenWishlist, onOpenAuth, onOpenChat }: HeaderProps) {
  const { 
    currentUser, activePage, setActivePage, searchQuery, setSearchQuery, cart, wishlist, logout, stores 
  } = useApp();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (activePage !== 'shop' && e.target.value) {
      setActivePage('shop');
    }
  };

  const handleNavClick = (page: typeof activePage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#111111] text-white border-b-2 border-black tracking-wide" id="maternal-header">
      {/* Upper ticker tape */}
      <div className="bg-[#991b1b] text-[#f4f2e9] text-[10px] font-mono text-center py-1 select-none flex items-center justify-center gap-2 border-b border-black">
        <Terminal className="w-3.5 h-3.5 animate-pulse" />
        <span>ALT FASHION PLATFORM • FREE SHIPPING BANDUNG • INDONESIAN MULTI-VENDOR ARCHIVE</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <button 
            onClick={() => handleNavClick('home')}
            className="font-serif text-3xl font-bold tracking-tighter cursor-pointer text-white hover:text-red-600 transition duration-300"
          >
            TOKO SIPIL
          </button>

          {/* Nav links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 font-mono text-xs text-gray-300">
            <button 
              onClick={() => handleNavClick('home')}
              className={`hover:text-[#f4f2e9] transition ${activePage === 'home' ? 'text-white font-bold underline decoration-red-600 underline-offset-4' : ''}`}
            >
              HOME
            </button>
            <button 
              onClick={() => handleNavClick('shop')}
              className={`hover:text-[#f4f2e9] transition ${activePage === 'shop' ? 'text-white font-bold underline decoration-red-600 underline-offset-4' : ''}`}
            >
              SHOP
            </button>
            <button 
              onClick={() => handleNavClick('stores')}
              className={`hover:text-[#f4f2e9] transition ${activePage === 'stores' ? 'text-white font-bold underline decoration-red-600 underline-offset-4' : ''}`}
            >
              STORES
            </button>
            <button 
              onClick={() => handleNavClick('about')}
              className={`hover:text-[#f4f2e9] transition ${activePage === 'about' ? 'text-white font-bold underline decoration-red-600 underline-offset-4' : ''}`}
            >
              ABOUT
            </button>
            <button 
              onClick={() => handleNavClick('contact')}
              className={`hover:text-[#f4f2e9] transition ${activePage === 'contact' ? 'text-white font-bold underline decoration-red-600 underline-offset-4' : ''}`}
            >
              CONTACT
            </button>
            <a 
              href="https://hmts.useyapi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 font-bold tracking-wider transition-colors duration-200 flex items-center gap-1"
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
            className="w-full bg-[#222222] text-[#f4f2e9] text-xs font-mono placeholder-gray-500 py-1.5 pl-3 pr-8 rounded-none border border-gray-800 focus:outline-none focus:border-white transition-colors"
          />
          <Search className="w-4 h-4 text-gray-500 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Right Buttons: User panel, wishlist, bag, mobile toggle */}
        <div className="flex items-center gap-4.5">
          {/* Wishlist */}
          <button 
            onClick={onOpenWishlist}
            className="relative p-1 text-gray-400 hover:text-white transition cursor-pointer"
            id="wishlist-trigger-btn"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-mono leading-none rounded-full w-4 h-4 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Bag */}
          <button 
            onClick={onOpenCart}
            className="relative p-1 text-gray-400 hover:text-white transition cursor-pointer"
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
              onClick={onOpenChat}
              className="p-1 text-gray-400 hover:text-white transition cursor-pointer"
              id="chat-trigger-btn"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}

          {/* Account Profile Controller */}
          <div className="relative">
            {currentUser ? (
              <div className="flex items-center gap-2">
                
                <button 
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setMobileMenuOpen(false);
                  }}
                  className="w-8 h-8 rounded-none border border-gray-600 bg-[#333] hover:border-white transition overflow-hidden cursor-pointer flex items-center justify-center text-xs font-mono"
                  id="profile-dropdown-trigger"
                >
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    currentUser.name.substring(0, 2).toUpperCase()
                  )}
                </button>

                {/* Profile drop-down overlay menu */}
                {showProfileMenu && (
                   <div className="absolute right-0 top-11 bg-[#111111] border-2 border-black w-56 maternal-shadow-sm font-mono text-xs z-50">
                    <div className="p-3 border-b border-gray-800">
                      <p className="font-bold text-white truncate">{currentUser.name}</p>
                      <span className="text-[10px] text-gray-400 bg-gray-900 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider inline-block mt-1">
                        {currentUser.role.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Conditional Role-Based Panel Linkups */}
                    {currentUser.role === Role.SUPER_ADMIN && (
                      <button 
                        onClick={() => { setActivePage('dashboard-admin'); setShowProfileMenu(false); }}
                        className="w-full text-left px-3 py-2.5 text-gray-200 hover:bg-[#222] hover:text-white transition flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-red-500" />
                        SUPER ADMIN PANEL
                      </button>
                    )}

                    {currentUser.role === Role.PEGAWAI && (
                      <button 
                        onClick={() => { setActivePage('dashboard-admin'); setShowProfileMenu(false); }}
                        className="w-full text-left px-3 py-2.5 text-gray-200 hover:bg-[#222] hover:text-white transition flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-orange-500" />
                        STAFF MOD PANEL
                      </button>
                    )}

                    {(currentUser.role === Role.SELLER || (stores && stores.some(s => s.userId === currentUser.id))) && (
                      <button 
                        onClick={() => { setActivePage('dashboard-seller'); setShowProfileMenu(false); }}
                        className="w-full text-left px-3 py-2.5 text-gray-200 hover:bg-[#222] hover:text-white transition flex items-center gap-2"
                      >
                        <Store className="w-4 h-4 text-green-500" />
                        SELLER STORE DASH
                      </button>
                    )}

                    <button 
                      onClick={() => { setActivePage('dashboard-user'); setShowProfileMenu(false); }}
                      className="w-full text-left px-3 py-2.5 text-gray-200 hover:bg-[#222] hover:text-white transition flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      MY PROFILE & ORDERS
                    </button>

                    <button 
                      onClick={() => { logout(); setShowProfileMenu(false); }}
                      className="w-full text-left px-3 py-2.5 text-red-400 hover:bg-[#222] hover:text-red-300 transition border-t border-gray-800 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      LOGOUT ACCOUNT
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="bg-white text-black font-mono text-[10px] md:text-xs px-3 py-1 font-bold border-2 border-black hover:bg-[#111] hover:text-white hover:border-white transition-all cursor-pointer"
                id="login-btn"
              >
                LOGIN
              </button>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button 
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setShowProfileMenu(false);
            }}
            className="lg:hidden text-gray-400 hover:text-white cursor-pointer"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drop menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#111] border-b border-gray-800 p-4 font-mono text-xs flex flex-col gap-3">
          <div className="relative mb-2">
            <input 
              type="text" 
              placeholder="Search items..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-[#222] text-[#f4f2e9] text-xs py-1.5 pl-3 pr-8 rounded-none border border-gray-800"
            />
            <Search className="w-4 h-4 text-gray-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
          <button onClick={() => handleNavClick('home')} className="text-left py-1 hover:text-[#f4f2e9]">HOME</button>
          <button onClick={() => handleNavClick('shop')} className="text-left py-1 hover:text-[#f4f2e9]">SHOP</button>
          <button onClick={() => handleNavClick('stores')} className="text-left py-1 hover:text-[#f4f2e9]">STORES</button>
          <button onClick={() => handleNavClick('about')} className="text-left py-1 hover:text-[#f4f2e9]">ABOUT</button>
          <button onClick={() => handleNavClick('contact')} className="text-left py-1 hover:text-[#f4f2e9]">CONTACT</button>
          <a 
            href="https://hmts.useyapi.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-left py-1 text-red-400 font-bold hover:text-red-300 flex items-center gap-1"
          >
            HMTS WEBSITE ↗
          </a>
        </div>
      )}
    </header>
  );
}
