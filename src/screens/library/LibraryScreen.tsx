import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';
import { GlassCard } from '../../components/common/GlassCard';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

interface VideoItem {
  id: string;
  title: string;
  subject: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  progress?: number;
}

export const LibraryScreen: React.FC = () => {
  const { isAuthenticated, userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Physics', 'Mathematics', 'Chemistry', 'Biology', 'History'];

  // Mock data for saved videos
  const savedVideos: VideoItem[] = [
    {
      id: '1',
      title: 'Introduction to Quantum Physics',
      subject: 'Physics',
      duration: '45:30',
      difficulty: 'intermediate',
      thumbnail: '',
      progress: 75,
    },
    {
      id: '2',
      title: 'Calculus Fundamentals',
      subject: 'Mathematics',
      duration: '32:15',
      difficulty: 'beginner',
      thumbnail: '',
      progress: 100,
    },
    {
      id: '3',
      title: 'Organic Chemistry Basics',
      subject: 'Chemistry',
      duration: '28:45',
      difficulty: 'intermediate',
      thumbnail: '',
      progress: 40,
    },
    {
      id: '4',
      title: 'Cell Biology Overview',
      subject: 'Biology',
      duration: '38:20',
      difficulty: 'beginner',
      thumbnail: '',
    },
  ];

  const filteredVideos = savedVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || video.subject === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return theme.colors.green[400];
      case 'intermediate': return theme.colors.yellow[400];
      case 'advanced': return theme.colors.orange[400];
      default: return theme.colors.slate[400];
    }
  };

  if (!isAuthenticated) {
    return (
      <LinearGradient
        colors={[theme.colors.slate[950], theme.colors.blue[950], theme.colors.navy[900]]}
        style={styles.container}
      >
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="book-multiple"
            size={64}
            color={theme.colors.slate[400]}
          />
          <Text style={styles.emptyTitle}>Your Library</Text>
          <Text style={styles.emptySubtitle}>Sign in to save and organize your learning content</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[theme.colors.slate[950], theme.colors.blue[950], theme.colors.navy[900]]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Library</Text>
          <Text style={styles.subtitle}>Your saved learning content</Text>
        </View>

        {/* Search Bar */}
        <GlassCard style={styles.searchCard}>
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={theme.colors.slate[400]}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your library..."
              placeholderTextColor={theme.colors.slate[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={theme.colors.slate[400]}
                />
              </TouchableOpacity>
            )}
          </View>
        </GlassCard>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Video List */}
        <View style={styles.videoList}>
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video) => (
              <GlassCard key={video.id} style={styles.videoCard}>
                <TouchableOpacity style={styles.videoContent}>
                  {/* Thumbnail Placeholder */}
                  <View style={styles.thumbnail}>
                    <MaterialCommunityIcons
                      name="play"
                      size={32}
                      color={theme.colors.white}
                    />
                    {video.progress && (
                      <View style={styles.progressOverlay}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${video.progress}%` },
                            ]}
                          />
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Video Info */}
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle}>{video.title}</Text>
                    <View style={styles.videoMeta}>
                      <Text style={styles.videoSubject}>{video.subject}</Text>
                      <Text style={styles.videoDuration}>{video.duration}</Text>
                    </View>
                    <View style={styles.videoTags}>
                      <View
                        style={[
                          styles.difficultyTag,
                          { backgroundColor: getDifficultyColor(video.difficulty) + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.difficultyText,
                            { color: getDifficultyColor(video.difficulty) },
                          ]}
                        >
                          {video.difficulty}
                        </Text>
                      </View>
                      {video.progress && (
                        <Text style={styles.progressText}>
                          {video.progress === 100 ? 'Completed' : `${video.progress}% watched`}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.videoActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <MaterialCommunityIcons
                        name="bookmark"
                        size={20}
                        color={theme.colors.blue[400]}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <MaterialCommunityIcons
                        name="dots-vertical"
                        size={20}
                        color={theme.colors.slate[400]}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </GlassCard>
            ))
          ) : (
            <GlassCard style={styles.emptyCard}>
              <MaterialCommunityIcons
                name="book-search"
                size={48}
                color={theme.colors.slate[400]}
              />
              <Text style={styles.emptyCardTitle}>No videos found</Text>
              <Text style={styles.emptyCardSubtitle}>
                {searchQuery ? 'Try adjusting your search or filter' : 'Start saving videos to build your library'}
              </Text>
            </GlassCard>
          )}
        </View>

        {/* Quick Stats */}
        <GlassCard style={styles.statsCard}>
          <Text style={styles.statsTitle}>Library Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{savedVideos.length}</Text>
              <Text style={styles.statLabel}>Saved Videos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {savedVideos.filter(v => v.progress === 100).length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {savedVideos.filter(v => v.progress && v.progress > 0 && v.progress < 100).length}
              </Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.slate[300],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.slate[400],
    textAlign: 'center',
  },
  searchCard: {
    padding: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchIcon: {
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.white,
    padding: 0,
  },
  categoryScroll: {
    marginBottom: 24,
  },
  categoryContainer: {
    paddingRight: 20,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryChipActive: {
    backgroundColor: theme.colors.blue[600],
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.slate[300],
    fontWeight: '500',
  },
  categoryTextActive: {
    color: theme.colors.white,
  },
  videoList: {
    gap: 16,
    marginBottom: 24,
  },
  videoCard: {
    padding: 16,
  },
  videoContent: {
    flexDirection: 'row',
    gap: 16,
  },
  thumbnail: {
    width: 120,
    height: 68,
    borderRadius: 8,
    backgroundColor: theme.colors.slate[700],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 1.5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.blue[500],
    borderRadius: 1.5,
  },
  videoInfo: {
    flex: 1,
    gap: 4,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    lineHeight: 22,
  },
  videoMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  videoSubject: {
    fontSize: 14,
    color: theme.colors.blue[400],
    fontWeight: '500',
  },
  videoDuration: {
    fontSize: 14,
    color: theme.colors.slate[400],
  },
  videoTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  difficultyTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.green[400],
    fontWeight: '500',
  },
  videoActions: {
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCardSubtitle: {
    fontSize: 14,
    color: theme.colors.slate[400],
    textAlign: 'center',
  },
  statsCard: {
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.blue[400],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.slate[300],
  },
});
