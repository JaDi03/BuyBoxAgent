'use client';

import React, { useState, useEffect } from 'react';

// Bright Data Scraping Browser Terminal Logs Generator
export const getPresetLogs = (completed: boolean, count: number) => [
  '\x1b[34m[INFO]\x1b[0m Connecting to WebSocket proxy wss://brd.superproxy.io:9222...',
  '\x1b[32m[SUCCESS]\x1b[0m Secure tunnel established. Authenticating session credentials...',
  '\x1b[34m[INFO]\x1b[0m Target URL resolved: https://listado.mercadolibre.com.mx...',
  '\x1b[33m[SECURITY]\x1b[0m Activating Bright Data Bot-Detection bypass...',
  '\x1b[33m[SECURITY]\x1b[0m Bypassing WebGL fingerprints and Cloudflare Turnstile...',
  '\x1b[32m[SUCCESS]\x1b[0m Target page successfully unlocked and rendered.',
  '\x1b[34m[BROWSER]\x1b[0m Evaluating browser DOM query selectAll(".ui-search-layout__item")...',
  completed 
    ? `\x1b[32m[DATA]\x1b[0m Extracted ${count || 5} competitor products and pricing tiers.` 
    : '\x1b[34m[DATA]\x1b[0m Extracting product titles, ratings, prices, and shipping badges...',
  '\x1b[32m[SUCCESS]\x1b[0m Parsing complete. Payload successfully formatted. Closing session.',
];

interface TerminalProps {
  completed?: boolean;
  count?: number;
}

export default function BrightDataTerminal({ completed = false, count = 0 }: TerminalProps) {
  const initialLogs = getPresetLogs(completed, count);
  const [logs, setLogs] = useState<string[]>(
    completed ? initialLogs : [initialLogs[0]]
  );

  useEffect(() => {
    if (completed) return;
    let index = 1;
    const interval = setInterval(() => {
      const currentPreset = getPresetLogs(false, 0);
      if (index < currentPreset.length) {
        const nextLog = currentPreset[index];
        if (nextLog) {
          setLogs(prev => [...prev, nextLog]);
        }
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [completed]);

  return (
    <div className="w-full bg-slate-950 rounded-lg p-3.5 font-mono text-[10px] text-slate-300 border border-slate-850 shadow-inner mt-2 max-h-48 overflow-y-auto leading-relaxed">
      <div className="flex items-center justify-between pb-2 border-b border-slate-900 mb-2 bg-slate-950">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500/80"></span>
          <span className="w-2 h-2 rounded-full bg-amber-500/80"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Bright Data Scraping Browser Console</span>
      </div>
      <div className="space-y-1 select-all bg-slate-950">
        {logs.map((log, idx) => {
          if (!log) return null;
          let formattedLog = log
            .replace('\x1b[34m', '<span class="text-blue-400">')
            .replace('\x1b[32m', '<span class="text-emerald-400">')
            .replace('\x1b[33m', '<span class="text-amber-400">')
            .replace('\x1b[0m', '</span>');
          return (
            <div key={idx} dangerouslySetInnerHTML={{ __html: formattedLog }} />
          );
        })}
        {!completed && (
          <span className="inline-block w-1.5 h-3 bg-blue-400 animate-pulse ml-0.5 align-middle"></span>
        )}
      </div>
    </div>
  );
}
