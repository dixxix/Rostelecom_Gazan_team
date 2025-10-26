import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { useRouter } from 'expo-router';
import { ArrowUpCircle, Bot, FolderKanban, Star, Scale } from 'lucide-react-native';
import { createRorkTool, useRorkAgent } from '@rork/toolkit-sdk';

interface MessageItem {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
}

export default function AssistantScreen() {
  const router = useRouter();
  const { projects, toggleFavorite } = useProjects();
  const { colors } = useTheme();
  const [input, setInput] = useState<string>('');
  const listRef = useRef<FlatList<MessageItem>>(null);
  const [helpVisible, setHelpVisible] = useState<boolean>(false);

  const tools = useMemo(() => ({
    listProjects: createRorkTool({
      description: 'Получить список проектов в кратком виде',
      zodSchema: undefined as unknown as any,
      execute() {
        const summary = projects.map(p => `• ${p.name} — этап: ${p.stage}, сегмент: ${p.segment}, бюджет: ${p.budget.toLocaleString('ru-RU')}₽`).join('\n');
        return { summary } as any;
      },
    }),
    openProject: createRorkTool({
      description: 'Открыть страницу проекта по точному названию',
      zodSchema: undefined as unknown as any,
      execute(input: any) {
        const name: string | undefined = input?.name;
        if (!name) return { ok: false, error: 'name is required' } as any;
        const found = projects.find(p => p.name.toLowerCase() === String(name).toLowerCase());
        if (!found) return { ok: false, error: 'Проект не найден' } as any;
        router.push(`/project/${found.id}` as any);
        return { ok: true, id: found.id } as any;
      },
    }),
    toggleFavorite: createRorkTool({
      description: 'Добавить или убрать проект из избранного по названию',
      zodSchema: undefined as unknown as any,
      execute(input: any) {
        const name: string | undefined = input?.name;
        if (!name) return { ok: false, error: 'name is required' } as any;
        const found = projects.find(p => p.name.toLowerCase() === String(name).toLowerCase());
        if (!found) return { ok: false, error: 'Проект не найден' } as any;
        toggleFavorite(found.id);
        return { ok: true, id: found.id } as any;
      },
    }),
    goCompare: createRorkTool({
      description: 'Открыть экран сравнения проектов',
      zodSchema: undefined as unknown as any,
      execute() {
        router.push('/(tabs)/compare' as any);
        return { ok: true } as any;
      },
    }),
  }), [projects, router, toggleFavorite]);

  const { messages, sendMessage, error } = useRorkAgent({ tools });

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      await sendMessage(input.trim());
      setInput('');
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.main },
    header: { backgroundColor: colors.primary.purple, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { color: colors.neutral.white, fontSize: 16, fontWeight: '700' as const, flex: 1 },
    headerAction: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.neutral.white, borderRadius: 16 },
    headerActionText: { color: colors.primary.purple, fontWeight: '700' as const, fontSize: 12 },
    listContent: { padding: 16, gap: 12 },
    message: { padding: 12, borderRadius: 12 },
    userMsg: { backgroundColor: colors.primary.orange + '20', alignSelf: 'flex-end', maxWidth: '90%' },
    assistantMsg: { backgroundColor: colors.background.card, alignSelf: 'flex-start', maxWidth: '90%' },
    messageRole: { fontSize: 11, color: colors.text.muted, marginBottom: 6 },
    messageText: { fontSize: 14, color: colors.text.primary, lineHeight: 20 },
    errorBox: { paddingHorizontal: 16, paddingBottom: 8 },
    errorText: { color: colors.semantic.error },
    inputBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.background.cardLight, backgroundColor: colors.background.card },
    input: { flex: 1, height: 44, backgroundColor: colors.background.cardLight, borderRadius: 10, paddingHorizontal: 12, color: colors.text.primary },
    sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary.orange, alignItems: 'center', justifyContent: 'center' },
    quick: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.cardLight },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 24 },
    modalCard: { backgroundColor: colors.background.card, borderRadius: 16, padding: 16, width: '100%', maxWidth: 480 },
    modalTitle: { fontSize: 16, fontWeight: '700' as const, color: colors.text.primary, marginBottom: 8 },
    modalText: { fontSize: 14, color: colors.text.secondary, marginBottom: 12 },
    modalClose: { alignSelf: 'flex-end', backgroundColor: colors.primary.orange, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
    modalCloseText: { color: colors.neutral.white, fontWeight: '700' as const },
  }), [colors]);

  return (
    <View style={styles.container} testID="assistant-screen">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Bot size={22} color={colors.neutral.white} />
          <Text style={styles.headerTitle}>Газанчик — ваш ассистент</Text>
          <TouchableOpacity onPress={() => setHelpVisible(true)} style={styles.headerAction} testID="assistant-help-button">
            <Text style={styles.headerActionText}>Помощь</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={listRef}
          data={messages.map(m => ({ id: m.id, role: m.role as 'user' | 'assistant' | 'system', text: m.parts.map(p => p.type === 'text' ? p.text : `[tool:${(p as any).toolName}]`).join('\n') }))}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.message, item.role === 'user' ? styles.userMsg : styles.assistantMsg]} testID={`msg-${item.id}`}>
              <Text style={styles.messageRole}>{item.role === 'user' ? 'Вы' : 'Газанчик'}</Text>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
        />

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Ошибка: {String(error)}</Text>
          </View>
        )}

        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.quick} onPress={() => setInput('Покажи список проектов и порекомендуй с чего начать')} testID="assistant-quick-1">
            <FolderKanban size={16} color={colors.primary.purple} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quick} onPress={() => setInput('Сравни проекты и открой лучший')} testID="assistant-quick-2">
            <Scale size={16} color={colors.primary.purple} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Спросите у Газанчика... (DeepSeek v3)"
            placeholderTextColor={colors.text.muted}
            value={input}
            onChangeText={setInput}
            autoCapitalize="sentences"
            testID="assistant-input"
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendBtn} testID="assistant-send">
            <ArrowUpCircle size={24} color={colors.neutral.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={helpVisible} transparent animationType="fade" onRequestClose={() => setHelpVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Как Газанчик может помочь</Text>
            <Text style={styles.modalText}>• Подскажет, где что находится в приложении\n• Откроет проект по названию\n• Добавит проект в избранное\n• Перейдёт к сравнению проектов</Text>
            <TouchableOpacity onPress={() => setHelpVisible(false)} style={styles.modalClose} testID="assistant-help-close">
              <Text style={styles.modalCloseText}>Понятно</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
