/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Send, X, ArrowLeft, RefreshCw, User, ChevronRight } from 'lucide-react';

interface ChatDrawerProps {
  onClose: () => void;
}

export default function ChatDrawer({ onClose }: ChatDrawerProps) {
  const { currentUser } = useApp();

  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll messages to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat rooms for the current user
  useEffect(() => {
    if (!currentUser) return;
    const fetchRooms = async () => {
      try {
        const res = await fetch(`/api/chats?userId=${currentUser.id}`);
        if (res.ok) {
          setRooms(await res.json());
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchRooms();
  }, [currentUser, refreshToggle]);

  // Auto-select room from localStorage trigger if present
  useEffect(() => {
    if (rooms.length > 0) {
      const activeStoreId = localStorage.getItem('active_chat_store_id');
      const activeChatId = localStorage.getItem('active_chat_id');
      if (activeChatId) {
        const found = rooms.find(r => r.id === activeChatId);
        if (found) {
          setSelectedRoomId(found.id);
          localStorage.removeItem('active_chat_id');
          localStorage.removeItem('active_chat_store_id');
        }
      } else if (activeStoreId) {
        const found = rooms.find(r => r.sellerId === activeStoreId || r.storeId === activeStoreId);
        if (found) {
          setSelectedRoomId(found.id);
          localStorage.removeItem('active_chat_id');
          localStorage.removeItem('active_chat_store_id');
        }
      }
    }
  }, [rooms]);

  // Fetch specific room messages on select
  useEffect(() => {
    if (!selectedRoomId) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/chats/${selectedRoomId}/messages`);
        if (res.ok) {
          setMessages(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    // Setup a mini simulation interval to simulate polling/instant real-time answers (Socket fallback)
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [selectedRoomId, refreshToggle]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText || !selectedRoomId || !currentUser) return;

    try {
      const res = await fetch(`/api/chats/${selectedRoomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: newMessageText
        })
      });

      if (res.ok) {
        const data = await res.json();
        const msgObj = data.message || data;
        setMessages([...messages, msgObj]);
        setNewMessageText('');
        // Trigger simulation reply from Seller with Gemini API or mock response only if sender is the Buyer
        const activeRoom = rooms.find(r => r.id === selectedRoomId);
        if (activeRoom && currentUser.id === activeRoom.buyerId) {
          setTimeout(async () => {
            try {
              await fetch(`/api/chats/${selectedRoomId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  senderId: 'SYSTEM_BOT',
                  senderName: 'Seller Assist',
                  text: "Halo! Pesanan Anda sedang dicek oleh admin toko. Mohon tunggu, kami akan membalas pesan Anda secepatnya."
                })
              });
              setRefreshToggle(prev => !prev);
            } catch (e) {}
          }, 3000);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeRoom = rooms.find(r => r.id === selectedRoomId);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-[#f4f2e9] border-l-4 border-black maternal-shadow transition-all duration-300 flex flex-col justify-between" id="chat-drawer-drawer">
      
      {/* Header Panel */}
      <div className="p-4 md:p-6 bg-[#111] text-white flex items-center justify-between border-b-2 border-black" id="chat-header">
        <div className="flex items-center gap-2">
          {selectedRoomId ? (
            <button 
              onClick={() => setSelectedRoomId(null)}
              className="p-1 hover:bg-white/10 rounded mr-1 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
          ) : (
            <MessageSquare className="w-5 h-5 text-red-600" />
          )}

          <h2 className="font-serif text-lg font-bold uppercase tracking-tight">
            {selectedRoomId ? `CHAT WITH SELLER` : `PESAN & INBOX`}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setRefreshToggle(!refreshToggle)}
            className="text-gray-400 hover:text-white cursor-pointer"
            title="Refresh Inbox"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Inbox area list */}
      <div className="flex-grow overflow-y-auto p-4 md:p-6" id="chat-body-content">
        {!currentUser ? (
          <div className="text-center py-20 font-mono text-xs" id="chat-no-auth">
            <p className="text-red-700 font-bold uppercase mb-2">AUTENTIKASI DIBUTUHKAN</p>
            <p className="text-gray-500 max-w-xs mx-auto">Sila melakukan sign in atau masuk member untuk membuka percakapan dengan para seller toko.</p>
          </div>
        ) : !selectedRoomId ? (
          /* ROOM LISTS */
          rooms.length === 0 ? (
            <div className="text-center py-24 font-mono text-xs" id="chat-rooms-empty">
              <MessageSquare className="w-8 h-8 text-gray-400 inline-block mb-3" />
              <p className="font-bold text-gray-800 uppercase">INBOX MASIH KOSONG</p>
              <p className="text-gray-400 mt-1 max-w-xs mx-auto">Klik tombol "HUBUNGI SELLER" di modal halaman produk untuk memulai sesi obrolan.</p>
            </div>
          ) : (
            <div className="space-y-3" id="chat-rooms-list">
              <span className="font-mono text-[9.5px] text-gray-500 font-bold block uppercase mb-4">DAFTAR CHAT AKTIF</span>
              {rooms.map((room) => {
                const isSellerOfRoom = currentUser.id !== room.buyerId;
                const displayName = isSellerOfRoom ? (room.buyerName || 'Pembeli') : (room.sellerName || room.storeName || 'Toko');
                return (
                  <div 
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className="bg-white p-4 border border-black hover:border-red-800 transition cursor-pointer flex justify-between items-center maternal-shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border border-black bg-gray-100 flex items-center justify-center font-bold font-serif text-sm">
                        {displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold font-serif text-xs text-black uppercase">{displayName}</p>
                        <span className="font-mono text-[10px] text-gray-400 line-clamp-1 truncate block w-48">{room.lastMessage || 'Tekan untuk melihat pesan...'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* MESSAGES SEQUENCE PANEL */
          <div className="flex flex-col justify-between h-full space-y-4" id="messages-sequence-box">
            <div className="flex-grow space-y-3 overflow-y-auto max-h-[60vh] pr-1">
              
              <div className="text-center pb-2 border-b border-gray-200">
                <span className="font-semibold text-xs text-[#111] uppercase font-serif block">
                  {currentUser.id === activeRoom?.buyerId ? (activeRoom?.sellerName || activeRoom?.storeName || 'MITRA TOKO') : (activeRoom?.buyerName || 'PEMBELI')}
                </span>
                <span className="font-mono text-[8px] text-gray-400 uppercase">SECURE PORTAL CHATBOX COMPLIANT</span>
              </div>

              {messages.map((m) => {
                const isMe = m.senderId === currentUser.id;
                let senderDisplayName = '';
                if (isMe) {
                  senderDisplayName = 'Anda';
                } else if (activeRoom) {
                  if (m.senderId === activeRoom.buyerId) {
                    senderDisplayName = activeRoom.buyerName || 'Pembeli';
                  } else {
                    senderDisplayName = activeRoom.sellerName || activeRoom.storeName || 'Toko';
                  }
                } else {
                  senderDisplayName = 'Mitra';
                }
                return (
                  <div 
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <span className="font-mono text-[8.5px] text-gray-400">{senderDisplayName}</span>
                    <div className={`p-3 max-w-xs border-2 border-black font-mono text-xs ${
                      isMe ? 'bg-black text-[#faf9f3] maternal-shadow-sm' : 'bg-white text-black'
                    }`}>
                      <p className="break-words leading-relaxed">{m.text}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* SEND FORM */}
            <form onSubmit={handleSendMessage} className="flex border-t-2 border-black pt-3">
              <input 
                type="text" 
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Tulis pesan Anda..."
                className="flex-grow bg-white border border-black p-2 text-xs focus:ring-0 focus:outline-none font-mono"
              />
              <button 
                type="submit"
                className="bg-black text-white hover:bg-gray-800 p-2 border-y-2 border-r-2 border-black font-mono font-bold text-xs flex items-center justify-center px-4 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
