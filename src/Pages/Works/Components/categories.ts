// constants/categories.ts
import { Gamepad2, Code, Brain } from 'lucide-react';
import type { Category, WorksData } from './type';

export const CATEGORIES: Category[] = [
  { 
    id: 'games' as keyof WorksData, 
    name: 'Games', 
    icon: Gamepad2, 
    color: 'from-green-500 to-emerald-500',
    hoverColor: 'hover:shadow-green-500/30'
  },
  { 
    id: 'software' as keyof WorksData, 
    name: 'Software', 
    icon: Code, 
    color: 'from-blue-500 to-cyan-500',
    hoverColor: 'hover:shadow-blue-500/30'
  },
  { 
    id: 'ai' as keyof WorksData, 
    name: 'AI', 
    icon: Brain, 
    color: 'from-purple-500 to-pink-500',
    hoverColor: 'hover:shadow-purple-500/30'
  }
];