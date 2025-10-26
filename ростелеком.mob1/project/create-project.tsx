import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ProjectStage, ProjectSegment, ServiceType } from '@/types';

const STAGES: ProjectStage[] = ['Идея', 'Планирование', 'Разработка', 'Тестирование', 'Внедрение'];
const SEGMENTS: ProjectSegment[] = ['B2B', 'B2C', 'B2G'];
const SERVICES: ServiceType[] = ['Интернет', 'Телевидение', 'Телефония', 'Облачные услуги', 'Кибербезопасность'];

export default function CreateProjectScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const { addProject } = useProjects();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<ProjectStage>('Идея');
  const [segment, setSegment] = useState<ProjectSegment>('B2B');
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [manager, setManager] = useState(authState.user?.name || '');
  const [budget, setBudget] = useState('');
  const [team, setTeam] = useState('');

  const toggleService = (service: ServiceType) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleCreateProject = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите название проекта');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Ошибка', 'Введите описание проекта');
      return;
    }

    if (selectedServices.length === 0) {
      Alert.alert('Ошибка', 'Выберите хотя бы одну услугу');
      return;
    }

    if (!budget || isNaN(Number(budget))) {
      Alert.alert('Ошибка', 'Введите корректный бюджет');
      return;
    }

    setIsLoading(true);

    try {
      const teamArray = team
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await addProject({
        name: name.trim(),
        description: description.trim(),
        stage,
        segment,
        services: selectedServices,
        startDate: new Date().toISOString(),
        manager: manager.trim(),
        team: teamArray,
        budget: Number(budget),
        isFavorite: false,
        isProblematic: false,
        createdBy: authState.user?.id,
      });

      Alert.alert('Успех', 'Проект успешно создан', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Ошибка', 'Не удалось создать проект');
    } finally {
      setIsLoading(false);
    }
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
    section: {
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text.primary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.background.card,
      borderRadius: 12,
      padding: 16,
      fontSize: 15,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.background.cardLight,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top' as const,
    },
    chipScroll: {
      flexGrow: 0,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.background.card,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.background.cardLight,
    },
    chipActive: {
      backgroundColor: colors.primary.orange,
      borderColor: colors.primary.orange,
    },
    chipText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    chipTextActive: {
      color: colors.neutral.white,
      fontWeight: '600' as const,
    },
    segmentRow: {
      flexDirection: 'row',
      gap: 12,
    },
    segmentButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.background.card,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.background.cardLight,
    },
    segmentButtonActive: {
      backgroundColor: colors.primary.purple,
      borderColor: colors.primary.purple,
    },
    segmentText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text.secondary,
    },
    segmentTextActive: {
      color: colors.neutral.white,
    },
    servicesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    serviceChip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.background.cardLight,
    },
    serviceChipActive: {
      backgroundColor: colors.primary.orange + '20',
      borderColor: colors.primary.orange,
    },
    serviceChipText: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    serviceChipTextActive: {
      color: colors.primary.orange,
      fontWeight: '600' as const,
    },
    hint: {
      fontSize: 12,
      color: colors.text.muted,
      marginTop: 8,
    },
    createButton: {
      backgroundColor: colors.primary.orange,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    createButtonDisabled: {
      opacity: 0.6,
    },
    createButtonText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.neutral.white,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Создать проект',
          headerStyle: {
            backgroundColor: colors.background.card,
          },
          headerTintColor: colors.text.primary,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.label}>Название проекта *</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите название проекта"
            placeholderTextColor={colors.text.muted}
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Описание *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Введите описание проекта"
            placeholderTextColor={colors.text.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            editable={!isLoading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Этап проекта</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {STAGES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, stage === s && styles.chipActive]}
                onPress={() => setStage(s)}
                disabled={isLoading}
              >
                <Text style={[styles.chipText, stage === s && styles.chipTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Сегмент</Text>
          <View style={styles.segmentRow}>
            {SEGMENTS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.segmentButton, segment === s && styles.segmentButtonActive]}
                onPress={() => setSegment(s)}
                disabled={isLoading}
              >
                <Text style={[styles.segmentText, segment === s && styles.segmentTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Услуги *</Text>
          <View style={styles.servicesGrid}>
            {SERVICES.map((service) => (
              <TouchableOpacity
                key={service}
                style={[
                  styles.serviceChip,
                  selectedServices.includes(service) && styles.serviceChipActive,
                ]}
                onPress={() => toggleService(service)}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.serviceChipText,
                    selectedServices.includes(service) && styles.serviceChipTextActive,
                  ]}
                >
                  {service}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Руководитель проекта</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите имя руководителя"
            placeholderTextColor={colors.text.muted}
            value={manager}
            onChangeText={setManager}
            editable={!isLoading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Бюджет (₽) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите бюджет проекта"
            placeholderTextColor={colors.text.muted}
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
            editable={!isLoading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Команда</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите имена через запятую"
            placeholderTextColor={colors.text.muted}
            value={team}
            onChangeText={setTeam}
            editable={!isLoading}
          />
          <Text style={styles.hint}>Разделите имена запятой, например: Иванов И., Петров П.</Text>
        </View>

        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.createButtonDisabled]}
          onPress={handleCreateProject}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.neutral.white} />
          ) : (
            <Text style={styles.createButtonText}>Создать проект</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
