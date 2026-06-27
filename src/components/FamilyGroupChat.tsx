/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { API } from '../api';
import { 
  Send, 
  MessageSquare, 
  Users, 
  Sparkles 
} from 'lucide-react';

interface FamilyGroupChatProps {
  currentUser: User;
}

export default function FamilyGroupChat({ currentUser }: FamilyGroupChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<User[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  const loadMessagesAndFamily = async () => {
    try {
      const chatRes = await API.getChatMessages();
      setMessages(chatRes.chatMessages || []);

      const famRes = await API.getFamily();
      setFamilyMembers(famRes.members || []);
    } catch (err) {
      console.error('Error loading group chat details', err);
    } finally {
      setLoading(false);
    }
  };

  // Poll for new messages every 3 seconds to keep it fully dynamic
  useEffect(() => {
    loadMessagesAndFamily();
    const interval = setInterval(() => {
      loadMessagesAndFamily();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Scroll to bottom only if messages length increases (e.g. new message loaded)
  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevLengthRef.current = messages.length;
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const textToSend = customMsg || newMessageText;
    if (!textToSend.trim() || sending) return;

    setSending(true);
    try {
      const res = await API.sendChatMessage(textToSend);
      if (res.success) {
        setMessages(prev => [...prev, res.message]);
        if (!customMsg) {
          setNewMessageText('');
        }
      }
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const isParent = currentUser.role === 'parent';

  // Quick reply options depending on role to make discussion frictionless
  const quickReplies = isParent 
    ? [
        { text: 'Dinner is ready! Devices away! 🍽️', icon: '🍽️' },
        { text: 'Time for routine study lock! 📚', icon: '📚' },
        { text: 'Check the Offline Planner for ideas! 🎨', icon: '⚽' },
        { text: 'Request approved! Extra time added! 👍', icon: '✓' }
      ]
    : [
        { text: 'Finished my homework! Can I get extra time? 📝', icon: '📝' },
        { text: 'Sure thing, putting my device away now! 📵', icon: '📵' },
        { text: 'Who wants to play a board game outside? 🎲', icon: '🎲' },
        { text: 'I completed my routine daily goals! 🏆', icon: '🏆' }
      ];

  return (
    <div id="family-group-chat-root" className="max-w-4xl mx-auto py-6 px-4 space-y-6 font-sans">
      
      {/* Chat header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Family Lounge Chat
          </h2>
          <p className="text-xs text-slate-500 font-medium">Coordinate screen-time requests, remind each other of locking routines, or suggest active offline games.</p>
        </div>

        {/* Live family participants status chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-extrabold text-slate-400 flex items-center gap-1 mr-1">
            <Users className="w-3.5 h-3.5" /> Lounge ({familyMembers.length}):
          </span>
          {familyMembers.map((m) => {
            const isMe = m.id === currentUser.id;
            return (
              <span 
                key={m.id} 
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${isMe ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <span>{m.profilePic}</span>
                <span>{m.name.split(' ')[0]}</span>
                {isMe && <span className="text-[8px] bg-indigo-200 text-indigo-800 px-1 rounded-sm">You</span>}
              </span>
            );
          })}
        </div>
      </div>

      {/* Main chat window */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
        
        {/* Chat log body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[11px] text-slate-400 font-bold">Synchronizing lounge archives...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300" />
              <p className="text-xs text-slate-400 font-medium">No discussion topics logged yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isMyMessage = msg.userId === currentUser.id;
                
                return (
                  <div 
                    key={msg.id || index}
                    className={`flex items-start gap-2 max-w-[85%] ${isMyMessage ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-lg shrink-0">
                      {msg.userProfilePic}
                    </div>

                    {/* Bubble and info */}
                    <div className="space-y-1">
                      <div className={`flex items-baseline gap-1.5 ${isMyMessage ? 'justify-end' : ''}`}>
                        <span className="text-[11px] font-black text-slate-700">{msg.userName}</span>
                        <span className={`text-[8px] px-1.5 py-0.2 rounded-full uppercase font-black ${msg.userRole === 'parent' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                          {msg.userRole}
                        </span>
                      </div>

                      {/* Text balloon */}
                      <div 
                        className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isMyMessage 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      </div>

                      {/* Timestamp */}
                      <span className={`text-[9px] text-slate-400 block font-medium font-mono ${isMyMessage ? 'text-right' : ''}`}>
                        {formatMessageTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Quick template toolbar wrapper */}
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 overflow-x-auto flex gap-2 whitespace-nowrap scrollbar-none items-center h-12 shrink-0">
          <span className="text-[10px] font-extrabold text-slate-400 shrink-0 flex items-center gap-1 uppercase">
            <Sparkles className="w-3 h-3 text-amber-500" /> Quick Replies:
          </span>
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(undefined, qr.text)}
              className="bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[10px] font-extrabold px-3 py-1 rounded-full border border-slate-200 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {qr.text}
            </button>
          ))}
        </div>

        {/* Chat composition form */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center shrink-0">
          <input
            type="text"
            id="group-chat-input-field"
            placeholder={`Send message to family lounge as ${currentUser.name.split(' ')[0]}...`}
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            required
            disabled={sending}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs bg-slate-50/50"
          />
          <button
            type="submit"
            id="send-chat-message-btn"
            disabled={sending || !newMessageText.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
