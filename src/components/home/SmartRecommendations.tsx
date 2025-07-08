import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { GlassCard } from '../common/GlassCard';

interface RecommendationItem {
  title: string;
  reason: string;
  duration: string;
  thumbnail: string;
}

interface SmartRecommendationsProps {
  onContentPress?: (content: RecommendationItem) => void;
}

const recommendations: RecommendationItem[] = [
  {
    title: 'Linear Algebra: Eigenvalues',
    reason: 'Based on your progress',
    duration: '45 min',
    thumbnail: 'https://via.placeholder.com/60x40/1e3a8a/ffffff?text=LA',
  },
  {
    title: 'Thermodynamics Laws',
    reason: 'Complements physics studies',
    duration: '32 min',
    thumbnail: 'https://via.placeholder.com/60x40/1e40af/ffffff?text=TD',
  },
];

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  onContentPress,
}) => {
  return (
    <GlassCard style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons 
            name="brain" 
            size={16} 
            color={theme.colors.blue[300]} 
          />
          <Text style={styles.title}>AI Recommended</Text>
          <MaterialCommunityIcons 
            name="star-four-points" 
            size={12} 
            color={theme.colors.blue[300]} 
          />
        </View>
      </View>

      {/* Recommendations List */}
      <View style={styles.content}>
        {recommendations.map((rec, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recommendationItem}
            onPress={() => onContentPress?.(rec)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: rec.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />

            <View style={styles.itemContent}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {rec.title}
              </Text>
              <Text style={styles.itemReason} numberOfLines={1}>
                {rec.reason}
              </Text>
              <View style={styles.durationContainer}>
                <MaterialCommunityIcons 
                  name="clock-outline" 
                  size={12} 
                  color={theme.colors.blue[300]} 
                />
                <Text style={styles.duration}>{rec.duration}</Text>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    gap: theme.spacing.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 64, 175, 0.2)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  thumbnail: {
    width: 48,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(30, 64, 175, 0.3)',
    marginRight: theme.spacing.sm,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemReason: {
    color: theme.colors.blue[200],
    fontSize: 12,
    marginBottom: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    color: theme.colors.blue[300],
    fontSize: 12,
  },
});
