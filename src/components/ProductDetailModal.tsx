/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Review } from '../types';
import { X, Heart, Star, ShoppingCart, ShieldCheck, Scale, Ruler, MessageSquare, CreditCard, ShoppingBag } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenChat: () => void;
  onOpenCheckout?: () => void;
}

export default function ProductDetailModal({ product, onClose, onOpenChat, onOpenCheckout }: ProductDetailModalProps) {
  const { 
    currentUser, addToCart, wishlist, toggleWishlist, followedStores, toggleFollowStore, refreshAllData, setAuthOpen 
  } = useApp();

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!product) return;
    
    // Reset inputs
    setActiveImgIndex(0);
    setSelectedSize(product.sizes[0] || 'All Size');
    setSelectedColor(product.colors[0] || 'N/A');
    setQty(1);
    setToastMessage(null);

    // Fetch Reviews from express
    fetch(`/api/products/${product.id}`)
      .then(r => {
        if (r.ok) return r.json();
        throw new Error();
      })
      .then(data => {
        if (data.reviews) {
          setProductReviews(data.reviews);
        }
      })
      .catch(() => {});

    // Follow status
    setIsFollowing(followedStores.includes(product.storeId));
  }, [product, followedStores]);

  if (!product) return null;

  const hasDiscount = product.discount > 0;
  const originalPrice = product.price;
  const netPrice = originalPrice * (1 - product.discount / 100);
  const isWishlisted = wishlist.includes(product.id);

  const handleFollowClick = async () => {
    if (!currentUser) {
      setToastMessage("Silakan login terlebih dahulu untuk mengikuti toko.");
      setTimeout(() => setAuthOpen(true), 1200);
      return;
    }
    const result = await toggleFollowStore(product.storeId);
    setIsFollowing(result);
    setToastMessage(result ? `Mengikuti ${product.storeName}` : `Batal mengikuti ${product.storeName}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddToCart = () => {
    if (!currentUser) {
      setToastMessage("Silakan login terlebih dahulu untuk mulai belanja dan menambahkan item.");
      setTimeout(() => setAuthOpen(true), 1200);
      return;
    }
    addToCart(product, qty, selectedSize, selectedColor);
    setToastMessage(`Sukses menambahkan ${qty} pcs ke keranjang belanja!`);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 2000);
  };

  const handleBuyNow = () => {
    if (!currentUser) {
      setToastMessage("Silakan login terlebih dahulu untuk checkout.");
      setTimeout(() => setAuthOpen(true), 1200);
      return;
    }
    if (product.stock === 0) {
      setToastMessage("Stok produk habis.");
      return;
    }
    // Tambahkan item yang dikonfigurasikan langsung ke keranjang
    addToCart(product, qty, selectedSize, selectedColor);
    setToastMessage(`Sukses menambahkan ke keranjang! Membuka halaman checkout...`);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
      if (onOpenCheckout) {
        onOpenCheckout();
      }
    }, 1200);
  };

  const handleChatSeller = async () => {
    if (!currentUser) {
      setToastMessage("Silakan login terlebih dahulu untuk chat penjual.");
      setTimeout(() => setAuthOpen(true), 1200);
      return;
    }
    try {
      const res = await fetch('/api/chats/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: currentUser.id, storeId: product.storeId })
      });
      if (res.ok) {
        const chat = await res.json();
        if (chat && chat.id) {
          localStorage.setItem('active_chat_id', chat.id);
          localStorage.setItem('active_chat_store_id', product.storeId);
        }
        onClose();
        onOpenChat();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-start md:items-center justify-center p-2 sm:p-4 overflow-y-auto py-6 sm:py-8" id="product-detail-overlay">
      <div className="bg-[#f4f2e9] border bg-brand-cream border-2 border-black max-w-5xl w-full h-auto md:max-h-[90vh] overflow-y-auto maternal-shadow-lg relative flex flex-col md:flex-row my-auto" id="product-detail-modal-card">
        {/* Close Button top-right */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-40 p-1 bg-black text-white hover:bg-red-800 transition border-2 border-black cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Images Workspace */}
        <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col gap-4 border-b-2 border-black md:border-b-0 md:border-r-2" id="detail-images-column">
          {/* Main Visual */}
          <div className="aspect-square w-full bg-white border-2 border-black relative overflow-hidden" id="main-preview-viewport">
            <img 
              src={product.images[activeImgIndex]} 
              alt={product.name}
              className="w-full h-full object-cover transition-all"
              referrerPolicy="no-referrer"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-red-600 border-2 border-black text-white text-xs font-mono font-bold py-1 px-2.5">
                -{product.discount}% EXCLUSIVE SAVINGS
              </span>
            )}
          </div>

          {/* Thumbnails list minimum 5 */}
          <div className="grid grid-cols-5 gap-2" id="thumbnails-list-panels">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImgIndex(idx)}
                className={`aspect-square w-full bg-white border cursor-pointer border-black relative overflow-hidden transition-all hover:scale-105 ${
                  idx === activeImgIndex ? 'ring-2 ring-red-700' : 'opacity-70'
                }`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Options & Actions Form info */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto" id="detail-buying-column">
          <div>
            {/* Store title & follow toggle button */}
            <div className="flex items-center justify-between border-b pb-4 border-gray-300">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5 uppercase">ALTLINE BRAND</span>
                <span className="font-serif font-bold text-sm tracking-tight text-gray-700">{product.storeName}</span>
              </div>
              <button
                onClick={handleFollowClick}
                className="font-mono text-[10px] px-2.5 py-1 border border-black hover:bg-black hover:text-[#fcfbf7] transition font-bold uppercase cursor-pointer"
              >
                {isFollowing ? '• LEAVE / UNFOLLOW' : '+ FOLLOW STORE'}
              </button>
            </div>

            {/* Display Title */}
            <div className="mt-4">
              <h2 className="font-serif text-2.5xl font-bold uppercase tracking-tight text-brand-obsidian leading-tight">
                {product.name}
              </h2>
              {/* SKU & Weight metadata */}
              <div className="flex items-center gap-4 mt-1.5 font-mono text-[10px] text-gray-400">
                <span className="text-gray-500">SKU: <span className="text-black select-all">{product.sku}</span></span>
                <span className="flex items-center gap-1"><Scale className="w-3 h-3" /> {product.weight}g weight</span>
              </div>

              {/* STARS Rating banner display */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="font-mono text-xs font-bold text-gray-500">4.8 Rating</span>
                <span className="text-gray-400 font-mono text-xs">• {productReviews.length} reviews</span>
              </div>
            </div>

            {/* Description Paragraph */}
            <div className="mt-4 font-sans text-xs text-gray-600 border-t border-b border-gray-300 py-3.5 leading-relaxed">
              <p>{product.description || 'Tidak ada deskripsi pendukung untuk produk fashion alternatif ini dari penjual.'}</p>
            </div>

            {/* Multi Options configuration */}
            <div className="mt-4 space-y-3.5" id="purchasing-options-control">
              {/* Sizing options selectors */}
              <div>
                <span className="font-mono text-[11px] font-bold text-gray-500 block mb-1.5 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5" /> SELECT SIZE ARCHIVE:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`font-mono text-xs px-3 py-1.5 border-2 transition cursor-pointer ${
                        selectedSize === sz 
                          ? 'border-black bg-black text-white font-bold' 
                          : 'border-gray-300 bg-white hover:border-black text-black'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color configurations */}
              <div>
                <span className="font-mono text-[11px] font-bold text-gray-500 block mb-1.5">COLORWAY SELECTOR:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.colors.map((clr) => (
                    <button
                      key={clr}
                      onClick={() => setSelectedColor(clr)}
                      className={`font-mono text-xs px-3 py-1.5 border-2 transition cursor-pointer ${
                        selectedColor === clr 
                          ? 'border-black bg-black text-white font-bold' 
                          : 'border-gray-300 bg-white hover:border-black text-black'
                      }`}
                    >
                      {clr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Qty Selector */}
              <div className="flex items-center justify-between bg-[#eae8de] p-3 border border-black font-mono mt-2">
                <span className="text-xs font-bold text-gray-500">QUANTITY COPIES:</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-6 h-6 bg-white text-black font-bold border border-black flex items-center justify-center hover:bg-black hover:text-white transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{qty}</span>
                  <button 
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    disabled={qty >= product.stock}
                    className="w-6 h-6 bg-white text-black font-bold border border-black flex items-center justify-center hover:bg-black hover:text-white transition disabled:opacity-30 cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] text-[#991b1b] font-bold">Stok: {product.stock} pcs</span>
              </div>
            </div>
          </div>

          {/* Pricing & Checkout Triggers */}
          <div className="mt-8 pt-4 border-t border-gray-300 gap-4" id="checkout-pricing-panel">
            {/* Dynamic toast line alert */}
            {toastMessage && (
              <div className="mb-3 bg-black text-[#f4f2e9] p-2 text-center text-xs font-mono font-bold animate-pulse maternal-border">
                {toastMessage}
              </div>
            )}

            {product.isPreOrder && (
              <div className="bg-amber-50 border-2 border-amber-400 p-3 rounded-none font-mono text-[10px] text-[#5c3e09] mb-4 uppercase leading-normal">
                <span className="font-extrabold text-amber-800 flex items-center gap-1">★ SISTEM PRE-ORDER (PO) AKTIF</span>
                <p className="mt-1 leading-relaxed">Produk ini diproduksi custom. Cukup bayar <b>DP {product.preOrderDpPercent}%</b> saat checkout. Pelunasan sisa dibayar setelah barang jadi.</p>
                <div className="flex justify-between items-center border-t border-amber-300 pt-2 mt-2">
                  <span>MENGURANGI BAYAR AWAL (DP):</span>
                  <span className="font-extrabold text-green-700 text-xs">Rp{(Math.round(netPrice * (product.preOrderDpPercent / 100)) * qty).toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-gray-500">ESTIMASI TOTAL:</span>
              <div className="text-right">
                {hasDiscount && (
                  <span className="line-through text-xs font-mono text-red-700 block text-right">
                    Rp{(originalPrice * qty).toLocaleString('id-ID')}
                  </span>
                )}
                <span className="font-mono text-xl font-bold block text-black">
                  Rp{(netPrice * qty).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Quick checkout CTA triggers */}
            <div className="flex flex-col gap-2 font-mono">
              {/* Beli Sekarang - Direct Primary Action */}
              <button
                disabled={product.stock === 0}
                onClick={handleBuyNow}
                className="w-full text-center bg-neutral-950 hover:bg-neutral-800 text-white border-2 border-black flex items-center justify-center gap-2 py-3.5 cursor-pointer font-extrabold uppercase transition duration-200 shadow-[3px_3px_0px_rgba(0,0,0,1)] select-none disabled:opacity-50"
                id="buy-now-direct-btn"
              >
                <CreditCard className="w-4 h-4 text-white" />
                <span>💳 BELI SEKARANG</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Masukkan Keranjang */}
                <button
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                  className="w-full text-center bg-white hover:bg-neutral-100 text-black border-2 border-black flex items-center justify-center gap-1.5 py-3 cursor-pointer font-bold uppercase transition duration-200 shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                  id="add-to-cart-drawer-btn"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>🛒 (+ KERANJANG)</span>
                </button>

                {/* Chat Seller */}
                <button
                  onClick={handleChatSeller}
                  className="w-full text-center maternal-btn-outline flex items-center justify-center gap-1.5 py-3 cursor-pointer uppercase text-xs"
                  id="initiate-chat-seller-btn"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>CHAT SELLER</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reviews List Section */}
          <div className="mt-10 border-t border-gray-300 pt-6">
            <h3 className="font-serif text-lg font-bold uppercase tracking-tight text-gray-800 mb-4 block">
              REVIEWS AND CUSTOMER VOICES ({productReviews.length})
            </h3>
            {productReviews.length === 0 ? (
              <p className="font-mono text-xs text-gray-400 italic">Belum ada review untuk produk ini.</p>
            ) : (
              <div className="space-y-4 max-h-56 overflow-y-auto pr-2 scrollbar-none">
                {productReviews.map((rev) => (
                  <div key={rev.id} className="bg-white p-3.5 border border-black text-xs">
                    <div className="flex items-center justify-between font-mono text-[10px] text-gray-500 mb-1.5">
                      <span className="font-bold text-black">{rev.buyerName}</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    {/* Stars rating */}
                    <div className="flex text-amber-500 mb-1 flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-[9px] text-gray-400 font-mono">({rev.rating}/5)</span>
                    </div>
                    <p className="font-sans text-gray-600 mt-1">{rev.text}</p>
                    
                    {/* Image inclusion on review panel */}
                    {rev.image && (
                      <div className="mt-2 text-left">
                        <img 
                          src={rev.image} 
                          alt="review preview" 
                          className="max-h-20 max-w-20 object-cover border border-black hover:scale-105 transition"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
