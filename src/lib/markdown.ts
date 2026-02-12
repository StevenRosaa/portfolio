import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ProfileData, Project } from '@/types';

// Content directory definitions
const contentDirectory = path.join(process.cwd(), 'content');
const projectsDirectory = path.join(contentDirectory, 'projects');

/**
 * Fetches profile information from the root profile.md file.
 * Separates YAML front-matter from Markdown content.
 */
export function getProfile(): ProfileData {
  const fullPath = path.join(contentDirectory, 'profile.md');
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  // matter extracts metadata (data) and the body of the markdown (content)
  const { data, content } = matter(fileContents);

  return {
    ...data,
    bio: content, // The Markdown body is assigned to the bio property
  } as ProfileData;
}

/**
 * Retrieves all project markdown files from the projects directory.
 * Maps filenames to slugs and parses file contents.
 */
export function getAllProjects(): Project[] {
  const fileNames = fs.readdirSync(projectsDirectory);

  const projects = fileNames.map((fileName) => {
    // Generate URL slug by removing the file extension
    const slug = fileName.replace(/\.md$/, ''); 
    const fullPath = path.join(projectsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      ...data,
      content,
    } as Project;
  });

  return projects;
}