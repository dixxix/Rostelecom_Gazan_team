import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Filter, Star, TrendingUp, Trophy } from 'lucide-react-native';
import { useProjects } from '@/contexts/ProjectsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Project, ProjectStage, ProjectSegment } from '@/types';

export default function ProjectsScreen() {
  const router = useRouter();
  const { projects, toggleFavorite } = useProjects();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<ProjectStage | 'all'>('all');
  const [selectedSegment, setSelectedSegment] = useState<ProjectSegment | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'budget'>('default');

  const filteredProjects = useMemo(() => {
    let filtered = projects.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = selectedStage === 'all' || project.stage === selectedStage;
      const matchesSegment = selectedSegment === 'all' || project.segment === selectedSegment;
      const matchesFavorite = !showFavoritesOnly || project.isFavorite;
      return matchesSearch && matchesStage && matchesSegment && matchesFavorite;
    });

    if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'budget') {
      filtered = [...filtered].sort((a, b) => b.budget - a.budget);
    }

    return filtered;
  }, [projects, searchQuery, selectedStage, selectedSegment, showFavoritesOnly, sortBy]);

  const stages: (ProjectStage | 'all')[] = ['all', 'Идея', 'Планирование', 'Разработка', 'Тестирование', 'Внедрение', 'Завершён'];
  const segments: (ProjectSegment | 'all')[] = ['all', 'B2B', 'B2C', 'B2G'];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStageColor = (stage: ProjectStage): string => {
    const stageColors: Record<ProjectStage, string> = {
      'Идея': colors.neutral.gray400,
      'Планирование': colors.semantic.info,
      'Разработка': colors.primary.orange,
      'Тестирование': colors.primary.purple,
      'Внедрение': colors.semantic.warning,
      'Завершён': colors.semantic.success,
    };
    return stageColors[stage];
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.main,
    },
    searchContainer: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
    },
    searchInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 48,
      gap: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.text.primary,
    },
    filterButton: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.background.card,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: colors.primary.orange + '20',
    },
    filtersContainer: {
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 12,
    },
    filterScroll: {
      flexGrow: 0,
    },
    filterGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    filterGroupLabel: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text.secondary,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.background.card,
    },
    filterChipActive: {
      backgroundColor: colors.primary.orange,
    },
    filterChipText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    filterChipTextActive: {
      color: colors.neutral.white,
      fontWeight: '600' as const,
    },
    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    resultsText: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    favoriteFilter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.semantic.warning,
    },
    favoriteFilterActive: {
      backgroundColor: colors.semantic.warning,
    },
    favoriteFilterText: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.semantic.warning,
    },
    favoriteFilterTextActive: {
      color: colors.neutral.white,
    },
    listContent: {
      padding: 16,
      paddingTop: 8,
      gap: 16,
    },
    projectCard: {
      backgroundColor: colors.background.card,
      borderRadius: 16,
      overflow: 'hidden',
    },
    projectHeader: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.background.cardLight,
    },
    projectTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    projectTitleLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.semantic.warning + '15',
    },
    ratingText: {
      fontSize: 12,
      fontWeight: '700' as const,
      color: colors.semantic.warning,
    },
    stageBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 8,
    },
    stageText: {
      fontSize: 12,
      fontWeight: '600' as const,
    },
    favoriteButton: {
      padding: 4,
    },
    projectName: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.text.primary,
      marginBottom: 8,
    },
    projectDescription: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    projectInfo: {
      padding: 16,
      gap: 16,
    },
    infoRow: {
      flexDirection: 'row',
      gap: 16,
    },
    infoItem: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text.primary,
    },
    segmentBadge: {
      backgroundColor: colors.primary.purple + '20',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    segmentText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.primary.purple,
    },
    financialRow: {
      gap: 12,
    },
    budgetInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    budgetLabel: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    budgetValue: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: colors.text.primary,
    },
    progressInfo: {
      gap: 4,
    },
    progressLabel: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.background.cardLight,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressText: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.text.primary,
    },
    warningBadge: {
      backgroundColor: colors.semantic.error + '20',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    warningText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.semantic.error,
    },
  }), [colors]);

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => router.push(`/project/${item.id}` as any)}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectTitleRow}>
          <View style={styles.projectTitleLeft}>
            <View style={[styles.stageBadge, { backgroundColor: getStageColor(item.stage) + '20' }]}>
              <Text style={[styles.stageText, { color: getStageColor(item.stage) }]}>
                {item.stage}
              </Text>
            </View>
            {item.rating && (
              <View style={styles.ratingBadge}>
                <Trophy size={14} color={colors.semantic.warning} />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            style={styles.favoriteButton}
          >
            <Star
              size={20}
              color={item.isFavorite ? colors.semantic.warning : colors.neutral.gray500}
              fill={item.isFavorite ? colors.semantic.warning : 'transparent'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.projectName}>{item.name}</Text>
        <Text style={styles.projectDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      <View style={styles.projectInfo}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Сегмент</Text>
            <View style={styles.segmentBadge}>
              <Text style={styles.segmentText}>{item.segment}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Менеджер</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{item.manager}</Text>
          </View>
        </View>

        <View style={styles.financialRow}>
          <View style={styles.budgetInfo}>
            <TrendingUp size={16} color={colors.semantic.success} />
            <View>
              <Text style={styles.budgetLabel}>Бюджет</Text>
              <Text style={styles.budgetValue}>{formatCurrency(item.budget)}</Text>
            </View>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Потрачено</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((item.spent / item.budget) * 100, 100)}%`,
                    backgroundColor: item.spent > item.budget ? colors.semantic.error : colors.primary.orange,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {((item.spent / item.budget) * 100).toFixed(0)}%
            </Text>
          </View>
        </View>

        {item.isProblematic && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningText}>⚠️ Требует внимания</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.neutral.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск проектов..."
            placeholderTextColor={colors.neutral.gray500}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? colors.primary.orange : colors.neutral.gray400} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterGroupLabel}>Сортировка:</Text>
              <TouchableOpacity
                style={[styles.filterChip, sortBy === 'default' && styles.filterChipActive]}
                onPress={() => setSortBy('default')}
              >
                <Text style={[styles.filterChipText, sortBy === 'default' && styles.filterChipTextActive]}>По умолчанию</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, sortBy === 'rating' && styles.filterChipActive]}
                onPress={() => setSortBy('rating')}
              >
                <Text style={[styles.filterChipText, sortBy === 'rating' && styles.filterChipTextActive]}>По рейтингу</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, sortBy === 'budget' && styles.filterChipActive]}
                onPress={() => setSortBy('budget')}
              >
                <Text style={[styles.filterChipText, sortBy === 'budget' && styles.filterChipTextActive]}>По бюджету</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterGroupLabel}>Этап:</Text>
              {stages.map((stage) => (
                <TouchableOpacity
                  key={stage}
                  style={[
                    styles.filterChip,
                    selectedStage === stage && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedStage(stage)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedStage === stage && styles.filterChipTextActive,
                    ]}
                  >
                    {stage === 'all' ? 'Все' : stage}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterGroupLabel}>Сегмент:</Text>
              {segments.map((segment) => (
                <TouchableOpacity
                  key={segment}
                  style={[
                    styles.filterChip,
                    selectedSegment === segment && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedSegment(segment)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedSegment === segment && styles.filterChipTextActive,
                    ]}
                  >
                    {segment === 'all' ? 'Все' : segment}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          Найдено проектов: {filteredProjects.length}
        </Text>
        <TouchableOpacity
          style={[styles.favoriteFilter, showFavoritesOnly && styles.favoriteFilterActive]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Star
            size={16}
            color={showFavoritesOnly ? colors.neutral.white : colors.semantic.warning}
            fill={showFavoritesOnly ? colors.neutral.white : colors.semantic.warning}
          />
          <Text style={[styles.favoriteFilterText, showFavoritesOnly && styles.favoriteFilterTextActive]}>
            Избранные
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
