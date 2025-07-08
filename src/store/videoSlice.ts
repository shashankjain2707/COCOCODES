// Redux slice for video state management
// Phase 1 Implementation

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { VideoMetadata, VideoPlayerState, VideoProgress, VideoError } from './types';
import { youtubeMetadataExtractor } from '../services/youtube/metadataExtractor';

// Async thunks for video operations
export const loadVideoMetadata = createAsyncThunk(
  'video/loadMetadata',
  async (videoIdOrUrl: string) => {
    const result = await youtubeMetadataExtractor.extractVideoMetadata(videoIdOrUrl);
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to load video metadata');
    }
    
    return result.data!;
  }
);

export const loadMultipleVideosMetadata = createAsyncThunk(
  'video/loadMultipleMetadata',
  async (videoIds: string[]) => {
    const results = await youtubeMetadataExtractor.extractMultipleVideosMetadata(videoIds);
    return results.filter((result: any): result is VideoMetadata => result !== null);
  }
);

// Initial state
interface VideoState {
  // Current video being played
  currentVideo: VideoMetadata | null;
  playerState: VideoPlayerState;
  
  // Video collection
  videos: Record<string, VideoMetadata>;
  
  // Progress tracking
  progress: Record<string, VideoProgress>;
  
  // Loading states
  isLoadingMetadata: boolean;
  isLoadingPlayer: boolean;
  
  // Error handling
  error: string | null;
  lastError: VideoError | null;
  
  // Recently viewed videos
  recentVideos: VideoMetadata[];
  
  // Playlists (for Phase 3)
  playlists: Record<string, any>;
}

const initialState: VideoState = {
  currentVideo: null,
  playerState: {
    videoId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isFullscreen: false,
    isLoading: false,
    error: null,
  },
  videos: {},
  progress: {},
  isLoadingMetadata: false,
  isLoadingPlayer: false,
  error: null,
  lastError: null,
  recentVideos: [],
  playlists: {},
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    // Player control actions
    setCurrentVideo: (state, action: PayloadAction<VideoMetadata>) => {
      state.currentVideo = action.payload;
      state.playerState.videoId = action.payload.id;
      state.error = null;
    },

    playVideo: (state) => {
      state.playerState.isPlaying = true;
    },

    pauseVideo: (state) => {
      state.playerState.isPlaying = false;
    },

    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.playerState.currentTime = action.payload;
    },

    setDuration: (state, action: PayloadAction<number>) => {
      state.playerState.duration = action.payload;
    },

    setVolume: (state, action: PayloadAction<number>) => {
      state.playerState.volume = Math.max(0, Math.min(1, action.payload));
    },

    toggleFullscreen: (state) => {
      state.playerState.isFullscreen = !state.playerState.isFullscreen;
    },

    setPlayerLoading: (state, action: PayloadAction<boolean>) => {
      state.playerState.isLoading = action.payload;
    },

    setPlayerError: (state, action: PayloadAction<string | null>) => {
      state.playerState.error = action.payload;
    },

    // Progress tracking
    updateVideoProgress: (state, action: PayloadAction<{
      videoId: string;
      currentTime: number;
      duration: number;
    }>) => {
      const { videoId, currentTime, duration } = action.payload;
      const percentageWatched = duration > 0 ? (currentTime / duration) * 100 : 0;
      
      state.progress[videoId] = {
        videoId,
        userId: 'current-user', // Will be updated with actual user ID
        currentTime: currentTime,
        duration: duration,
        percentage: percentageWatched,
        lastWatched: new Date(),
      };
    },

    // Video collection management
    addVideoToCollection: (state, action: PayloadAction<VideoMetadata>) => {
      const video = action.payload;
      state.videos[video.id] = video;
      
      // Add to recent videos (keep last 10)
      state.recentVideos = [
        video,
        ...state.recentVideos.filter((v: any) => v.id !== video.id),
      ].slice(0, 10);
    },

    removeVideoFromCollection: (state, action: PayloadAction<string>) => {
      const videoId = action.payload;
      delete state.videos[videoId];
      delete state.progress[videoId];
      state.recentVideos = state.recentVideos.filter((v: any) => v.id !== videoId);
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
      state.lastError = null;
      state.playerState.error = null;
    },

    // Reset player state
    resetPlayer: (state) => {
      state.playerState = initialState.playerState;
      state.currentVideo = null;
    },
  },

  extraReducers: (builder) => {
    // Load video metadata
    builder
      .addCase(loadVideoMetadata.pending, (state) => {
        state.isLoadingMetadata = true;
        state.error = null;
      })
      .addCase(loadVideoMetadata.fulfilled, (state, action) => {
        state.isLoadingMetadata = false;
        const video = action.payload;
        state.videos[video.id] = video;
        state.error = null;
      })
      .addCase(loadVideoMetadata.rejected, (state, action) => {
        state.isLoadingMetadata = false;
        state.error = action.error.message || 'Failed to load video metadata';
      });

    // Load multiple videos metadata
    builder
      .addCase(loadMultipleVideosMetadata.pending, (state) => {
        state.isLoadingMetadata = true;
        state.error = null;
      })
      .addCase(loadMultipleVideosMetadata.fulfilled, (state, action) => {
        state.isLoadingMetadata = false;
        action.payload.forEach((video: any) => {
          state.videos[video.id] = video;
        });
        state.error = null;
      })
      .addCase(loadMultipleVideosMetadata.rejected, (state, action) => {
        state.isLoadingMetadata = false;
        state.error = action.error.message || 'Failed to load videos metadata';
      });
  },
});

// Export actions
export const {
  setCurrentVideo,
  playVideo,
  pauseVideo,
  setCurrentTime,
  setDuration,
  setVolume,
  toggleFullscreen,
  setPlayerLoading,
  setPlayerError,
  updateVideoProgress,
  addVideoToCollection,
  removeVideoFromCollection,
  clearError,
  resetPlayer,
} = videoSlice.actions;

// Selectors
export const selectCurrentVideo = (state: { video: VideoState }) => state.video.currentVideo;
export const selectPlayerState = (state: { video: VideoState }) => state.video.playerState;
export const selectVideoById = (state: { video: VideoState }, videoId: string) => state.video.videos[videoId];
export const selectRecentVideos = (state: { video: VideoState }) => state.video.recentVideos;
export const selectVideoProgress = (state: { video: VideoState }, videoId: string) => state.video.progress[videoId];
export const selectIsVideoLoading = (state: { video: VideoState }) => state.video.isLoadingMetadata;

// Export reducer
export default videoSlice.reducer;
