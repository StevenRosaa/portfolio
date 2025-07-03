// components/ProjectCard.tsx
import React from 'react';
import { Github, ExternalLink } from 'lucide-react';
import type { Project } from './type';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div 
      className="group relative p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 backdrop-blur-md border border-violet-500/20 hover:border-violet-400/40 transition-all duration-700 hover:scale-[1.02] hover:-translate-y-2 shadow-xl hover:shadow-2xl hover:shadow-violet-500/20 cursor-pointer"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/5 via-purple-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
      
      <div className="relative flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="text-3xl lg:text-4xl flex-shrink-0">
            {project.image_emoji || '🚀'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-medium text-white/95 mb-3 group-hover:text-violet-300 transition-colors duration-500 drop-shadow-sm break-words">
              {project.title}
            </h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${project.status_color}/20 text-${project.status_color} border border-${project.status_color}/30`}>
              {project.status}
            </div>
          </div>
        </div>
        <div className="flex gap-3 self-start sm:self-auto">
          {project.github_url && project.github_url !== '#' && (
            <a 
              href={project.github_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white hover:scale-110 transition-all duration-300 p-1"
            >
              <Github className="w-5 h-5" />
            </a>
          )}
          {project.demo_url && project.demo_url !== '#' && (
            <a 
              href={project.demo_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white hover:scale-110 transition-all duration-300 p-1"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
      
      <p className="text-white/75 mb-6 leading-relaxed font-light group-hover:text-white/90 transition-colors duration-500">
        {project.description}
      </p>
      
      <div className="flex flex-wrap gap-2">
        {project.technologies.map((tech) => (
          <span 
            key={tech.id} 
            className="bg-gray-800/50 text-white/70 px-3 py-1 rounded-full text-sm font-light border border-white/10 hover:border-white/20 hover:bg-gray-700/50 transition-all duration-300"
          >
            {tech.name}
          </span>
        ))}
      </div>
    </div>
  );
};