// components/ProjectsList.tsx
import React from 'react';
import type { Project } from './type';
import { ProjectCard } from './ProjectCard';

interface ProjectsListProps {
  projects: Project[];
  categoryName: string;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({ projects, categoryName }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12 text-white/60">
        <div className="text-4xl mb-4">🚧</div>
        <h3 className="text-xl mb-2 font-light">No projects in this category yet</h3>
        <p className="font-light">Check back soon for exciting new {categoryName} projects!</p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-6 lg:gap-8 max-w-7xl mx-auto">
      {projects.map((project, index) => (
        <ProjectCard 
          key={project.id || index} 
          project={project}
          index={index}
        />
      ))}
    </div>
  );
};