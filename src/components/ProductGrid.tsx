/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { Star, Heart, ArrowUpDown, SlidersHorizontal, Eye } from 'lucide-react';

interface ProductGridProps {
  onSelectProduct: (product: Product) => void;
  standalone?: boolean; // if true, shows sorting headers and category row
}

export default function ProductGrid({ onSelectProduct, standalone = false }: ProductGridProps) {
  const { 
    products, categories, searchQuery, setSearchQuery, activeCategory, setActiveCategory, wishlist, toggleWishlist 
  } = useApp();

  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  // Filter & Sort core logic
  let filteredList = products.filter(p => p.isApproved !== false);

  // Category filter
  if (activeCategory) {
    filteredList = filteredList.filter(p => p.categoryId === activeCategory);
  }

  // Search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredList = filteredList.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q) ||
      p.storeName.toLowerCase().includes(q)
    );
  }

  // Frontend Sorting
  if (sortBy === 'price-asc') {
    filteredList.sort((a, b) => {
      const netA = a.price * (1 - a.discount / 100);
      const netB = b.price * (1 - b.discount / 100);
      return netA - netB;
    });
  } else if (sortBy === 'price-desc') {
    filteredList.sort((a, b) => {
      const netA = a.price * (1 - a.discount / 100);
      const netB = b.price * (1 - b.discount / 100);
      return netB - netA;
    });
  } else {
    // Newest first
    filteredList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return (
    <div className="w-full" id="product-grid-section">
      {/* Dynamic Filter / Navigation Bar when viewing full catalog */}
      {standalone && (
        <div className="mb-8 flex flex-col gap-4 border-b border-gray-300 pb-6" id="catalog-controls">
          {/* Subheader Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl font-bold uppercase tracking-tight">BLACK ARCHIVE CATALOG</h2>
              <p className="font-mono text-[10px] text-gray-500 mt-1">
                DISCOVER CRITICAL GOTHIC SILHOUETTES AND ACCESSORIES • {filteredList.length} RILISAN READY
              </p>
            </div>

            {/* Price Sorting controls */}
            <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs">
              <span className="text-gray-500 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>SORT BY:</span>
              </span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border-2 border-black px-2 py-1 focus:outline-none cursor-pointer"
                id="catalog-sort-select"
              >
                <option value="newest">NEW RELEASES</option>
                <option value="price-asc">PRICE: LOW TO HIGH</option>
                <option value="price-desc">PRICE: HIGH TO LOW</option>
              </select>
            </div>
          </div>

          {/* Catalog Categories Scroll Bar Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-3 py-1.5 transition ${!activeCategory ? 'bg-black text-white hover:bg-black/90' : 'bg-white hover:bg-black/10 text-black border border-gray-300'}`}
            >
              ALL RELEASES
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 transition whitespace-nowrap ${activeCategory === cat.id ? 'bg-black text-white hover:bg-black/90' : 'bg-white hover:bg-black/10 text-black border border-gray-300'}`}
              >
                {cat.name.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Search Result Status banner */}
          {searchQuery && (
            <div className="bg-[#111] text-white p-3 font-mono text-xs flex justify-between items-center">
              <span>Pencarian untuk: "{searchQuery}" ({filteredList.length} hasil)</span>
              <button 
                onClick={() => setSearchQuery('')}
                className="underline text-brand-sage hover:text-white text-[10px] cursor-pointer"
              >
                BERSIHKAN FILTER
              </button>
            </div>
          )}
        </div>
      )}

      {filteredList.length === 0 ? (
        <div className="text-center py-24 bg-[#eae8de] border-2 border-dashed border-gray-400 maternal-border flex flex-col items-center justify-center gap-4" id="empty-catalog-state">
          <p className="font-serif text-xl font-bold uppercase text-gray-700">ARSIP TIDAK DITEMUKAN</p>
          <p className="font-mono text-xs text-gray-500 max-w-sm">
            Tidak ada produk fashion di dalam database yang cocok dengan kriteria filter pencarian Anda saat ini.
          </p>
          <button 
            onClick={() => { setActiveCategory(''); setSearchQuery(''); }}
            className="maternal-btn"
          >
            LIHAT SEMUA PRODUK
          </button>
        </div>
      ) : (
        /* Dynamic Brutalist Catalog Grid Layout */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" id="products-gird-container">
          {filteredList.map((product) => {
            const hasDiscount = product.discount > 0;
            const originalPrice = product.price;
            const netPrice = originalPrice * (1 - product.discount / 100);
            const isWishlisted = wishlist.includes(product.id);

            return (
              <div 
                key={product.id}
                className="group relative bg-[#faf9f3] border-2 border-black hover:border-brand-forest transition duration-300 maternal-shadow-sm flex flex-col justify-between"
                id={`product-card-${product.id}`}
              >
                {/* Image Wrap */}
                <div className="relative aspect-square overflow-hidden bg-gray-100 border-b-2 border-black">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-550"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />

                  {/* Absolute badgelines: Discount factor */}
                  {hasDiscount && (
                    <div className="absolute top-2.5 left-2.5 bg-brand-forest text-brand-cream font-mono text-[9px] font-bold px-2 py-0.5 border border-black z-10 select-none">
                      -{product.discount}% OFF
                    </div>
                  )}

                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-mono text-xs font-bold leading-none select-none">
                      SOLD OUT
                    </div>
                  )}

                  {/* Top-right floating Wishlist and Quick Eye Preview triggers */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                      className={`p-1.5 border border-black maternal-shadow-sm transition cursor-pointer ${isWishlisted ? 'bg-brand-forest text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                      title={isWishlisted ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}
                      id={`wishlist-btn-${product.id}`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                    
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="p-1.5 bg-white border border-black text-black maternal-shadow-sm hover:bg-black hover:text-white transition cursor-pointer"
                      title="Quick Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info Text Area */}
                <div className="p-3.5 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Store Title Badge and SKU */}
                    <div className="flex items-center justify-between font-mono text-[9px] text-[#222] font-semibold mb-1">
                      <span className="uppercase text-gray-500 hover:underline cursor-pointer">{product.storeName}</span>
                      <span className="text-gray-400 select-all">{product.sku}</span>
                    </div>

                    {/* Headline */}
                    <h3 
                      onClick={() => onSelectProduct(product)}
                      className="font-serif text-sm md:text-md font-bold text-[#111] hover:text-red-700 cursor-pointer transition line-clamp-1 truncate block uppercase leading-snug"
                    >
                      {product.name}
                    </h3>

                    {/* Product reviews value stars */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="font-mono text-[9px] text-gray-400">4.8</span>
                    </div>
                  </div>

                  {/* Financials lines */}
                  <div className="mt-3.5 pt-2 border-t border-gray-200 flex items-baseline justify-between gap-1">
                    <div className="flex flex-col">
                      {hasDiscount && (
                        <span className="line-through text-[10px] font-mono text-gray-400">
                          Rp{originalPrice.toLocaleString('id-ID')}
                        </span>
                      )}
                      <span className="font-mono text-xs md:text-sm font-bold text-[#111]">
                        Rp{netPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                    
                    <button
                      disabled={product.stock === 0}
                      onClick={() => onSelectProduct(product)}
                      className={`font-mono text-[10px] px-2.5 py-1 border-2 border-black transition ${
                        product.stock === 0 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300' 
                          : 'bg-black text-white hover:bg-transparent hover:text-black cursor-pointer font-bold'
                      }`}
                    >
                      {product.stock === 0 ? 'OUT' : 'BUY'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
