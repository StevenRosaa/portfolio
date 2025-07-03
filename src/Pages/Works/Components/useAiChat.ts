// hooks/useAiChat.ts
import { useState } from 'react';
import type { Message } from './type';
import { AI_RESPONSES } from './responseAi';

export const useAiChat = () => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageId, setMessageId] = useState(0);

  const getAiResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();
    
    for (const [key, response] of Object.entries(AI_RESPONSES)) {
      if (key !== 'default' && message.includes(key)) {
        return response;
      }
    }
    
    return AI_RESPONSES.default;
  };

  const simulateTyping = async (response: string): Promise<void> => {
    return new Promise(resolve => {
      const typingTime = Math.min(response.length * 30, 2000);
      setTimeout(resolve, typingTime);
    });
  };

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    setIsLoading(true);

    const userMsg: Message = {
      id: messageId,
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMsg]);
    setMessageId(prev => prev + 1);

    try {
      const aiResponse = getAiResponse(userMessage);
      await simulateTyping(aiResponse);
      
      const aiMsg: Message = {
        id: messageId + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, aiMsg]);
      setMessageId(prev => prev + 2);
      
    } catch (error) {
      console.error('Errore nella risposta dell\'AI:', error);
      
      const errorMsg: Message = {
        id: messageId + 1,
        type: 'ai',
        content: 'Scusa, ho avuto un problema tecnico. Prova a rifare la domanda!',
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, errorMsg]);
      setMessageId(prev => prev + 2);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setConversation([]);
    setMessageId(0);
  };

  const getSuggestions = (input: string): string[] => {
    if (!input.trim()) return ['Chi sei?', 'Qual è il tuo scopo?', 'Ciao'];
    
    const suggestions = [];
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('chi')) suggestions.push('Chi sei?');
    if (inputLower.includes('scopo')) suggestions.push('Qual è il tuo scopo?');
    if (inputLower.includes('giacomo')) suggestions.push('Raccontami di Giacomo');
    if (inputLower.includes('version') || inputLower.includes('versione')) suggestions.push('Che versione sei?');
    
    return suggestions.slice(0, 3);
  };

  return {
    conversation,
    isLoading,
    sendMessage,
    clearConversation,
    getSuggestions
  };
};