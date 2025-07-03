// hooks/useGitHubSync.ts
import { useState, useCallback, useEffect } from 'react';
import GitHubSyncService from '../backend/githubSyncService';
import supabase from '../backend/supabase';

interface SyncStats {
  synced: number;
  created: number;
  updated: number;
  deactivated: number;
}

interface SyncResult {
  success: boolean;
  message: string;
  stats: SyncStats;
}

interface Technology {
  id: number;
  name: string;
  color: string | null;
  icon: string | null;
  category: string | null;
  is_active: boolean;
}

interface UseGitHubSyncReturn {
  isLoading: boolean;
  lastSync: Date | null;
  syncResult: SyncResult | null;
  error: string | null;
  syncRepositories: () => Promise<void>;
  startAutoSync: (intervalMinutes?: number) => void;
  stopAutoSync: () => void;
  // Nuovi metodi per gestire le tecnologie
  checkTechnologyExists: (technologyName: string) => Promise<Technology | null>;
  getOrCreateTechnology: (technologyName: string) => Promise<Technology>;
  addTechnologyToProject: (projectId: number, technologyId: number) => Promise<boolean>;
  syncProjectTechnologies: (projectId: number, topics: string[]) => Promise<boolean>;
  getTechnologiesByProject: (projectId: number) => Promise<Technology[]>;
}

export const useGitHubSync = (): UseGitHubSyncReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoSyncInterval, setAutoSyncInterval] = useState<NodeJS.Timeout | null>(null);

  const githubSync = new GitHubSyncService();

  const syncRepositories = useCallback(async () => {
    if (isLoading) return; // Previeni multiple chiamate simultanee

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await githubSync.syncRepositories();
      setSyncResult(result);
      setLastSync(new Date());
      
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setSyncResult({
        success: false,
        message: errorMessage,
        stats: { synced: 0, created: 0, updated: 0, deactivated: 0 }
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const startAutoSync = useCallback((intervalMinutes: number = 60) => {
    // Ferma il sync automatico precedente se attivo
    if (autoSyncInterval) {
      clearInterval(autoSyncInterval);
    }

    // Esegui subito una sincronizzazione
    syncRepositories();

    // Imposta l'intervallo per le sincronizzazioni future
    const interval = setInterval(() => {
      syncRepositories();
    }, intervalMinutes * 60 * 1000);

    setAutoSyncInterval(interval);
  }, [syncRepositories, autoSyncInterval]);

  const stopAutoSync = useCallback(() => {
    if (autoSyncInterval) {
      clearInterval(autoSyncInterval);
      setAutoSyncInterval(null);
    }
  }, [autoSyncInterval]);

  // Nuovo metodo: Controlla se una tecnologia esiste
  const checkTechnologyExists = useCallback(async (technologyName: string): Promise<Technology | null> => {
    try {
      const normalizedName = technologyName.toLowerCase();
      
      const { data: technology, error } = await supabase
        .from('technologies')
        .select('*')
        .eq('name', normalizedName)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking technology:', error);
        return null;
      }

      return technology || null;
    } catch (err) {
      console.error('Error in checkTechnologyExists:', err);
      return null;
    }
  }, []);

  // Nuovo metodo: Ottieni o crea una tecnologia
  const getOrCreateTechnology = useCallback(async (technologyName: string): Promise<Technology> => {
    try {
      const normalizedName = technologyName.toLowerCase();
      
      // Prima controlla se esiste
      let technology = await checkTechnologyExists(normalizedName);
      
      if (technology) {
        return technology;
      }

      // Se non esiste, creala
      const technologyData = {
        name: normalizedName,
        color: null,
        icon: null,
        category: null,
        is_active: true
      };

      const { data: newTechnology, error: createError } = await supabase
        .from('technologies')
        .insert(technologyData)
        .select('*')
        .single();

      if (createError) {
        throw new Error(`Error creating technology: ${createError.message}`);
      }

      console.log(`Created new technology: ${normalizedName}`);
      return newTechnology;
    } catch (err) {
      console.error('Error in getOrCreateTechnology:', err);
      throw err;
    }
  }, [checkTechnologyExists]);

  // Nuovo metodo: Aggiungi una tecnologia a un progetto
  const addTechnologyToProject = useCallback(async (projectId: number, technologyId: number): Promise<boolean> => {
    try {
      // Controlla se l'associazione esiste già
      const { data: existingAssociation } = await supabase
        .from('project_technologies')
        .select('*')
        .eq('project_id', projectId)
        .eq('technology_id', technologyId)
        .single();

      if (existingAssociation) {
        console.log(`Technology ${technologyId} already associated with project ${projectId}`);
        return true;
      }

      // Crea l'associazione
      const { error: insertError } = await supabase
        .from('project_technologies')
        .insert({
          project_id: projectId,
          technology_id: technologyId
        });

      if (insertError) {
        console.error('Error adding technology to project:', insertError);
        return false;
      }

      console.log(`Added technology ${technologyId} to project ${projectId}`);
      return true;
    } catch (err) {
      console.error('Error in addTechnologyToProject:', err);
      return false;
    }
  }, []);

  // Nuovo metodo: Sincronizza le tecnologie di un progetto basate sui topic
  const syncProjectTechnologies = useCallback(async (projectId: number, topics: string[]): Promise<boolean> => {
    try {
      const categoryTopics = ['games', 'software', 'ai'];
      
      // Filtra i topic che non sono categorie (questi diventeranno tecnologie)
      const technologyTopics = topics.filter(topic => 
        !categoryTopics.includes(topic.toLowerCase())
      );

      if (technologyTopics.length === 0) {
        console.log(`No technology topics found for project ${projectId}`);
        return true;
      }

      // Rimuovi le associazioni esistenti per questo progetto
      const { error: deleteError } = await supabase
        .from('project_technologies')
        .delete()
        .eq('project_id', projectId);

      if (deleteError) {
        console.error(`Error removing existing project technologies:`, deleteError);
        return false;
      }

      // Crea le nuove associazioni
      const projectTechnologies = [];
      
      for (const topic of technologyTopics) {
        try {
          const technology = await getOrCreateTechnology(topic);
          projectTechnologies.push({
            project_id: projectId,
            technology_id: technology.id
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
          return false;
        }

        console.log(`Added ${projectTechnologies.length} technologies to project ${projectId}`);
      }

      return true;
    } catch (err) {
      console.error('Error in syncProjectTechnologies:', err);
      return false;
    }
  }, [getOrCreateTechnology]);

  // Nuovo metodo: Ottieni tutte le tecnologie di un progetto
  const getTechnologiesByProject = useCallback(async (projectId: number): Promise<Technology[]> => {
    try {
      const { data: projectTechnologies, error } = await supabase
        .from('project_technologies')
        .select(`
          technology_id,
          technologies (
            id,
            name,
            color,
            icon,
            category,
            is_active
          )
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching project technologies:', error);
        return [];
      }

      return projectTechnologies
        ? projectTechnologies
            .map(pt => pt.technologies)
            .filter(Boolean)
            .flat()
        : [];
    } catch (err) {
      console.error('Error in getTechnologiesByProject:', err);
      return [];
    }
  }, []);

  // Cleanup dell'intervallo quando il componente viene smontato
  useEffect(() => {
    return () => {
      if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
      }
    };
  }, [autoSyncInterval]);

  return {
    isLoading,
    lastSync,
    syncResult,
    error,
    syncRepositories,
    startAutoSync,
    stopAutoSync,
    // Nuovi metodi per gestire le tecnologie
    checkTechnologyExists,
    getOrCreateTechnology,
    addTechnologyToProject,
    syncProjectTechnologies,
    getTechnologiesByProject
  };
};