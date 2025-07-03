// useAI.ts - Hook React personalizzato per l'AI italiana
import { useState, useCallback, useEffect, useRef } from 'react';
import { AIService, type HealthCheckResponse, type FormattedResponse, type SearchResult, type RetrainResult } from '../backend/API/aiService';

// Tipi per il messaggio della conversazione
interface ConversationMessage {
  id: number;
  type: 'user' | 'ai';
  content: string;
  sources?: string[];
  webEnhanced?: boolean;
  timestamp: string;
}

// Tipi per le opzioni di invio messaggio
interface SendMessageOptions {
  skipConversationUpdate?: boolean;
}

// Tipo per la richiesta corrente
interface CurrentRequest {
  id: number;
  cancelled: boolean;
}

// Tipo per i dati di esportazione
interface ExportData {
  conversation: ConversationMessage[];
  aiHealth: HealthCheckResponse | null;
  stats: ReturnType<typeof AIService.getUsageStats>;
  exportDate: string;
}

// Tipo di ritorno dell'hook
interface UseAIReturn {
  // Funzioni principali
  sendMessage: (message: string, options?: SendMessageOptions) => Promise<FormattedResponse | null>;
  testWebSearch: (query: string) => Promise<SearchResult>;
  retrainModel: () => Promise<RetrainResult>;
  checkAIHealth: () => Promise<HealthCheckResponse | null>;
  
  // Gestione stato
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  aiHealth: HealthCheckResponse | null;
  
  // Dati conversazione
  conversation: ConversationMessage[];
  lastResponse: FormattedResponse | null;
  webSearchUsed: boolean;
  
  // Utilità
  clearError: () => void;
  cancelCurrentRequest: () => void;
  clearConversation: () => void;
  exportConversation: () => void;
  getSuggestions: (input: string) => string[];
  getUsageStats: () => ReturnType<typeof AIService.getUsageStats>;
  
  // Informazioni AI
  webSearchTriggers: string[];
  mightTriggerWebSearch: (message: string) => boolean;
  
  // Stato connessione
  retryCount: number;
  maxRetries: number;
}

export const useAI = (): UseAIReturn => {
  // Stati principali
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [aiHealth, setAiHealth] = useState<HealthCheckResponse | null>(null);
  
  // Stati aggiuntivi per funzionalità avanzate
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [lastResponse, setLastResponse] = useState<FormattedResponse | null>(null);
  const [webSearchUsed, setWebSearchUsed] = useState<boolean>(false);
  
  // Ref per gestire richieste multiple
  const currentRequestRef = useRef<CurrentRequest | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  /**
   * Verifica stato dell'AI all'avvio
   */
  useEffect(() => {
    checkAIHealth();
  }, []);

  /**
   * Verifica la salute dell'AI
   */
  const checkAIHealth = useCallback(async (): Promise<HealthCheckResponse | null> => {
    try {
      const health = await AIService.healthCheck();
      setAiHealth(health);
      setIsConnected(health.connected);
      
      if (!health.connected) {
        setError('AI non disponibile. Verifica che il server sia avviato.');
      } else {
        setError(null);
      }
      
      return health;
    } catch (err) {
      setIsConnected(false);
      setError('Impossibile verificare lo stato dell\'AI');
      console.error('Health check error:', err);
      return null;
    }
  }, []);

  /**
   * Invia messaggio all'AI con gestione avanzata
   */
  const sendMessage = useCallback(async (
    message: string, 
    options: SendMessageOptions = {}
  ): Promise<FormattedResponse | null> => {
    // Validazione input
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new Error('Il messaggio non può essere vuoto');
    }

    // Annulla richiesta precedente se in corso
    if (currentRequestRef.current) {
      currentRequestRef.current.cancelled = true;
    }

    const requestId = Date.now();
    currentRequestRef.current = { id: requestId, cancelled: false };

    setIsLoading(true);
    setError(null);
    setWebSearchUsed(false);

    try {
      
      // Invia richiesta
      const response = await AIService.sendMessage(message.trim());
      
      // Verifica se la richiesta è stata cancellata
      if (currentRequestRef.current?.cancelled || currentRequestRef.current?.id !== requestId) {
        return null;
      }

      // Formatta risposta
      const formattedResponse = AIService.formatResponse(response);
      
      // Aggiorna stati
      setLastResponse(formattedResponse);
      setWebSearchUsed(response.used_web_search || false);
      
      // Aggiorna conversazione se richiesto
      if (!options.skipConversationUpdate) {
        setConversation(prev => [
          ...prev,
          {
            id: requestId,
            type: 'user',
            content: message,
            timestamp: new Date().toISOString()
          },
          {
            id: requestId + 1,
            type: 'ai',
            content: formattedResponse.text,
            sources: formattedResponse.sources,
            webEnhanced: formattedResponse.isWebEnhanced,
            timestamp: formattedResponse.timestamp
          }
        ]);
      }

      // Aggiorna statistiche
      AIService.updateUsageStats(response, message);
      
      // Reset retry counter on success
      retryCountRef.current = 0;

      return formattedResponse;

    } catch (err) {
      // Verifica se la richiesta è stata cancellata
      if (currentRequestRef.current?.cancelled) {
        return null;
      }

      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      console.error('Errore invio messaggio:', err);
      
      // Gestione retry automatico per errori di rete
      if (errorMessage.includes('connettersi') && retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        setError(`Tentativo ${retryCountRef.current}/${maxRetries}...`);
        
        // Attendi prima del retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCountRef.current));
        
        // Riprova
        return sendMessage(message, options);
      }
      
      setError(errorMessage);
      throw err;

    } finally {
      setIsLoading(false);
      if (currentRequestRef.current?.id === requestId) {
        currentRequestRef.current = null;
      }
    }
  }, []);

  /**
   * Testa la ricerca web
   */
  const testWebSearch = useCallback(async (query: string): Promise<SearchResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await AIService.testWebSearch(query);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(`Errore test ricerca: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Riaddestra il modello
   */
  const retrainModel = useCallback(async (): Promise<RetrainResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AIService.retrainModel();
      
      // Verifica salute dopo riaddestramento
      setTimeout(checkAIHealth, 2000);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(`Errore riaddestramento: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [checkAIHealth]);

  /**
   * Cancella richiesta corrente
   */
  const cancelCurrentRequest = useCallback((): void => {
    if (currentRequestRef.current) {
      currentRequestRef.current.cancelled = true;
      currentRequestRef.current = null;
      setIsLoading(false);
      setError('Richiesta cancellata');
    }
  }, []);

  /**
   * Pulisce la conversazione
   */
  const clearConversation = useCallback((): void => {
    setConversation([]);
    setLastResponse(null);
    setWebSearchUsed(false);
  }, []);

  /**
   * Esporta conversazione
   */
  const exportConversation = useCallback((): void => {
    const exportData: ExportData = {
      conversation,
      aiHealth,
      stats: AIService.getUsageStats(),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversazione-ai-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }, [conversation, aiHealth]);

  /**
   * Ottieni suggerimenti per l'input
   */
  const getSuggestions = useCallback((input: string): string[] => {
    const inputLower = input.toLowerCase();
    
    const suggestions: string[] = [];
    
    // Suggerimenti basati sui trigger
    if (inputLower.includes('meteo') || inputLower.includes('tempo')) {
      suggestions.push('che tempo fa oggi', 'previsioni meteo domani');
    }
    
    if (inputLower.includes('notizie') || inputLower.includes('news')) {
      suggestions.push('ultime notizie', 'cosa sta succedendo oggi');
    }
    
    if (inputLower.includes('prezzo') || inputLower.includes('costo')) {
      suggestions.push('quanto costa', 'prezzo attuale di');
    }

    // Suggerimenti conversazionali
    if (input.length < 10) {
      suggestions.push(
        'come stai?',
        'cosa ne pensi di...',
        'parlami di...',
        'spiegami...'
      );
    }

    return suggestions.slice(0, 4);
  }, []);

  /**
   * Ottieni statistiche d'uso
   */
  const getUsageStats = useCallback(() => {
    return AIService.getUsageStats();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.cancelled = true;
      }
    };
  }, []);

  return {
    // Funzioni principali
    sendMessage,
    testWebSearch,
    retrainModel,
    checkAIHealth,
    
    // Gestione stato
    isLoading,
    error,
    isConnected,
    aiHealth,
    
    // Dati conversazione
    conversation,
    lastResponse,
    webSearchUsed,
    
    // Utilità
    clearError: () => setError(null),
    cancelCurrentRequest,
    clearConversation,
    exportConversation,
    getSuggestions,
    getUsageStats,
    
    // Informazioni AI
    webSearchTriggers: AIService.getWebSearchTriggers(),
    mightTriggerWebSearch: AIService.mightTriggerWebSearch,
    
    // Stato connessione
    retryCount: retryCountRef.current,
    maxRetries
  };
};

// Esporta anche i tipi per l'uso esterno
export type {
  ConversationMessage,
  SendMessageOptions,
  ExportData,
  UseAIReturn
};