// hooks/useStars.ts
import { useState, useEffect, useMemo } from 'react';

interface Star {
  id: number;
  left: number;
  top: number;
  animationDelay: number;
  animationDuration: number;
}

interface UseStarsOptions {
  count?: number;
  intervalMin?: number;
  intervalMax?: number;
}

export const useStars = (options: UseStarsOptions = {}) => {
  const {
    count = 20,
    intervalMin = 8000,
    intervalMax = 12000
  } = options;

  // Generiamo le stelle una sola volta e le salviamo in localStorage
  const initialStars = useMemo(() => {
    const storageKey = 'portfolio-stars-positions';
    
    // Prova a recuperare le posizioni salvate
    const savedStars = localStorage.getItem(storageKey);
    
    if (savedStars) {
      try {
        return JSON.parse(savedStars);
      } catch {
        // Se c'è un errore nel parsing, genera nuove stelle
      }
    }
    
    // Genera nuove stelle se non ci sono posizioni salvate
    const newStars = [...Array(count)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 2 + Math.random() * 3,
    }));
    
    // Salva le nuove posizioni
    localStorage.setItem(storageKey, JSON.stringify(newStars));
    return newStars;
  }, [count]);

  const [stars, setStars] = useState<Star[]>(initialStars);

  // Funzione per generare nuove posizioni casuali
  const generateNewPositions = () => {
    setStars(prevStars => 
      prevStars.map(star => ({
        ...star,
        left: Math.random() * 100,
        top: Math.random() * 100
      }))
    );
  };

  // Effetto per il movimento automatico delle stelle
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleNextMovement = () => {
      const randomInterval = intervalMin + Math.random() * (intervalMax - intervalMin);
      
      timeoutId = setTimeout(() => {
        generateNewPositions();
        scheduleNextMovement(); // Programma il prossimo movimento
      }, randomInterval);
    };

    // Inizia il ciclo di movimento
    scheduleNextMovement();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [intervalMin, intervalMax]);

  // Funzione per resettare le stelle (utile per debug)
  const resetStars = () => {
    localStorage.removeItem('portfolio-stars-positions');
    const newStars = [...Array(count)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 2 + Math.random() * 3,
    }));
    
    localStorage.setItem('portfolio-stars-positions', JSON.stringify(newStars));
    setStars(newStars);
  };

  return {
    stars,
    generateNewPositions,
    resetStars
  };
};