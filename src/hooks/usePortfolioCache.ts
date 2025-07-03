// hooks/usePortfolioCache.ts
import { useState, useEffect, useRef } from 'react';
import supabase from '../backend/supabase.ts';

interface PersonalConfig {
  whatsapp: string | undefined;
  telegram: string | undefined;
  name: string;
  title: string;
  description: string;
  email: string;
  github: string;
  linkedin: string;
}

interface AboutConfig {
  title: string;
  imageUrl: string;
  paragraphs: string[];
}

interface Skill {
  id: number;
  name: string;
  description: string;
  icon: string;
  color_gradient: string;
  sort_order: number;
}

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  status_color: string;
  image_emoji?: string;
  image_url?: string;
  github_url?: string;
  demo_url?: string;
  is_featured: boolean;
  technologies: { id: number; name: string; }[];
  category_id?: number;
  category?: {
    id: number;
    name: string;
    display_name: string;
    icon: string;
    color_gradient: string;
    hover_color: string;
  };
}

interface ContactConfig {
  title: string;
  subtitle: string;
  primaryButton: string;
  secondaryButton: string;
}

interface WhyChooseMeItem {
  id: number;
  icon: string;
  title: string;
  description: string;
  gradient: string;
  sort_order: number;
}

interface WhyChooseMeConfig {
  title: string;
  subtitle: string;
  cta_title: string;
  cta_subtitle: string;
  cta_primary_button: string;
  cta_secondary_button: string;
  items: WhyChooseMeItem[];
}

interface PortfolioData {
  personal: PersonalConfig | null;
  about: AboutConfig | null;
  skills: Skill[];
  projects: Project[];
  contact: ContactConfig | null;
  whyChooseMe: WhyChooseMeConfig | null;
}

// Stato globale semplificato
interface GlobalState {
  data: PortfolioData;
  error: string | null;
  lastFetch: number;
  currentVersion: string;
  initializationPromise: Promise<void> | null;
  isLoading: boolean;
}

// Configurazione cache
const CACHE_KEYS = {
  DATA: 'portfolio_data',
  VERSION: 'portfolio_data_version',
  LAST_FETCH: 'portfolio_last_fetch'
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti
const VERSION_CHECK_INTERVAL = 30 * 1000; // 30 secondi

// Stato globale iniziale - VUOTO, da popolare dal database
let globalState: GlobalState = {
  data: {
    personal: null,
    about: null,
    skills: [],
    projects: [],
    contact: null,
    whyChooseMe: null
  },
  error: null,
  lastFetch: 0,
  currentVersion: '',
  initializationPromise: null,
  isLoading: true
};

// Listeners per notificare i componenti degli aggiornamenti
const listeners = new Set<() => void>();

// Funzione per notificare tutti i listener
const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

// Utility functions per cache management
const cacheUtils = {
  setCache: (key: string, data: any) => {
    try {
      if (typeof window !== 'undefined') {
        (window as any).__portfolioCache = (window as any).__portfolioCache || {};
        (window as any).__portfolioCache[key] = {
          data,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      //console.warn('Cache write failed:', error);
    }
  },

  getCache: (key: string) => {
    try {
      if (typeof window !== 'undefined') {
        const cache = (window as any).__portfolioCache?.[key];
        if (cache) {
          return cache.data;
        }
      }
      return null;
    } catch (error) {
      //console.warn('Cache read failed:', error);
      return null;
    }
  },

  isCacheValid: (key: string, maxAge: number = CACHE_DURATION) => {
    try {
      if (typeof window !== 'undefined') {
        const cache = (window as any).__portfolioCache?.[key];
        if (cache) {
          return Date.now() - cache.timestamp < maxAge;
        }
      }
      return false;
    } catch (error) {
      //console.warn('Cache validation failed:', error);
      return false;
    }
  },

  getCacheAge: (key: string): number => {
    try {
      if (typeof window !== 'undefined') {
        const cache = (window as any).__portfolioCache?.[key];
        if (cache) {
          return Date.now() - cache.timestamp;
        }
      }
      return Infinity;
    } catch (error) {
      return Infinity;
    }
  },

  clearCache: () => {
    try {
      if (typeof window !== 'undefined') {
        (window as any).__portfolioCache = {};
      }
    } catch (error) {
      //console.warn('Cache clear failed:', error);
    }
  }
};

// Funzione per ottenere la versione corrente dei dati
const getCurrentDataVersion = async (): Promise<string> => {
  try {
    const { data: configData } = await supabase
      .from('portfolio_config')
      .select('updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1);

    const { data: skillsData } = await supabase
      .from('skills')
      .select('updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1);

    const { data: projectsData } = await supabase
      .from('projects')
      .select('updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1);

    const timestamps = [
      configData?.[0]?.updated_at || '',
      skillsData?.[0]?.updated_at || '',
      projectsData?.[0]?.updated_at || ''
    ].filter(Boolean);

    const versionString = timestamps.join('|');
    return btoa(versionString).slice(0, 16);
  } catch (error) {
    //console.error('Error getting data version:', error);
    return Date.now().toString();
  }
};

// Funzioni di fetch
const fetchPortfolioConfig = async () => {
  try {
    const { data, error } = await supabase
      .from('portfolio_config')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('No portfolio configuration found in database');
    }

    const configBySection: { [key: string]: { [key: string]: any } } = {};
    data.forEach(item => {
      if (!configBySection[item.section]) {
        configBySection[item.section] = {};
      }
      
      let value = item.value;
      if (item.data_type === 'json') {
        try {
          value = JSON.parse(item.value);
        } catch (e) {
          //console.error('Error parsing JSON:', e);
        }
      } else if (item.data_type === 'boolean') {
        value = item.value === 'true';
      }
      
      configBySection[item.section][item.key] = value;
    });

    // Costruzione della configurazione dalle sezioni del database
    const personal: PersonalConfig | null = configBySection.personal ? {
      whatsapp: configBySection.personal.whatsapp || undefined,
      telegram: configBySection.personal.telegram || undefined,
      name: configBySection.personal.name || '',
      title: configBySection.personal.title || '',
      description: configBySection.personal.description || '',
      email: configBySection.personal.email || '',
      github: configBySection.personal.github || '',
      linkedin: configBySection.personal.linkedin || ''
    } : null;

    // CORREZIONE: Costruzione corretta dell'array paragraphs
    const about: AboutConfig | null = configBySection.about ? {
      title: configBySection.about.title || '',
      imageUrl: configBySection.about.image_url || '', // Nota: image_url nel DB
      paragraphs: [
        configBySection.about.paragraph_1,
        configBySection.about.paragraph_2
      ].filter(Boolean) // Rimuove eventuali valori null/undefined
    } : null;

    const contact: ContactConfig | null = configBySection.contact ? {
      title: configBySection.contact.title || '',
      subtitle: configBySection.contact.subtitle || '',
      primaryButton: configBySection.contact.primary_button || '',
      secondaryButton: configBySection.contact.secondary_button || ''
    } : null;

    const whyChooseMe: WhyChooseMeConfig | null = configBySection.why_choose_me ? {
      title: configBySection.why_choose_me.title || '',
      subtitle: configBySection.why_choose_me.subtitle || '',
      cta_title: configBySection.why_choose_me.cta_title || '',
      cta_subtitle: configBySection.why_choose_me.cta_subtitle || '',
      cta_primary_button: configBySection.why_choose_me.cta_primary_button || '',
      cta_secondary_button: configBySection.why_choose_me.cta_secondary_button || '',
      items: configBySection.why_choose_me.items || []
    } : null;

    return {
      personal,
      about,
      contact,
      whyChooseMe
    };
  } catch (err) {
    //console.error('Error fetching portfolio configuration:', err);
    throw err;
  }
};

const fetchSkills = async (): Promise<Skill[]> => {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    //console.error('Error fetching skills:', err);
    throw err;
  }
};

const fetchProjects = async (): Promise<Project[]> => {
  try {
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select(`
        *,
        project_technologies (
          technologies (
            id,
            name
          )
        ),
        categories (
          id,
          name,
          display_name,
          icon,
          color_gradient,
          hover_color
        )
      `)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('sort_order', { ascending: true });

    if (projectsError) throw projectsError;

    if (projectsData) {
      return projectsData.map(project => ({
        ...project,
        technologies: project.project_technologies?.map((pt: any) => pt.technologies) || [],
        category: project.categories || undefined
      }));
    }
    
    return [];
  } catch (err) {
    //console.error('Error fetching projects:', err);
    throw err;
  }
};

// Funzione principale per caricare i dati
const loadAllData = async (forceRefresh = false): Promise<void> => {
  try {
    globalState.isLoading = true;
    notifyListeners();

    // Verifica se abbiamo bisogno di aggiornare
    if (!forceRefresh) {
      const now = Date.now();
      if (now - globalState.lastFetch < CACHE_DURATION && globalState.data.personal) {
        //console.log('📦 Data is still fresh, skipping fetch');
        globalState.isLoading = false;
        notifyListeners();
        return;
      }
      
      // Verifica cache
      if (cacheUtils.isCacheValid(CACHE_KEYS.DATA)) {
        const cachedData = cacheUtils.getCache(CACHE_KEYS.DATA);
        const cachedLastFetch = cacheUtils.getCache(CACHE_KEYS.LAST_FETCH) || 0;
        
        if (cachedData && cachedData.personal) {
          //console.log('📦 Using cached portfolio data');
          globalState.data = cachedData;
          globalState.lastFetch = cachedLastFetch;
          globalState.isLoading = false;
          notifyListeners();
          return;
        }
      }
    }

    //console.log('🔄 Fetching fresh portfolio data from database...');
    
    const [configData, skills, projects] = await Promise.all([
      fetchPortfolioConfig(),
      fetchSkills(),
      fetchProjects()
    ]);

    const portfolioData: PortfolioData = {
      personal: configData.personal,
      about: configData.about,
      contact: configData.contact,
      whyChooseMe: configData.whyChooseMe,
      skills,
      projects
    };

    // Verifica che abbiamo almeno i dati essenziali
    if (!portfolioData.personal) {
      throw new Error('Essential portfolio data missing from database');
    }

    // Aggiorna stato globale
    const now = Date.now();
    globalState.data = portfolioData;
    globalState.lastFetch = now;
    globalState.error = null;
    globalState.isLoading = false;

    // Salva nella cache
    cacheUtils.setCache(CACHE_KEYS.DATA, portfolioData);
    cacheUtils.setCache(CACHE_KEYS.LAST_FETCH, now);
    
    // Aggiorna la versione corrente
    const currentVersion = await getCurrentDataVersion();
    globalState.currentVersion = currentVersion;
    cacheUtils.setCache(CACHE_KEYS.VERSION, currentVersion);

    //console.log('✅ Portfolio data loaded from database');
    notifyListeners();
  } catch (error) {
    //console.error('Error loading portfolio data:', error);
    globalState.error = error instanceof Error ? error.message : 'Error loading portfolio data';
    globalState.isLoading = false;
    notifyListeners();
    throw error;
  }
};

// Controllo periodico degli aggiornamenti
let versionCheckInterval: NodeJS.Timeout | null = null;
let isCheckingVersion = false;

const startVersionCheck = () => {
  if (versionCheckInterval) return;

  const checkForUpdates = async () => {
    if (isCheckingVersion) return;
    isCheckingVersion = true;

    try {
      const newVersion = await getCurrentDataVersion();
      const cachedVersion = cacheUtils.getCache(CACHE_KEYS.VERSION);
      
      if (cachedVersion && newVersion !== cachedVersion && newVersion !== globalState.currentVersion) {
        //console.log('🔄 Data version changed, updating...');
        await loadAllData(true);
      }
    } catch (error) {
      //console.error('Error checking for updates:', error);
    } finally {
      isCheckingVersion = false;
    }
  };

  // Controllo iniziale dopo 2 secondi
  setTimeout(checkForUpdates, 2000);
  
  // Controllo periodico
  versionCheckInterval = setInterval(checkForUpdates, VERSION_CHECK_INTERVAL);
};

const stopVersionCheck = () => {
  if (versionCheckInterval) {
    clearInterval(versionCheckInterval);
    versionCheckInterval = null;
  }
  isCheckingVersion = false;
};

// Inizializzazione
const initializeAppData = async (): Promise<void> => {
  if (globalState.initializationPromise) {
    return globalState.initializationPromise;
  }

  globalState.initializationPromise = (async () => {
    try {
      //console.log('🚀 Initializing app data from database...');
      
      // Prova prima la cache
      const hasValidCache = cacheUtils.isCacheValid(CACHE_KEYS.DATA);
      
      if (hasValidCache) {
        const cachedData = cacheUtils.getCache(CACHE_KEYS.DATA);
        if (cachedData && cachedData.personal) {
          //console.log('📦 Loading from cache...');
          globalState.data = cachedData;
          globalState.lastFetch = cacheUtils.getCache(CACHE_KEYS.LAST_FETCH) || 0;
          globalState.isLoading = false;
          notifyListeners();
        }
      }
      
      // Se non abbiamo cache valida, carica dal database
      if (!hasValidCache || !globalState.data.personal) {
        await loadAllData(false);
      }
      
      //console.log('✅ App initialized with database data');
    } catch (error) {
      //console.error('❌ Error during initialization:', error);
      globalState.error = 'Failed to initialize portfolio data from database';
      globalState.isLoading = false;
      notifyListeners();
      throw error;
    }
  })();

  return globalState.initializationPromise;
};

export const usePortfolioCache = () => {
  const [localState, setLocalState] = useState(() => ({ 
    data: globalState.data,
    error: globalState.error,
    isLoading: globalState.isLoading
  }));
  const mountedRef = useRef(true);

  // Funzione per sincronizzare lo stato locale con quello globale
  const syncState = () => {
    if (mountedRef.current) {
      setLocalState({ 
        data: globalState.data,
        error: globalState.error,
        isLoading: globalState.isLoading
      });
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Aggiungi listener per gli aggiornamenti
    listeners.add(syncState);
    
    // Inizializza i dati
    initializeAppData().catch(console.error);
    
    // Avvia il controllo delle versioni
    startVersionCheck();

    return () => {
      mountedRef.current = false;
      listeners.delete(syncState);
      
      // Ferma il controllo solo se non ci sono più listener attivi
      if (listeners.size === 0) {
        stopVersionCheck();
      }
    };
  }, []);

  // Funzione per aggiornamento manuale
  const refreshData = async () => {
    //console.log('🔄 Manual refresh triggered');
    await loadAllData(true);
  };

  // Funzione per pulire la cache
  const clearCache = () => {
    cacheUtils.clearCache();
    globalState.data = {
      personal: null,
      about: null,
      skills: [],
      projects: [],
      contact: null,
      whyChooseMe: null
    };
    globalState.lastFetch = 0;
    globalState.currentVersion = '';
    globalState.initializationPromise = null;
    globalState.isLoading = true;
    setLocalState({ 
      data: globalState.data, 
      error: null,
      isLoading: true
    });
    //console.log('🗑️ Cache cleared');
  };

  return {
    data: localState.data,
    error: localState.error,
    isLoading: localState.isLoading,
    refreshData,
    clearCache,
    getCacheInfo: () => ({
      hasCache: cacheUtils.isCacheValid(CACHE_KEYS.DATA),
      cacheAge: cacheUtils.getCacheAge(CACHE_KEYS.DATA),
      version: cacheUtils.getCache(CACHE_KEYS.VERSION),
      currentVersion: globalState.currentVersion,
      lastFetch: new Date(globalState.lastFetch).toLocaleTimeString()
    })
  };
};

export const useWorksData = () => {
  const { data, error, isLoading, refreshData, clearCache, getCacheInfo } = usePortfolioCache();
  
  // Organizza i progetti per categoria usando i dati dal database
  const categorizeProjects = (projects: Project[]) => {
    const categorizedProjects = {
      games: [] as Project[],
      software: [] as Project[],
      ai: [] as Project[]
    };

    projects.forEach((project: Project) => {
      let categoryKey: keyof typeof categorizedProjects = 'software'; // default
      
      if (project.category) {
        // Usa la categoria dal database
        const categoryName = project.category.name.toLowerCase();
        if (categoryName.includes('game') || categoryName === 'games') {
          categoryKey = 'games';
        } else if (categoryName.includes('ai') || categoryName.includes('artificial') || categoryName === 'ai') {
          categoryKey = 'ai';
        } else if (categoryName.includes('software') || categoryName === 'software') {
          categoryKey = 'software';
        }
      } else if (project.category_id) {
        // Fallback usando category_id (dovrai adattare gli ID in base al tuo database)
        switch (project.category_id) {
          case 1:
            categoryKey = 'games';
            break;
          case 2:
            categoryKey = 'software';
            break;
          case 3:
            categoryKey = 'ai';
            break;
          default:
            categoryKey = 'software';
        }
      }

      categorizedProjects[categoryKey].push(project);
    });

    return categorizedProjects;
  };

  const worksData = categorizeProjects(data.projects);

  return {
    data,
    worksData,
    error,
    isLoading,
    refreshData,
    clearCache,
    getCacheInfo
  };
};