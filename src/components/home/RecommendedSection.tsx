import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { theme } from '../../styles/theme';
import { RecommendedSectionProps } from '../../types/home';

export const RecommendedSection: React.FC<RecommendedSectionProps> = ({
  content,
  onContentPress,
  onExplorePress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.sectionIcon}>💡</Text>
          <Text style={styles.sectionTitle}>Recommended</Text>
        </View>
        <TouchableOpacity onPress={onExplorePress}>
          <Text style={styles.exploreText}>View all</Text>
        </TouchableOpacity>
      </View>

      {content.length === 0 ? (
        <View style={styles.emptyStateCard}>
          <View style={styles.emptyContent}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🎯</Text>
            </View>
            <Text style={styles.emptyTitle}>No recommendations yet</Text>
            <Text style={styles.emptySubtitle}>
              Start watching videos to get personalized recommendations
            </Text>
            <TouchableOpacity style={styles.exploreButton} onPress={onExplorePress}>
              <Text style={styles.exploreButtonText}>Explore Content</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.contentScrollContainer}
        >
          {content.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.contentCard, index === 0 && styles.firstCard]}
              onPress={() => onContentPress(item)}
            >
              <View style={styles.cardContent}>
                <View style={styles.thumbnailContainer}>
                  <View style={styles.thumbnailPlaceholder}>
                    <Text style={styles.subjectEmoji}>{getSubjectEmoji(item.subject)}</Text>
                  </View>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{item.duration}</Text>
                  </View>
                </View>
                
                <View style={styles.contentInfo}>
                  <Text style={styles.contentTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.contentDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.contentMeta}>
                    <Text style={styles.authorText}>{item.author}</Text>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingText}>⭐ {item.rating}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

// Helper function to get emoji for subjects
const getSubjectEmoji = (subject: string): string => {
  const emojiMap: { [key: string]: string } = {
    'Mathematics': '📊',
    'Physics': '⚛️',
    'Chemistry': '🧪',
    'Biology': '🧬',
    'Computer Science': '💻',
    'Languages': '🌍',
    'History': '📜',
    'Literature': '📚',
    'Art': '🎨',
    'Music': '🎵',
  };
  return emojiMap[subject] || '📚';
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  exploreText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  emptyStateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
    opacity: 0.8,
  },
  exploreButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  exploreButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  contentScrollContainer: {
    paddingRight: theme.spacing.lg,
  },
  contentCard: {
    width: 280,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  firstCard: {
    marginLeft: 0,
  },
  cardContent: {
    flex: 1,
  },
  thumbnailContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 140,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectEmoji: {
    fontSize: 48,
  },
  durationBadge: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  durationText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    fontWeight: '500' as const,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
  contentDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
    opacity: 0.9,
  },
  contentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    opacity: 0.8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    opacity: 0.8,
  },
});
