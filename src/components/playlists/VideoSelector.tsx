import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PlaylistVideo } from '../../types/userContent';

interface VideoSelectorProps {
  videos: PlaylistVideo[];
  onAddVideo: (videoUrl: string) => Promise<void>;
  onRemoveVideo: (videoId: string) => void;
  onReorderVideos: (videos: PlaylistVideo[]) => void;
  loading: boolean;
}

const VideoSelector: React.FC<VideoSelectorProps> = ({
  videos,
  onAddVideo,
  onRemoveVideo,
  onReorderVideos,
  loading,
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [addingVideo, setAddingVideo] = useState(false);

  const handleAddVideo = async () => {
    if (!videoUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid YouTube URL');
      return;
    }

    setAddingVideo(true);
    try {
      await onAddVideo(videoUrl.trim());
      setVideoUrl('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add video. Please check the URL and try again.');
    } finally {
      setAddingVideo(false);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newVideos = [...videos];
    const temp = newVideos[index];
    newVideos[index] = newVideos[index - 1];
    newVideos[index - 1] = temp;
    
    // Update positions
    newVideos.forEach((video, idx) => {
      video.position = idx;
    });
    
    onReorderVideos(newVideos);
  };

  const handleMoveDown = (index: number) => {
    if (index === videos.length - 1) return;
    
    const newVideos = [...videos];
    const temp = newVideos[index];
    newVideos[index] = newVideos[index + 1];
    newVideos[index + 1] = temp;
    
    // Update positions
    newVideos.forEach((video, idx) => {
      video.position = idx;
    });
    
    onReorderVideos(newVideos);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:00`;
    }
    
    return `${minutes}:00`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Add YouTube Videos</Text>
      
      <View style={styles.addVideoContainer}>
        <TextInput
          style={styles.videoInput}
          value={videoUrl}
          onChangeText={setVideoUrl}
          placeholder="Paste YouTube URL"
          placeholderTextColor="#999"
          autoCapitalize="none"
          editable={!addingVideo}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddVideo}
          disabled={addingVideo || !videoUrl.trim()}
        >
          {addingVideo ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="plus" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      
      <Text style={styles.videoCount}>
        {videos.length} {videos.length === 1 ? 'video' : 'videos'} in playlist
      </Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.videoId}
          renderItem={({ item, index }) => (
            <View style={styles.videoItem}>
              <View style={styles.thumbnailContainer}>
                {item.thumbnailUrl ? (
                  <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
                ) : (
                  <View style={styles.placeholderThumbnail}>
                    <Icon name="youtube" size={24} color="#fff" />
                  </View>
                )}
                <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
              </View>
              
              <View style={styles.videoDetails}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.videoControls}>
                  <TouchableOpacity
                    style={[styles.controlButton, index === 0 && styles.disabledButton]}
                    onPress={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <Icon
                      name="arrow-up"
                      size={18}
                      color={index === 0 ? '#ccc' : '#666'}
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      index === videos.length - 1 && styles.disabledButton,
                    ]}
                    onPress={() => handleMoveDown(index)}
                    disabled={index === videos.length - 1}
                  >
                    <Icon
                      name="arrow-down"
                      size={18}
                      color={index === videos.length - 1 ? '#ccc' : '#666'}
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.controlButton, styles.removeButton]}
                    onPress={() => onRemoveVideo(item.videoId)}
                  >
                    <Icon name="trash-can-outline" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.videoList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  addVideoContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  videoInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoCount: {
    marginBottom: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  videoList: {
    paddingBottom: 16,
  },
  videoItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  thumbnailContainer: {
    width: 120,
    height: 68,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  duration: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    padding: 2,
    paddingHorizontal: 4,
    borderRadius: 2,
    fontSize: 12,
  },
  videoDetails: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  videoControls: {
    flexDirection: 'row',
    marginTop: 8,
  },
  controlButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    marginLeft: 'auto',
    backgroundColor: '#fee2e2',
  },
});

export default VideoSelector;
