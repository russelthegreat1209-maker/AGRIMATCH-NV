import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Send,
  Truck,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  ClipboardCheck,
  Video,
  ShoppingBag,
} from 'lucide-react';

export const PrivateChatModule: React.FC<{
  initialSubTab?: 'messages' | 'orders';
}> = ({ initialSubTab = 'messages' }) => {
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
    setActiveTab,
    setActiveAgribeeVideo,
  } = useApp();

  const [subView, setSubView] = useState<'messages' | 'orders'>(initialSubTab);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    setSubView(initialSubTab);
  }, [initialSubTab]);

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

  const isBuyer = currentUser?.role === 'Buyer';

  return (
    <div className="space-y-5 pb-16 text-left animate-fade-in">
      {/* Module Header with Messages / Orders & Transactions Switcher */}
      <div className="glass-light p-4 sm:p-5 rounded-3xl border border-[#91EAAF] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4D7111]/15 text-[#1F4B2C] dark:text-[#C3E956] text-[10px] font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3 h-3 text-[#4D7111]" />
            <span>Direct Messages & 2-Step Order Handshake</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1F4B2C] dark:text-white tracking-tight">
            {subView === 'orders'
              ? 'Orders & Transactions Ledger'
              : 'Direct Stakeholder Messages'}
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 font-semibold mt-0.5">
            {isBuyer
              ? 'Buyer Mode: Review your active crop orders, chat with farmers, and confirm "Order Received".'
              : 'Chat directly with buyers/suppliers and confirm "Order Sent / Dispatched".'}
          </p>
        </div>

        {/* Sub-view Switcher: Messages beside Orders & Transactions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSubView('messages');
              setActiveTab('messages');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              subView === 'messages'
                ? 'bg-[#1F4B2C] text-[#C3E956] shadow-md'
                : 'bg-white/80 dark:bg-white/10 text-[#1F4B2C] dark:text-white border border-[#91EAAF]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages ({chatThreads.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubView('orders');
              setActiveTab('orders');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              subView === 'orders'
                ? 'bg-[#1F4B2C] text-[#C3E956] shadow-md'
                : isBuyer
                ? 'bg-[#C3E956]/40 text-[#1F4B2C] dark:text-[#C3E956] ring-2 ring-[#4D7111] font-black'
                : 'bg-white/80 dark:bg-white/10 text-[#1F4B2C] dark:text-white border border-[#91EAAF]'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Orders & Transactions ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAgribeeVideo('messages-orders')}
            className="px-3.5 py-2.5 rounded-2xl bg-[#C3E956]/30 text-[#1F4B2C] dark:text-[#C3E956] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>Watch Guide</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          SUB-VIEW A: DEDICATED ORDERS & TRANSACTIONS LEDGER (HIGHLIGHTED FOR BUYERS)
         ===================================================================== */}
      {subView === 'orders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="glass-card rounded-3xl p-5 border-2 border-[#91EAAF] shadow-md flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#1F4B2C] text-[#C3E956] text-[10px] font-black uppercase">
                      Order #{ord.id}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        ord.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-900'
                          : ord.status === 'ORDER_DISPATCHED'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#1F4B2C] dark:text-white">
                        {ord.commodityName}
                      </h3>
                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                        Buyer: <strong>{ord.buyerName}</strong> • Seller:{' '}
                        <strong>{ord.supplierName}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-[#1F4B2C] dark:text-[#C3E956]">
                        ₱{ord.totalAmountPhp.toLocaleString()}
                      </p>
                      <p className="text-xs font-bold text-neutral-500">
                        {ord.quantityKg} kg @ ₱{ord.proposedPricePerKg}/kg
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white/70 dark:bg-black/25 p-3 rounded-2xl border border-[#91EAAF]/50">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                        Delivery Mode
                      </span>
                      <span className="font-bold text-[#1F4B2C] dark:text-white">
                        {ord.deliveryMode}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                        Destination
                      </span>
                      <span className="font-bold text-[#1F4B2C] dark:text-white truncate block">
                        {ord.deliveryLocation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2-Step Handshake Buttons right on the Order Card */}
                <div className="space-y-2 pt-2 border-t border-[#91EAAF]/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => markOrderSent(ord.id)}
                      disabled={ord.supplierConfirmedSent || ord.status === 'COMPLETED'}
                      className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        ord.supplierConfirmedSent
                          ? 'bg-emerald-600 text-white'
                          : 'btn-forest'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>
                        {ord.supplierConfirmedSent
                          ? '✓ 1. Sent by Seller'
                          : '1. Mark Order Sent'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => markOrderReceived(ord.id)}
                      disabled={ord.buyerConfirmedReceived || ord.status === 'COMPLETED'}
                      className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        ord.buyerConfirmedReceived
                          ? 'bg-emerald-600 text-white'
                          : 'btn-sprout'
                      }`}
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>
                        {ord.buyerConfirmedReceived
                          ? '✓ 2. Received by Buyer'
                          : '2. Mark Order Received'}
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveChatThreadId(ord.chatThreadId);
                      setSubView('messages');
                      setActiveTab('messages');
                    }}
                    className="w-full py-2 rounded-xl bg-white/90 dark:bg-white/10 border border-[#91EAAF] text-[#1F4B2C] dark:text-[#C3E956] text-xs font-extrabold flex items-center justify-center gap-1.5 hover:bg-[#91EAAF]/25 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Chat Thread for This Order</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('marketplace')}
              className="px-5 py-2.5 rounded-2xl btn-sprout text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse More Crops in Marketplace</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-VIEW B: 1-ON-1 CHAT THREADS & PINNED ORDER HANDSHAKE
         ===================================================================== */}
      {subView === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Threads Sidebar */}
          <div className="glass-light p-3 sm:p-4 rounded-3xl border border-[#91EAAF] shadow-md flex flex-col h-[600px]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-300 mb-2">
              Active Conversations ({chatThreads.length})
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
                        : 'bg-white/80 dark:bg-black/25 border-neutral-200 dark:border-white/10 hover:border-[#91EAAF]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-[#C3E956] text-[#1F4B2C]'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        Order #{thread.orderId.replace('ord-', '')}
                      </span>
                      <span
                        className={`text-[10px] font-medium ${
                          isActive ? 'text-neutral-300' : 'text-neutral-400'
                        }`}
                      >
                        {thread.lastMessageTimestamp.includes('T')
                          ? new Date(thread.lastMessageTimestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : thread.lastMessageTimestamp}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold mt-1.5 truncate">
                      {thread.commodityName}
                    </h4>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        isActive ? 'text-neutral-200' : 'text-neutral-500 dark:text-neutral-300'
                      }`}
                    >
                      {thread.lastMessageSnippet}
                    </p>

                    {ord && (
                      <div className="mt-2 pt-1 border-t border-white/10 flex justify-between items-center text-[10px]">
                        <span
                          className={
                            isActive ? 'text-[#C3E956]' : 'text-[#4D7111] dark:text-[#C3E956] font-bold'
                          }
                        >
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

          {/* Active Conversation & Interactive Order Card */}
          <div className="lg:col-span-2 glass-light rounded-3xl border border-[#91EAAF] shadow-md flex flex-col h-[600px] overflow-hidden">
            {currentThread ? (
              <>
                {/* Pinned Interactive Order Card if linked */}
                {currentOrder && (
                  <div className="p-4 bg-white/90 dark:bg-black/30 border-b border-[#91EAAF] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase text-[#1F4B2C] dark:text-[#C3E956]">
                            Pinned Order #{currentOrder.id}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              currentOrder.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : currentOrder.status === 'ORDER_DISPATCHED'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-blue-100 text-blue-900'
                            }`}
                          >
                            {currentOrder.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 font-bold mt-0.5">
                          {currentOrder.commodityName} ({currentOrder.quantityKg} kg @ ₱
                          {currentOrder.proposedPricePerKg}/kg)
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold">
                          Total Value
                        </span>
                        <p className="text-lg font-black text-[#1F4B2C] dark:text-[#C3E956] font-mono">
                          ₱{currentOrder.totalAmountPhp.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* DUAL-HANDSHAKE CONFIRMATION BUTTONS */}
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-[#91EAAF]/20 via-[#C3E956]/20 to-[#91EAAF]/20 border border-[#91EAAF] space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => markOrderSent(currentOrder.id)}
                          disabled={
                            currentOrder.supplierConfirmedSent ||
                            currentOrder.status === 'COMPLETED'
                          }
                          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            currentOrder.supplierConfirmedSent
                              ? 'bg-emerald-600 text-white'
                              : 'btn-forest'
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>
                            {currentOrder.supplierConfirmedSent
                              ? '✓ 1. Sent by Seller'
                              : '1. Mark Order Sent (Seller)'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => markOrderReceived(currentOrder.id)}
                          disabled={
                            currentOrder.buyerConfirmedReceived ||
                            currentOrder.status === 'COMPLETED'
                          }
                          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            currentOrder.buyerConfirmedReceived
                              ? 'bg-emerald-600 text-white'
                              : 'btn-sprout'
                          }`}
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>
                            {currentOrder.buyerConfirmedReceived
                              ? '✓ 2. Received by Buyer'
                              : '2. Mark Order Received (Buyer)'}
                          </span>
                        </button>
                      </div>

                      {currentOrder.status === 'COMPLETED' && (
                        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold text-center flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>
                            Order Completed! Inventory deducted & trade counters updated.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Chat Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F4FFFC]/50 dark:bg-black/20">
                  {messagesInThread.map((msg) => {
                    const isMine = currentUser?.id === msg.senderId;

                    if (msg.isOrderCard) {
                      return (
                        <div
                          key={msg.id}
                          className="p-3 rounded-2xl bg-white dark:bg-black/40 border border-[#91EAAF] text-center max-w-md mx-auto shadow-xs text-xs"
                        >
                          <span className="font-bold text-[#1F4B2C] dark:text-[#C3E956]">
                            📜 Order Card Linked
                          </span>
                          <p className="text-neutral-600 dark:text-neutral-300 text-[11px] mt-0.5">
                            {msg.text}
                          </p>
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
                              : 'bg-white dark:bg-[#132E1E] text-neutral-800 dark:text-white rounded-tl-none border border-neutral-200 dark:border-white/10'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Preset Phrases */}
                <div className="px-3 py-1.5 bg-white dark:bg-black/30 border-t border-neutral-200 dark:border-white/10 flex gap-1.5 overflow-x-auto text-[10px]">
                  {[
                    'Naimbag nga aldaw! Ready for pickup.',
                    'Truck en route along AH26 highway.',
                    'Confirmed! Ready at NVAT Bambang.',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickPreset(preset)}
                      className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 text-neutral-700 dark:text-white whitespace-nowrap cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Message Input Form */}
                <form
                  onSubmit={handleSend}
                  className="p-3 bg-white dark:bg-black/30 border-t border-neutral-200 dark:border-white/10 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type message, pickup schedule, or order question..."
                    className="flex-1 px-4 py-2.5 text-xs rounded-full border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:border-[#4D7111]"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-full btn-forest shadow-xs hover:scale-105 transition-transform cursor-pointer"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4 text-[#C3E956]" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-500">
                <p className="text-sm font-semibold">
                  Select a conversation thread on the left to chat.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
