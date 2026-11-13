import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OrderRecord } from '../types';
import {
  Send,
  CheckCircle,
  Truck,
  PackageCheck,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Phone,
  Paperclip,
  Check,
  AlertCircle,
} from 'lucide-react';

export const PrivateChatModule: React.FC = () => {
  const {
    currentUser,
    orders,
    chatThreads,
    chatMessages,
    activeChatThreadId,
    setActiveChatThreadId,
    sendMessage,
    markOrderSent,
    markOrderReceived,
  } = useApp();

  const [messageInput, setMessageInput] = useState('');

  const currentThread = chatThreads.find((t) => t.id === activeChatThreadId) || chatThreads[0];
  const currentOrder = orders.find((o) => o.id === currentThread?.orderId);

  const messagesInThread = chatMessages.filter((m) => m.threadId === currentThread?.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentThread) return;

    sendMessage(currentThread.id, messageInput.trim());
    setMessageInput('');
  };

  const handleQuickPreset = (txt: string) => {
    if (!currentThread) return;
    sendMessage(currentThread.id, txt);
  };

  return (
    <div className="space-y-4 pb-16 text-left animate-fade-in">
      {/* Module Title */}
      <div className="glass-light p-4 rounded-3xl border border-[#91EAAF] shadow-md flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4D7111]/15 text-[#1F4B2C] text-[10px] font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3 h-3 text-[#4D7111]" />
            Dual-Handshake Escrow & Logistics Negotiation
          </div>
          <h2 className="text-xl font-black text-[#1F4B2C] tracking-tight">
            Private Stakeholder Negotiations & Orders
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-neutral-600 bg-white/80 px-3 py-1.5 rounded-full border border-neutral-200">
          <span className="w-2 h-2 rounded-full bg-[#C3E956] animate-pulse" />
          <span>Atomic Ledger Sync: Enabled</span>
        </div>
      </div>

      {/* Chat Layout: Threads List (Left) + Messages & Pinned Order Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Threads Sidebar */}
        <div className="glass-light p-3 sm:p-4 rounded-3xl border border-[#91EAAF] shadow-md flex flex-col h-[600px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Active Order Discussions ({chatThreads.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {chatThreads.map((thread) => {
              const isActive = thread.id === activeChatThreadId;
              const ord = orders.find((o) => o.id === thread.orderId);

              return (
                <div
                  key={thread.id}
                  onClick={() => setActiveChatThreadId(thread.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#1F4B2C] text-[#F4FFFC] border-[#1F4B2C] shadow-md'
                      : 'bg-white/80 border-neutral-200 hover:border-[#91EAAF]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-[#C3E956] text-[#1F4B2C]'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      Order #{thread.orderId.replace('ord-', '')}
                    </span>
                    <span className={`text-[10px] font-medium ${isActive ? 'text-neutral-300' : 'text-neutral-400'}`}>
                      {new Date(thread.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold mt-1.5 truncate">
                    {thread.commodityName}
                  </h4>
                  <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-neutral-200' : 'text-neutral-500'}`}>
                    {thread.lastMessageSnippet}
                  </p>

                  {ord && (
                    <div className="mt-2 pt-1 border-t border-white/10 flex justify-between items-center text-[10px]">
                      <span className={isActive ? 'text-[#C3E956]' : 'text-[#4D7111] font-bold'}>
                        {ord.quantityKg} kg • ₱{ord.totalAmountPhp.toLocaleString()}
                      </span>
                      <span
                        className={`font-bold ${
                          ord.status === 'COMPLETED'
                            ? 'text-emerald-400'
                            : ord.status === 'ORDER_DISPATCHED'
                            ? 'text-amber-400'
                            : 'text-neutral-400'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Conversation & Interactive Order Card (Center & Right) */}
        <div className="lg:col-span-2 glass-light rounded-3xl border border-[#91EAAF] shadow-md flex flex-col h-[600px] overflow-hidden">
          {currentThread && currentOrder ? (
            <>
              {/* Pinned Interactive Order Card & Dual-Handshake Header */}
              <div className="p-4 bg-white/90 border-b border-[#91EAAF] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-[#1F4B2C]">
                        Pinned Order Card #{currentOrder.id}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          currentOrder.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-500'
                            : currentOrder.status === 'ORDER_DISPATCHED'
                            ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-500'
                            : 'bg-blue-100 text-blue-900 ring-1 ring-blue-500'
                        }`}
                      >
                        {currentOrder.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 font-bold mt-0.5">
                      {currentOrder.commodityName} ({currentOrder.quantityKg} kg @ ₱{currentOrder.proposedPricePerKg}/kg)
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold">Total Agreed Value</span>
                    <p className="text-lg font-black text-[#1F4B2C] font-mono">
                      ₱{currentOrder.totalAmountPhp.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Logistics Settlement Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-neutral-100">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-semibold block">Delivery Mode</span>
                    <span className="font-bold text-neutral-700">{currentOrder.deliveryMode}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 font-semibold block">Location</span>
                    <span className="font-bold text-neutral-700 truncate block">{currentOrder.deliveryLocation}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 font-semibold block">Payment Method</span>
                    <span className="font-bold text-neutral-700">{currentOrder.paymentOption.split('(')[0].trim()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 font-semibold block">Parties</span>
                    <span className="font-bold text-[#4D7111]">{currentOrder.buyerName.split(' ')[0]} ⇄ {currentOrder.supplierName.split(' ')[0]}</span>
                  </div>
                </div>

                {/* DUAL-HANDSHAKE CONFIRMATION BUTTONS */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#91EAAF]/20 via-[#C3E956]/20 to-[#91EAAF]/20 border border-[#91EAAF] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1F4B2C]">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#4D7111]" />
                      Dual-Handshake Completion Protocol:
                    </span>
                    <span className="text-[10px] text-neutral-500 font-medium">
                      Both parties must sign off
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* BUTTON 1 (Supplier Side): Mark as Order Sent / Dispatched */}
                    <button
                      onClick={() => markOrderSent(currentOrder.id)}
                      disabled={currentOrder.supplierConfirmedSent || currentOrder.status === 'COMPLETED'}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        currentOrder.supplierConfirmedSent
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'btn-forest shadow-xs hover:scale-[1.01]'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>
                        {currentOrder.supplierConfirmedSent
                          ? '✓ Order Dispatched by Supplier'
                          : '1. Mark as Order Sent / Dispatched (Supplier)'}
                      </span>
                    </button>

                    {/* BUTTON 2 (Buyer Side): Mark as Order Received */}
                    <button
                      onClick={() => markOrderReceived(currentOrder.id)}
                      disabled={currentOrder.buyerConfirmedReceived || currentOrder.status === 'COMPLETED'}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        currentOrder.buyerConfirmedReceived
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'btn-sprout shadow-xs hover:scale-[1.01]'
                      }`}
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>
                        {currentOrder.buyerConfirmedReceived
                          ? '✓ Order Received by Buyer'
                          : '2. Mark as Order Received (Buyer)'}
                      </span>
                    </button>
                  </div>

                  {/* Status Banner */}
                  {currentOrder.status === 'COMPLETED' ? (
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold text-center flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>ATOMIC COMPLETION CONFIRMED: Inventory deducted & Completed Transactions incremented!</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-neutral-600 text-center font-medium italic">
                      Clicking both buttons atomically registers the transaction to the permanent ledger and increments public counters in real time.
                    </p>
                  )}
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F4FFFC]/50">
                {messagesInThread.map((msg) => {
                  const isMine = currentUser?.id === msg.senderId;

                  if (msg.isOrderCard) {
                    return (
                      <div key={msg.id} className="p-3 rounded-2xl bg-white border border-[#91EAAF] text-center max-w-md mx-auto shadow-xs text-xs">
                        <span className="font-bold text-[#1F4B2C]">📜 Order Card Linked</span>
                        <p className="text-neutral-600 text-[11px] mt-0.5">{msg.text}</p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-neutral-400 font-semibold mb-0.5 px-1">
                        {msg.senderName} ({msg.senderRole})
                      </span>
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                          isMine
                            ? 'bg-[#1F4B2C] text-[#F4FFFC] rounded-tr-none'
                            : 'bg-white text-neutral-800 rounded-tl-none border border-neutral-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-neutral-400 mt-0.5 px-1 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Quick Preset Phrases */}
              <div className="px-3 py-1.5 bg-white border-t border-neutral-200 flex gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
                {[
                  'Naimbag nga aldaw! Ready for pickup.',
                  'Truck en route along AH26 highway.',
                  'Can we adjust price to prevailing NVAT index?',
                  'Confirmed! Payment pre-authorized.',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPreset(preset)}
                    className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 whitespace-nowrap"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSend} className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type negotiation message, dispatch ETA, or pickup note..."
                  className="flex-1 px-4 py-2.5 text-xs rounded-full border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:border-[#4D7111]"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-full btn-forest shadow-xs hover:scale-105 transition-transform"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 text-[#C3E956]" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-500">
              <p className="text-sm font-semibold">Select an order thread to open negotiation card.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
