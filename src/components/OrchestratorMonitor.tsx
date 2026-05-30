'use client';

import React from 'react';
import { 
  Activity, 
  PackageSearch, 
  Bot, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

interface OrchestratorMonitorProps {
  agent1State: 'idle' | 'running' | 'done' | 'error';
  agent2State: 'idle' | 'running' | 'done' | 'error';
  scrapedCompetitorsCount: number;
}

export default function OrchestratorMonitor({
  agent1State,
  agent2State,
  scrapedCompetitorsCount
}: OrchestratorMonitorProps) {
  return (
    <div className="bg-slate-850/50 rounded-xl border border-slate-805 p-4 space-y-3.5 shadow-lg">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 select-none">
        <Activity className="w-4 h-4 text-emerald-400" />
        Orquestador de Agentes
      </h3>
      
      <div className="space-y-3">
        {/* Agent 1 Status */}
        <div className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${
              agent1State === 'running' 
                ? 'bg-blue-500/10 text-blue-400' 
                : agent1State === 'done' 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-slate-800 text-slate-500'
            }`}>
              <PackageSearch className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">1. ScraperAgent</h4>
              <p className="text-[10px] text-slate-500">Bright Data Extractor</p>
            </div>
          </div>
          <div>
            {agent1State === 'idle' && (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">Espera</span>
            )}
            {agent1State === 'running' && (
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-800 animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></span>
                Scraping...
              </span>
            )}
            {agent1State === 'done' && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                Listo ({scrapedCompetitorsCount})
              </span>
            )}
            {agent1State === 'error' && (
              <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-800 flex items-center gap-1 font-semibold">
                <XCircle className="w-3 h-3" />
                Error
              </span>
            )}
          </div>
        </div>

        {/* Agent 2 Status */}
        <div className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${
              agent2State === 'running' 
                ? 'bg-purple-500/10 text-purple-400' 
                : agent2State === 'done' 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-slate-800 text-slate-500'
            }`}>
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">2. StrategyAgent</h4>
              <p className="text-[10px] text-slate-500">Gemini Competitor Analyst</p>
            </div>
          </div>
          <div>
            {agent2State === 'idle' && (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">Espera</span>
            )}
            {agent2State === 'running' && (
              <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-800 animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping"></span>
                Analizando...
              </span>
            )}
            {agent2State === 'done' && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                Completado
              </span>
            )}
            {agent2State === 'error' && (
              <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-800 flex items-center gap-1 font-semibold">
                <XCircle className="w-3 h-3" />
                Error
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
