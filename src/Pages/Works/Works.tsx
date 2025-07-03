import React, { useState, useEffect } from 'react';
import { Github, Code } from 'lucide-react';

// Import types
import type { Project, WorksData } from './Components/type';

// Import constants
import { CATEGORIES } from './Components/categories';

// Import hooks
import { useAuth } from '../../hooks/useAuth';
import { useWorksData } from '../../hooks/usePortfolioCache';
import { useStarsAnimation } from './Components/useStarsAnimation';

// Import components
import Navbar from '../Navbar';
import { AnimatedBackground } from './Components/AnimatedBackground';
import { AiChat } from './Components/AiChat';

// ✨ Typing Text Component (riutilizzato da Home)
type TypingTextProps = {
  text?: string;
  speed?: number;
  delay?: number;
  className?: string;
  showCursor?: boolean;
  onComplete?: () => void;
};

const TypingText = ({ 
  text, 
  speed = 50, 
  delay = 0, 
  className = "", 
  showCursor = false,
  onComplete = () => {} 
}: TypingTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else if (!isComplete) {
        setIsComplete(true);
        onComplete();
      }
    }, currentIndex === 0 ? delay : speed);

    return () => clearTimeout(timer);
  }, [text, currentIndex, speed, delay, isComplete, onComplete]);

  useEffect(() => {
    if (!text) return;
    setDisplayText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  if (!text) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="h-6 bg-gradient-to-r from-violet-600/30 to-cyan-600/30 rounded animate-shimmer"></div>
      </div>
    );
  }

  return (
    <span className={className}>
      {displayText}
      {showCursor && !isComplete && (
        <span className="animate-blink text-violet-400">|</span>
      )}
    </span>
  );
};

// ✨ Bouncing Dots Component
const BouncingDots = ({ className = "" }: { className?: string }) => (
  <div className={`flex space-x-1 ${className}`}>
    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
  </div>
);

// ✨ Project Card Skeleton Component
const ProjectCardSkeleton = () => (
  <div className="group relative rounded-3xl bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 backdrop-blur-md border border-violet-500/20 overflow-hidden animate-pulse">
    {/* Shimmer effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/10 to-transparent -translate-x-full animate-shimmer"></div>
    
    <div className="p-8 space-y-6">
      {/* Image placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-violet-600/20 to-cyan-600/20 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-cyan-600/30 animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-violet-500/30 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Title placeholder */}
      <div className="space-y-3">
        <div className="h-8 bg-gradient-to-r from-violet-600/30 to-cyan-600/30 rounded-lg animate-shimmer"></div>
        <div className="h-6 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded-lg w-3/4 animate-shimmer"></div>
      </div>

      {/* Description placeholder */}
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded animate-shimmer"></div>
        <div className="h-4 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded w-5/6 animate-shimmer"></div>
        <div className="h-4 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded w-2/3 animate-shimmer"></div>
      </div>

      {/* Tags placeholder */}
      <div className="flex flex-wrap gap-2">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className="h-6 w-16 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded-full animate-shimmer"
            style={{ animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>

      {/* Buttons placeholder */}
      <div className="flex gap-3 pt-4">
        <div className="h-10 w-32 bg-gradient-to-r from-violet-600/30 to-cyan-600/30 rounded-full animate-shimmer"></div>
        <div className="h-10 w-10 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded-full animate-shimmer"></div>
      </div>
    </div>
  </div>
);

// ✨ Category Button with Loading
const CategoryButtonWithLoading = ({ 
  category, 
  isActive, 
  count, 
  isLoading, 
  onClick 
}: {
  category: any;
  isActive: boolean;
  count: number;
  isLoading: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`group relative px-6 py-4 rounded-2xl transition-all duration-500 transform hover:scale-105 ${
      isActive 
        ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-2xl shadow-violet-500/50' 
        : 'bg-gray-800/50 text-white/70 hover:bg-gray-700/50 hover:text-white border border-gray-700/50 hover:border-violet-500/30'
    }`}
  >
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div className="relative flex items-center space-x-3">
      <category.icon className="w-5 h-5" />
      <span className="font-medium">{category.name}</span>
      
      {/* Count with loading animation */}
      <div className="flex items-center justify-center min-w-[24px] h-6">
        {isLoading ? (
          <BouncingDots className="scale-75" />
        ) : (
          <span className={`text-sm px-2 py-1 rounded-full ${
            isActive 
              ? 'bg-white/20 text-white' 
              : 'bg-violet-500/20 text-violet-300'
          }`}>
            {count}
          </span>
        )}
      </div>
    </div>
  </button>
);

// ✨ Enhanced Category Selector with Loading
const EnhancedCategorySelector = ({ 
  activeCategory, 
  onCategoryChange, 
  worksData, 
  isLoading 
}: {
  activeCategory: keyof WorksData;
  onCategoryChange: (category: keyof WorksData) => void;
  worksData: WorksData;
  isLoading: boolean;
}) => (
  <section className="py-12 relative z-10">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-thin text-white mb-6 tracking-tight drop-shadow-lg">
          <TypingText 
            text="Explore My Work" 
            speed={100}
            delay={1000}
            className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"
            showCursor={false}
          />
        </h2>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent mx-auto"></div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {CATEGORIES.map((category) => (
          <CategoryButtonWithLoading
            key={category.id}
            category={category}
            isActive={activeCategory === category.id}
            count={worksData[category.id]?.length || 0}
            isLoading={isLoading}
            onClick={() => onCategoryChange(category.id)}
          />
        ))}
      </div>
    </div>
  </section>
);

// ✨ Projects Grid with Loading
const ProjectsGridWithLoading = ({ 
  projects, 
  categoryName, 
  isLoading 
}: {
  projects: Project[];
  categoryName: string;
  isLoading: boolean;
}) => (
  <div className="space-y-8">
    <div className="text-center">
      <h3 className="text-3xl font-thin text-white tracking-tight drop-shadow-lg mb-4">
        <TypingText 
          text={categoryName} 
          speed={80}
          delay={0}
          className=""
          showCursor={false}
        />
      </h3>
      <div className="flex items-center justify-center">
        {isLoading ? (
          <BouncingDots />
        ) : (
          <span className="text-white/60 font-light">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </span>
        )}
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {isLoading ? (
        // Show skeleton cards while loading
        [...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="opacity-0 animate-fadeIn"
            style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'forwards' }}
          >
            <ProjectCardSkeleton />
          </div>
        ))
      ) : (
        // Show actual projects
        projects.map((project, index) => (
          <div
            key={project.id}
            className="opacity-0 animate-fadeIn"
            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
          >
            <ProjectCard project={project} />
          </div>
        ))
      )}
    </div>
  </div>
);

// ✨ Simple Project Card Component (placeholder)
const ProjectCard = ({ project }: { project: Project }) => (
  <div className="group relative rounded-3xl bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 backdrop-blur-md border border-violet-500/20 hover:border-violet-400/40 transition-all duration-700 hover:scale-105 hover:-translate-y-3 shadow-xl hover:shadow-2xl hover:shadow-violet-500/25 overflow-hidden">
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/5 via-purple-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
    
    <div className="p-8 relative">
      {/* Project Image */}
      <div className="relative h-48 bg-gradient-to-br from-violet-600/20 to-cyan-600/20 rounded-2xl overflow-hidden mb-6">
        {project.image_url ? (
          <img 
            src={project.image_url} 
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Code className="w-16 h-16 text-violet-400/50" />
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="space-y-4">
        <h3 className="text-2xl font-medium text-white/95 group-hover:text-violet-300 transition-colors duration-500">
          {project.name}
        </h3>
        
        <p className="text-white/75 leading-relaxed font-light line-clamp-3">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags?.map((tag: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, i: React.Key | null | undefined) => (
            <span 
              key={i}
              className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm font-light"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-full font-light tracking-wide hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300 text-center"
            >
              View Demo
            </a>
          )}
          
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-violet-500/30 text-violet-400 rounded-full hover:border-violet-400/50 hover:bg-violet-500/10 transition-all duration-300"
            >
              <Github className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  </div>
);

export function Works() {
  const [activeCategory, setActiveCategory] = useState<keyof WorksData>('games');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hooks per autenticazione e dati
  const { isAuthenticated, logout } = useAuth();
  
  // ✨ Usa il hook ottimizzato per i portfolio data
  const { worksData, error, refreshData, clearCache, getCacheInfo } = useWorksData() as unknown as {
    data: any;
    worksData: WorksData;
    error: any;
    refreshData: () => void;
    clearCache: () => void;
    getCacheInfo: () => any;
  };
  
  // ✨ Usa il hook per l'animazione delle stelle
  const stars = useStarsAnimation();

  // ✨ Simula il caricamento dei dati
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500 + Math.random() * 1000); // Simula caricamento variabile

    return () => clearTimeout(timer);
  }, [activeCategory]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    refreshData();
  };

  const handleDebugCache = () => {
    const cacheInfo = getCacheInfo();
    console.log('📊 Cache Info:', cacheInfo);
  };

  const renderAiSection = () => (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* AI Chat Component */}
      <AiChat />
      
      {/* AI Projects */}
      <ProjectsGridWithLoading
        projects={worksData[activeCategory]}
        categoryName="AI Projects"
        isLoading={isLoading}
      />
    </div>
  );

  // Debug info
  if (error) {
    console.warn('⚠️ Portfolio data error:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-x-hidden relative">
      {/* ✨ Animated Background Component */}
      <AnimatedBackground stars={stars} />

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .glow-effect {
          animation: glow 3s ease-in-out infinite;
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite ease-in-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>

      {/* Navbar Component */}
      <Navbar 
        isAuthenticated={isAuthenticated}
        isDropdownOpen={isDropdownOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        onDropdownToggle={() => setDropdownOpen(!isDropdownOpen)}
        onMobileMenuToggle={() => setMobileMenuOpen(!isMobileMenuOpen)}
        onLogout={handleLogout}
        onManualRefresh={handleManualRefresh}
        onDebugCache={handleDebugCache}
        onClearCache={clearCache}
        isDevelopment={process.env.NODE_ENV === 'development'}
      />

      {/* Hero Section */}
      <section className="py-16 lg:py-24 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-96 bg-gradient-to-r from-violet-600/30 via-purple-600/20 to-cyan-600/30 rounded-full blur-3xl animate-pulse glow-effect"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-thin mb-6 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent leading-tight tracking-tight drop-shadow-2xl">
            <TypingText 
              text="My Works" 
              speed={150}
              delay={200}
              className=""
              showCursor={false}
            />
          </h1>
          <p className="text-lg lg:text-xl text-white/70 mb-12 max-w-4xl mx-auto leading-relaxed font-light drop-shadow-lg">
            <TypingText 
              text="Explore my journey through games, software, and AI - where creativity meets cutting-edge technology" 
              speed={40}
              delay={1000}
              className=""
              showCursor={false}
            />
          </p>
        </div>
      </section>

      {/* ✨ Enhanced Category Selection Component */}
      <EnhancedCategorySelector 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        worksData={worksData}
        isLoading={isLoading}
      />

      {/* Content Section */}
      <section className="py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {activeCategory === 'ai' ? renderAiSection() : (
            <ProjectsGridWithLoading
              projects={worksData[activeCategory]}
              categoryName={CATEGORIES.find(cat => cat.id === activeCategory)?.name || 'Projects'}
              isLoading={isLoading}
            />
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-violet-500/20 mt-16">
        <div className="absolute inset-0 bg-gradient-to-t from-violet-900/10 to-transparent"></div>
        <div className="max-w-6xl mx-auto px-6 py-12 text-center relative">
          <p className="text-white/60 font-light tracking-wide drop-shadow-sm">
            <TypingText 
              text="© 2025 · Crafted with precision and passion" 
              speed={80}
              delay={0}
              className=""
              showCursor={false}
            />
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Works;