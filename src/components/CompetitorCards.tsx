'use client';

import React from 'react';
import { PackageSearch, Bot } from 'lucide-react';
import BrightDataTerminal from './BrightDataTerminal';

interface CompetitorCardsProps {
  products: any[];
  companyName: string;
}

export default function CompetitorCards({ products, companyName }: CompetitorCardsProps) {
  return (
    <div className="mb-6 bg-slate-950/50 rounded-xl p-4 border border-slate-800/80">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <PackageSearch className="w-4.5 h-4.5 text-emerald-400" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Real-Time Extracted Data</h4>
          <p className="text-[10px] text-slate-500">Smart filtering via Bright Data Scraping Browser</p>
        </div>
      </div>
      
      {/* Grid of Competitors with Images and Details */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {products.slice(0, 6).map((product: any, idx: number) => {
          const isUserProduct = companyName && product.seller?.toLowerCase().includes(companyName.toLowerCase());
          return (
            <a 
              key={idx} 
              href={product.link} 
              target="_blank" 
              rel="noreferrer" 
              className={`flex gap-3 bg-slate-900 hover:bg-slate-850 border ${
                isUserProduct 
                  ? 'border-amber-500/40 bg-amber-500/[0.02]' 
                  : 'border-slate-800 hover:border-slate-700'
              } transition rounded-xl p-3.5 group relative overflow-hidden`}
            >
              {/* User product indicator badge */}
              {isUserProduct && (
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] px-2 py-0.5 rounded-bl font-bold uppercase tracking-wider">
                  Your Product
                </div>
              )}

              {/* Product Image */}
              <div className="w-16 h-16 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center border border-slate-800">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <PackageSearch className="w-8 h-8 text-slate-300" />
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {product.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {product.rating && (
                      <span className="text-[10px] text-amber-400 font-medium">
                        ⭐ {product.rating} <span className="text-slate-500">({product.reviewsCount || 0})</span>
                      </span>
                    )}
                    {product.bestSellerTag && (
                      <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded font-bold uppercase">BEST SELLER</span>
                    )}
                    {product.isSponsored && (
                      <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1 py-0.2 rounded font-medium">Promo</span>
                    )}
                  </div>
                </div>

                <div className="flex items-end justify-between mt-1">
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-slate-100">${product.price} MXN</span>
                      {product.discountPercentage && (
                        <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">{product.discountPercentage}</span>
                      )}
                    </div>
                    {product.originalPrice && (
                      <div className="text-[9px] text-slate-500 line-through">${product.originalPrice}</div>
                    )}
                  </div>

                  <div className="text-right flex flex-col items-end gap-0.5">
                    {(product.isFullShipping || product.isFull) && (
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        FULL
                      </span>
                    )}
                    {product.shippingSpeed && (
                      <span className="text-[9px] text-slate-400 truncate max-w-[90px]">{product.shippingSpeed}</span>
                    )}
                    {product.seller && (
                      <span className="text-[9px] text-slate-500 font-medium truncate max-w-[100px]">
                        By: {product.seller}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
      
      {/* Terminal logs history */}
      <div className="mt-4 pt-3 border-t border-slate-800/60">
        <details className="group">
          <summary className="text-[10px] text-slate-500 font-mono cursor-pointer hover:text-slate-350 transition list-none flex items-center gap-1 select-none">
            <span className="text-emerald-500 font-bold group-open:rotate-90 transition-transform">▶</span> View session logs (Bright Data Scraping Browser)
          </summary>
          <div className="mt-2">
            <BrightDataTerminal completed={true} count={products.length} />
          </div>
        </details>
      </div>
    </div>
  );
}
