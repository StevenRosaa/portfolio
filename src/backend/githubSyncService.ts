// services/githubSyncService.ts
import supabase from '../backend/supabase';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  updated_at: string;
  archived: boolean;
  disabled: boolean;
  private: boolean;
}

interface GitHubApiResponse {
  items: GitHubRepo[];
  total_count: number;
}

interface Technology {
  id: number;
  name: string;
  color: string | null;
  icon: string | null;
  category: string | null;
  is_active: boolean;
}

class GitHubSyncService {
  private readonly GITHUB_TOKEN: string;
  private readonly GITHUB_USERNAME: string;
  private readonly TARGET_TOPICS = ['games', 'software', 'ai'];

  constructor() {
    this.GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';
    this.GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME || '';
    
    if (!this.GITHUB_TOKEN || !this.GITHUB_USERNAME) {
      console.error('GitHub token or username not configured');
    }
  }

  /**
   * Recupera tutti i repository con i topic specificati
   */
  private async fetchRepositoriesWithTopics(): Promise<GitHubRepo[]> {
    const allRepos: GitHubRepo[] = [];
    
    for (const topic of this.TARGET_TOPICS) {
      try {
        const response = await fetch(
          `https://api.github.com/search/repositories?q=user:${this.GITHUB_USERNAME}+topic:${topic}`,
          {
            headers: {
              'Authorization': `Bearer ${this.GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const data: GitHubApiResponse = await response.json();
        
        // Filtra repository duplicati (un repo può avere più topic)
        data.items.forEach(repo => {
          if (!allRepos.find(existing => existing.id === repo.id)) {
            allRepos.push(repo);
          }
        });
        
      } catch (error) {
        console.error(`Error fetching repositories for topic ${topic}:`, error);
      }
    }

    return allRepos;
  }

  /**
   * Determina la categoria basata sui topic del repository
   */
  private determineCategoryFromTopics(topics: string[]): string {
    const categoryTopics = ['games', 'software', 'ai'];
    
    for (const topic of topics) {
      const normalizedTopic = topic.toLowerCase();
      if (categoryTopics.includes(normalizedTopic)) {
        // Capitalizza la prima lettera per il nome della categoria
        return normalizedTopic.charAt(0).toUpperCase() + normalizedTopic.slice(1);
      }
    }

    return 'Software'; // Default category
  }

  /**
   * Ottiene o crea una technology nel database
   */
  private async getOrCreateTechnology(technologyName: string): Promise<number> {
    const normalizedName = technologyName.toLowerCase();
    
    // Prima prova a recuperare la technology esistente
    const { data: existingTechnology, error: fetchError } = await supabase
      .from('technologies')
      .select('id')
      .eq('name', normalizedName)
      .single();

    if (existingTechnology) {
      return existingTechnology.id;
    }

    // Se non esiste, creala
    const technologyData = {
      name: normalizedName,
      color: null, // Non impostiamo colori hardcoded
      icon: null,
      category: null,
      is_active: true
    };

    const { data: newTechnology, error: createError } = await supabase
      .from('technologies')
      .insert(technologyData)
      .select('id')
      .single();

    if (createError) {
      throw new Error(`Error creating technology: ${createError.message}`);
    }

    console.log(`Created new technology: ${normalizedName}`);
    return newTechnology.id;
  }

  /**
   * Gestisce le technologies per un progetto
   */
  private async syncProjectTechnologies(projectId: number, topics: string[]): Promise<void> {
    const categoryTopics = ['games', 'software', 'ai'];
    
    // Filtra i topic che non sono categorie
    const technologyTopics = topics.filter(topic => 
      !categoryTopics.includes(topic.toLowerCase())
    );

    if (technologyTopics.length === 0) {
      return;
    }

    // Rimuovi le associazioni esistenti per questo progetto
    const { error: deleteError } = await supabase
      .from('project_technologies')
      .delete()
      .eq('project_id', projectId);

    if (deleteError) {
      console.error(`Error removing existing project technologies:`, deleteError);
      return;
    }

    // Crea le nuove associazioni
    const projectTechnologies = [];
    
    for (const topic of technologyTopics) {
      try {
        const technologyId = await this.getOrCreateTechnology(topic);
        projectTechnologies.push({
          project_id: projectId,
          technology_id: technologyId
        });
      } catch (error) {
        console.error(`Error processing technology ${topic}:`, error);
      }
    }

    if (projectTechnologies.length > 0) {
      const { error: insertError } = await supabase
        .from('project_technologies')
        .insert(projectTechnologies);

      if (insertError) {
        console.error(`Error creating project technologies:`, insertError);
      } else {
        console.log(`Added ${projectTechnologies.length} technologies to project ${projectId}`);
      }
    }
  }

  /**
   * Ottiene o crea una categoria nel database
   */
  private async getOrCreateCategory(categoryName: string): Promise<number> {
    // Prima prova a recuperare la categoria esistente
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName.toLowerCase())
      .single();

    if (existingCategory) {
      return existingCategory.id;
    }

    // Se non esiste, creala
    const categoryData = {
      name: categoryName.toLowerCase(),
      display_name: categoryName,
      icon: this.getCategoryIcon(categoryName),
      color_gradient: this.getCategoryGradient(categoryName),
      hover_color: this.getCategoryHoverColor(categoryName),
      sort_order: this.getCategorySortOrder(categoryName),
      is_active: true
    };

    const { data: newCategory, error: createError } = await supabase
      .from('categories')
      .insert(categoryData)
      .select('id')
      .single();

    if (createError) {
      throw new Error(`Error creating category: ${createError.message}`);
    }

    return newCategory.id;
  }

  /**
   * Helper methods per configurazione categorie
   */
  private getCategoryIcon(categoryName: string): string {
    const icons = {
      'Games': '🎮',
      'Software': '💻',
      'AI': '🤖',
      'Ai': '🤖'
    };
    return icons[categoryName as keyof typeof icons] || '📦';
  }

  private getCategoryGradient(categoryName: string): string {
    const gradients = {
      'Games': 'from-purple-500 to-pink-500',
      'Software': 'from-blue-500 to-cyan-500',
      'AI': 'from-green-500 to-emerald-500',
      'Ai': 'from-green-500 to-emerald-500'
    };
    return gradients[categoryName as keyof typeof gradients] || 'from-gray-500 to-gray-600';
  }

  private getCategoryHoverColor(categoryName: string): string {
    const colors = {
      'Games': 'hover:from-purple-600 hover:to-pink-600',
      'Software': 'hover:from-blue-600 hover:to-cyan-600',
      'AI': 'hover:from-green-600 hover:to-emerald-600',
      'Ai': 'hover:from-green-600 hover:to-emerald-600'
    };
    return colors[categoryName as keyof typeof colors] || 'hover:from-gray-600 hover:to-gray-700';
  }

  private getCategorySortOrder(categoryName: string): number {
    const orders = {
      'AI': 1,
      'Ai': 1,
      'Software': 2,
      'Games': 3
    };
    return orders[categoryName as keyof typeof orders] || 99;
  }

  /**
   * Determina lo stato del progetto basato su vari fattori
   */
  private determineProjectStatus(repo: GitHubRepo): { status: string; color: string } {
    if (repo.archived) {
      return { status: 'Archived', color: 'text-gray-500' };
    }
    
    if (repo.disabled) {
      return { status: 'Disabled', color: 'text-red-500' };
    }

    // Controlla l'ultima attività (se aggiornato negli ultimi 30 giorni)
    const lastUpdate = new Date(repo.updated_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (lastUpdate > thirtyDaysAgo) {
      return { status: 'Active', color: 'text-green-500' };
    }

    return { status: 'Stable', color: 'text-blue-500' };
  }

  /**
   * Sincronizza un singolo repository nel database
   */
  private async syncRepository(repo: GitHubRepo): Promise<void> {
    try {
      const categoryName = this.determineCategoryFromTopics(repo.topics);
      const categoryId = await this.getOrCreateCategory(categoryName);
      const { status, color } = this.determineProjectStatus(repo);

      const projectData = {
        title: repo.name,
        description: repo.description || 'No description available',
        status: status,
        status_color: color,
        image_emoji: this.getCategoryIcon(categoryName),
        github_url: repo.html_url,
        demo_url: repo.homepage,
        category_id: categoryId,
        github_id: repo.id,
        last_synced_at: new Date().toISOString(),
        is_active: !repo.archived && !repo.disabled
      };

      // Controlla se il progetto esiste già
      const { data: existingProject } = await supabase
        .from('projects')
        .select('id, github_id')
        .eq('github_id', repo.id)
        .single();

      let projectId: number;

      if (existingProject) {
        // Aggiorna il progetto esistente
        const { error: updateError } = await supabase
          .from('projects')
          .update(projectData)
          .eq('github_id', repo.id);

        if (updateError) {
          console.error(`Error updating project ${repo.name}:`, updateError);
          return;
        }
        
        projectId = existingProject.id;
        console.log(`Updated project: ${repo.name}`);
      } else {
        // Crea nuovo progetto
        const { data: newProject, error: insertError } = await supabase
          .from('projects')
          .insert(projectData)
          .select('id')
          .single();

        if (insertError) {
          console.error(`Error creating project ${repo.name}:`, insertError);
          return;
        }
        
        projectId = newProject.id;
        console.log(`Created project: ${repo.name}`);
      }

      // Sincronizza le technologies per questo progetto
      await this.syncProjectTechnologies(projectId, repo.topics);

    } catch (error) {
      console.error(`Error syncing repository ${repo.name}:`, error);
    }
  }

  /**
   * Rimuove progetti che non esistono più su GitHub
   */
  private async removeDeletedRepositories(githubRepoIds: number[]): Promise<void> {
    try {
      // Ottieni tutti i progetti con github_id nel database
      const { data: dbProjects, error: fetchError } = await supabase
        .from('projects')
        .select('id, github_id, title')
        .not('github_id', 'is', null);

      if (fetchError) {
        console.error('Error fetching database projects:', fetchError);
        return;
      }

      if (!dbProjects) return;

      // Trova progetti che non esistono più su GitHub
      const projectsToRemove = dbProjects.filter(
        project => project.github_id && !githubRepoIds.includes(project.github_id)
      );

      // Rimuovi o disattiva i progetti eliminati
      for (const project of projectsToRemove) {
        const { error: updateError } = await supabase
          .from('projects')
          .update({ is_active: false })
          .eq('id', project.id);

        if (updateError) {
          console.error(`Error deactivating project ${project.title}:`, updateError);
        } else {
          console.log(`Deactivated deleted project: ${project.title}`);
        }
      }
    } catch (error) {
      console.error('Error removing deleted repositories:', error);
    }
  }

  /**
   * Esegue la sincronizzazione completa
   */
  public async syncRepositories(): Promise<{ success: boolean; message: string; stats: any }> {
    try {
      console.log('Starting GitHub repository synchronization...');
      
      // Recupera tutti i repository con i topic specificati
      const repos = await this.fetchRepositoriesWithTopics();
      
      if (repos.length === 0) {
        return {
          success: true,
          message: 'No repositories found with specified topics',
          stats: { synced: 0, created: 0, updated: 0, deactivated: 0 }
        };
      }

      console.log(`Found ${repos.length} repositories to sync`);

      let created = 0;
      let updated = 0;

      // Sincronizza ogni repository
      for (const repo of repos) {
        const { data: existingProject } = await supabase
          .from('projects')
          .select('id')
          .eq('github_id', repo.id)
          .single();

        if (existingProject) {
          updated++;
        } else {
          created++;
        }

        await this.syncRepository(repo);
      }

      // Rimuovi progetti eliminati da GitHub
      const githubIds = repos.map(repo => repo.id);
      await this.removeDeletedRepositories(githubIds);

      const stats = {
        synced: repos.length,
        created,
        updated,
        deactivated: 0 // Potresti voler tracciare questo
      };

      console.log('Synchronization completed successfully', stats);

      return {
        success: true,
        message: `Successfully synced ${repos.length} repositories`,
        stats
      };

    } catch (error) {
      console.error('Error during synchronization:', error);
      return {
        success: false,
        message: `Synchronization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        stats: { synced: 0, created: 0, updated: 0, deactivated: 0 }
      };
    }
  }

  /**
   * Sincronizzazione automatica con intervallo
   */
  public startAutoSync(intervalMinutes: number = 60): void {
    const intervalMs = intervalMinutes * 60 * 1000;
    
    // Esegui subito una sincronizzazione
    this.syncRepositories();
    
    // Poi ripeti ogni intervallo specificato
    setInterval(() => {
      this.syncRepositories();
    }, intervalMs);
    
    console.log(`Auto-sync started. Will sync every ${intervalMinutes} minutes.`);
  }
}

export default GitHubSyncService;