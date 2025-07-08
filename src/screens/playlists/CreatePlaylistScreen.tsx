import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { playlistService, VideoData } from '../../services/playlists/playlistService';
import { youtubeMetadataExtractor } from '../../services/youtube/metadataExtractor';

interface VideoLink {
  id: string;
  url: string;
  title: string;
  isValid: boolean;
}

export const CreatePlaylistScreen: React.FC = () => {
  const navigation = useNavigation();
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>([]);
  const [currentLink, setCurrentLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateYouTubeUrl = (url: string): boolean => {
    return playlistService.validateYouTubeUrl(url);
  };

  const extractVideoId = (url: string): string | null => {
    return playlistService.extractVideoId(url);
  };

  const addVideoLink = async () => {
    if (!currentLink.trim()) {
      Alert.alert('Error', 'Please enter a YouTube URL');
      return;
    }

    if (!validateYouTubeUrl(currentLink)) {
      Alert.alert('Error', 'Please enter a valid YouTube URL');
      return;
    }

    const videoId = extractVideoId(currentLink);
    if (!videoId) {
      Alert.alert('Error', 'Could not extract video ID from URL');
      return;
    }

    // Check if video already exists
    if (videoLinks.some(link => link.url === currentLink)) {
      Alert.alert('Error', 'This video is already in the playlist');
      return;
    }

    setIsLoading(true);
    try {
      // Fetch video metadata from YouTube
      const metadataResult = await youtubeMetadataExtractor.extractVideoMetadata(currentLink);
      
      let title = `Video ${videoLinks.length + 1}`; // Fallback title
      let description = '';
      let thumbnail = '';
      
      if (metadataResult.success && metadataResult.data) {
        title = metadataResult.data.title;
        description = metadataResult.data.description || '';
        thumbnail = metadataResult.data.thumbnailUrl || '';
      }

      const newVideo: VideoLink = {
        id: videoId,
        url: currentLink,
        title,
        isValid: metadataResult.success,
      };

      setVideoLinks([...videoLinks, newVideo]);
      setCurrentLink('');
    } catch (error) {
      console.error('Error adding video:', error);
      Alert.alert('Error', 'Failed to add video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeVideoLink = (index: number) => {
    setVideoLinks(videoLinks.filter((_, i) => i !== index));
  };

  const createPlaylist = async () => {
    if (!playlistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    if (videoLinks.length === 0) {
      Alert.alert('Error', 'Please add at least one video');
      return;
    }

    setIsLoading(true);
    try {
      const videos: VideoData[] = videoLinks.map(link => ({
        id: link.id,
        url: link.url,
        title: link.title,
        addedAt: new Date(),
      }));

      const playlistId = await playlistService.createPlaylist({
        name: playlistName,
        description: playlistDescription,
        type: 'custom',
        videos: videos,
        isPublic: false,
        tags: [],
      });

      Alert.alert('Success', 'Playlist created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error creating playlist:', error);
      Alert.alert('Error', 'Failed to create playlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={[theme.colors.slate[950], theme.colors.blue[950], theme.colors.navy[900]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Playlist</Text>
          <TouchableOpacity onPress={createPlaylist} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Playlist Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Playlist Information</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                value={playlistName}
                onChangeText={setPlaylistName}
                placeholder="Enter playlist name"
                placeholderTextColor={theme.colors.slate[400]}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={playlistDescription}
                onChangeText={setPlaylistDescription}
                placeholder="Enter playlist description"
                placeholderTextColor={theme.colors.slate[400]}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Add Video Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add YouTube Videos</Text>
            <View style={styles.addLinkContainer}>
              <TextInput
                style={styles.linkInput}
                value={currentLink}
                onChangeText={setCurrentLink}
                placeholder="Paste YouTube URL here"
                placeholderTextColor={theme.colors.slate[400]}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                onPress={addVideoLink} 
                style={styles.addButton}
                disabled={isLoading}
              >
                <MaterialCommunityIcons 
                  name={isLoading ? "loading" : "plus"} 
                  size={20} 
                  color={theme.colors.white} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Video List */}
          {videoLinks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Videos ({videoLinks.length})</Text>
              {videoLinks.map((video, index) => (
                <View key={index} style={styles.videoItem}>
                  <View style={styles.videoInfo}>
                    <MaterialCommunityIcons 
                      name="play-circle" 
                      size={20} 
                      color={theme.colors.blue[400]} 
                    />
                    <View style={styles.videoDetails}>
                      <Text style={styles.videoTitle}>{video.title}</Text>
                      <Text style={styles.videoUrl} numberOfLines={1}>{video.url}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => removeVideoLink(index)}
                    style={styles.removeButton}
                  >
                    <MaterialCommunityIcons name="close" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.blue[600],
    borderRadius: 8,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.colors.slate[300],
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: theme.colors.white,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addLinkContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  linkInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: theme.colors.white,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  addButton: {
    backgroundColor: theme.colors.blue[600],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  videoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  videoDetails: {
    marginLeft: 12,
    flex: 1,
  },
  videoTitle: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  videoUrl: {
    color: theme.colors.slate[400],
    fontSize: 12,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
});
