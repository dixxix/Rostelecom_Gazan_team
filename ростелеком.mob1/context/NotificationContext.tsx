import { useEffect, useState, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_ENABLED_KEY = '@notifications_enabled';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export const [NotificationProvider, useNotification] = createContextHook(() => {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotificationSettings = useCallback(async () => {
    try {
      const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      if (enabled !== null) {
        setNotificationsEnabled(JSON.parse(enabled));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotificationSettings();
  }, [loadNotificationSettings]);

  const toggleNotifications = useCallback(async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, JSON.stringify(newValue));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }, [notificationsEnabled]);

  const sendProjectNotification = useCallback((projectName: string, message: string) => {
    if (!notificationsEnabled || Platform.OS === 'web') {
      console.log('Notifications are disabled or on web platform');
      return;
    }

    Notifications.scheduleNotificationAsync({
      content: {
        title: `Проект: ${projectName}`,
        body: message,
      },
      trigger: null,
    }).catch(error => {
      console.error('Failed to send notification:', error);
    });
  }, [notificationsEnabled]);

  return useMemo(() => ({
    notificationsEnabled,
    isLoading,
    toggleNotifications,
    sendProjectNotification,
  }), [notificationsEnabled, isLoading, toggleNotifications, sendProjectNotification]);
});
