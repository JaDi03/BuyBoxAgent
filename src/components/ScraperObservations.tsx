'use client';

import React from 'react';
import { PackageSearch, Activity } from 'lucide-react';

interface ScraperObservationsProps {
  messages: any[];
}

export default function ScraperObservations({ messages }: ScraperObservationsProps) {
  // Extract all tool invocations from messages
  const hasToolCalls = messages.some(m => m.toolInvocations && m.toolInvocations.length > 0);

  return (
    <div className="space-y-3.5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 select-none">Observaciones del Scraper</h3>
      
      <div className="space-y-3">
        {messages.map(m => (
          m.toolInvocations?.map((toolInvocation: any) => {
            const toolCallId = toolInvocation.toolCallId;
            const isFinished = 'result' in toolInvocation;

            return (
              <div key={toolCallId} className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800/80 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1 uppercase tracking-wider">
                    <PackageSearch className="w-3.5 h-3.5" />
                    {toolInvocation.toolName}
                  </span>
                  {isFinished ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.8)]"></span>
                  )}
                </div>
                
                <div className="text-[11px] text-slate-300 font-mono bg-slate-950 p-2.5 rounded border border-slate-900 overflow-x-auto">
                  <span className="text-slate-500">{'>'} Query: </span>
                  <span className="text-emerald-400">"{toolInvocation.args.searchQuery}"</span>
                  <br />
                  <span className="text-slate-500">{'>'} Range: </span>
                  <span className="text-emerald-400">{toolInvocation.args.minPrice}-{toolInvocation.args.maxPrice} MXN</span>
                </div>

                {isFinished && (
                  <div className="text-[10px] text-slate-400 flex justify-between items-center pt-1 border-t border-slate-800">
                    <span>Status: <strong className={toolInvocation.result.success ? "text-emerald-400" : "text-rose-400"}>{toolInvocation.result.success ? "Completado" : "Error"}</strong></span>
                    <span>Competidores: <strong>{toolInvocation.result.data?.length || 0}</strong></span>
                  </div>
                )}
              </div>
            );
          })
        ))}
        
        {!hasToolCalls && (
          <div className="text-center text-slate-600 py-6 text-xs flex flex-col items-center select-none">
            <Activity className="w-6 h-6 mb-2 opacity-15" />
            Orquestador inactivo. Lanza un análisis para observar los logs.
          </div>
        )}
      </div>
    </div>
  );
}
