/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export default function HeroCarousel() {
  const { banners, setActivePage } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners]);

  if (banners.length === 0) {
    return (
      <div className="w-full h-80 md:h-[450px] bg-[#1a1a1a] flex items-center justify-center border-b-2 border-black">
        <span className="font-mono text-xs text-gray-500 animate-pulse">LOADING BANNERS ARCHIVE...</span>
      </div>
    );
  }

  const current = banners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full h-[300px] md:h-[480px] bg-[#111111] overflow-hidden border-b-2 border-black" id="hero-carousel-container">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out md:grayscale hover:grayscale-0 duration-550"
        style={{ backgroundImage: `url(${current.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-10 left-4 md:left-12 max-w-xl z-20 text-white flex flex-col items-start gap-4" id="carousel-info-overlay">
        <span className="font-mono text-[9px] md:text-xs bg-[#991b1b] text-white px-2 py-0.5 border border-black uppercase tracking-wider">
          PLATFORM FEATURED RELEASE
        </span>
        <h1 className="font-serif text-3.5xl md:text-5xl font-bold leading-tight uppercase font-medium tracking-tight">
          {current.title}
        </h1>
        <p className="font-sans text-xs md:text-sm text-gray-300">
          Eksplorasi koleksi rilisan eksklusif multi-vendor subaltern, gothic rock, dan underground clothing di Indonesia.
        </p>
        <button 
          onClick={() => setActivePage('shop')}
          className="maternal-btn flex items-center gap-1.5"
          id="cta-shop-now"
        >
          <Play className="w-4 h-4 fill-current text-black" />
          <span>SHOP NOW</span>
        </button>
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/80 hover:bg-white hover:text-black text-white p-1.5 border border-black transition cursor-pointer"
            id="carousel-prev"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/80 hover:bg-white hover:text-black text-white p-1.5 border border-black transition cursor-pointer"
            id="carousel-next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicators dots */}
          <div className="absolute bottom-4 right-4 md:right-12 z-30 flex items-center gap-1.5 font-mono text-[10px]">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-5 h-1 transition-all ${idx === currentIndex ? 'bg-[#991b1b]' : 'bg-gray-600'}`}
              ></button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
