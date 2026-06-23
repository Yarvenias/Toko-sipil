/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, Tag, ChevronRight, ShoppingCart } from 'lucide-react';

interface CartDrawerProps {
  onClose: () => void;
  onOpenCheckout: () => void;
  onOpenAuth: () => void;
}

export default function CartDrawer({ onClose, onOpenCheckout, onOpenAuth }: CartDrawerProps) {
  const { 
    currentUser, cart, removeFromCart, updateCartQty, appliedVoucher, applyVoucherCode, removeVoucher 
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const cartSubtotal = cart.reduce((sum, item) => {
    const discountedPrice = item.product.price * (1 - item.product.discount / 100);
    return sum + (discountedPrice * item.quantity);
  }, 0);

  // Voucher calculation details
  let voucherValueText = 'Rp0';
  let totalWithVoucher = cartSubtotal;

  if (appliedVoucher) {
    let eligibleSubtotal = cartSubtotal;
    if (appliedVoucher.productId) {
      eligibleSubtotal = cart.filter(item => item.product.id === appliedVoucher.productId).reduce((sum, item) => {
        const discountedPrice = item.product.price * (1 - item.product.discount / 100);
        return sum + (discountedPrice * item.quantity);
      }, 0);
    } else if (appliedVoucher.storeId) {
      eligibleSubtotal = cart.filter(item => item.product.storeId === appliedVoucher.storeId).reduce((sum, item) => {
        const discountedPrice = item.product.price * (1 - item.product.discount / 100);
        return sum + (discountedPrice * item.quantity);
      }, 0);
    }

    if (appliedVoucher.discountType === 'NOMINAL') {
      const discount = Math.min(eligibleSubtotal, appliedVoucher.amount);
      voucherValueText = `-Rp${discount.toLocaleString('id-ID')}`;
      totalWithVoucher = Math.max(0, cartSubtotal - discount);
    } else {
      const discount = Math.round(eligibleSubtotal * (appliedVoucher.amount / 100));
      voucherValueText = `-Rp${discount.toLocaleString('id-ID')} (${appliedVoucher.amount}%)`;
      totalWithVoucher = Math.max(0, cartSubtotal - discount);
    }
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponError(null);
    setCouponSuccess(null);
    const err = await applyVoucherCode(couponCode);
    if (err) {
      setCouponError(err);
    } else {
      setCouponSuccess(`Voucher ${couponCode.toUpperCase()} berhasil diklaim diskon!`);
      setCouponCode('');
    }
  };

  const handleCheckoutClick = () => {
    if (!currentUser) {
      onOpenAuth();
    } else {
      onClose();
      onOpenCheckout();
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-[#f4f2e9] border-l-4 border-black maternal-shadow transition-transform duration-300 flex flex-col justify-between" id="maternal-cart-drawer">
      {/* Header section panel */}
      <div className="p-4 md:p-6 bg-[#111] text-white flex items-center justify-between border-b-2 border-black" id="cart-drawer-header">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-red-600" />
          <h2 className="font-serif text-xl font-bold uppercase tracking-tight">YOUR BAG CART</h2>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Cart Content lists */}
      <div className="flex-grow overflow-y-auto p-4 md:p-6 gap-4" id="cart-drawer-items-list">
        {cart.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center justify-center gap-4" id="cart-drawer-empty">
            <span className="font-mono text-xs text-gray-500 uppercase">Your clothing basket is fully empty</span>
            <p className="font-serif text-lg font-bold text-gray-700">ARSIP TAS KOSONG</p>
            <button 
              onClick={onClose}
              className="maternal-btn"
            >
              MULAI BELANJA
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item, idx) => {
              const discountedPrice = item.product.price * (1 - item.product.discount / 100);
              return (
                <div 
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="bg-white p-3.5 border-2 border-black maternal-shadow-sm flex gap-3 relative"
                >
                  {/* Photo mini preview */}
                  <div className="w-20 h-20 bg-gray-100 border border-black flex-shrink-0">
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Options & totals text */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-serif font-bold text-xs uppercase leading-tight line-clamp-1 truncate w-11/12">{item.product.name}</span>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                          className="text-red-700 hover:text-red-900 cursor-pointer"
                          title="Hapus item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      {/* Meta options chosen */}
                      <p className="font-mono text-[9px] text-gray-400 mt-0.5 uppercase">
                        Size: {item.selectedSize} | Color: {item.selectedColor}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                      {/* Qty edit input inline buttons */}
                      <div className="flex items-center gap-2 font-mono">
                        <button 
                          onClick={() => updateCartQty(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                          className="w-5 h-5 border border-black flex items-center justify-center text-xs hover:bg-black hover:text-white"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQty(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                          className="w-5 h-5 border border-black flex items-center justify-center text-xs hover:bg-black hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      {/* Display calculations list */}
                      <span className="font-mono text-xs font-bold text-black select-none">
                        Rp{(discountedPrice * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer totals summaries */}
      {cart.length > 0 && (
        <div className="p-4 md:p-6 bg-white border-t-4 border-black" id="cart-drawer-total-footer">
          {/* Coupon Form Area */}
          <form onSubmit={handleApplyCoupon} className="mb-4" id="coupon-entry-form">
            <span className="font-mono text-[10px] text-gray-500 font-bold block mb-1.5 uppercase">MASUKAN VOUCHER PLATFORM/TOKO</span>
            <div className="flex">
              <input 
                type="text" 
                placeholder="CONTOH: TOKO50 atau VOUCHER10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-grow bg-gray-50 text-xs font-mono py-1.5 px-2.5 border border-black placeholder-gray-400 uppercase rounded-none focus:outline-none"
              />
              <button 
                type="submit"
                className="bg-black text-white hover:bg-gray-800 text-xs font-mono font-bold px-3 py-1.5 border-y-2 border-r-2 border-black rounded-none cursor-pointer"
              >
                KLAIM
              </button>
            </div>
            {couponError && <p className="text-[10px] text-red-600 font-mono mt-1">{couponError}</p>}
            {couponSuccess && <p className="text-[10px] text-green-700 font-mono mt-1">{couponSuccess}</p>}
          </form>

          {/* Checkout pricing layout */}
          <div className="space-y-1.5 font-mono text-xs mb-4" id="checkout-pricing-summary">
            <div className="flex justify-between text-gray-600">
              <span>BAG SUBTOTAL:</span>
              <span>Rp{cartSubtotal.toLocaleString('id-ID')}</span>
            </div>

            {appliedVoucher ? (
              <div className="flex justify-between text-green-800 font-semibold bg-green-50 p-1 border border-green-200">
                <span className="flex items-center gap-1.5 uppercase">
                  <Tag className="w-3 h-3 text-green-700" />
                  KODE {appliedVoucher.code}:
                </span>
                <button 
                  type="button" 
                  onClick={removeVoucher}
                  className="text-red-700 font-bold ml-2 underline hover:text-red-900 cursor-pointer"
                >
                  REMOVE
                </button>
                <span className="font-mono">{voucherValueText}</span>
              </div>
            ) : (
              <div className="text-[9px] text-gray-400 flex items-center gap-1">
                <span>Tips: Gunakan <b>TOKO50</b> (belanja min. Rp300rb)</span>
              </div>
            )}

            <div className="border-t border-dashed border-gray-300 pt-2 flex justify-between font-bold text-black text-sm">
              <span>TOTAL ESTIMASI:</span>
              <span>Rp{totalWithVoucher.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button
            onClick={handleCheckoutClick}
            className="w-full text-center maternal-btn py-3.5 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
            id="checkout-drawer-btn"
          >
            <span>PROSES BAYAR CHECKOUT</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
          
          {!currentUser && (
            <p className="text-[9px] text-center text-red-700 font-mono font-bold mt-2 select-mono tracking-wider">
              *ANDA PERLU AUTENTIKASI MASUK TERLEBIH DAHULU UNTUK MEMESAN
            </p>
          )}
        </div>
      )}
    </div>
  );
}
