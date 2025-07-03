// components/StarField.tsx
import React from 'react';
import { useStars } from '../hooks/useStars';

interface StarFieldProps {
  count?: number;
  intervalMin?: number;
  intervalMax?: number;
  className?: string;
}

const StarField: React.FC<StarFieldProps> = ({ 
  count = 20, 
  intervalMin = 8000, 
  intervalMax = 12000,
  className = "absolute inset-0"
}) => {
  const { stars } = useStars({ count, intervalMin, intervalMax });

  return (
    <div className={className}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse transition-all duration-[3000ms] ease-in-out"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.animationDelay}s`,
            animationDuration: `${star.animationDuration}s`
          }}
        />
      ))}
    </div>
  );
};

export default StarField;