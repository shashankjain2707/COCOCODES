import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState, AppDispatch } from '../../store';
import { deleteCategory } from '../../store/userContentSlice';
import { Category, Playlist } from '../../types/userContent';

type CategoryDetailScreenRouteProp = RouteProp<
  { 
    CategoryDetail: { 
      categoryId: string 
    } 
  },
  'CategoryDetail'
>;

const CategoryDetailScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute<CategoryDetailScreenRouteProp>();
  const { categoryId } = route.params;

  const { categories, playlists, categoriesLoading } = useSelector(
    (state: RootState) => state.userContent
  );
  
  const category = categories[categoryId];
  
  // Filter playlists that belong to this category
  const categoryPlaylists = Object.values(playlists).filter(
    (playlist) => playlist.categoryIds.includes(categoryId)
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If the category doesn't exist, go back
    if (!category && !categoriesLoading) {
      navigation.goBack();
    }
  }, [category, categoriesLoading, navigation]);

  const handleEdit = () => {
    navigation.navigate('CategoryForm', { categoryId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await dispatch(deleteCategory(categoryId));
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete category');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAddPlaylist = () => {
    navigation.navigate('PlaylistForm', { categoryId });
  };

  const handlePlaylistPress = (playlist: Playlist) => {
    navigation.navigate('PlaylistDetail', { playlistId: playlist.id });
  };

  if (categoriesLoading || !category) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Convert hex color to rgba for gradient
  const hexToRgba = (hex: string, alpha: number = 1): string => {
    // Default color if none provided
    if (!hex) return `rgba(59, 130, 246, ${alpha})`;
    
    const hexValue = hex.replace('#', '');
    const r = parseInt(hexValue.substring(0, 2), 16);
    const g = parseInt(hexValue.substring(2, 4), 16);
    const b = parseInt(hexValue.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[hexToRgba(category.color, 0.9), hexToRgba(category.color, 0.7)]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Icon name={category.icon || 'folder'} size={48} color="#FFFFFF" />
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="video-outline" size={18} color="#FFFFFF" />
              <Text style={styles.statValue}>{category.videoCount}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="playlist-play" size={18} color="#FFFFFF" />
              <Text style={styles.statValue}>{categoryPlaylists.length}</Text>
              <Text style={styles.statLabel}>Playlists</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleEdit}
              disabled={isLoading}
            >
              <Icon name="pencil" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={handleDelete}
              disabled={isLoading}
            >
              <Icon name="trash-can-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>
                {isLoading ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Playlists</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddPlaylist}
          >
            <Icon name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Playlist</Text>
          </TouchableOpacity>
        </View>

        {categoryPlaylists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="playlist-plus" size={48} color="#999" />
            <Text style={styles.emptyText}>
              No playlists in this category yet.
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={handleAddPlaylist}
            >
              <Text style={styles.emptyButtonText}>Create Playlist</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={categoryPlaylists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.playlistItem}
                onPress={() => handlePlaylistPress(item)}
              >
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistTitle}>{item.title}</Text>
                  <Text style={styles.playlistDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.playlistStats}>
                    <View style={styles.playlistStat}>
                      <Icon name="video-outline" size={14} color="#666" />
                      <Text style={styles.playlistStatText}>
                        {item.videos.length} videos
                      </Text>
                    </View>
                    <View style={styles.playlistStat}>
                      <Icon name="clock-outline" size={14} color="#666" />
                      <Text style={styles.playlistStatText}>
                        {formatDuration(item.totalDuration)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color="#999" />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.playlistList}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

// Helper function to format duration in seconds to "Xh Ym" format
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  playlistList: {
    paddingBottom: 24,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  playlistDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  playlistStats: {
    flexDirection: 'row',
    marginTop: 8,
  },
  playlistStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  playlistStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default CategoryDetailScreen;
