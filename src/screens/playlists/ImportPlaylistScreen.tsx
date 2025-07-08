import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { playlistService } from '../../services/playlists/playlistService';

export const ImportPlaylistScreen: React.FC = () => {
  const navigation = useNavigation();
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateYouTubePlaylistUrl = (url: string): boolean => {
    return playlistService.validateYouTubePlaylistUrl(url);
  };

  const extractPlaylistId = (url: string): string | null => {
    return playlistService.extractPlaylistId(url);
  };

  const importPlaylist = async () => {
    if (!playlistUrl.trim()) {
      Alert.alert('Error', 'Please enter a YouTube playlist URL');
      return;
    }

    if (!validateYouTubePlaylistUrl(playlistUrl)) {
      Alert.alert('Error', 'Please enter a valid YouTube playlist URL');
      return;
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      Alert.alert('Error', 'Could not extract playlist ID from URL');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Fetch playlist data from YouTube API
      // For now, create a placeholder playlist
      const playlistData = {
        name: `Imported Playlist ${new Date().toLocaleDateString()}`,
        description: 'Imported from YouTube',
        type: 'imported' as const,
        videos: [], // TODO: Fetch actual videos from YouTube API
        isPublic: false,
        tags: ['imported', 'youtube'],
      };

      await playlistService.createPlaylist(playlistData);
      Alert.alert('Success', 'Playlist imported successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error importing playlist:', error);
      Alert.alert('Error', 'Failed to import playlist. Please try again.');
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
          <Text style={styles.headerTitle}>Import from YouTube</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.instructionsContainer}>
            <MaterialCommunityIcons name="youtube" size={48} color="#FF0000" />
            <Text style={styles.instructionsTitle}>Import YouTube Playlist</Text>
            <Text style={styles.instructionsText}>
              Paste a YouTube playlist URL below to import all videos from that playlist.
            </Text>
            
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleTitle}>Example URL:</Text>
              <Text style={styles.exampleUrl}>
                https://www.youtube.com/playlist?list=PLxxxxx...
              </Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Playlist URL *</Text>
            <TextInput
              style={styles.input}
              value={playlistUrl}
              onChangeText={setPlaylistUrl}
              placeholder="https://www.youtube.com/playlist?list=..."
              placeholderTextColor={theme.colors.slate[400]}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
            />
          </View>

          <TouchableOpacity 
            onPress={importPlaylist} 
            style={[styles.importButton, isLoading && styles.disabledButton]}
            disabled={isLoading}
          >
            <MaterialCommunityIcons 
              name={isLoading ? "loading" : "import"} 
              size={20} 
              color={theme.colors.white} 
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              {isLoading ? 'Importing...' : 'Import Playlist'}
            </Text>
          </TouchableOpacity>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What you'll get:</Text>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.success} />
              <Text style={styles.featureText}>All videos from the playlist</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.success} />
              <Text style={styles.featureText}>Original playlist title and description</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.success} />
              <Text style={styles.featureText}>Video thumbnails and metadata</Text>
            </View>
          </View>
        </View>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  instructionsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: theme.colors.slate[300],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  exampleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  exampleTitle: {
    fontSize: 12,
    color: theme.colors.slate[300],
    marginBottom: 4,
  },
  exampleUrl: {
    fontSize: 12,
    color: theme.colors.blue[300],
    fontFamily: 'monospace',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.colors.slate[300],
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    color: theme.colors.white,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.blue[600],
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 32,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  featuresContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.slate[300],
    marginLeft: 8,
  },
});
