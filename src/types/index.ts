export interface SocialLink {
  platform: string;
  url: string;
  icon: string; // The icon identifier (e.g., 'Github', 'Linkedin')
}

export interface ProfileData {
  name: string;
  role: string;
  bio: string; // Brief introductory text
  avatar: string; // Public directory image path
  location: string;
  email: string;
  socials: SocialLink[];
  skills: string[]; // List of primary technical skills
}

export interface Project {
  slug: string; // URL-friendly identifier (e.g., 'ecommerce-site')
  title: string;
  description: string;
  tags: string[]; // Array of technologies used in the project
  coverImage: string;
  images: string[]; // Array of image paths for the project slider
  linkDemo?: string;
  linkRepo?: string;
  content: string; // Markdown body content
}