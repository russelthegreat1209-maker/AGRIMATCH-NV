import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  MessageCircle,
  X,
  Send,
  Languages,
  ArrowRight,
  HelpCircle,
  MapPin,
  TrendingUp,
} from 'lucide-react';

export const AgribeeFloatingCompanion: React.FC = () => {
  const {
    navigateToTabWithGuard,
    currentUser,
    nvatReport,
    commodities,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'EN' | 'TL' | 'IL'>('EN');
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { sender: 'user' | 'bee'; text: string; actionTab?: string; agentSource?: string }[]
  >([
    {
      sender: 'bee',
      text: "Hello! I'm AGRIBEE AI. Ask about NVAT prices, 1–2 month barangay climate forecasts, or nearest verified suppliers.",
      agentSource: 'Orchestrator Agent',
    },
  ]);

  const sendPrompt = async (queryText: string) => {
    const query = queryText.trim();
    if (!query || isThinking) return;

    const newHistory = [...chatHistory, { sender: 'user' as const, text: query }];
    setChatHistory(newHistory);
    setUserInput('');
    setIsThinking(true);

    const langCode = selectedLanguage === 'TL' ? 'tl' : selectedLanguage === 'IL' ? 'ilo' : 'en';
    const topPrices = nvatReport.items
      .slice(0, 4)
      .map((i) => `${i.commodityName}: PHP ${i.prevailingPricePhp}/kg (${i.marketTrendStatus})`)
      .join('; ');
    const contextSummary = `Active Listings: ${commodities.length}. NVAT Benchmarks: ${topPrices}.`;

    try {
      const res = await fetch('/api/ai/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          role: currentUser?.role || 'Farmer',
          municipality: currentUser?.municipality || 'Bambang',
          barangay: currentUser?.barangay || 'Aliaga',
          language: langCode,
          history: newHistory.slice(-6),
          contextSummary,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'bee',
            text: data.reply || 'Multi-agent response ready.',
            actionTab: data.actionTab,
            agentSource: data.agentSource,
          },
        ]);
      } else {
        throw new Error('Agent endpoint unavailable');
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'bee',
          text: 'NVAT Bambang prices and PAGASA forecasts are synced on your dashboard. Open Marketplace or GIS Map for live hub details.',
          actionTab: 'marketplace',
          agentSource: 'Local Agent',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendQuery = (e: React.FormEvent) => {
    e.preventDefault();
    sendPrompt(userInput);
  };

  return (
    <>
      {/* Floating Bee Launcher Button in bottom-right corner */}
      <div className="fixed bottom-20 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-16 h-16 rounded-full glass-light border-2 border-[#C3E956] shadow-2xl p-1 hover:scale-110 active:scale-95 transition-all group animate-float-logo"
          aria-label="Ask AGRIBEE AI Companion"
        >
          <div className="absolute -inset-1 rounded-full bg-[#C3E956]/40 blur-xs animate-pulse pointer-events-none" />
          <img
            src="/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121823_0000_2ea129ee.webp"
            alt="AGRIBEE"
            className="w-full h-full object-contain relative z-10"
          />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">
            AI
          </span>
        </button>
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 glass-light rounded-3xl shadow-2xl border-2 border-[#91EAAF] p-4 flex flex-col h-[480px] animate-fade-in text-left">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white p-1 border border-[#91EAAF] shadow-xs">
                <img
                  src="/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121637_0000_5f169ef9.webp"
                  alt="AGRIBEE"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#1F4B2C]">AGRIBEE Assistant</h4>
                <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Autonomous Multi-Agent Router</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <div className="flex bg-neutral-100 rounded-lg p-0.5 text-[9px] font-bold">
                <button
                  onClick={() => setSelectedLanguage('EN')}
                  className={`px-1.5 py-0.5 rounded ${selectedLanguage === 'EN' ? 'bg-[#1F4B2C] text-white' : 'text-neutral-500'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setSelectedLanguage('TL')}
                  className={`px-1.5 py-0.5 rounded ${selectedLanguage === 'TL' ? 'bg-[#1F4B2C] text-white' : 'text-neutral-500'}`}
                >
                  TL
                </button>
                <button
                  onClick={() => setSelectedLanguage('IL')}
                  className={`px-1.5 py-0.5 rounded ${selectedLanguage === 'IL' ? 'bg-[#1F4B2C] text-white' : 'text-neutral-500'}`}
                >
                  IL
                </button>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
                aria-label="Close AGRIBEE dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2.5 text-xs">
            {chatHistory.map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed font-medium shadow-xs ${
                    item.sender === 'user'
                      ? 'bg-[#1F4B2C] text-white rounded-tr-none'
                      : 'bg-white text-neutral-800 rounded-tl-none border border-[#91EAAF]/60'
                  }`}
                >
                  {item.text}
                </div>

                {item.actionTab && (
                  <button
                    onClick={() => {
                      navigateToTabWithGuard(item.actionTab!);
                      setIsOpen(false);
                    }}
                    className="mt-1 px-3 py-1 rounded-full btn-sprout text-[10px] font-bold flex items-center gap-1"
                  >
                    <span>Open {item.actionTab.toUpperCase()}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="flex items-start">
                <div className="px-3 py-2 rounded-2xl bg-white border border-[#91EAAF]/60 text-[11px] font-bold text-[#1F4B2C] animate-pulse">
                  Analyzing hub data...
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="py-1 flex gap-1 overflow-x-auto scrollbar-none text-[10px]">
            {[
              'Cabbage price today?',
              'Rain forecast in Kayapa?',
              'Show nearest suppliers',
              'Route to NVAT Bambang',
            ].map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sendPrompt(p)}
                className="px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-600 whitespace-nowrap hover:bg-neutral-50"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSendQuery} className="pt-2 border-t border-neutral-200 flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask in English, Tagalog, or Ilocano..."
              className="flex-1 px-3 py-2 text-xs rounded-full border border-neutral-300 bg-white focus:outline-none focus:border-[#4D7111]"
            />
            <button
              type="submit"
              disabled={isThinking || !userInput.trim()}
              className="p-2 rounded-full btn-forest shadow-xs hover:scale-105 transition-transform disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="w-3.5 h-3.5 text-[#C3E956]" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
