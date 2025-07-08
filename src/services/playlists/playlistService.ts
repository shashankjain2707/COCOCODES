import { auth, firestore, Timestamp } from '../firebase/config';

export interface VideoData {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: string;
  addedAt: any;
  progress?: VideoProgress;
}

export interface VideoProgress {
  watchedSeconds: number;
  totalSeconds: number;
  completed: boolean;
  lastWatched?: any;
}

export interface PlaylistData {
  id?: string;
  name: string;
  description: string;
  type: 'custom' | 'imported';
  videos: VideoData[];
  createdBy: string;
  createdAt: any;
  updatedAt: any;
  isPublic: boolean;
  tags: string[];
  thumbnail?: string;
}

export interface NoteData {
  id: string;
  url: string;
  title: string;
  description: string;
  type: 'notion' | 'google-docs' | 'github' | 'other';
  createdAt: any;
  createdBy: string;
  playlistId?: string;
}

export const playlistService = {
  /**
   * Create a new playlist
   */
  async createPlaylist(playlistData: Omit<PlaylistData, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<string> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to create playlists');
    }

    const now = Timestamp.now();
    const docRef = firestore().collection('playlists').doc();
    
    const playlist: PlaylistData = {
      id: docRef.id,
      ...playlistData,
      createdBy: currentUser.uid,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(playlist);
    return docRef.id;
  },

  /**
   * Get all playlists for the current user
   */
  async getUserPlaylists(): Promise<PlaylistData[]> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to get playlists');
    }

    const snapshot = await firestore()
      .collection('playlists')
      .where('createdBy', '==', currentUser.uid)
      .orderBy('updatedAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PlaylistData));
  },

  /**
   * Get a single playlist by ID
   */
  async getPlaylistById(playlistId: string): Promise<PlaylistData | null> {
    const doc = await firestore().collection('playlists').doc(playlistId).get();
    
    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data()
    } as PlaylistData;
  },

  /**
   * Update a playlist
   */
  async updatePlaylist(playlistId: string, updates: Partial<PlaylistData>): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to update playlists');
    }

    await firestore().collection('playlists').doc(playlistId).update({
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Delete a playlist
   */
  async deletePlaylist(playlistId: string): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to delete playlists');
    }

    // Check if user owns the playlist
    const playlist = await this.getPlaylistById(playlistId);
    if (!playlist || playlist.createdBy !== currentUser.uid) {
      throw new Error('You can only delete your own playlists');
    }

    await firestore().collection('playlists').doc(playlistId).delete();
  },

  /**
   * Add a video to a playlist
   */
  async addVideoToPlaylist(playlistId: string, videoData: Omit<VideoData, 'addedAt'>): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to modify playlists');
    }

    const playlist = await this.getPlaylistById(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    if (playlist.createdBy !== currentUser.uid) {
      throw new Error('You can only modify your own playlists');
    }

    const video: VideoData = {
      ...videoData,
      addedAt: Timestamp.now(),
    };

    const updatedVideos = [...playlist.videos, video];
    await this.updatePlaylist(playlistId, { videos: updatedVideos });
  },

  /**
   * Remove a video from a playlist
   */
  async removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to modify playlists');
    }

    const playlist = await this.getPlaylistById(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    if (playlist.createdBy !== currentUser.uid) {
      throw new Error('You can only modify your own playlists');
    }

    const updatedVideos = playlist.videos.filter(video => video.id !== videoId);
    await this.updatePlaylist(playlistId, { videos: updatedVideos });
  },

  /**
   * Save note links
   */
  async saveNoteLinks(notes: Omit<NoteData, 'createdAt' | 'createdBy'>[]): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to save notes');
    }

    const batch = firestore().batch();
    const now = Timestamp.now();

    notes.forEach(note => {
      const docRef = firestore().collection('notes').doc();
      const noteData: NoteData = {
        ...note,
        createdAt: now,
        createdBy: currentUser.uid,
      };
      batch.set(docRef, noteData);
    });

    await batch.commit();
  },

  /**
   * Get all notes for the current user
   */
  async getUserNotes(): Promise<NoteData[]> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to get notes');
    }

    const snapshot = await firestore()
      .collection('notes')
      .where('createdBy', '==', currentUser.uid)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NoteData));
  },

  /**
   * Extract YouTube video ID from URL
   */
  extractVideoId(url: string): string | null {
    const regexes = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    
    for (const regex of regexes) {
      const match = url.match(regex);
      if (match) return match[1];
    }
    return null;
  },

  /**
   * Extract YouTube playlist ID from URL
   */
  extractPlaylistId(url: string): string | null {
    const match = url.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
  },

  /**
   * Validate YouTube video URL
   */
  validateYouTubeUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  },

  /**
   * Validate YouTube playlist URL
   */
  validateYouTubePlaylistUrl(url: string): boolean {
    const playlistRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/playlist\?list=|youtube\.com\/watch\?.*list=)/;
    return playlistRegex.test(url);
  },

  /**
   * Update video progress
   */
  async updateVideoProgress(
    playlistId: string,
    videoId: string,
    watchedSeconds: number,
    totalSeconds: number
  ): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to update progress');
    }

    const playlist = await this.getPlaylistById(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    if (playlist.createdBy !== currentUser.uid) {
      throw new Error('You can only update progress for your own playlists');
    }

    const updatedVideos = playlist.videos.map(video => {
      if (video.id === videoId) {
        return {
          ...video,
          progress: {
            watchedSeconds,
            totalSeconds,
            completed: watchedSeconds >= totalSeconds * 0.9, // Consider 90% as completed
            lastWatched: Timestamp.now(),
          },
        };
      }
      return video;
    });

    await this.updatePlaylist(playlistId, { videos: updatedVideos });
  },

  /**
   * Mark video as completed
   */
  async markVideoAsCompleted(playlistId: string, videoId: string): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to mark videos as completed');
    }

    const playlist = await this.getPlaylistById(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    if (playlist.createdBy !== currentUser.uid) {
      throw new Error('You can only update progress for your own playlists');
    }

    const updatedVideos = playlist.videos.map(video => {
      if (video.id === videoId) {
        return {
          ...video,
          progress: {
            watchedSeconds: video.progress?.totalSeconds || 0,
            totalSeconds: video.progress?.totalSeconds || 0,
            completed: true,
            lastWatched: Timestamp.now(),
          },
        };
      }
      return video;
    });

    await this.updatePlaylist(playlistId, { videos: updatedVideos });
  },

  /**
   * Get playlist progress statistics
   */
  getPlaylistProgress(playlist: PlaylistData): {
    totalVideos: number;
    completedVideos: number;
    totalWatchedSeconds: number;
    totalDurationSeconds: number;
    completionPercentage: number;
  } {
    const totalVideos = playlist.videos.length;
    const completedVideos = playlist.videos.filter(v => v.progress?.completed).length;
    const totalWatchedSeconds = playlist.videos.reduce((sum, v) => sum + (v.progress?.watchedSeconds || 0), 0);
    const totalDurationSeconds = playlist.videos.reduce((sum, v) => sum + (v.progress?.totalSeconds || 0), 0);
    
    return {
      totalVideos,
      completedVideos,
      totalWatchedSeconds,
      totalDurationSeconds,
      completionPercentage: totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0,
    };
  },

  /**
   * Get video progress percentage
   */
  getVideoProgressPercentage(video: VideoData): number {
    if (!video.progress || !video.progress.totalSeconds) return 0;
    return Math.min((video.progress.watchedSeconds / video.progress.totalSeconds) * 100, 100);
  },
};
