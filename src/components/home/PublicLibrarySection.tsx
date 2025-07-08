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

interface CommunityPlaylist {
  title: string;
  creator: string;
  rating: number;
  videos: number;
  thumbnail: string;
}

interface PublicLibrarySectionProps {
  onPlaylistPress?: (playlist: CommunityPlaylist) => void;
  onExplorePress?: () => void;
}

const communityPlaylists: CommunityPlaylist[] = [
  {
    title: 'Advanced Calculus Mastery',
    creator: 'Dr. Sarah Chen',
    rating: 4.9,
    videos: 15,
    thumbnail: 'https://via.placeholder.com/60x40/1e3a8a/ffffff?text=AC',
  },
  {
    title: 'Quantum Physics Fundamentals',
    creator: 'Prof. Michael Torres',
    rating: 4.8,
    videos: 22,
    thumbnail: 'https://via.placeholder.com/60x40/1e40af/ffffff?text=QP',
  },
];

export const PublicLibrarySection: React.FC<PublicLibrarySectionProps> = ({
  onPlaylistPress,
  onExplorePress,
}) => {
  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons 
            name="account-group" 
            size={16} 
            color={theme.colors.blue[300]} 
          />
          <Text style={styles.title}>Community</Text>
          <MaterialCommunityIcons 
            name="trending-up" 
            size={12} 
            color={theme.colors.blue[300]} 
          />
        </View>
        <TouchableOpacity onPress={onExplorePress}>
          <Text style={styles.exploreButton}>Explore</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {communityPlaylists.map((playlist, index) => (
          <TouchableOpacity
            key={index}
            style={styles.playlistItem}
            onPress={() => onPlaylistPress?.(playlist)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: playlist.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />

            <View style={styles.itemContent}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {playlist.title}
              </Text>
              <View style={styles.itemDetails}>
                <Text style={styles.creator}>{playlist.creator}</Text>
                <View style={styles.ratingContainer}>
                  <MaterialCommunityIcons 
                    name="star" 
                    size={12} 
                    color={theme.colors.blue[400]} 
                  />
                  <Text style={styles.rating}>{playlist.rating}</Text>
                </View>
                <Text style={styles.videoCount}>{playlist.videos} videos</Text>
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
  exploreButton: {
    color: theme.colors.blue[300],
    fontSize: 12,
  },
  content: {
    gap: theme.spacing.sm,
  },
  playlistItem: {
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
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  creator: {
    color: theme.colors.blue[200],
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: theme.colors.blue[200],
    fontSize: 12,
  },
  videoCount: {
    color: theme.colors.blue[200],
    fontSize: 12,
  },
});
