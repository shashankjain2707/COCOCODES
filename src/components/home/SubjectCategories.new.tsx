import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { GlassCard } from '../common/GlassCard';

interface Category {
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  count: number;
  gradient: string;
}

interface SubjectCategoriesProps {
  onCategoryPress?: (category: Category) => void;
  onViewAllPress?: () => void;
}

const categories: Category[] = [
  { name: "Mathematics", icon: "calculator", count: 24, gradient: "from-blue-600/25 to-blue-700/20" },
  { name: "Physics", icon: "atom", count: 18, gradient: "from-navy-600/25 to-blue-800/20" },
  { name: "Chemistry", icon: "flask", count: 15, gradient: "from-blue-500/25 to-navy-600/20" },
  { name: "Biology", icon: "dna", count: 21, gradient: "from-blue-700/25 to-slate-700/20" },
  { name: "Computer Science", icon: "code-tags", count: 32, gradient: "from-navy-500/25 to-blue-600/20" },
  { name: "Languages", icon: "translate", count: 12, gradient: "from-blue-800/25 to-navy-700/20" },
];

export const SubjectCategories: React.FC<SubjectCategoriesProps> = ({
  onCategoryPress,
  onViewAllPress,
}) => {
  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Subjects</Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category.name}
            style={styles.categoryCard}
            onPress={() => onCategoryPress?.(category)}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                  name={category.icon} 
                  size={16} 
                  color={theme.colors.blue[100]} 
                />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.videoCount}>{category.count} videos</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  viewAllText: {
    color: theme.colors.blue[300],
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  videoCount: {
    color: theme.colors.blue[200],
    fontSize: 12,
  },
});
