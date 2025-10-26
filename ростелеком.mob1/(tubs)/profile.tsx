import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, LogOut, ChevronRight, Star, FolderPlus, Shield, Users, BarChart3, Settings } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MOCK_TEAMS } from '@/mocks/users';

export default function ProfileScreen() {
  const router = useRouter();
  const { authState, logout } = useAuth();
  const { projects } = useProjects();
  const { colors } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const getRoleName = (role: string): string => {
    const roles: Record<string, string> = {
      admin: 'Администратор',
      analyst: 'Аналитик',
      user: 'Пользователь',
    };
    return roles[role] || role;
  };

  const isAdmin = authState.user?.role === 'admin';

  const userStats = useMemo(() => {
    if (!authState.user) return { myProjects: 0, favoriteProjects: 0, totalBudget: 0 };
    
    const myProjects = projects.filter(p => p.createdBy === authState.user?.id).length;
    const favoriteProjects = projects.filter(p => p.isFavorite).length;
    const totalBudget = projects
      .filter(p => p.createdBy === authState.user?.id)
      .reduce((sum, p) => sum + p.budget, 0);

    return { myProjects, favoriteProjects, totalBudget };
  }, [projects, authState.user]);

  const adminStats = useMemo(() => {
    if (!isAdmin) return null;

    const totalProjects = projects.length;
    const totalUsers = 1;
    const activeProjects = projects.filter(p => p.stage !== 'Завершён').length;

    return { totalProjects, totalUsers, activeProjects };
  }, [projects, isAdmin]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreateProject = () => {
    router.push('/create-project' as any);
  };

  const handleSettings = () => {
    router.push('/settings' as any);
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
      paddingVertical: 24,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary.orange,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarText: {
      fontSize: 36,
      fontWeight: '700' as const,
      color: colors.neutral.white,
    },
    name: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: colors.text.primary,
      marginBottom: 8,
    },
    roleBadge: {
      backgroundColor: colors.primary.purple + '20',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
    },
    roleText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.primary.purple,
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
    adminStatsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statCard: {
      flex: 1,
      minWidth: '30%',
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: colors.neutral.white,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      color: colors.neutral.white,
      opacity: 0.9,
      marginTop: 4,
      textAlign: 'center',
    },
    statsGrid: {
      backgroundColor: colors.background.card,
      borderRadius: 16,
      padding: 16,
      gap: 16,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    statInfo: {
      flex: 1,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: colors.text.primary,
    },
    statText: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    budgetCard: {
      backgroundColor: colors.primary.purple,
      borderRadius: 16,
      padding: 20,
      marginTop: 12,
      alignItems: 'center',
    },
    budgetLabel: {
      fontSize: 13,
      color: colors.neutral.white,
      opacity: 0.9,
      marginBottom: 8,
    },
    budgetValue: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: colors.neutral.white,
    },
    infoCard: {
      backgroundColor: colors.background.card,
      borderRadius: 16,
      padding: 16,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
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
    },
    actionsList: {
      gap: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background.card,
      borderRadius: 16,
      padding: 16,
    },
    actionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoutIcon: {
      backgroundColor: colors.semantic.error + '20',
    },
    actionText: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.text.primary,
    },
    logoutText: {
      color: colors.semantic.error,
    },
    teamsList: {
      gap: 12,
    },
    teamCard: {
      backgroundColor: colors.background.card,
      borderRadius: 16,
      padding: 16,
      gap: 12,
    },
    teamHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    teamIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primary.orange + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    teamInfo: {
      flex: 1,
    },
    teamName: {
      fontSize: 15,
      fontWeight: '700' as const,
      color: colors.text.primary,
      marginBottom: 6,
    },
    teamMeta: {
      flexDirection: 'row',
      gap: 12,
    },
    teamMetaItem: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    teamMetaValue: {
      fontSize: 13,
      fontWeight: '700' as const,
      color: colors.primary.orange,
    },
    teamMetaLabel: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    teamRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.semantic.warning + '15',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    teamRatingText: {
      fontSize: 13,
      fontWeight: '700' as const,
      color: colors.semantic.warning,
    },
    teamMembers: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    memberBadge: {
      backgroundColor: colors.background.cardLight,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    memberName: {
      fontSize: 11,
      fontWeight: '600' as const,
      color: colors.text.secondary,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: 24,
      gap: 4,
    },
    footerText: {
      fontSize: 12,
      color: colors.text.muted,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {authState.user?.name.split(' ').map(n => n[0]).join('') || 'П'}
            </Text>
          </View>
          <Text style={styles.name}>{authState.user?.name || 'Пользователь'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getRoleName(authState.user?.role || 'user')}</Text>
          </View>
        </View>

        {isAdmin ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Статистика администратора</Text>
            <View style={styles.adminStatsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.primary.purple }]}>
                <Shield size={24} color={colors.neutral.white} />
                <Text style={styles.statValue}>{adminStats?.totalProjects || 0}</Text>
                <Text style={styles.statLabel}>Всего проектов</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.primary.orange }]}>
                <BarChart3 size={24} color={colors.neutral.white} />
                <Text style={styles.statValue}>{adminStats?.activeProjects || 0}</Text>
                <Text style={styles.statLabel}>Активных</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.semantic.success }]}>
                <Users size={24} color={colors.neutral.white} />
                <Text style={styles.statValue}>{adminStats?.totalUsers || 0}</Text>
                <Text style={styles.statLabel}>Пользователей</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Моя статистика</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <FolderPlus size={20} color={colors.primary.orange} />
                <View style={styles.statInfo}>
                  <Text style={styles.statNumber}>{userStats.myProjects}</Text>
                  <Text style={styles.statText}>Мои проекты</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <Star size={20} color={colors.semantic.warning} />
                <View style={styles.statInfo}>
                  <Text style={styles.statNumber}>{userStats.favoriteProjects}</Text>
                  <Text style={styles.statText}>Избранных</Text>
                </View>
              </View>
            </View>
            {userStats.myProjects > 0 && (
              <View style={styles.budgetCard}>
                <Text style={styles.budgetLabel}>Общий бюджет проектов</Text>
                <Text style={styles.budgetValue}>{formatCurrency(userStats.totalBudget)}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Mail size={20} color={colors.primary.purple} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{authState.user?.email}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Действия</Text>
          
          <View style={styles.actionsList}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCreateProject}>
              <View style={styles.actionLeft}>
                <View style={[styles.actionIcon, { backgroundColor: colors.primary.orange + '20' }]}>
                  <FolderPlus size={20} color={colors.primary.orange} />
                </View>
                <Text style={styles.actionText}>Создать проект</Text>
              </View>
              <ChevronRight size={20} color={colors.neutral.gray500} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleSettings}>
              <View style={styles.actionLeft}>
                <View style={[styles.actionIcon, { backgroundColor: colors.primary.purple + '20' }]}>
                  <Settings size={20} color={colors.primary.purple} />
                </View>
                <Text style={styles.actionText}>Настройки</Text>
              </View>
              <ChevronRight size={20} color={colors.neutral.gray500} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
              <View style={styles.actionLeft}>
                <View style={[styles.actionIcon, styles.logoutIcon]}>
                  <LogOut size={20} color={colors.semantic.error} />
                </View>
                <Text style={[styles.actionText, styles.logoutText]}>Выйти из аккаунта</Text>
              </View>
              <ChevronRight size={20} color={colors.neutral.gray500} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Все команды ({MOCK_TEAMS.length})</Text>
          <View style={styles.teamsList}>
            {MOCK_TEAMS.map((team) => (
              <View key={team.id} style={styles.teamCard}>
                <View style={styles.teamHeader}>
                  <View style={styles.teamIconContainer}>
                    <Users size={20} color={colors.primary.orange} />
                  </View>
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <View style={styles.teamMeta}>
                      <View style={styles.teamMetaItem}>
                        <Text style={styles.teamMetaValue}>{team.members.length}</Text>
                        <Text style={styles.teamMetaLabel}> участников</Text>
                      </View>
                      <View style={styles.teamMetaItem}>
                        <Text style={styles.teamMetaValue}>{team.projectsCount}</Text>
                        <Text style={styles.teamMetaLabel}> проектов</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.teamRating}>
                    <Star size={14} color={colors.semantic.warning} fill={colors.semantic.warning} />
                    <Text style={styles.teamRatingText}>{team.rating.toFixed(1)}</Text>
                  </View>
                </View>
                <View style={styles.teamMembers}>
                  {team.members.slice(0, 3).map((member, idx) => (
                    <View key={idx} style={styles.memberBadge}>
                      <Text style={styles.memberName}>{member}</Text>
                    </View>
                  ))}
                  {team.members.length > 3 && (
                    <View style={styles.memberBadge}>
                      <Text style={styles.memberName}>+{team.members.length - 3}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Версия 1.0.0</Text>
          <Text style={styles.footerText}>© 2024 РОСТЕЛЕКОМ</Text>
        </View>
      </ScrollView>
    </View>
  );
}
