import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Project } from '@/types';
import { MOCK_PROJECTS } from '@/mocks/projects';

const STORAGE_KEY = '@rostelekom_projects';

export const [ProjectsProvider, useProjects] = createContextHook(() => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProjects(JSON.parse(stored));
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PROJECTS));
        setProjects(MOCK_PROJECTS);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects(MOCK_PROJECTS);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProjects = async (newProjects: Project[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
      setProjects(newProjects);
    } catch (error) {
      console.error('Failed to save projects:', error);
    }
  };

  const toggleFavorite = useCallback((projectId: string) => {
    setProjects((current) => {
      const updated = current.map((p) =>
        p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p
      );
      saveProjects(updated);
      return updated;
    });
  }, []);

  const getProjectById = useCallback((id: string) => {
    return projects.find((p) => p.id === id);
  }, [projects]);

  const addProject = useCallback(async (newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'monthlyFinances' | 'spent'>) => {
    const project: Project = {
      ...newProject,
      id: Date.now().toString(),
      spent: 0,
      monthlyFinances: [],
      history: [{
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        userId: newProject.createdBy || '',
        userName: 'Current User',
        action: 'Создан проект',
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...projects, project];
    await saveProjects(updated);
    return project;
  }, [projects]);

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    setProjects((current) => {
      const updated = current.map((p) =>
        p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      );
      saveProjects(updated);
      return updated;
    });
  }, []);

  return useMemo(() => ({
    projects,
    isLoading,
    toggleFavorite,
    getProjectById,
    addProject,
    updateProject,
  }), [projects, isLoading, toggleFavorite, getProjectById, addProject, updateProject]);
});
