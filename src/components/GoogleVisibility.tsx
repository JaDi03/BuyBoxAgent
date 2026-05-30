import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  ExternalLink,
  Award,
  AlertTriangle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SerpResponse } from '@/lib/scraper/brightDataSerp';

interface GoogleVisibilityProps {
  serpData: SerpResponse | null;
  isLoading: boolean;
}

export default function GoogleVisibility({ serpData, isLoading }: GoogleVisibilityProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center min-h-[250px] space-y-4">
        <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-xs text-sky-400 font-bold uppercase tracking-wider">Analyzing Google Visibility</p>
          <p className="text-[11px] text-slate-500 mt-1">Fetching real-time rankings via Bright Data SERP API...</p>
        </div>
      </div>
    );
  }

  if (!serpData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center min-h-[250px] text-slate-500 text-center space-y-3">
        <Search className="w-8 h-8 text-slate-600" />
        <div>
          <h4 className="text-sm font-bold text-slate-350">Google Visibility Standby</h4>
          <p className="text-[11px] text-slate-400 mt-1">Run an analysis to examine search engine visibility and keyword rankings.</p>
        </div>
      </div>
    );
  }

  const { query, results, userProductRank, competitorsRanked, isMockData } = serpData;

  // Compute status metrics
  let seoStatus: 'excellent' | 'warning' | 'critical' = 'critical';
  let statusText = 'SEO Crítico: No detectado en los primeros resultados';
  let statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';

  if (userProductRank !== null) {
    if (userProductRank <= 3) {
      seoStatus = 'excellent';
      statusText = `SEO Excelente: Rank #${userProductRank} en Google`;
      statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    } else {
      seoStatus = 'warning';
      statusText = `SEO Aceptable: Rank #${userProductRank} en Google`;
      statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-sky-400" />
            Google Search Visibility Analysis
          </h3>
          <p className="text-[11px] text-slate-500">
            Target Keyword: <span className="font-mono text-slate-400">"{query} mercado libre"</span>
          </p>
        </div>
        
        {isMockData && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
            Simulated
          </span>
        )}
      </div>

      {/* Visibility Status Bar */}
      <div className={`p-3 rounded-lg border flex items-center gap-2.5 ${statusColor}`}>
        {seoStatus === 'excellent' && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />}
        {seoStatus === 'warning' && <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0" />}
        {seoStatus === 'critical' && <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0" />}
        <div>
          <span className="text-xs font-bold block">{statusText}</span>
          <span className="text-[9px] opacity-80 block">
            {seoStatus === 'excellent' && 'Tu producto goza de excelente visibilidad. Mantén el precio para cuidar el posicionamiento.'}
            {seoStatus === 'warning' && 'Competidores cercanos te están superando en ranking orgánico. Optimiza palabras clave.'}
            {seoStatus === 'critical' && 'Tu tienda no aparece en la primera página de Google. Tu CTR y ventas están en riesgo extremo.'}
          </span>
        </div>
      </div>

      {/* Organic Rankings Table */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Google Organic SERP (Top 5)</h4>
        
        <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
          {results.map((res) => {
            const isUserShop = userProductRank === res.rank;
            return (
              <div 
                key={res.rank}
                className={`p-3 rounded-lg border text-left transition ${
                  isUserShop 
                    ? 'bg-sky-500/5 border-sky-500/40 shadow-md shadow-sky-950/20' 
                    : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-start gap-2">
                    <span className={`text-[10px] font-mono font-bold flex items-center justify-center w-5 h-5 rounded ${
                      res.rank <= 3 ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {res.rank}
                    </span>
                    <div>
                      <h5 className={`text-xs font-bold line-clamp-1 ${isUserShop ? 'text-sky-300' : 'text-slate-200'}`}>
                        {res.title}
                      </h5>
                      <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                        {res.displayLink}
                        {isUserShop && <span className="text-[9px] text-sky-400 bg-sky-500/10 px-1 py-0.2 rounded font-bold uppercase ml-1">Tu Tienda</span>}
                      </span>
                    </div>
                  </div>
                  <a 
                    href={res.link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-slate-500 hover:text-sky-400 p-0.5"
                    title="Open Search Result Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                {res.snippet && (
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {res.snippet}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Competitors organic check */}
      {competitorsRanked.length > 0 && (
        <div className="pt-2 border-t border-slate-850">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">Competidores orgánicos en Google</span>
          <div className="flex flex-wrap gap-1.5">
            {competitorsRanked.map((comp, idx) => (
              <span 
                key={idx} 
                className="text-[9px] bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 text-slate-400 font-medium"
              >
                {comp.seller} (Rank #{comp.rank})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
