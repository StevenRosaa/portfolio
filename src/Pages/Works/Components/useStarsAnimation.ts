// hooks/useStarsAnimation.ts
import { useState, useEffect, useMemo } from 'react';

interface Star {
  id: number;
  initialLeft: number;
  initialTop: number;
  animationDelay: number;
  animationDuration: number;
  left: number;
  top: number;
}

export const useStarsAnimation = () => {
  const starsData = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      initialLeft: Math.random() * 100,
      initialTop: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 2 + Math.random() * 3,
      left: Math.random() * 100,
      top: Math.random() * 100
    }));
  }, []);

  const [stars, setStars] = useState<Star[]>(starsData);

  useEffect(() => {
    const changeStarsPosition = () => {
      setStars(prevStars => 
        prevStars.map(star => ({
          ...star,
          left: Math.random() * 100,
          top: Math.random() * 100
        }))
      );
    };

    const randomInterval = 8000 + Math.random() * 4000;
    
    const interval = setInterval(() => {
      changeStarsPosition();
      clearInterval(interval);
      setTimeout(() => {
        const newInterval = setInterval(changeStarsPosition, 8000 + Math.random() * 4000);
        return () => clearInterval(newInterval);
      }, 8000 + Math.random() * 4000);
    }, randomInterval);

    return () => clearInterval(interval);
  }, []);

  return stars;
};