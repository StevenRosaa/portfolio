// components/AiChat.tsx
import React, { useState } from 'react';
import { Bot, Send, X, MessageCircle, Sparkles } from 'lucide-react';
import { useAiChat } from './useAiChat';

export const AiChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const { conversation, isLoading, sendMessage, clearConversation, getSuggestions } = useAiChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    await sendMessage(message);
    setMessage('');
  };

  return (
    <div className="group relative p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 backdrop-blur-md border border-violet-500/20 hover:border-violet-400/40 transition-all duration-700 shadow-xl hover:shadow-2xl hover:shadow-violet-500/20">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/5 via-purple-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
      
      <div className="relative flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-medium text-white/95 group-hover:text-violet-300 transition-colors duration-500">Chat with Veritas AI</h3>
        <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
        
        <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          Online (v0.15)
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="mb-6 space-y-4 max-h-64 overflow-y-auto">
        {conversation.length === 0 && (
          <div className="text-white/60 text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-light mb-2">Ciao! Sono Veritas, l'assistente IA di Giacomo.</p>
            <p className="font-light text-sm text-white/40">Prova a chiedermi "Chi sei?" o "Qual è il tuo scopo?"</p>
          </div>
        )}
        
        {conversation.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-2xl font-light ${
              msg.type === 'user' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'bg-gray-800/50 text-white/90 border border-white/10'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 text-white/90 px-4 py-2 rounded-2xl border border-white/10">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Suggestions */}
      {message.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {getSuggestions(message).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setMessage(suggestion)}
              className="px-3 py-1 bg-gray-800/50 hover:bg-gray-700/50 text-white/70 hover:text-white rounded-full text-sm transition-colors font-light border border-white/10 hover:border-white/20"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      {/* Quick suggestions when empty */}
      {message.length === 0 && conversation.length === 0 && (
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          {['Chi sei?', 'Qual è il tuo scopo?', 'Ciao'].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setMessage(suggestion)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white/80 hover:text-white rounded-full text-sm transition-all font-light border border-purple-500/30 hover:border-purple-400/50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      {/* Chat Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
          placeholder="Scrivi un messaggio a Veritas..."
          disabled={isLoading}
          className="flex-1 bg-gray-800/50 border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors font-light disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !message.trim()}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full transition-all transform hover:scale-110 active:scale-95 duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-purple-500/50"
        >
          <Send className="w-4 h-4" />
        </button>
        
        {conversation.length > 0 && (
          <button
            onClick={clearConversation}
            className="text-white/50 hover:text-white transition-colors px-3 py-3 rounded-full hover:bg-gray-800/50 border border-white/10 hover:border-white/20"
            title="Clear conversation"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* AI Info */}
      <div className="mt-4 text-xs text-white/40 text-center font-light">
        Veritas AI • Version Alpha 0.15 • Created by Giacomo Palmisani
      </div>
    </div>
  );
};