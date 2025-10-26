import { Tabs } from 'expo-router';
import { LayoutDashboard, FolderKanban, UserCircle, Bot, Scale } from 'lucide-react-native';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary.orange,
        tabBarInactiveTintColor: colors.neutral.gray500,
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background.card,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '700' as const,
        },
        tabBarStyle: {
          backgroundColor: colors.background.card,
          borderTopWidth: 1,
          borderTopColor: colors.background.cardLight,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600' as const,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Дашборд',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Проекты',
          tabBarIcon: ({ color, size }) => <FolderKanban size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: 'Сравнение',
          tabBarIcon: ({ color, size }) => <Scale size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Газанчик',
          tabBarIcon: ({ color, size }) => <Bot size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => <UserCircle size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
