'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { 
  Bot, 
  Send, 
  Info, 
  Trash2,
  Sparkles,
  BrainCircuit,
  Search,
  MessageSquare,
  BarChart2,
  Globe
} from 'lucide-react';

// Import modular components
import SellerProfileForm from '@/components/SellerProfileForm';
import OrchestratorMonitor from '@/components/OrchestratorMonitor';
import ScraperObservations from '@/components/ScraperObservations';
import CompetitorCards from '@/components/CompetitorCards';
import BrightDataTerminal from '@/components/BrightDataTerminal';
import GoogleVisibility from '@/components/GoogleVisibility';
import ReviewsAnalysis from '@/components/ReviewsAnalysis';
import BrightDataDashboard from '@/components/BrightDataDashboard';
import StrategyReport from '@/components/StrategyReport';

export default function Chat() {
  // Seller Profile Form State
  const [profileExpanded, setProfileExpanded] = useState(true);
  const [companyName, setCompanyName] = useState('Yeti Official Mexico');
  const [companyProduct, setCompanyProduct] = useState('Yeti Rambler 30oz');
  const [companyPrice, setCompanyPrice] = useState('799');
  const [companyLevel, setCompanyLevel] = useState('MercadoLíder Platinum');
  const [companyShipping, setCompanyShipping] = useState('Mercado Envíos FULL');
  const [companyWarranty, setCompanyWarranty] = useState('30 días de garantía');

  // Agent Status Tracking
  const [agent1State, setAgent1State] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [agent2State, setAgent2State] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [scrapedCompetitorsCount, setScrapedCompetitorsCount] = useState<number>(0);
  
  // Bright Data New Integrated States
  const [serpData, setSerpData] = useState<any>(null);
  const [reviewsData, setReviewsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'competitors' | 'seo' | 'reviews' | 'dashboard'>('competitors');

  // useChat initialization for Agent 1 (ScraperAgent)
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append } = useChat({
    api: '/api/chat',
    body: {
      companyContext: {
        name: companyName,
        product: companyProduct,
        price: companyPrice,
        level: companyLevel,
        shipping: companyShipping,
        warranty: companyWarranty,
      }
    },
    onFinish: async (message) => {
      console.log('[onFinish] ScraperAgent stream completed. Last message:', message);
      
      // Extract results from all completed tools dynamically
      const mlCall = findMercadoLibreToolCall(message);
      const serpCall = findSerpToolCall(message);
      const reviewsCall = findReviewsToolCall(message);
      
      console.log('[onFinish] Found mlCall:', mlCall);
      console.log('[onFinish] Found serpCall:', serpCall);
      console.log('[onFinish] Found reviewsCall:', reviewsCall);

      const competitors = mlCall && 'result' in mlCall && mlCall.result?.success ? mlCall.result.data : [];
      const serpResults = serpCall && 'result' in serpCall && serpCall.result?.success ? serpCall.result.data : null;
      const reviewsResults = reviewsCall && 'result' in reviewsCall && reviewsCall.result?.success ? reviewsCall.result.data : null;

      setScrapedCompetitorsCount(competitors.length);
      if (serpResults) setSerpData(serpResults);
      if (reviewsResults) setReviewsData(reviewsResults);

      setAgent1State('done');
      
      if (competitors.length > 0) {
        // Trigger StrategyAgent automatically and pass all scraped feeds
        await runStrategyAgent(message, competitors, serpResults, reviewsResults);
      } else {
        console.warn('[onFinish] No successful market listings retrieved. StrategyAgent standby.');
        setAgent2State('idle');
      }
    },
    onError: (err) => {
      console.error('Chat error:', err);
      setAgent1State('error');
    }
  });

  // Keep a ref of messages to prevent React stale closure bugs in onFinish & asynchronous fetch
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Robust helper to extract mercadoLibreTool call and its results
  const findMercadoLibreToolCall = (lastMessage: any) => {
    if (lastMessage?.toolInvocations) {
      const found = lastMessage.toolInvocations.find((t: any) => t.toolName === 'mercadoLibreTool');
      if (found) return found;
    }
    const history = messagesRef.current || [];
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      if (msg.toolInvocations) {
        const found = msg.toolInvocations.find((t: any) => t.toolName === 'mercadoLibreTool');
        if (found) return found;
      }
    }
    return null;
  };

  // Robust helper to extract serpTool call and its results
  const findSerpToolCall = (lastMessage: any) => {
    if (lastMessage?.toolInvocations) {
      const found = lastMessage.toolInvocations.find((t: any) => t.toolName === 'serpTool');
      if (found) return found;
    }
    const history = messagesRef.current || [];
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      if (msg.toolInvocations) {
        const found = msg.toolInvocations.find((t: any) => t.toolName === 'serpTool');
        if (found) return found;
      }
    }
    return null;
  };

  // Robust helper to extract reviewsTool call and its results
  const findReviewsToolCall = (lastMessage: any) => {
    if (lastMessage?.toolInvocations) {
      const found = lastMessage.toolInvocations.find((t: any) => t.toolName === 'reviewsTool');
      if (found) return found;
    }
    const history = messagesRef.current || [];
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      if (msg.toolInvocations) {
        const found = msg.toolInvocations.find((t: any) => t.toolName === 'reviewsTool');
        if (found) return found;
      }
    }
    return null;
  };

  // Orchestrator for Agent 2 (StrategyAgent)
  const runStrategyAgent = async (lastMessage: any, scrapedData: any, serpDataInput: any, reviewsDataInput: any) => {
    try {
      console.log('[runStrategyAgent] Triggering StrategyAgent...');
      setAgent2State('running');
      
      // Clean chat history for StrategyAgent API request
      const history = messagesRef.current || [];
      const hasLast = history.some(m => m.id === lastMessage.id);
      const fullHistory = hasLast ? history : [...history, lastMessage];

      const chatHistory = fullHistory
        .filter(m => !m.id.startsWith('strategy-'))
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      console.log('[runStrategyAgent] Request payload to strategy endpoint:', { chatHistory, scrapedData, serpDataInput, reviewsDataInput });

      const response = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          companyContext: {
            name: companyName,
            product: companyProduct,
            price: companyPrice,
            level: companyLevel,
            shipping: companyShipping,
            warranty: companyWarranty,
          },
          scrapedData,
          serpData: serpDataInput,
          reviewsData: reviewsDataInput
        })
      });

      if (!response.ok) {
        throw new Error(`Strategy API responded with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available from Strategy Agent');

      const decoder = new TextDecoder();
      const strategyMessageId = 'strategy-' + Date.now();

      // Insert an empty assistant message in the chat for the streaming strategy response
      setMessages(prev => [
        ...prev,
        {
          id: strategyMessageId,
          role: 'assistant',
          content: ''
        }
      ]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(m => m.id === strategyMessageId ? { ...m, content: m.content + chunk } : m));
      }

      console.log('[runStrategyAgent] StrategyAgent complete.');
      setAgent2State('done');
    } catch (error) {
      console.error('StrategyAgent error:', error);
      setAgent2State('error');
    }
  };

  // Submit handler from UI
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setAgent1State('running');
    setAgent2State('idle');
    setSerpData(null);
    setReviewsData(null);
    handleSubmit(e);
  };

  // Quick Action: Run full Analysis pipeline directly from profile
  const handleStartAnalysis = () => {
    if (!companyProduct.trim()) return;
    setAgent1State('running');
    setAgent2State('idle');
    setSerpData(null);
    setReviewsData(null);
    append({
      role: 'user',
      content: `Analyze the market for product "${companyProduct}"`
    });
  };

  // Clear chat history
  const handleClearChat = () => {
    setMessages([]);
    setAgent1State('idle');
    setAgent2State('idle');
    setScrapedCompetitorsCount(0);
    setSerpData(null);
    setReviewsData(null);
    setActiveTab('competitors');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
      
      {/* Side Panel - Vendedor Perfil & Observaciones (Brain) */}
      <aside className="w-96 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex shrink-0">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent select-none">
            <BrainCircuit className="w-5 h-5 text-blue-400" />
            Control Panel
          </h2>
          <button 
            type="button"
            onClick={handleClearChat} 
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <SellerProfileForm
            companyName={companyName}
            setCompanyName={setCompanyName}
            companyProduct={companyProduct}
            setCompanyProduct={setCompanyProduct}
            companyPrice={companyPrice}
            setCompanyPrice={setCompanyPrice}
            companyLevel={companyLevel}
            setCompanyLevel={setCompanyLevel}
            companyShipping={companyShipping}
            setCompanyShipping={setCompanyShipping}
            companyWarranty={companyWarranty}
            setCompanyWarranty={setCompanyWarranty}
            profileExpanded={profileExpanded}
            setProfileExpanded={setProfileExpanded}
            isLoading={isLoading || agent2State === 'running'}
            onStartAnalysis={handleStartAnalysis}
          />

          <OrchestratorMonitor
            agent1State={agent1State}
            agent2State={agent2State}
            scrapedCompetitorsCount={scrapedCompetitorsCount}
          />

          <ScraperObservations messages={messages} />
        </div>
      </aside>

      {/* Main Panel - Chat Interface */}
      <main className="flex-1 flex flex-col h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        
        {/* Header */}
        <header className="p-5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur flex justify-between items-center z-10 select-none">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              BuyBoxAgent <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-normal">Multi-Agent v2.0</span>
            </h1>
            <p className="text-xs text-slate-400">Competitive intelligence orchestrator powered by Bright Data</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-slate-300 tracking-wider uppercase">System Live</span>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 max-w-lg mx-auto text-center space-y-5">
              <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 shadow-2xl relative">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full filter blur-xl animate-pulse"></div>
                <Bot className="w-10 h-10 text-blue-400 relative z-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-200">Competitiveness Assistant</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                  Configure your seller profile in the left panel and click "Start Market Analysis" to let agents extract and analyze the competition in real time.
                </p>
              </div>
              
              <div className="w-full pt-4 max-w-sm">
                <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5 text-left text-xs">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-300">What does the multi-agent flow do?</h4>
                      <p className="text-slate-400 text-[11px] mt-1">
                        1. <strong>ScraperAgent</strong> uses Bright Data to extract detailed information (seller, shipping model, original price, delivery speed, etc.).
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        2. <strong>StrategyAgent</strong> applies a cognitive analysis (Gemini 2.5 Pro) to spot gaps and structure your strategic attack plan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            messages.map(m => (
              m.role !== 'system' && (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-2xl p-5 ${m.role === 'user' ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/20' : 'bg-slate-900 border border-slate-800/80 text-slate-200 shadow-xl w-full'}`}>
                    
                    {m.role === 'assistant' && (
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4.5 h-4.5 text-blue-400" />
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                            {m.id.startsWith('strategy-') ? 'StrategyAgent Report' : 'ScraperAgent Status'}
                          </span>
                        </div>
                        {m.id.startsWith('strategy-') && (
                          <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md">PRO Analysis</span>
                        )}
                      </div>
                    )}
                    
                    {/* Render Tool Invocations visually with premium details */}
                    {(() => {
                      if (!m.toolInvocations || m.toolInvocations.length === 0) return null;

                      // Find the latest assistant message containing tool calls in the history
                      const latestToolCallMsg = [...messages]
                        .reverse()
                        .find(msg => msg.role === 'assistant' && msg.toolInvocations && msg.toolInvocations.length > 0);

                      if (m.id !== latestToolCallMsg?.id) {
                        // Suppress older dashboards to prevent visual duplication in chat
                        return null;
                      }

                      // Aggregate tool calls across all messages in history
                      const mlTool = findMercadoLibreToolCall(m);
                      const serpTool = findSerpToolCall(m);
                      const reviewsTool = findReviewsToolCall(m);

                      const competitors = mlTool && 'result' in mlTool && mlTool.result?.success ? mlTool.result.data : [];
                      const serpResults = serpTool && 'result' in serpTool && serpTool.result?.success ? serpTool.result.data : null;
                      const reviewsResults = reviewsTool && 'result' in reviewsTool && reviewsTool.result?.success ? reviewsTool.result.data : null;

                      const isMlRunning = !!(mlTool && !('result' in mlTool));
                      const isSerpRunning = !!(serpTool && !('result' in serpTool));
                      const isReviewsRunning = !!(reviewsTool && !('result' in reviewsTool));

                      const hasAnyResult = !!(
                        (mlTool && 'result' in mlTool) || 
                        (serpTool && 'result' in serpTool) || 
                        (reviewsTool && 'result' in reviewsTool)
                      );

                      // If tools are running but none have completed yet, show standard terminal loader
                      if (!hasAnyResult) {
                        let loadingMsg = "Unlocking and extracting listings via Bright Data Scraping Browser...";
                        if (isSerpRunning) loadingMsg = "Tracking organic search rankings via Bright Data SERP API...";
                        if (isReviewsRunning) loadingMsg = "Extracting competitor reviews via Bright Data Scraping Browser...";

                        return (
                          <div key="loader-panel" className="mb-6 p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3 shadow-inner">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              <div>
                                <span className="text-xs text-blue-400 font-bold uppercase tracking-wider block">ScraperAgent executing</span>
                                <span className="text-[11px] text-slate-400">{loadingMsg}</span>
                              </div>
                            </div>
                            <BrightDataTerminal />
                          </div>
                        );
                      }

                      // If at least one tool completed, render the multi-product Intelligence Hub
                      return (
                        <div key="intelligence-hub" className="mb-6 space-y-4">
                          {/* Premium Tab Navigation */}
                          <div className="flex border-b border-slate-850 overflow-x-auto gap-1">
                            <button
                              type="button"
                              onClick={() => setActiveTab('competitors')}
                              className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                activeTab === 'competitors' 
                                  ? 'border-blue-500 text-blue-400' 
                                  : 'border-transparent text-slate-450 hover:text-slate-200'
                              }`}
                            >
                              <BarChart2 className="w-3.5 h-3.5" />
                              Competidores ({competitors.length})
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => setActiveTab('seo')}
                              className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                activeTab === 'seo' 
                                  ? 'border-sky-500 text-sky-400' 
                                  : 'border-transparent text-slate-450 hover:text-slate-200'
                              }`}
                            >
                              <Search className="w-3.5 h-3.5" />
                              Google SEO
                              {isSerpRunning && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>}
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => setActiveTab('reviews')}
                              className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                activeTab === 'reviews' 
                                  ? 'border-purple-500 text-purple-400' 
                                  : 'border-transparent text-slate-450 hover:text-slate-200'
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Opiniones
                              {isReviewsRunning && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>}
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => setActiveTab('dashboard')}
                              className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                activeTab === 'dashboard' 
                                  ? 'border-emerald-500 text-emerald-400' 
                                  : 'border-transparent text-slate-450 hover:text-slate-200'
                              }`}
                            >
                              <Globe className="w-3.5 h-3.5" />
                              Bright Data Stack
                            </button>
                          </div>

                          {/* Tab Content Display */}
                          <div className="pt-2">
                            {activeTab === 'competitors' && (
                              <CompetitorCards 
                                products={competitors}
                                companyName={companyName}
                              />
                            )}
                            
                            {activeTab === 'seo' && (
                              <GoogleVisibility 
                                serpData={serpResults}
                                isLoading={isSerpRunning}
                              />
                            )}
                            
                            {activeTab === 'reviews' && (
                              <ReviewsAnalysis 
                                reviewsData={reviewsResults}
                                isLoading={isReviewsRunning}
                              />
                            )}
                            
                            {activeTab === 'dashboard' && (
                              <BrightDataDashboard 
                                browserActive={isMlRunning || isReviewsRunning || competitors.length > 0}
                                serpActive={isSerpRunning || serpResults !== null}
                                reviewsActive={isReviewsRunning || reviewsResults !== null}
                                isBrowserMock={false}
                                isSerpMock={false}
                                isReviewsMock={false}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="leading-relaxed text-sm text-slate-350">
                      {m.id.startsWith('strategy-') ? (
                        <StrategyReport content={m.content} />
                      ) : (
                        <div className="whitespace-pre-wrap markdown-body">{m.content}</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            ))
          )}
          
          {/* Loaders for active thinking state */}
          {isLoading && agent1State === 'running' && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl p-4 shadow-xl flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-xs text-slate-400 font-medium">ScraperAgent is thinking...</span>
              </div>
            </div>
          )}

          {agent2State === 'running' && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl p-4 shadow-xl flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-xs text-purple-400 font-medium">StrategyAgent is generating strategic analysis report...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-5 bg-slate-950/70 backdrop-blur border-t border-slate-800/80 z-10">
          <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto relative group">
            <input
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-slate-650 rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all text-slate-100 placeholder:text-slate-500 shadow-inner text-sm"
              value={input}
              placeholder={companyProduct ? `e.g., Analyze the competition for "${companyProduct}"` : "Type your query here..."}
              onChange={handleInputChange}
              disabled={isLoading || agent2State === 'running'}
            />
            <button
              type="submit"
              disabled={isLoading || agent2State === 'running' || !input?.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="max-w-4xl mx-auto mt-2 flex items-center gap-1.5 text-[10px] text-slate-500 px-1">
            <Info className="w-3.5 h-3.5" />
            <span>Data is extracted in real-time from Mercado Libre Mexico using Bright Data's Scraping Browser.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
