import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { LightColors, DarkColors } from '@/constants/colors';

const THEME_KEY = '@theme_mode';

export type ThemeMode = 'light' | 'dark';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  const loadTheme = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored) {
        setThemeMode(stored as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const toggleTheme = useCallback(async () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, [themeMode]);

  const colors = useMemo(() => {
    return themeMode === 'light' ? LightColors : DarkColors;
  }, [themeMode]);

  return useMemo(() => ({
    themeMode,
    colors,
    isLoading,
    toggleTheme,
    isDark: themeMode === 'dark',
  }), [themeMode, colors, isLoading, toggleTheme]);
});
