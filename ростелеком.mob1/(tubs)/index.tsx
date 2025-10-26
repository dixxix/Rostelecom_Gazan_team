import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { TrendingUp, TrendingDown, Folder, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react-native';
import { useProjects } from '@/contexts/ProjectsContext';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';
import { DashboardMetrics } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function DashboardScreen() {
  const { projects } = useProjects();
  const { authState } = useAuth();

  const metrics = useMemo((): DashboardMetrics => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => 
      p.stage !== 'Завершён'
    ).length;
    const completedProjects = projects.filter(p => 
      p.stage === 'Завершён'
    ).length;
    const problematicProjects = projects.filter(p => 
      p.isProblematic
    ).length;

    const totalRevenue = projects.reduce((sum, p) => 
      sum + p.monthlyFinances.reduce((s, m) => s + m.revenue, 0), 0
    );
    const totalCosts = projects.reduce((sum, p) => 
      sum + p.monthlyFinances.reduce((s, m) => s + m.costs, 0), 0
    );
    const totalProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalRevenue,
      totalCosts,
      totalProfit,
      profitMargin,
      problematicProjects,
    };
  }, [projects]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stageDistribution = useMemo(() => {
    const stages = projects.reduce((acc, p) => {
      acc[p.stage] = (acc[p.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stages).map(([stage, count]) => ({ stage, count }));
  }, [projects]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Добро пожаловать,</Text>
          <Text style={styles.name}>{authState.user?.name || 'Пользователь'}</Text>
          <Text style={styles.role}>
            {authState.user?.role === 'admin' && 'Администратор'}
            {authState.user?.role === 'analyst' && 'Аналитик'}
            {authState.user?.role === 'user' && 'Пользователь'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Обзор проектов</Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: Colors.primary.purple }]}>
              <View style={styles.metricIconContainer}>
                <Folder size={24} color={Colors.neutral.white} />
              </View>
              <Text style={styles.metricValue}>{metrics.totalProjects}</Text>
              <Text style={styles.metricLabel}>Всего проектов</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: Colors.primary.orange }]}>
              <View style={styles.metricIconContainer}>
                <TrendingUp size={24} color={Colors.neutral.white} />
              </View>
              <Text style={styles.metricValue}>{metrics.activeProjects}</Text>
              <Text style={styles.metricLabel}>Активных</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: Colors.semantic.success }]}>
              <View style={styles.metricIconContainer}>
                <CheckCircle size={24} color={Colors.neutral.white} />
              </View>
              <Text style={styles.metricValue}>{metrics.completedProjects}</Text>
              <Text style={styles.metricLabel}>Завершённых</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: Colors.semantic.error }]}>
              <View style={styles.metricIconContainer}>
                <AlertTriangle size={24} color={Colors.neutral.white} />
              </View>
              <Text style={styles.metricValue}>{metrics.problematicProjects}</Text>
              <Text style={styles.metricLabel}>Проблемных</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Финансовые показатели</Text>
          
          <View style={styles.financialCard}>
            <View style={styles.financialRow}>
              <View style={styles.financialItem}>
                <View style={[styles.financialIcon, { backgroundColor: Colors.semantic.success + '20' }]}>
                  <TrendingUp size={20} color={Colors.semantic.success} />
                </View>
                <View style={styles.financialInfo}>
                  <Text style={styles.financialLabel}>Выручка</Text>
                  <Text style={styles.financialValue}>{formatCurrency(metrics.totalRevenue)}</Text>
                </View>
              </View>

              <View style={styles.financialItem}>
                <View style={[styles.financialIcon, { backgroundColor: Colors.semantic.error + '20' }]}>
                  <TrendingDown size={20} color={Colors.semantic.error} />
                </View>
                <View style={styles.financialInfo}>
                  <Text style={styles.financialLabel}>Расходы</Text>
                  <Text style={styles.financialValue}>{formatCurrency(metrics.totalCosts)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.profitContainer}>
              <View style={[styles.financialIcon, { backgroundColor: Colors.primary.orange + '20' }]}>
                <DollarSign size={20} color={Colors.primary.orange} />
              </View>
              <View style={styles.financialInfo}>
                <Text style={styles.financialLabel}>Прибыль</Text>
                <Text style={[styles.profitValue, metrics.totalProfit >= 0 ? styles.profitPositive : styles.profitNegative]}>
                  {formatCurrency(metrics.totalProfit)}
                </Text>
                <Text style={styles.profitMargin}>
                  Рентабельность: {metrics.profitMargin.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Распределение по этапам</Text>
          <View style={styles.stageList}>
            {stageDistribution.map((item, index) => (
              <View key={index} style={styles.stageItem}>
                <View style={styles.stageInfo}>
                  <View style={[styles.stageDot, { backgroundColor: getStageColor(item.stage) }]} />
                  <Text style={styles.stageName}>{item.stage}</Text>
                </View>
                <View style={styles.stageCount}>
                  <Text style={styles.stageCountText}>{item.count}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    'Идея': Colors.neutral.gray400,
    'Планирование': Colors.semantic.info,
    'Разработка': Colors.primary.orange,
    'Тестирование': Colors.primary.purple,
    'Внедрение': Colors.semantic.warning,
    'Завершён': Colors.semantic.success,
  };
  return colors[stage] || Colors.neutral.gray400;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  name: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 4,
  },
  role: {
    fontSize: 14,
    color: Colors.primary.orange,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: CARD_WIDTH,
    padding: 16,
    borderRadius: 16,
    minHeight: 120,
  },
  metricIconContainer: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.neutral.white,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: Colors.neutral.white,
    opacity: 0.9,
  },
  financialCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 16,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financialItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  financialIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  financialInfo: {
    flex: 1,
  },
  financialLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.background.cardLight,
    marginVertical: 16,
  },
  profitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profitValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  profitPositive: {
    color: Colors.semantic.success,
  },
  profitNegative: {
    color: Colors.semantic.error,
  },
  profitMargin: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  stageList: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  stageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stageName: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  stageCount: {
    backgroundColor: Colors.background.cardLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stageCountText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
});
