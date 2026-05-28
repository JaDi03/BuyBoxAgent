'use client';

import { useChat } from 'ai/react';
import { Bot, Send, BrainCircuit, Activity, PackageSearch } from 'lucide-react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
      {/* Brain Panel - Left Side */}
      <aside className="w-1/3 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
          <h2 className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            <BrainCircuit className="w-6 h-6 text-blue-400" />
            Brain Panel
          </h2>
          <p className="text-xs text-slate-400 mt-2">Real-time Agent Observations</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(m => (
            m.toolInvocations?.map(toolInvocation => {
              const toolCallId = toolInvocation.toolCallId;
              const isFinished = 'result' in toolInvocation;

              return (
                <div key={toolCallId} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-blue-400 flex items-center gap-2 uppercase tracking-wider">
                      <PackageSearch className="w-4 h-4" />
                      {toolInvocation.toolName}
                    </span>
                    {isFinished ? (
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    ) : (
                      <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                    )}
                  </div>
                  
                  <div className="text-sm text-slate-300 font-mono bg-slate-900 p-3 rounded border border-slate-800">
                    <span className="text-slate-500">{'>'} Input: </span>
                    <span className="text-emerald-400">"{toolInvocation.args.searchQuery}"</span>
                  </div>

                  {isFinished && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs">
                      <span className="text-slate-500">Status: </span>
                      <span className={toolInvocation.result.success ? "text-emerald-400" : "text-rose-400"}>
                        {toolInvocation.result.success ? "Extraction Complete" : "Failed"}
                      </span>
                      {toolInvocation.result.success && (
                        <div className="mt-2 text-slate-400">
                          Found {toolInvocation.result.data?.length || 0} competitors on Mercado Libre.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ))}
          {messages.length === 0 && (
            <div className="text-center text-slate-500 mt-10 text-sm flex flex-col items-center">
              <Activity className="w-8 h-8 mb-3 opacity-20" />
              Agent is idle. Waiting for tasks...
            </div>
          )}
        </div>
      </aside>

      {/* Chat Interface - Right Side */}
      <main className="flex-1 flex flex-col h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <header className="p-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex justify-between items-center z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">BuyBoxAgent</h1>
            <p className="text-sm text-slate-400">Powered by Bright Data Scraping Browser</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">System Live</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 max-w-md mx-auto text-center space-y-4">
              <div className="p-4 bg-slate-900 rounded-full border border-slate-800 shadow-2xl">
                <Bot className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-medium text-slate-300">Welcome to BuyBoxAgent</h3>
              <p className="text-sm leading-relaxed">Ask me about a product you sell on Mercado Libre. I will scrape real-time competitor data and give you a winning strategy.</p>
              
              <div className="w-full pt-6">
                <p className="text-xs uppercase tracking-wider text-slate-600 mb-3 font-semibold">Try asking</p>
                <button 
                  className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 w-full text-left text-sm cursor-pointer hover:bg-slate-800 hover:border-slate-600 transition group relative overflow-hidden" 
                  onClick={() => handleInputChange({ target: { value: 'Analyze the market for "audifonos inalambricos"' } } as any)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  "Analyze the market for audifonos inalambricos"
                </button>
              </div>
            </div>
          ) : (
            messages.map(m => (
              m.role !== 'system' && (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-5 ${m.role === 'user' ? 'bg-blue-600 text-white shadow-blue-900/20 shadow-xl' : 'bg-slate-800 border border-slate-700 text-slate-200 shadow-xl w-full'}`}>
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/50">
                        <Bot className="w-5 h-5 text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">BuyBoxAgent Analysis</span>
                      </div>
                    )}
                    
                    {/* Render Tool Invocations Visually */}
                    {m.toolInvocations?.map(tool => {
                      if (tool.toolName === 'mercadoLibreTool' && 'result' in tool && tool.result?.success) {
                        return (
                          <div key={tool.toolCallId} className="mb-6 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <PackageSearch className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-emerald-400">Live Market Data Extracted</h4>
                                <p className="text-xs text-slate-400">Powered by Bright Data Scraping Browser</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {tool.result.data.slice(0, 6).map((product: any, idx: number) => (
                                <a key={idx} href={product.link} target="_blank" rel="noreferrer" className="block bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 transition-all rounded-lg p-3 group">
                                  <div className="line-clamp-2 text-xs font-medium text-slate-200 mb-2 group-hover:text-emerald-300 transition-colors">{product.title}</div>
                                  <div className="flex items-end justify-between">
                                    <div>
                                      <div className="text-lg font-bold text-white">{product.price}</div>
                                      {product.originalPrice && <div className="text-[10px] text-slate-500 line-through">{product.originalPrice}</div>}
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                      {product.isFull && (
                                        <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                          <Bot className="w-3 h-3" /> FULL
                                        </span>
                                      )}
                                      {product.seller && <span className="text-[10px] text-slate-400 mt-1 truncate max-w-[80px]">By {product.seller}</span>}
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      if (tool.toolName === 'mercadoLibreTool' && !('result' in tool)) {
                         return (
                           <div key={tool.toolCallId} className="mb-6 flex items-center gap-3 p-4 bg-blue-900/10 border border-blue-900/30 rounded-xl">
                             <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                             <span className="text-sm text-blue-400 font-medium">Bright Data is unlocking and scraping real-time data...</span>
                           </div>
                         );
                      }
                      return null;
                    })}

                    <div className="whitespace-pre-wrap leading-relaxed text-sm text-slate-300">{m.content}</div>
                  </div>
                </div>
              )
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl p-4 shadow-xl flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-xs text-slate-400 font-medium">Agent is thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-950/80 backdrop-blur border-t border-slate-800 z-10">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
            <input
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-100 placeholder:text-slate-500 shadow-inner"
              value={input}
              placeholder="E.g., Why am I losing the Buy Box for 'termo yeti'?"
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input?.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
