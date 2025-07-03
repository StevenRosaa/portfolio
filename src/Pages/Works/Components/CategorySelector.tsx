// components/CategorySelector.tsx
import React from 'react';
import { CATEGORIES } from './categories';
import type { WorksData } from './type';

interface CategorySelectorProps {
  activeCategory: keyof WorksData;
  onCategoryChange: (category: keyof WorksData) => void;
  worksData: WorksData;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  activeCategory, 
  onCategoryChange, 
  worksData 
}) => {
  return (
    <section className="py-12 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            const projectCount = worksData[category.id]?.length || 0;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`group relative p-6 lg:p-8 rounded-3xl border transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 ${
                  isActive 
                    ? 'bg-gray-800/80 border-white/20 shadow-2xl ' + category.hoverColor
                    : 'bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 backdrop-blur-md border-violet-500/20 hover:border-violet-400/40 hover:shadow-xl hover:shadow-violet-500/20'
                }`}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/5 via-purple-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                
                <div className="text-center relative">
                  <div className={`inline-flex p-3 lg:p-4 rounded-xl mb-4 bg-gradient-to-r ${category.color} ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  } transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-white drop-shadow-lg" />
                  </div>
                  <h3 className={`text-lg lg:text-xl font-medium transition-colors duration-300 drop-shadow-sm ${
                    isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                  }`}>
                    {category.name}
                  </h3>
                  <p className="text-sm text-white/50 mt-1 font-light">
                    {projectCount} project{projectCount !== 1 ? 's' : ''}
                  </p>
                </div>
                
                {isActive && (
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};