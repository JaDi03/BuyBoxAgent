'use client';

import React, { useState } from 'react';
import { AlertTriangle, Sparkles, Info, Check, Copy, CheckSquare } from 'lucide-react';

interface StrategyReportProps {
  content: string;
}

interface Block {
  type: 'text' | 'table' | 'alert' | 'checklist' | 'header';
  lines: string[];
  alertType?: 'NOTE' | 'TIP' | 'WARNING' | 'CAUTION' | 'IMPORTANT';
  headerLevel?: number;
}

export default function StrategyReport({ content }: StrategyReportProps) {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Helper to copy text to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  // Helper to toggle check states for action checklist items
  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Inline formatting helper for simple bold, inline code, and status emojis
  const renderInlineText = (text: string) => {
    let remaining = text.trim();
    let prefixBadge = null;

    // Detect state indicators and wrap in a styled badge
    if (remaining.startsWith('🔴')) {
      prefixBadge = (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 mr-1.5 shrink-0">
          Critical
        </span>
      );
      remaining = remaining.substring(2).trim();
    } else if (remaining.startsWith('🟢')) {
      prefixBadge = (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mr-1.5 shrink-0">
          Advantage
        </span>
      );
      remaining = remaining.substring(2).trim();
    } else if (remaining.startsWith('🟡')) {
      prefixBadge = (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mr-1.5 shrink-0">
          Risk
        </span>
      );
      remaining = remaining.substring(2).trim();
    } else if (remaining.startsWith('⚪')) {
      prefixBadge = (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 mr-1.5 shrink-0">
          Info
        </span>
      );
      remaining = remaining.substring(2).trim();
    }

    // Split for markdown **bold**
    const boldParts = remaining.split('**');
    const jsxParts = boldParts.map((part, index) => {
      const isBold = index % 2 === 1;

      // Within this part, split for markdown `inline code`
      const codeParts = part.split('`');
      const innerJsx = codeParts.map((codePart, codeIndex) => {
        const isCode = codeIndex % 2 === 1;
        if (isCode) {
          return (
            <code key={codeIndex} className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-pink-400 select-all">
              {codePart}
            </code>
          );
        }
        return codePart;
      });

      if (isBold) {
        return (
          <strong key={index} className="font-semibold text-slate-100">
            {innerJsx}
          </strong>
        );
      }
      return <span key={index}>{innerJsx}</span>;
    });

    return (
      <span className="inline-flex items-center flex-wrap gap-y-1">
        {prefixBadge}
        {jsxParts}
      </span>
    );
  };

  // Group report lines into structured blocks
  const parseBlocks = (rawText: string): Block[] => {
    const lines = rawText.split('\n');
    const blocks: Block[] = [];
    let currentBlock: Block | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 1. Detect Alert Blocks (> [!TYPE])
      if (trimmed.startsWith('> [!')) {
        if (currentBlock) blocks.push(currentBlock);
        
        const typeMatch = trimmed.match(/>\s*\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]/i);
        const alertType = typeMatch ? (typeMatch[1].toUpperCase() as any) : 'NOTE';
        
        currentBlock = {
          type: 'alert',
          alertType,
          lines: [],
        };
        continue;
      }

      if (currentBlock?.type === 'alert' && trimmed.startsWith('>')) {
        // Strip blockquote character '>'
        const contentLine = line.replace(/^\s*>\s?/, '');
        currentBlock.lines.push(contentLine);
        continue;
      }

      // 2. Detect Table Blocks (lines starting and ending with |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        // Skip separator row containing dashes (e.g. |:---|:---|)
        if (trimmed.includes('---')) {
          continue;
        }

        if (currentBlock?.type === 'table') {
          currentBlock.lines.push(trimmed);
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = {
            type: 'table',
            lines: [trimmed],
          };
        }
        continue;
      }

      // 3. Detect Checklist Items (- [ ] or - [x])
      if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          type: 'checklist',
          lines: [trimmed],
        };
        blocks.push(currentBlock);
        currentBlock = null;
        continue;
      }

      // 4. Detect Headers (### or ## or #)
      if (trimmed.startsWith('###') || trimmed.startsWith('##') || trimmed.startsWith('#')) {
        if (currentBlock) blocks.push(currentBlock);
        const level = trimmed.indexOf(' ');
        currentBlock = {
          type: 'header',
          headerLevel: level > 0 ? level : 3,
          lines: [trimmed.replace(/^#+\s*/, '')],
        };
        blocks.push(currentBlock);
        currentBlock = null;
        continue;
      }

      // 5. Default: Paragraph / standard lists
      if (currentBlock?.type === 'text') {
        currentBlock.lines.push(line);
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          type: 'text',
          lines: [line],
        };
      }
    }

    if (currentBlock) {
      blocks.push(currentBlock);
    }

    return blocks;
  };

  const blocks = parseBlocks(content);

  return (
    <div className="space-y-4 text-slate-300">
      {blocks.map((block, bIdx) => {
        switch (block.type) {
          // Render headers with premium neon underlines or icons
          case 'header': {
            const headerText = block.lines[0];
            // Detect if this is one of our translated English section headers
            const isSectionHeader = /^\d+\.\s+\*\*/.test(headerText);
            
            return (
              <div key={bIdx} className={`mt-6 mb-3 ${isSectionHeader ? 'border-b border-slate-800 pb-2' : ''}`}>
                <h3 className={`font-semibold tracking-wide text-slate-100 flex items-center gap-2 ${
                  block.headerLevel === 1 ? 'text-xl text-blue-400' :
                  block.headerLevel === 2 ? 'text-lg text-purple-400' :
                  'text-base text-slate-200'
                }`}>
                  {renderInlineText(headerText)}
                </h3>
              </div>
            );
          }

          // Render tables in a highly polished dashboard visual format
          case 'table': {
            if (block.lines.length === 0) return null;
            
            // Parse rows from lines
            const allRows = block.lines.map(l => 
              l.split('|')
                .map(cell => cell.trim())
                .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1) // Remove outer empties from pipeline splits
            );

            const headers = allRows[0];
            const bodyRows = allRows.slice(1);

            return (
              <div key={bIdx} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 backdrop-blur-md my-4 shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                      {headers.map((h, i) => (
                        <th key={i} className="p-3 text-xs font-semibold uppercase tracking-wider">
                          {h.replace(/\*\*/g, '')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {bodyRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/20 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3 text-sm text-slate-300">
                            {renderInlineText(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          // Render alert warnings, tips, and notes as dynamic SaaS notification boxes
          case 'alert': {
            const isWarning = block.alertType === 'WARNING' || block.alertType === 'CAUTION';
            const isTip = block.alertType === 'TIP';
            const alertContent = block.lines.join('\n').trim();

            let borderClass = 'border-blue-500/30 bg-blue-500/5 text-blue-200/90';
            let icon = <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />;
            let title = 'Note';

            if (isWarning) {
              borderClass = 'border-rose-500/30 bg-rose-500/5 text-rose-200/90';
              icon = <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />;
              title = block.alertType === 'WARNING' ? 'Warning' : 'Caution';
            } else if (isTip) {
              borderClass = 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200/90';
              icon = <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />;
              title = 'Recommendation';
            }

            // Extract potential code snippets for copy-paste action
            const codeMatch = alertContent.match(/`([\s\S]*?)`/);
            const rawCode = codeMatch ? codeMatch[1] : null;

            return (
              <div key={bIdx} className={`my-4 p-4 rounded-xl border ${borderClass} flex gap-3 shadow-md relative group transition-all hover:border-slate-700`}>
                {icon}
                <div className="flex-1 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-60">{title}</div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {renderInlineText(alertContent)}
                  </div>
                </div>
                {rawCode && (
                  <button
                    onClick={() => handleCopy(rawCode)}
                    className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Copy recommendation to clipboard"
                  >
                    {copiedText === rawCode ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            );
          }

          // Render checklists as functional, interactive checkboxes
          case 'checklist': {
            const item = block.lines[0];
            const text = item.replace(/^-\s*\[[ x]\]\s*/i, '');
            const uniqueKey = `${bIdx}-${text.substring(0, 30)}`;
            const isChecked = !!checkedItems[uniqueKey];

            return (
              <div 
                key={bIdx} 
                onClick={() => toggleCheck(uniqueKey)}
                className="flex items-start gap-3 my-2 p-2 rounded-lg hover:bg-slate-900/30 transition-all cursor-pointer select-none group border border-transparent hover:border-slate-800/40"
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  isChecked 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20 shadow-md' 
                    : 'border-slate-700 bg-slate-950 text-transparent group-hover:border-slate-500'
                }`}>
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                </div>
                <div className="flex-1">
                  <span className={`text-sm leading-relaxed transition-all ${
                    isChecked 
                      ? 'line-through text-slate-500 decoration-slate-500/70' 
                      : 'text-slate-300'
                  }`}>
                    {renderInlineText(text)}
                  </span>
                </div>
              </div>
            );
          }

          // Render general paragraph lines and lists
          default: {
            const textBlock = block.lines.join('\n');
            if (!textBlock.trim()) return null;

            return (
              <div key={bIdx} className="text-sm leading-relaxed text-slate-350 whitespace-pre-wrap">
                {textBlock.split('\n').map((line, lIdx) => {
                  const trimmed = line.trim();
                  // Detect plain list items starting with asterisk or dash
                  if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
                    const cleanListLine = trimmed.replace(/^[*+-]\s*/, '');
                    return (
                      <div key={lIdx} className="flex gap-2 pl-4 my-1">
                        <span className="text-purple-500">•</span>
                        <span>{renderInlineText(cleanListLine)}</span>
                      </div>
                    );
                  }
                  return <p key={lIdx} className="my-1.5">{renderInlineText(line)}</p>;
                })}
              </div>
            );
          }
        }
      })}
    </div>
  );
}
