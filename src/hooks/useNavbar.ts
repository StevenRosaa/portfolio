import { useState, useRef, useEffect } from 'react';

interface UseNavbarReturn {
  // State
  isNavCollapsed: boolean;
  isAnimating: boolean;
  
  // Actions
  toggleNavCollapse: () => void;
  
  // Computed values
  getNavPositionClasses: () => string;
  getNavContentClasses: () => string;
  getLogoClasses: () => string;
  getExpandableContentClasses: () => string;
  
  // Ref
  navRef: React.RefObject<HTMLDivElement | null>;
}

const NAVBAR_STORAGE_KEY = 'navbar-collapsed-state';

export const useNavbar = (): UseNavbarReturn => {
  // Inizializza lo stato leggendo da localStorage
  const [isNavCollapsed, setIsNavCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem(NAVBAR_STORAGE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.warn('Errore nel leggere lo stato navbar dal localStorage:', error);
      return false;
    }
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Salva lo stato in localStorage quando cambia
  useEffect(() => {
    try {
      localStorage.setItem(NAVBAR_STORAGE_KEY, JSON.stringify(isNavCollapsed));
    } catch (error) {
      console.warn('Errore nel salvare lo stato navbar nel localStorage:', error);
    }
  }, [isNavCollapsed]);

  // Toggle modalità collassata con animazione simmetrica
  const toggleNavCollapse = () => {
    if (isAnimating) return; // Previeni click multipli durante l'animazione
    
    setIsAnimating(true);
    setIsNavCollapsed(!isNavCollapsed);
    
    // Durata totale identica per entrambe le direzioni
    setTimeout(() => {
      setIsAnimating(false);
    }, 800); // Durata unica per entrambe le animazioni
  };

  // Calcola le classi CSS per la posizione del contenitore navbar
  const getNavPositionClasses = (): string => {
    const baseClasses = 'fixed top-6 z-50';
    
    if (isNavCollapsed) {
      // Quando collassata: movimento verso sinistra con delay
      return `${baseClasses} transition-all duration-500 ease-in-out delay-700 left-6`;
    }
    
    // Quando espansa: movimento verso centro con delay inverso
    return `${baseClasses} transition-all duration-500 ease-in-out delay-0 left-1/2 transform -translate-x-1/2`;
  };

  // Calcola le classi per il contenitore della navbar
  const getNavContentClasses = (): string => {
    const baseClasses = 'bg-black/20 backdrop-blur-xl border border-violet-500/90 shadow-2xl rounded-full px-4 py-3';
    
    if (isNavCollapsed) {
      // Riduzione dimensioni con delay intermedio
      return `${baseClasses} transition-all ease-in-out delay-150 w-auto`;
    }
    
    // Espansione con delay intermedio (simmetrico)
    return `${baseClasses} transition-all duration-500 ease-in-out delay-150 w-auto`;
  };

  // Calcola le classi per il logo
  const getLogoClasses = (): string => {
    const baseClasses = 'text-violet-300 font-medium text-lg tracking-wider flex-shrink-0 select-none';
    const transitionClasses = 'transition-all duration-400 ease-in-out';
    
    if (isNavCollapsed) {
      // Logo centrato con transizione fluida
      return `${baseClasses} ${transitionClasses} cursor-pointer hover:text-violet-200 hover:scale-110 mx-auto p-1`;
    }
    
    // Logo normale
    return `${baseClasses} ${transitionClasses}`;
  };

  // Calcola le classi per il contenuto espandibile
  const getExpandableContentClasses = (): string => {
    const baseClasses = 'flex items-center';
    
    if (isNavCollapsed) {
      // IMPLODE: nascondi il contenuto per ultimo nella sequenza di chiusura (delay 500)
      // Prima si sposta e si ridimensiona, POI gli elementi implodono visivamente
      return `${baseClasses} transform scale-x-0 transition-all duration-300 ease-in-out delay-500 opacity-0 max-w-0 ml-0 pointer-events-none`;
    }
    
    // EXPLODE: mostra il contenuto per ultimo nella sequenza di apertura (delay 500)
    // Prima si posiziona e si espande, POI gli elementi esplodono visivamente
    return `${baseClasses} transition-all duration-300 ease-in-out delay-500 opacity-100 max-w-[800px] ml-6 pointer-events-auto transform scale-x-100`;
  };

  return {
    // State
    isNavCollapsed,
    isAnimating,
    
    // Actions
    toggleNavCollapse,
    
    // Computed values
    getNavPositionClasses,
    getNavContentClasses,
    getLogoClasses,
    getExpandableContentClasses,
    
    // Ref
    navRef
  };
};