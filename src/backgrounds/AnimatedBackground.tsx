// components/AnimatedBackground.tsx
import React from 'react';
import StarField from './StarField';

interface AnimatedBackgroundProps {
  showStars?: boolean;
  showOrbs?: boolean;
  showGrid?: boolean;
  starsCount?: number;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  showStars = true,
  showOrbs = true,
  showGrid = true,
  starsCount = 20
}) => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Gradient orbs */}
      {showOrbs && (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
          <div 
            className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" 
            style={{animationDelay: '1s'}}
          />
          <div 
            className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-full blur-3xl animate-pulse" 
            style={{animationDelay: '2s'}}
          />
        </>
      )}
      
      {/* Floating stars */}
      {showStars && (
        <StarField 
          count={starsCount}
          intervalMin={8000}
          intervalMax={12000}
        />
      )}
      
      {/* Grid pattern */}
      {showGrid && (
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '60px 60px',
            animation: 'gridMove 20s linear infinite'
          }}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3); }
        }
        
        .glow-effect {
          animation: glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
