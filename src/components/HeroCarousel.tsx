import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowUpRight } from 'lucide-react';

export default function HeroCarousel() {
  const { banners, setActivePage } = useApp();

  if (banners.length === 0) {
    return (
      <div className="w-full h-64 md:h-[400px] bg-brand-pine flex items-center justify-center border-b-4 border-black">
        <span className="font-mono text-xs text-brand-cream animate-pulse">LOADING BRAND HERO BANNER...</span>
      </div>
    );
  }

  // Display the first active banner as the main hero banner
  const current = banners[0];

  return (
    <div className="w-full border-b-4 border-black overflow-hidden relative" id="hero-banner-outer">
      <div 
        onClick={() => {
          if (current.url && current.url.startsWith('/')) {
            if (current.url === '/shop') setActivePage('shop');
          } else if (current.url) {
            window.open(current.url, '_blank');
          }
        }}
        className="w-full h-auto aspect-[21/9] md:aspect-[3/1] bg-brand-pine overflow-hidden cursor-pointer" 
        id="hero-banner-inner"
      >
        <img 
          src={current.image} 
          alt={current.title || "Toko Sipil Banner"} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

