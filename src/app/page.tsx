'use client';

import React, { useState } from 'react';
import { useChat } from 'ai/react';
import { 
  Bot, 
  Send, 
  BrainCircuit, 
  Activity, 
  PackageSearch, 
  User, 
  Tag, 
  DollarSign, 
  Award, 
  Truck, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Rocket, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Sparkles,
  Info,
  Trash2
} from 'lucide-react';

export default function Chat() {
  // Seller Profile Form State
  const [profileExpanded, setProfileExpanded] = useState(true);
  const [companyName, setCompanyName] = useState('Yeti Oficial México');
  const [companyProduct, setCompanyProduct] = useState('Termo Yeti Rambler 30oz');
  const [companyPrice, setCompanyPrice] = useState('799');
  const [companyLevel, setCompanyLevel] = useState('MercadoLíder Platinum');
  const [companyShipping, setCompanyShipping] = useState('Mercado Envíos FULL');
  const [companyWarranty, setCompanyWarranty] = useState('30 días de garantía');

  // Agent Status Tracking
  const [agent1State, setAgent1State] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [agent2State, setAgent2State] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [scrapedCompetitorsCount, setScrapedCompetitorsCount] = useState<number>(0);

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
      // Check if ScraperAgent successfully invoked the scraping tool
      const toolCall = message.toolInvocations?.find(
        t => t.toolName === 'mercadoLibreTool'
      );
      if (toolCall && 'result' in toolCall && toolCall.result?.success) {
        setAgent1State('done');
        const competitors = toolCall.result.data || [];
        setScrapedCompetitorsCount(competitors.length);
        
        // Trigger StrategyAgent automatically
        await runStrategyAgent(message, competitors);
      } else {
        setAgent1State('done');
        setAgent2State('idle');
      }
    },
    onError: (err) => {
      console.error('Chat error:', err);
      setAgent1State('error');
    }
  });

  // Orchestrator for Agent 2 (StrategyAgent)
  const runStrategyAgent = async (lastMessage: any, scrapedData: any) => {
    try {
      setAgent2State('running');
      
      const response = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, lastMessage],
          companyContext: {
            name: companyName,
            product: companyProduct,
            price: companyPrice,
            level: companyLevel,
            shipping: companyShipping,
            warranty: companyWarranty,
          },
          scrapedData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to run Strategy Agent');
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
    handleSubmit(e);
  };

  // Quick Action: Run full Analysis pipeline directly from profile
  const handleStartAnalysis = () => {
    if (!companyProduct.trim()) return;
    setAgent1State('running');
    setAgent2State('idle');
    append({
      role: 'user',
      content: `Analiza el mercado para el producto "${companyProduct}"`
    });
  };

  // Clear chat history
  const handleClearChat = () => {
    setMessages([]);
    setAgent1State('idle');
    setAgent2State('idle');
    setScrapedCompetitorsCount(0);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
      
      {/* Side Panel - Vendedor Perfil & Observaciones (Brain) */}
      <aside className="w-96 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex shrink-0">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            <BrainCircuit className="w-5 h-5 text-blue-400" />
            Panel de Control
          </h2>
          <button 
            onClick={handleClearChat} 
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition"
            title="Limpiar Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Seller Profile Card (Mi Perfil) */}
          <div className="bg-slate-800/40 rounded-xl border border-slate-850 overflow-hidden transition-all shadow-lg backdrop-blur">
            <button 
              onClick={() => setProfileExpanded(!profileExpanded)}
              className="w-full p-4 flex items-center justify-between bg-slate-800/60 hover:bg-slate-800 transition border-b border-slate-700/50"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Mi Perfil de Vendedor
              </span>
              {profileExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
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
                  onClick={handleStartAnalysis}
                  disabled={isLoading || agent2State === 'running' || !companyProduct.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-purple-950/20 active:scale-[0.98]"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  Iniciar Análisis de Mercado
                </button>
              </div>
            ) : (
              <div className="p-3 text-[11px] text-slate-400 bg-slate-900/30 flex justify-between items-center">
                <span className="truncate font-semibold text-slate-300">{companyName}</span>
                <span className="text-emerald-400 font-bold">${companyPrice} MXN</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] border border-slate-750 text-slate-300">{companyShipping.replace('Mercado Envíos ', '')}</span>
              </div>
            )}
          </div>

          {/* Orchestrator Monitor (Monitoreo de Agentes) */}
          <div className="bg-slate-850/50 rounded-xl border border-slate-805 p-4 space-y-3.5 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Orquestador de Agentes
            </h3>
            
            <div className="space-y-3">
              {/* Agent 1 Status */}
              <div className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${agent1State === 'running' ? 'bg-blue-500/10 text-blue-400' : agent1State === 'done' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
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
                  <div className={`p-1.5 rounded-lg ${agent2State === 'running' ? 'bg-purple-500/10 text-purple-400' : agent2State === 'done' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
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

          {/* Observations log (Historial de Procesos de Herramienta) */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Observaciones del Scraper</h3>
            
            <div className="space-y-3">
              {messages.map(m => (
                m.toolInvocations?.map(toolInvocation => {
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
              
              {messages.length === 0 && (
                <div className="text-center text-slate-600 py-6 text-xs flex flex-col items-center">
                  <Activity className="w-6 h-6 mb-2 opacity-15" />
                  Orquestador inactivo. Lanza un análisis para observar los logs.
                </div>
              )}
            </div>
          </div>
          
        </div>
      </aside>

      {/* Main Panel - Chat Interface */}
      <main className="flex-1 flex flex-col h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        
        {/* Header */}
        <header className="p-5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur flex justify-between items-center z-10">
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
                <h3 className="text-lg font-bold text-slate-200">Asistente de Competitividad</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                  Configura tu perfil de vendedor en el panel izquierdo y haz clic en "Iniciar Análisis de Mercado" para que los agentes extraigan y analicen la competencia en tiempo real.
                </p>
              </div>
              
              <div className="w-full pt-4 max-w-sm">
                <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5 text-left text-xs">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-300">¿Qué hace el flujo multi-agente?</h4>
                      <p className="text-slate-400 text-[11px] mt-1">
                        1. <strong>ScraperAgent</strong> usa Bright Data para extraer información detallada (vendedor, envíos, precio original, velocidad, etc.).
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        2. <strong>StrategyAgent</strong> aplica un análisis cognitivo (Gemini 2.5 Pro) para encontrar brechas y estructurar tu plan de ataque.
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
                    {m.toolInvocations?.map(tool => {
                      if (tool.toolName === 'mercadoLibreTool' && 'result' in tool && tool.result?.success) {
                        const products = tool.result.data || [];
                        return (
                          <div key={tool.toolCallId} className="mb-6 bg-slate-950/50 rounded-xl p-4 border border-slate-800/80">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <PackageSearch className="w-4.5 h-4.5 text-emerald-400" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Datos en tiempo real extraídos</h4>
                                <p className="text-[10px] text-slate-500">Filtrado inteligente mediante Bright Data browser</p>
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
                                    className={`flex gap-3 bg-slate-900 hover:bg-slate-850 border ${isUserProduct ? 'border-amber-500/40 bg-amber-500/[0.02]' : 'border-slate-800 hover:border-slate-700'} transition rounded-xl p-3.5 group relative overflow-hidden`}
                                  >
                                    {/* User product indicator badge */}
                                    {isUserProduct && (
                                      <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] px-2 py-0.5 rounded-bl font-bold uppercase tracking-wider">
                                        Tu Producto
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
                                            <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded font-bold uppercase">MÁS VENDIDO</span>
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
                                              Por: {product.seller}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      
                      // Loading indicator during scraping
                      if (tool.toolName === 'mercadoLibreTool' && !('result' in tool)) {
                         return (
                           <div key={tool.toolCallId} className="mb-6 flex items-center gap-3 p-4 bg-blue-950/20 border border-blue-900/30 rounded-xl animate-pulse">
                             <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                             <div>
                               <span className="text-xs text-blue-400 font-bold uppercase tracking-wider block">ScraperAgent está trabajando</span>
                               <span className="text-[11px] text-slate-400">Bright Data está desbloqueando y extrayendo listados de competidores...</span>
                             </div>
                           </div>
                         );
                      }
                      return null;
                    })}

                    <div className="whitespace-pre-wrap leading-relaxed text-sm text-slate-300 markdown-body">
                      {m.content}
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
                <span className="text-xs text-slate-400 font-medium">ScraperAgent está pensando...</span>
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
                <span className="text-xs text-purple-400 font-medium">StrategyAgent está redactando el informe competitivo...</span>
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
              placeholder={companyProduct ? `Ej: Analiza a la competencia para "${companyProduct}"` : "Escribe tu consulta aquí..."}
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
            <span>Los datos son extraídos en tiempo real de Mercado Libre México usando el Scraping Browser de Bright Data.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
