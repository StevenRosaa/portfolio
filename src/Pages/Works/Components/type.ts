// types/index.ts
export interface Project {
  name: string | undefined;
  tags: any;
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
}

export interface WorksData {
  games: Project[];
  software: Project[];
  ai: Project[];
}

export interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface Category {
  id: keyof WorksData;
  name: string;
  icon: any;
  color: string;
  hoverColor: string;
}