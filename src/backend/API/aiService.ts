// aiService.ts - Servizio per interfacciarsi con l'AI italiana potenziata

// Tipi per le risposte dell'API
interface AIResponse {
  response: string;
  sources?: string[];
  used_web_search?: boolean;
}

interface APIResponse extends AIResponse {
  timestamp: string;
}

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'error';
  connected: boolean;
  error?: string;
  [key: string]: any; // Per altri campi dal server
}

interface SearchResult {
  [key: string]: any; // Dipende dalla struttura dei risultati di ricerca
}

interface RetrainResult {
  [key: string]: any; // Dipende dalla struttura del risultato di riaddestramento
}

interface FormattedResponse {
  text: string;
  hasSources: boolean;
  sources: string[];
  isWebEnhanced: boolean;
  timestamp: string;
  badge?: string;
  sourcesBadge?: string;
}

interface UsageStats {
  totalMessages: number;
  webSearchUsed: number;
  lastUsed: string | null;
  favoriteTopics: TopicCount[];
}

interface TopicCount {
  word: string;
  count: number;
}

// Gestione URL API per ambiente browser
const getApiBaseUrl = (): string => {
  // In un'app React, usa import.meta.env per Vite o process.env per Create React App
  if (typeof window !== 'undefined') {
    // Browser environment
    return (window as any).ENV?.REACT_APP_AI_API_URL || 
           (import.meta?.env?.VITE_AI_API_URL) || 
           'http://localhost:8000';
  }
  // Fallback per altri ambienti
  return 'http://localhost:8000';
};

const API_BASE_URL: string = getApiBaseUrl();

export class AIService {
  /**
   * Invia un messaggio all'AI italiana
   * @param message - Il messaggio da inviare
   * @returns Risposta dell'AI con sources e web_search flag
   */
  static async sendMessage(message: string): Promise<APIResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Errore HTTP: ${response.status} ${response.statusText}`
        );
      }

      const data: AIResponse = await response.json();
      
      // Valida la struttura della risposta
      if (!data.response) {
        throw new Error('Risposta dell\'AI non valida');
      }

      return {
        response: data.response,
        sources: data.sources || [],
        used_web_search: data.used_web_search || false,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Errore AI Service:', error);
      
      // Gestione errori specifici
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Impossibile connettersi al server AI. Verifica che sia in esecuzione.');
      }
      
      throw error;
    }
  }

  /**
   * Verifica lo stato dell'AI
   * @returns Informazioni sullo stato dell'AI
   */
  static async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        return { 
          status: 'unhealthy', 
          error: `HTTP ${response.status}`,
          connected: false 
        };
      }

      const healthData = await response.json();
      
      return {
        status: 'healthy',
        connected: true,
        ...healthData
      };

    } catch (error) {
      console.error('Health check failed:', error);
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        connected: false 
      };
    }
  }

  /**
   * Testa la ricerca web
   * @param query - Query di ricerca
   * @returns Risultati della ricerca
   */
  static async testWebSearch(query: string): Promise<SearchResult> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(`${API_BASE_URL}/search/${encodedQuery}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Errore ricerca: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Errore test ricerca web:', error);
      throw error;
    }
  }

  /**
   * Riaddestra il modello
   * @returns Risultato del riaddestramento
   */
  static async retrainModel(): Promise<RetrainResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/retrain`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Errore riaddestramento: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Errore riaddestramento:', error);
      throw error;
    }
  }

  /**
   * Ottiene informazioni sui trigger di ricerca web
   * @returns Lista dei trigger keywords
   */
  static getWebSearchTriggers(): string[] {
    return [
      'notizie', 'news', 'oggi', 'attualmente', 'recente', 'ultimo', 'aggiornamento',
      'cosa sta succedendo', 'eventi attuali', 'situazione attuale', 'adesso',
      'meteo', 'tempo', 'previsioni', 'temperatura',
      'prezzo', 'costo', 'quanto costa', 'mercato', 'borsa',
      'orari', 'programma', 'quando apre', 'quando chiude',
      'dove si trova', 'indirizzo', 'come arrivare',
      'chi è', 'biografia', 'informazioni su'
    ];
  }

  /**
   * Verifica se un messaggio potrebbe attivare la ricerca web
   * @param message - Messaggio da verificare
   * @returns True se potrebbe attivare ricerca web
   */
  static mightTriggerWebSearch(message: string): boolean {
    const triggers = this.getWebSearchTriggers();
    const lowerMessage = message.toLowerCase();
    
    return triggers.some(trigger => lowerMessage.includes(trigger));
  }

  /**
   * Formatta la risposta per la visualizzazione
   * @param aiResponse - Risposta dell'AI
   * @returns Risposta formattata
   */
  static formatResponse(aiResponse: APIResponse): FormattedResponse {
    const formatted: FormattedResponse = {
      text: aiResponse.response,
      hasSources: aiResponse.sources ? aiResponse.sources.length > 0 : false,
      sources: aiResponse.sources || [],
      isWebEnhanced: aiResponse.used_web_search || false,
      timestamp: aiResponse.timestamp || new Date().toISOString()
    };

    // Aggiungi indicatori visivi
    if (formatted.isWebEnhanced) {
      formatted.badge = '🌐 Risposta aggiornata';
    }

    if (formatted.hasSources) {
      formatted.sourcesBadge = `📚 ${formatted.sources.length} fonte${formatted.sources.length > 1 ? 'i' : ''}`;
    }

    return formatted;
  }

  /**
   * Ottiene statistiche sull'utilizzo
   * @returns Statistiche dal localStorage
   */
  static getUsageStats(): UsageStats {
    try {
      const stats = JSON.parse(localStorage.getItem('ai_usage_stats') || '{}');
      return {
        totalMessages: stats.totalMessages || 0,
        webSearchUsed: stats.webSearchUsed || 0,
        lastUsed: stats.lastUsed || null,
        favoriteTopics: stats.favoriteTopics || []
      };
    } catch {
      return {
        totalMessages: 0,
        webSearchUsed: 0,
        lastUsed: null,
        favoriteTopics: []
      };
    }
  }

  /**
   * Aggiorna statistiche utilizzo
   * @param aiResponse - Risposta dell'AI
   * @param userMessage - Messaggio dell'utente
   */
  static updateUsageStats(aiResponse: APIResponse, userMessage: string): void {
    try {
      const stats = this.getUsageStats();
      
      stats.totalMessages += 1;
      if (aiResponse.used_web_search) {
        stats.webSearchUsed += 1;
      }
      stats.lastUsed = new Date().toISOString();

      // Analizza topic (semplificato)
      const words = userMessage.toLowerCase().split(' ');
      const topicWords = words.filter(word => word.length > 3);
      topicWords.forEach(word => {
        const existing = stats.favoriteTopics.find(t => t.word === word);
        if (existing) {
          existing.count += 1;
        } else {
          stats.favoriteTopics.push({ word, count: 1 });
        }
      });

      // Mantieni solo i top 10 topic
      stats.favoriteTopics = stats.favoriteTopics
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      localStorage.setItem('ai_usage_stats', JSON.stringify(stats));
    } catch (error) {
      console.warn('Impossibile aggiornare statistiche:', error);
    }
  }
}

// Esporta anche i tipi per l'uso esterno
export type {
  AIResponse,
  APIResponse,
  HealthCheckResponse,
  SearchResult,
  RetrainResult,
  FormattedResponse,
  UsageStats,
  TopicCount
};