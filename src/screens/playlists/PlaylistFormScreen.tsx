import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootState, AppDispatch } from '../../store';
import { Playlist, PlaylistVideo } from '../../types/userContent';
import PlaylistForm from '../../components/playlists/PlaylistForm';
import VideoSelector from '../../components/playlists/VideoSelector';
import { createPlaylist, updatePlaylist } from '../../store/userContentSlice';

type PlaylistFormScreenRouteProp = RouteProp<
  {
    PlaylistForm: {
      playlistId?: string;
      categoryId?: string;
    };
  },
  'PlaylistForm'
>;

const PlaylistFormScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute<PlaylistFormScreenRouteProp>();
  const { playlistId, categoryId } = route.params || {};

  const { playlists } = useSelector((state: RootState) => state.userContent);
  const userId = useSelector((state: RootState) => state.auth.user?.uid);

  const [loading, setLoading] = useState(false);
  const [playlistData, setPlaylistData] = useState<Partial<Playlist>>({});
  const [videos, setVideos] = useState<PlaylistVideo[]>([]);
  const [step, setStep] = useState(1); // 1 for playlist details, 2 for video selection

  const playlist = playlistId ? playlists[playlistId] : undefined;
  const isEditing = !!playlist;

  useEffect(() => {
    if (isEditing && playlist) {
      setPlaylistData(playlist);
      setVideos(playlist.videos || []);
    }
  }, [isEditing, playlist]);

  const handlePlaylistDetailsSubmit = async (values: Partial<Playlist>) => {
    setPlaylistData({ ...playlistData, ...values });
    setStep(2);
  };

  const handleAddVideo = async (videoUrl: string) => {
    // In a real app, we would use the YouTube scraper to get video details
    // For now, we'll create a mock video entry
    const newVideo: PlaylistVideo = {
      videoId: `video-${Date.now()}`, // Mock ID
      title: `Video from ${videoUrl}`,
      duration: 300, // 5 minutes mock duration
      position: videos.length,
      thumbnailUrl: undefined, // Would be extracted from YouTube in a real app
      addedAt: new Date(),
      watchedDuration: 0,
      progress: 0,
      notes: [],
    };

    setVideos([...videos, newVideo]);
  };

  const handleRemoveVideo = (videoId: string) => {
    setVideos(videos.filter((video) => video.videoId !== videoId));
  };

  const handleReorderVideos = (newOrder: PlaylistVideo[]) => {
    setVideos(newOrder);
  };

  const handleCancel = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmitPlaylist = async () => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to create a playlist');
      return;
    }

    if (videos.length === 0) {
      Alert.alert('Error', 'Please add at least one video to the playlist');
      return;
    }

    setLoading(true);

    try {
      // Calculate total duration
      const totalDuration = videos.reduce((total, video) => total + video.duration, 0);

      // Prepare the complete playlist data
      const completePlaylist: Partial<Playlist> = {
        ...playlistData,
        videos,
        totalDuration,
        watchedDuration: isEditing ? playlist?.watchedDuration || 0 : 0,
        progress: isEditing ? playlist?.progress || 0 : 0,
        createdBy: userId,
      };

      if (isEditing) {
        await dispatch(updatePlaylist(completePlaylist as Playlist));
        Alert.alert('Success', 'Playlist updated successfully');
      } else {
        // Ensure all required fields are present
        if (!completePlaylist.title) {
          Alert.alert('Error', 'Playlist title is required');
          setLoading(false);
          return;
        }
        
        // Cast to the correct type required by createPlaylist
        const newPlaylist = {
          title: completePlaylist.title,
          description: completePlaylist.description || '',
          videos: completePlaylist.videos || [],
          totalDuration: completePlaylist.totalDuration || 0,
          watchedDuration: 0,
          progress: 0,
          createdBy: userId,
          categoryIds: completePlaylist.categoryIds || [],
          tags: completePlaylist.tags || [],
          isPublic: completePlaylist.isPublic || false,
        };
        
        await dispatch(createPlaylist(newPlaylist));
        Alert.alert('Success', 'Playlist created successfully');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        isEditing
          ? 'Failed to update playlist. Please try again.'
          : 'Failed to create playlist. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing
              ? 'Edit Playlist'
              : step === 1
              ? 'Create Playlist'
              : 'Add Videos'}
          </Text>
          <Text style={styles.stepIndicator}>
            Step {step} of 2
          </Text>
        </View>

        <ScrollView style={styles.content}>
          {step === 1 ? (
            <PlaylistForm
              initialValues={playlistData}
              categoryId={categoryId}
              onSubmit={handlePlaylistDetailsSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          ) : (
            <View style={styles.videoStep}>
              <VideoSelector
                videos={videos}
                onAddVideo={handleAddVideo}
                onRemoveVideo={handleRemoveVideo}
                onReorderVideos={handleReorderVideos}
                loading={false}
              />
              
              <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                  <Text style={styles.buttonHelp}>
                    Go back to edit playlist details
                  </Text>
                  <View style={styles.button} onTouchEnd={handleCancel}>
                    <Text style={styles.buttonText}>Back</Text>
                  </View>
                </View>
                
                <View style={styles.buttonWrapper}>
                  <Text style={styles.buttonHelp}>
                    Save playlist with {videos.length} videos
                  </Text>
                  <View 
                    style={[styles.button, styles.primaryButton]} 
                    onTouchEnd={handleSubmitPlaylist}
                  >
                    <Text style={styles.primaryButtonText}>
                      {loading ? 'Saving...' : 'Save Playlist'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  stepIndicator: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  videoStep: {
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  buttonWrapper: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  buttonHelp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  buttonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PlaylistFormScreen;
