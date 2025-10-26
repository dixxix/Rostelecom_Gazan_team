import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Key, Save, Eye, EyeOff, AlertCircle, Moon, Sun, Bell, BellOff } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';

const API_KEY_STORAGE = '@app_api_key';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { notificationsEnabled, toggleNotifications } = useNotification();
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const stored = await AsyncStorage.getItem(API_KEY_STORAGE);
      if (stored) {
        setApiKey(stored);
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Ошибка', 'Введите API ключ');
      return;
    }
    setIsSaving(true);
    try {
      await AsyncStorage.setItem(API_KEY_STORAGE, apiKey.trim());
      Alert.alert('Успех', 'API ключ успешно сохранён', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить API ключ');
      console.error('Failed to save API key:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.main,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary.purple + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: colors.text.primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 20,
    },
    settingsSection: {
      backgroundColor: colors.background.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      gap: 16,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    settingIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text.primary,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 18,
    },
    infoCard: {
      flexDirection: 'row',
      backgroundColor: colors.semantic.info + '15',
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      gap: 12,
    },
    infoText: {
      flex: 1,
    },
    infoTitle: {
      fontSize: 14,
      fontWeight: '700' as const,
      color: colors.semantic.info,
      marginBottom: 4,
    },
    infoDescription: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 18,
    },
    section: {
      marginBottom: 24,
    },
    label: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.text.primary,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.background.cardLight,
    },
    input: {
      flex: 1,
      height: 52,
      paddingHorizontal: 16,
      fontSize: 15,
      color: colors.text.primary,
    },
    eyeButton: {
      padding: 16,
    },
    hint: {
      fontSize: 12,
      color: colors.text.muted,
      marginTop: 8,
      lineHeight: 16,
    },
    examplesSection: {
      marginBottom: 32,
    },
    examplesTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text.primary,
      marginBottom: 12,
    },
    providersList: {
      backgroundColor: colors.background.card,
      borderRadius: 12,
      padding: 16,
      gap: 12,
    },
    providerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    providerDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary.orange,
    },
    providerText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary.purple,
      borderRadius: 12,
      paddingVertical: 16,
      gap: 8,
      marginBottom: 12,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: colors.neutral.white,
    },
    cancelButton: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    cancelButtonText: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.text.secondary,
    },
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Настройки',
        headerStyle: { backgroundColor: colors.primary.purple },
        headerTintColor: colors.neutral.white,
      }} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Key size={32} color={colors.primary.purple} />
          </View>
          <Text style={styles.title}>Настройки приложения</Text>
          <Text style={styles.subtitle}>
            Настройте тему, уведомления и подключение к нейросети
          </Text>
        </View>

        <View style={styles.settingsSection}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconCircle, { backgroundColor: isDark ? colors.semantic.warning + '20' : colors.primary.purple + '20' }]}>
                {isDark ? (
                  <Moon size={20} color={colors.semantic.warning} />
                ) : (
                  <Sun size={20} color={colors.primary.purple} />
                )}
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Темная тема</Text>
                <Text style={styles.settingDescription}>
                  {isDark ? 'Включена темная тема' : 'Включена светлая тема'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.neutral.gray400, true: colors.primary.purple }}
              thumbColor={colors.neutral.white}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconCircle, { backgroundColor: notificationsEnabled ? colors.semantic.success + '20' : colors.neutral.gray400 + '20' }]}>
                {notificationsEnabled ? (
                  <Bell size={20} color={colors.semantic.success} />
                ) : (
                  <BellOff size={20} color={colors.neutral.gray500} />
                )}
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Push-уведомления</Text>
                <Text style={styles.settingDescription}>
                  {notificationsEnabled ? 'Уведомления включены' : 'Уведомления выключены'}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.neutral.gray400, true: colors.semantic.success }}
              thumbColor={colors.neutral.white}
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <AlertCircle size={20} color={colors.semantic.info} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Примечание</Text>
            <Text style={styles.infoDescription}>
              API ключ хранится локально на вашем устройстве и используется для запросов к нейросети.
              Если оставить поле пустым, будет использоваться встроенная нейросеть DeepSeek v3.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>API Ключ нейросети</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              placeholderTextColor={colors.text.muted}
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
              testID="api-key-input"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowKey(!showKey)}
              testID="toggle-visibility"
            >
              {showKey ? (
                <EyeOff size={20} color={colors.neutral.gray500} />
              ) : (
                <Eye size={20} color={colors.neutral.gray500} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            Формат: sk-... (OpenAI), или другой формат в зависимости от провайдера
          </Text>
        </View>

        <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>Поддерживаемые провайдеры</Text>
          <View style={styles.providersList}>
            <View style={styles.providerItem}>
              <View style={styles.providerDot} />
              <Text style={styles.providerText}>OpenAI (GPT-4, GPT-3.5)</Text>
            </View>
            <View style={styles.providerItem}>
              <View style={styles.providerDot} />
              <Text style={styles.providerText}>Anthropic (Claude)</Text>
            </View>
            <View style={styles.providerItem}>
              <View style={styles.providerDot} />
              <Text style={styles.providerText}>Google (Gemini)</Text>
            </View>
            <View style={styles.providerItem}>
              <View style={styles.providerDot} />
              <Text style={styles.providerText}>DeepSeek v3 (по умолчанию)</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={saveApiKey}
          disabled={isSaving}
          testID="save-button"
        >
          <Save size={20} color={colors.neutral.white} />
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          testID="cancel-button"
        >
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
