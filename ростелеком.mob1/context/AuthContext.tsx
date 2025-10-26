import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { AuthState } from '@/types';


const STORAGE_KEY = '@gazan_auth';
const USERS_STORAGE_KEY = '@gazan_users';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    pending2FA: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAuthState(parsed);
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthState = async (state: AuthState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setAuthState(state);
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  };

  const register = useCallback(async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    console.log('Attempting registration:', email);
    
    try {
      const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users = usersData ? JSON.parse(usersData) : [];
      
      const existingUser = users.find((u: any) => u.email === email);
      if (existingUser) {
        return { success: false, error: 'Пользователь с такой почтой уже существует' };
      }
      
      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        role: 'user',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      
      users.push(newUser);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      
      const newState: AuthState = {
        isAuthenticated: true,
        user: newUser,
        pending2FA: false,
      };
      await saveAuthState(newState);
      
      console.log('Registration successful for:', email);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Ошибка регистрации' };
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('Attempting login:', email);
    
    try {
      const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users = usersData ? JSON.parse(usersData) : [];
      
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        return { success: false, error: 'Неверная почта или пароль' };
      }
      
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      const updatedUsers = users.map((u: any) => u.id === user.id ? updatedUser : u);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      
      const newState: AuthState = {
        isAuthenticated: true,
        user: updatedUser,
        pending2FA: false,
      };
      await saveAuthState(newState);
      
      console.log('Login successful for:', email);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Ошибка входа' };
    }
  }, []);



  const logout = useCallback(async () => {
    console.log('Logging out');
    const newState: AuthState = {
      isAuthenticated: false,
      user: null,
      pending2FA: false,
    };
    await saveAuthState(newState);
  }, []);

  return useMemo(() => ({
    authState,
    isLoading,
    register,
    login,
    logout,
  }), [authState, isLoading, register, login, logout]);
});
