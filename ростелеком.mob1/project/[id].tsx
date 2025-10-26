import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
} from 'lucide-react-native';
import { useProjects } from '@/contexts/ProjectsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Svg, Circle, Rect, Line, Text as SvgText, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

function RevenueChart({ monthlyFinances, colors }: { monthlyFinances: any[]; colors: any }) {
  if (monthlyFinances.length === 0) return null;

  const maxRevenue = Math.max(...monthlyFinances.map((m: any) => m.revenue), 100000);
  const chartWidth = width - 64;
  const chartHeight = 200;
  const padding = 40;
  const barWidth = Math.max((chartWidth - padding * 2) / monthlyFinances.length - 8, 20);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={chartWidth} height={chartHeight + 40}>
        {monthlyFinances.map((finance: any, index: number) => {
          const barHeight = (finance.revenue / maxRevenue) * chartHeight;
          const x = padding + index * ((chartWidth - padding * 2) / monthlyFinances.length);
          const y = chartHeight - barHeight + 20;

          return (
            <React.Fragment key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={colors.primary.orange}
                rx={4}
              />
              <SvgText
                x={x + barWidth / 2}
                y={chartHeight + 35}
                fontSize="10"
                fill={colors.text.secondary}
                textAnchor="middle"
              >
                {new Date(finance.month).toLocaleDateString('ru-RU', { month: 'short' })}
              </SvgText>
            </React.Fragment>
          );
        })}
        <Line
          x1={padding}
          y1={chartHeight + 20}
          x2={chartWidth - padding}
          y2={chartHeight + 20}
          stroke={colors.background.cardLight}
          strokeWidth={2}
        />
      </Svg>
      <View style={{ marginTop: 16, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary.orange }} />
          <Text style={{ fontSize: 13, color: colors.text.secondary }}>Выручка по месяцам</Text>
        </View>
      </View>
    </View>
  );
}

function BudgetPieChart({ budget, spent, colors }: { budget: number; spent: number; colors: any }) {
  const spentPercent = (spent / budget) * 100;

  const centerX = 100;
  const centerY = 100;
  const radius = 70;

  const spentAngle = (spentPercent / 100) * 360;
  const spentRadians = (spentAngle * Math.PI) / 180;
  
  const x1 = centerX + radius * Math.sin(spentRadians);
  const y1 = centerY - radius * Math.cos(spentRadians);

  const largeArcFlag = spentAngle > 180 ? 1 : 0;

  const spentPath = [
    `M ${centerX} ${centerY}`,
    `L ${centerX} ${centerY - radius}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x1} ${y1}`,
    'Z',
  ].join(' ');

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={200} height={200}>
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill={colors.semantic.success + '40'}
        />
        {spent > 0 && (
          <Path
            d={spentPath}
            fill={spent > budget ? colors.semantic.error : colors.primary.purple}
          />
        )}
        <Circle
          cx={centerX}
          cy={centerY}
          r={40}
          fill={colors.background.card}
        />
        <SvgText
          x={centerX}
          y={centerY + 7}
          fontSize="20"
          fontWeight="bold"
          fill={colors.text.primary}
          textAnchor="middle"
        >
          {spentPercent.toFixed(0)}%
        </SvgText>
      </Svg>
      <View style={{ marginTop: 24, width: '100%' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary.purple }} />
              <Text style={{ fontSize: 12, color: colors.text.secondary }}>Потрачено</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600' as const, color: colors.text.primary }}>
              {formatCurrency(spent)}
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.semantic.success + '60' }} />
              <Text style={{ fontSize: 12, color: colors.text.secondary }}>Осталось</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600' as const, color: colors.text.primary }}>
              {formatCurrency(Math.max(budget - spent, 0))}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ProjectDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProjectById, toggleFavorite } = useProjects();
  const { colors } = useTheme();
  const project = getProjectById(id);

  const totalRevenue = useMemo(() => {
    if (!project) return 0;
    return project.monthlyFinances.reduce((sum, m) => sum + m.revenue, 0);
  }, [project]);

  const totalCosts = useMemo(() => {
    if (!project) return 0;
    return project.monthlyFinances.reduce((sum, m) => sum + m.costs, 0);
  }, [project]);

  const totalProfit = totalRevenue - totalCosts;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStageColor = (stage: string): string => {
    const stageColors: Record<string, string> = {
      'Идея': colors.neutral.gray400,
      'Планирование': colors.semantic.info,
      'Разработка': colors.primary.orange,
      'Тестирование': colors.primary.purple,
      'Внедрение': colors.semantic.warning,
      'Завершён': colors.semantic.success,
    };
    return stageColors[stage] || colors.neutral.gray400;
  };

  const styles = useMemo(() => StyleSheet.create({
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
    headerButton: {
      padding: 8,
      marginRight: 8,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: 16,
      color: colors.text.secondary,
    },
    backButton: {
      marginTop: 16,
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: colors.primary.orange,
      borderRadius: 12,
    },
    backButtonText: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.neutral.white,
    },
    headerSection: {
      marginBottom: 24,
    },
    statusRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    stageBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    stageText: {
      fontSize: 13,
      fontWeight: '600' as const,
    },
    segmentBadge: {
      backgroundColor: colors.primary.purple + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    segmentText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.primary.purple,
    },
    projectName: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: colors.text.primary,
      marginBottom: 8,
    },
    projectDescription: {
      fontSize: 15,
      color: colors.text.secondary,
      lineHeight: 22,
    },
    warningBanner: {
      backgroundColor: colors.semantic.error + '20',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 16,
    },
    warningText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.semantic.error,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: colors.text.primary,
      marginBottom: 12,
    },
    analysisSummary: {
      flexDirection: 'row',
      gap: 12,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.background.card,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 8,
    },
    summaryValue: {
      fontSize: 20,
      fontWeight: '700' as const,
      marginBottom: 4,
    },
    summarySubtext: {
      fontSize: 11,
      color: colors.text.muted,
    },
    infoCard: {
      backgroundColor: colors.background.card,
      borderRadius: 16,
      padding: 16,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    infoIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.background.cardLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.text.primary,
      lineHeight: 20,
    },
    divider: {
      height: 1,
      backgroundColor: colors.background.cardLight,
      marginVertical: 16,
    },
    servicesList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    serviceTag: {
      backgroundColor: colors.background.card,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    serviceText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.text.primary,
    },
    financialCards: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    finCard: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
    },
    finLabel: {
      fontSize: 12,
      color: colors.neutral.white,
      opacity: 0.9,
      marginTop: 8,
    },
    finValue: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.neutral.white,
      marginTop: 4,
    },
    finSubtext: {
      fontSize: 11,
      color: colors.neutral.white,
      opacity: 0.8,
      marginTop: 2,
    },
    revenueCard: {
      backgroundColor: colors.background.card,
      borderRadius: 16,
      padding: 16,
    },
    revenueRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    revenueItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    revenueLabel: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    revenueValue: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text.primary,
    },
    profitSection: {
      alignItems: 'center',
    },
    profitLabel: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    profitValue: {
      fontSize: 24,
      fontWeight: '700' as const,
    },
    profitPositive: {
      color: colors.semantic.success,
    },
    profitNegative: {
      color: colors.semantic.error,
    },
    chartCard: {
      backgroundColor: colors.background.card,
      borderRadius: 16,
      padding: 16,
    },
    monthlyList: {
      gap: 12,
    },
    monthlyItem: {
      backgroundColor: colors.background.card,
      borderRadius: 16,
      padding: 16,
    },
    monthlyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    monthlyMonth: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text.primary,
    },
    monthlyFinances: {
      gap: 8,
    },
    monthlyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    monthlyLabel: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    monthlyValue: {
      fontSize: 14,
      fontWeight: '600' as const,
    },
    monthlyRevenue: {
      color: colors.semantic.success,
    },
    monthlyCosts: {
      color: colors.semantic.error,
    },
    monthlyProfit: {
      fontSize: 15,
      fontWeight: '700' as const,
    },
    monthlyProfitPositive: {
      color: colors.semantic.success,
    },
    monthlyProfitNegative: {
      color: colors.semantic.error,
    },
    historyList: {
      backgroundColor: colors.background.card,
      borderRadius: 16,
      padding: 16,
      gap: 16,
    },
    historyItem: {
      flexDirection: 'row',
      gap: 12,
    },
    historyDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary.orange,
      marginTop: 6,
    },
    historyContent: {
      flex: 1,
    },
    historyAction: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text.primary,
      marginBottom: 4,
    },
    historyUser: {
      fontSize: 13,
      color: colors.text.secondary,
      marginBottom: 2,
    },
    historyDate: {
      fontSize: 12,
      color: colors.text.muted,
    },
  }), [colors]);

  if (!project) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Проект не найден' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Проект не найден</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: project.name,
          headerStyle: {
            backgroundColor: colors.background.card,
          },
          headerTintColor: colors.text.primary,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => toggleFavorite(project.id)}
              style={styles.headerButton}
            >
              <Star
                size={24}
                color={project.isFavorite ? colors.semantic.warning : colors.neutral.gray400}
                fill={project.isFavorite ? colors.semantic.warning : 'transparent'}
              />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={styles.statusRow}>
            <View style={[styles.stageBadge, { backgroundColor: getStageColor(project.stage) + '20' }]}>
              <Text style={[styles.stageText, { color: getStageColor(project.stage) }]}>
                {project.stage}
              </Text>
            </View>
            <View style={styles.segmentBadge}>
              <Text style={styles.segmentText}>{project.segment}</Text>
            </View>
          </View>
          
          <Text style={styles.projectName}>{project.name}</Text>
          <Text style={styles.projectDescription}>{project.description}</Text>

          {project.isProblematic && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>⚠️ Требует внимания</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Аналитика проекта</Text>
          <View style={styles.analysisSummary}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Общая прибыль</Text>
              <Text style={[styles.summaryValue, totalProfit >= 0 ? styles.profitPositive : styles.profitNegative]}>
                {formatCurrency(totalProfit)}
              </Text>
              <Text style={styles.summarySubtext}>
                {totalProfit >= 0 ? '↑ Прибыльный' : '↓ Убыточный'}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Эффективность</Text>
              <Text style={styles.summaryValue}>
                {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0'}%
              </Text>
              <Text style={styles.summarySubtext}>
                Рентабельность
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>График выручки</Text>
          <View style={styles.chartCard}>
            <RevenueChart monthlyFinances={project.monthlyFinances} colors={colors} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Распределение бюджета</Text>
          <View style={styles.chartCard}>
            <BudgetPieChart budget={project.budget} spent={project.spent} colors={colors} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основная информация</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Users size={20} color={colors.primary.orange} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Руководитель проекта</Text>
                <Text style={styles.infoValue}>{project.manager}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Calendar size={20} color={colors.primary.purple} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Даты проекта</Text>
                <Text style={styles.infoValue}>
                  {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Открыто'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Users size={20} color={colors.semantic.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Команда ({project.team.length})</Text>
                <Text style={styles.infoValue}>{project.team.join(', ')}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Услуги</Text>
          <View style={styles.servicesList}>
            {project.services.map((service, index) => (
              <View key={index} style={styles.serviceTag}>
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Финансы</Text>
          
          <View style={styles.financialCards}>
            <View style={[styles.finCard, { backgroundColor: colors.primary.purple }]}>
              <DollarSign size={24} color={colors.neutral.white} />
              <Text style={styles.finLabel}>Бюджет</Text>
              <Text style={styles.finValue}>{formatCurrency(project.budget)}</Text>
            </View>

            <View style={[styles.finCard, { backgroundColor: colors.semantic.warning }]}>
              <TrendingDown size={24} color={colors.neutral.white} />
              <Text style={styles.finLabel}>Потрачено</Text>
              <Text style={styles.finValue}>{formatCurrency(project.spent)}</Text>
              <Text style={styles.finSubtext}>
                {((project.spent / project.budget) * 100).toFixed(0)}%
              </Text>
            </View>
          </View>

          <View style={styles.revenueCard}>
            <View style={styles.revenueRow}>
              <View style={styles.revenueItem}>
                <TrendingUp size={20} color={colors.semantic.success} />
                <View>
                  <Text style={styles.revenueLabel}>Выручка</Text>
                  <Text style={styles.revenueValue}>{formatCurrency(totalRevenue)}</Text>
                </View>
              </View>
              <View style={styles.revenueItem}>
                <TrendingDown size={20} color={colors.semantic.error} />
                <View>
                  <Text style={styles.revenueLabel}>Расходы</Text>
                  <Text style={styles.revenueValue}>{formatCurrency(totalCosts)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.profitSection}>
              <Text style={styles.profitLabel}>Прибыль</Text>
              <Text style={[styles.profitValue, totalProfit >= 0 ? styles.profitPositive : styles.profitNegative]}>
                {formatCurrency(totalProfit)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Финансы по месяцам</Text>
          <View style={styles.monthlyList}>
            {project.monthlyFinances.map((finance, index) => (
              <View key={index} style={styles.monthlyItem}>
                <View style={styles.monthlyHeader}>
                  <Clock size={16} color={colors.text.secondary} />
                  <Text style={styles.monthlyMonth}>
                    {new Date(finance.month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.monthlyFinances}>
                  <View style={styles.monthlyRow}>
                    <Text style={styles.monthlyLabel}>Выручка:</Text>
                    <Text style={[styles.monthlyValue, styles.monthlyRevenue]}>
                      {formatCurrency(finance.revenue)}
                    </Text>
                  </View>
                  <View style={styles.monthlyRow}>
                    <Text style={styles.monthlyLabel}>Расходы:</Text>
                    <Text style={[styles.monthlyValue, styles.monthlyCosts]}>
                      {formatCurrency(finance.costs)}
                    </Text>
                  </View>
                  <View style={styles.monthlyRow}>
                    <Text style={styles.monthlyLabel}>Прибыль:</Text>
                    <Text
                      style={[
                        styles.monthlyValue,
                        styles.monthlyProfit,
                        finance.profit >= 0 ? styles.monthlyProfitPositive : styles.monthlyProfitNegative,
                      ]}
                    >
                      {formatCurrency(finance.profit)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {project.history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>История изменений</Text>
            <View style={styles.historyList}>
              {project.history.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyAction}>{item.action}</Text>
                    <Text style={styles.historyUser}>{item.userName}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.timestamp).toLocaleString('ru-RU')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
