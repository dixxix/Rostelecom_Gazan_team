import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';
import { Mail, Lock, User, Moon } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, login } = useAuth();
  const { colors, toggleTheme, isDark } = useTheme();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password || (isRegisterMode && !name)) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Ошибка', 'Введите корректный email');
      return;
    }

    setIsLoading(true);
    
    if (isRegisterMode) {
      const result = await register(email, password, name);
      setIsLoading(false);
      
      if (!result.success) {
        Alert.alert('Ошибка регистрации', result.error || 'Неизвестная ошибка');
        return;
      }
      
      router.replace('/(tabs)');
    } else {
      const result = await login(email, password);
      setIsLoading(false);
      
      if (!result.success) {
        Alert.alert('Ошибка входа', result.error || 'Неизвестная ошибка');
        return;
      }
      
      router.replace('/(tabs)');
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    background: {
      flex: 1,
    },
    logoHeader: {
      position: 'absolute' as const,
      top: 0,
      right: 0,
      zIndex: 10,
    },
    themeToggle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 48,
    },
    logoSection: {
      alignItems: 'center',
      marginBottom: 48,
    },
    logoImage: {
      width: 120,
      height: 120,
      marginBottom: 16,
    },
    brandText: {
      fontSize: 36,
      fontWeight: '800' as const,
      color: colors.neutral.white,
      letterSpacing: 2,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 3 },
      textShadowRadius: 6,
    },
    formCard: {
      backgroundColor: colors.background.card,
      borderRadius: 24,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    formTitle: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: colors.text.primary,
      marginBottom: 24,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.cardLight,
      borderRadius: 12,
      marginBottom: 16,
      paddingHorizontal: 16,
      height: 56,
      borderWidth: 1,
      borderColor: colors.primary.purple + '20',
    },
    iconWrapper: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text.primary,
    },
    button: {
      borderRadius: 12,
      height: 56,
      marginTop: 8,
      overflow: 'hidden',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 17,
      fontWeight: '700' as const,
      color: colors.neutral.white,
      letterSpacing: 0.5,
    },
    switchModeButton: {
      marginTop: 20,
      alignItems: 'center',
      paddingVertical: 12,
    },
    switchModeText: {
      fontSize: 15,
      color: colors.primary.purple,
      fontWeight: '600' as const,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#1A1A1A', '#2A2A2A', '#3A3A3A', '#4A4A4A'] : ['#FF6B35', '#FFB8A0', '#D4C0FF', '#9D4EDD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom, flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoSection}>
              <View style={styles.logoHeader}>
                <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
                  <Moon size={28} color={colors.neutral.white} fill={isDark ? colors.neutral.white : 'transparent'} />
                </TouchableOpacity>
              </View>
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/fya5u2x3ooda7trkszd35' }}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.brandText}>РОСТЕЛЕКОМ</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {isRegisterMode ? 'Регистрация' : 'Вход'}
              </Text>

              {isRegisterMode && (
                <View style={styles.inputContainer}>
                  <View style={styles.iconWrapper}>
                    <User size={20} color={colors.primary.purple} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Имя"
                    placeholderTextColor={colors.text.muted}
                    value={name}
                    onChangeText={setName}
                    editable={!isLoading}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <Mail size={20} color={colors.primary.purple} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={colors.text.muted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <Lock size={20} color={colors.primary.purple} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Пароль"
                  placeholderTextColor={colors.text.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleAuth}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={[colors.primary.purple, colors.primary.orange]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.neutral.white} />
                  ) : (
                    <Text style={styles.buttonText}>
                      {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchModeButton}
                onPress={() => setIsRegisterMode(!isRegisterMode)}
                disabled={isLoading}
              >
                <Text style={styles.switchModeText}>
                  {isRegisterMode 
                    ? 'Уже есть аккаунт? Войти' 
                    : 'Нет аккаунта? Зарегистрироваться'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        </View>
      </LinearGradient>
    </View>
  );
}
