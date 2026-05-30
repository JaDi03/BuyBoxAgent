'use client';

import React from 'react';
import { 
  User, 
  Tag, 
  DollarSign, 
  Award, 
  Truck, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Rocket 
} from 'lucide-react';

interface SellerProfileFormProps {
  companyName: string;
  setCompanyName: (val: string) => void;
  companyProduct: string;
  setCompanyProduct: (val: string) => void;
  companyPrice: string;
  setCompanyPrice: (val: string) => void;
  companyLevel: string;
  setCompanyLevel: (val: string) => void;
  companyShipping: string;
  setCompanyShipping: (val: string) => void;
  companyWarranty: string;
  setCompanyWarranty: (val: string) => void;
  profileExpanded: boolean;
  setProfileExpanded: (val: boolean) => void;
  isLoading: boolean;
  onStartAnalysis: () => void;
}

export default function SellerProfileForm({
  companyName,
  setCompanyName,
  companyProduct,
  setCompanyProduct,
  companyPrice,
  setCompanyPrice,
  companyLevel,
  setCompanyLevel,
  companyShipping,
  setCompanyShipping,
  companyWarranty,
  setCompanyWarranty,
  profileExpanded,
  setProfileExpanded,
  isLoading,
  onStartAnalysis
}: SellerProfileFormProps) {
  return (
    <div className="bg-slate-800/40 rounded-xl border border-slate-850 overflow-hidden transition-all shadow-lg backdrop-blur">
      <button 
        type="button"
        onClick={() => setProfileExpanded(!profileExpanded)}
        className="w-full p-4 flex items-center justify-between bg-slate-800/60 hover:bg-slate-800 transition border-b border-slate-700/50 text-left"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          Mi Perfil de Vendedor
        </span>
        {profileExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {profileExpanded ? (
        <div className="p-4 space-y-3.5">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
              <User className="w-3 h-3" /> Nombre de tu Tienda
            </label>
            <input 
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              placeholder="MiTienda MX"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
              <Tag className="w-3 h-3" /> Producto a Analizar
            </label>
            <input 
              type="text" 
              value={companyProduct}
              onChange={(e) => setCompanyProduct(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              placeholder="Ej. Termo Yeti 30oz"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
                <DollarSign className="w-3 h-3" /> Tu Precio (MXN)
              </label>
              <input 
                type="number" 
                value={companyPrice}
                onChange={(e) => setCompanyPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="800"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
                <Award className="w-3 h-3" /> Reputación
              </label>
              <select 
                value={companyLevel}
                onChange={(e) => setCompanyLevel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
                disabled={isLoading}
              >
                <option value="Sin medalla">Sin Medalla</option>
                <option value="MercadoLíder">MercadoLíder</option>
                <option value="MercadoLíder Gold">Gold</option>
                <option value="MercadoLíder Platinum">Platinum</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
                <Truck className="w-3 h-3" /> Tipo Envío
              </label>
              <select 
                value={companyShipping}
                onChange={(e) => setCompanyShipping(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
                disabled={isLoading}
              >
                <option value="Mercado Envíos FULL">Envío FULL</option>
                <option value="Mercado Envíos Colecta">Normal (Colecta)</option>
                <option value="Mercado Envíos Flex">Flex (Rápido)</option>
                <option value="Acordar con vendedor">Acordar</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
                <ShieldCheck className="w-3 h-3" /> Garantía
              </label>
              <select 
                value={companyWarranty}
                onChange={(e) => setCompanyWarranty(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
                disabled={isLoading}
              >
                <option value="Sin garantía">Sin Garantía</option>
                <option value="30 días de garantía">30 días</option>
                <option value="90 días de garantía">90 días</option>
                <option value="1 año de garantía">1 año</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={onStartAnalysis}
            disabled={isLoading || !companyProduct.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-purple-950/20 active:scale-[0.98]"
          >
            <Rocket className="w-3.5 h-3.5" />
            Iniciar Análisis de Mercado
          </button>
        </div>
      ) : (
        <div className="p-3 text-[11px] text-slate-400 bg-slate-900/30 flex justify-between items-center">
          <span className="truncate font-semibold text-slate-300 max-w-[120px]">{companyName}</span>
          <span className="text-emerald-400 font-bold">${companyPrice} MXN</span>
          <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] border border-slate-750 text-slate-300">
            {companyShipping.replace('Mercado Envíos ', '')}
          </span>
        </div>
      )}
    </div>
  );
}
