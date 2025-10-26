import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { Project } from '@/types';
import { CheckCircle2, Circle, Sparkles, Scale, X } from 'lucide-react-native';
import { generateText } from '@rork/toolkit-sdk';

interface AnalysisResult {
  bestProjectId: string;
  reasoning: string;
}

export default function CompareScreen() {
  const { projects } = useProjects();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectedProjects = useMemo(() => projects.filter(p => selected.includes(p.id)), [projects, selected]);

  const startAnalysis = async () => {
    if (selected.length < 2) {
      Alert.alert('Выберите проекты', 'Нужно выбрать минимум 2 проекта для сравнения');
      return;
    }
    setIsAnalyzing(true);
    try {
      const bundle = selectedProjects.map(p => ({
        id: p.id,
        name: p.name,
        stage: p.stage,
        segment: p.segment,
        budget: p.budget,
        spent: p.spent,
        revenue: p.monthlyFinances.reduce((s, m) => s + m.revenue, 0),
        costs: p.monthlyFinances.reduce((s, m) => s + m.costs, 0),
        services: p.services,
        teamSize: p.team.length,
        isProblematic: !!p.isProblematic,
      }));

      const prompt = `Ты — аналитик проектов. Используй DeepSeek v3 стиль анализа. На основе JSON сопоставь проекты по метрикам: рентабельность (прибыль/выручка), риски (isProblematic, стадия), бюджетная эффективность (выручка/бюджет), фокус услуг, размер команды. Верни текущий лучший проект для запуска на ближайший квартал.
Верни ответ строго в формате:
BEST_ID: <id>\nREASONING:\n<краткое объяснение в 4-6 пунктах>\n`;

      const text = await generateText({ messages: [
        { role: 'user', content: [ { type: 'text', text: prompt }, { type: 'text', text: JSON.stringify(bundle) } ] },
      ]});

      const lines = text.split('\n');
      const bestLine = lines.find(l => l.startsWith('BEST_ID:')) || '';
      const bestId = bestLine.replace('BEST_ID:', '').trim();
      const reasoningIndex = lines.findIndex(l => l.startsWith('REASONING:'));
      const reasoning = reasoningIndex >= 0 ? lines.slice(reasoningIndex + 1).join('\n').trim() : text.trim();

      if (!bestId || !selected.includes(bestId)) {
        const fallback = [...selectedProjects]
          .sort((a, b) => (
            b.monthlyFinances.reduce((s, m) => s + m.profit, 0) - a.monthlyFinances.reduce((s, m) => s + m.profit, 0)
          ))[0]?.id || selected[0];
        setResult({ bestProjectId: fallback, reasoning });
      } else {
        setResult({ bestProjectId: bestId, reasoning });
      }
      setModalVisible(true);
    } catch (e) {
      Alert.alert('Ошибка анализа', 'Попробуйте ещё раз позже');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const best = useMemo(() => projects.find(p => p.id === result?.bestProjectId), [projects, result]);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.main },
    headerBar: { backgroundColor: colors.primary.orange, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { color: colors.neutral.white, fontWeight: '700' as const, fontSize: 13, flex: 1 },
    list: { padding: 16, gap: 12 },
    card: { backgroundColor: colors.background.card, borderRadius: 16, padding: 12, gap: 8, borderWidth: 1, borderColor: colors.background.cardLight },
    cardChecked: { borderColor: colors.semantic.success },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    left: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    name: { fontSize: 15, fontWeight: '700' as const, color: colors.text.primary },
    stageBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    stageText: { fontSize: 12, color: colors.text.secondary, fontWeight: '600' as const },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { fontSize: 12, color: colors.text.secondary },
    value: { fontSize: 14, fontWeight: '600' as const, color: colors.text.primary },
    services: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    serviceTag: { backgroundColor: colors.background.cardLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
    serviceText: { fontSize: 12, color: colors.text.secondary, fontWeight: '600' as const },
    analyzeBtn: { position: 'absolute' as const, bottom: 20, left: 16, right: 16, backgroundColor: colors.primary.purple, paddingVertical: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
    analyzeDisabled: { opacity: 0.6 },
    analyzeText: { color: colors.neutral.white, fontWeight: '700' as const },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', padding: 16, justifyContent: 'flex-end' },
    modalCard: { backgroundColor: colors.background.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '85%', padding: 16 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    modalTitle: { fontSize: 16, fontWeight: '700' as const, color: colors.text.primary },
    sectionTitle: { marginTop: 8, marginBottom: 6, fontSize: 14, color: colors.text.secondary, fontWeight: '700' as const },
    bestCard: { backgroundColor: colors.background.cardLight, padding: 12, borderRadius: 12 },
    bestName: { fontSize: 16, fontWeight: '800' as const, color: colors.text.primary },
    bestMeta: { fontSize: 12, color: colors.text.secondary, marginTop: 4 },
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    kpiItem: { backgroundColor: colors.background.cardLight, padding: 10, borderRadius: 10, minWidth: '30%', flexGrow: 1 },
    kpiLabel: { fontSize: 11, color: colors.text.secondary },
    kpiValue: { fontSize: 14, fontWeight: '700' as const, color: colors.text.primary },
    modalText: { fontSize: 14, color: colors.text.primary, lineHeight: 20 },
  }), [colors]);

  const renderItem = ({ item }: { item: Project }) => {
    const checked = selected.includes(item.id);
    const spentPct = Math.min((item.spent / item.budget) * 100, 999);
    const profit = item.monthlyFinances.reduce((s, m) => s + m.profit, 0);
    return (
      <TouchableOpacity onPress={() => toggle(item.id)} style={[styles.card, checked && styles.cardChecked]} testID={`compare-card-${item.id}`}>
        <View style={styles.cardHeader}>
          <View style={styles.left}>
            {checked ? <CheckCircle2 size={20} color={colors.semantic.success} /> : <Circle size={20} color={colors.neutral.gray500} />}
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          </View>
          <View style={[styles.stageBadge, { backgroundColor: colors.background.cardLight }]}>
            <Text style={styles.stageText}>{item.stage}</Text>
          </View>
        </View>
        <View style={styles.row}> 
          <Text style={styles.label}>Бюджет</Text>
          <Text style={styles.value}>{item.budget.toLocaleString('ru-RU')}₽</Text>
        </View>
        <View style={styles.row}> 
          <Text style={styles.label}>Потрачено</Text>
          <Text style={[styles.value, { color: item.spent > item.budget ? colors.semantic.error : colors.text.primary }]}>{item.spent.toLocaleString('ru-RU')}₽ ({spentPct.toFixed(0)}%)</Text>
        </View>
        <View style={styles.row}> 
          <Text style={styles.label}>Прибыль (сумма)</Text>
          <Text style={[styles.value, { color: profit >= 0 ? colors.semantic.success : colors.semantic.error }]}>{profit.toLocaleString('ru-RU')}₽</Text>
        </View>
        <View style={styles.services}>
          {item.services.map(s => (
            <View key={s} style={styles.serviceTag}><Text style={styles.serviceText}>{s}</Text></View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container} testID="compare-screen">
      <Stack.Screen options={{ title: 'Сравнение проектов' }} />

      <View style={styles.headerBar}>
        <Scale size={18} color={colors.neutral.white} />
        <Text style={styles.headerTitle}>Выберите 2-4 проекта и запустите анализ (DeepSeek v3)</Text>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={[styles.analyzeBtn, selected.length < 2 && styles.analyzeDisabled]} onPress={startAnalysis} disabled={isAnalyzing || selected.length < 2} testID="analyze-button">
        {isAnalyzing ? <ActivityIndicator color={colors.neutral.white} /> : (
          <>
            <Sparkles size={18} color={colors.neutral.white} />
            <Text style={styles.analyzeText}>Анализировать</Text>
          </>
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Результаты анализа</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} testID="close-analysis">
                <X size={22} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {!result ? (
              <Text style={styles.modalText}>Нет данных</Text>
            ) : (
              <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
                <Text style={styles.sectionTitle}>Рекомендованный проект</Text>
                <View style={styles.bestCard}>
                  <Text style={styles.bestName}>{best?.name || result.bestProjectId}</Text>
                  <Text style={styles.bestMeta}>Этап: {best?.stage} • Сегмент: {best?.segment}</Text>
                </View>

                {!!best && (
                  <View style={styles.kpiGrid}>
                    <View style={styles.kpiItem}><Text style={styles.kpiLabel}>Бюджет</Text><Text style={styles.kpiValue}>{best.budget.toLocaleString('ru-RU')}₽</Text></View>
                    <View style={styles.kpiItem}><Text style={styles.kpiLabel}>Потрачено</Text><Text style={styles.kpiValue}>{best.spent.toLocaleString('ru-RU')}₽</Text></View>
                    <View style={styles.kpiItem}><Text style={styles.kpiLabel}>Выручка</Text><Text style={styles.kpiValue}>{best.monthlyFinances.reduce((s,m)=>s+m.revenue,0).toLocaleString('ru-RU')}₽</Text></View>
                    <View style={styles.kpiItem}><Text style={styles.kpiLabel}>Расходы</Text><Text style={styles.kpiValue}>{best.monthlyFinances.reduce((s,m)=>s+m.costs,0).toLocaleString('ru-RU')}₽</Text></View>
                    <View style={styles.kpiItem}><Text style={styles.kpiLabel}>Прибыль</Text><Text style={styles.kpiValue}>{best.monthlyFinances.reduce((s,m)=>s+m.profit,0).toLocaleString('ru-RU')}₽</Text></View>
                    <View style={styles.kpiItem}><Text style={styles.kpiLabel}>Команда</Text><Text style={styles.kpiValue}>{best.team.length}</Text></View>
                  </View>
                )}

                <Text style={styles.sectionTitle}>Пояснение</Text>
                <Text style={styles.modalText}>{result.reasoning}</Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
