import { 
  auth, 
  firestore, 
  Timestamp, 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  setDoc 
} from '../firebase/config';

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
}

export interface NoteData {
  id?: string;
  playlistId: string;
  videoId: string;
  timestamp: number;
  content: string;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

export interface NoteLinkData {
  id?: string;
  title: string;
  url: string;
  notes: string;
  type?: 'note' | 'resource' | 'bookmark';
  description?: string;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

export const playlistService = {
  /**
   * Create a new playlist
   */
  async createPlaylist(playlistData: Omit<PlaylistData, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<string> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to create playlists');
    }

    const now = Timestamp.now();
    const playlistsRef = collection(firestore, 'playlists');
    
    const playlist: PlaylistData = {
      ...playlistData,
      createdBy: currentUser.uid,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(playlistsRef, playlist);
    console.log('Created playlist with ID:', docRef.id);
    return docRef.id;
  },

  /**
   * Get all playlists for the current user
   */
  async getUserPlaylists(): Promise<PlaylistData[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to get playlists');
    }

    const playlistsRef = collection(firestore, 'playlists');
    const q = query(
      playlistsRef,
      where('createdBy', '==', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      const playlist = {
        id: doc.id,
        ...data
      } as PlaylistData;
      
      console.log('Playlist from Firestore:', playlist.id, playlist.name);
      return playlist;
    });
  },

  /**
   * Get a single playlist by ID
   */
  async getPlaylistById(playlistId: string): Promise<PlaylistData | null> {
    console.log('getPlaylistById called with:', playlistId);
    console.log('playlistId type:', typeof playlistId);
    console.log('playlistId length:', playlistId?.length);
    
    if (!playlistId || typeof playlistId !== 'string') {
      console.error('Invalid playlist ID provided:', playlistId);
      throw new Error(`Invalid playlist ID provided: ${playlistId}`);
    }
    
    if (playlistId === 'playlists') {
      console.error('Received collection name instead of document ID');
      throw new Error('Invalid playlist ID: received collection name instead of document ID');
    }
    
    if (playlistId.includes('/') || playlistId.includes(' ') || playlistId.trim() === '') {
      console.error('Invalid playlist ID format:', playlistId);
      throw new Error(`Invalid playlist ID format: ${playlistId}`);
    }
    
    try {
      const docRef = doc(firestore, 'playlists', playlistId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log('Playlist not found:', playlistId);
        return null;
      }

      const data = docSnap.data();
      const playlist = {
        id: docSnap.id,
        ...data
      } as PlaylistData;
      
      console.log('Successfully loaded playlist:', playlist.id, playlist.name);
      return playlist;
    } catch (error) {
      console.error('Firebase error in getPlaylistById:', error);
      throw error;
    }
  },

  /**
   * Update an existing playlist
   */
  async updatePlaylist(playlistId: string, updates: Partial<PlaylistData>): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to update playlists');
    }

    const docRef = doc(firestore, 'playlists', playlistId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(docRef, updateData);
  },

  /**
   * Delete a playlist
   */
  async deletePlaylist(playlistId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to delete playlists');
    }

    const docRef = doc(firestore, 'playlists', playlistId);
    await deleteDoc(docRef);
  },

  /**
   * Add a video to a playlist
   */
  async addVideoToPlaylist(playlistId: string, videoData: Omit<VideoData, 'addedAt'>): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to add videos');
    }

    const playlist = await this.getPlaylistById(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    if (playlist.createdBy !== currentUser.uid) {
      throw new Error('You can only add videos to your own playlists');
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
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to remove videos');
    }

    const playlist = await this.getPlaylistById(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    if (playlist.createdBy !== currentUser.uid) {
      throw new Error('You can only remove videos from your own playlists');
    }

    const updatedVideos = playlist.videos.filter(video => video.id !== videoId);
    await this.updatePlaylist(playlistId, { videos: updatedVideos });
  },

  /**
   * Save multiple note links using batch writes
   */
  async saveNoteLinks(notes: Omit<NoteLinkData, 'createdAt' | 'createdBy'>[]): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to save notes');
    }

    // For now, save notes one by one since we don't have batch implemented yet
    // TODO: Implement batch writes for better performance
    for (const note of notes) {
      const noteData: NoteLinkData = {
        ...note,
        createdBy: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const notesRef = collection(firestore, 'noteLinks');
      await addDoc(notesRef, noteData);
    }
  },

  /**
   * Get all note links for the current user
   */
  async getUserNoteLinks(): Promise<NoteLinkData[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to get note links');
    }

    const notesRef = collection(firestore, 'noteLinks');
    const q = query(
      notesRef,
      where('createdBy', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NoteLinkData));
  },

  /**
   * Get all notes for the current user
   */
  async getUserNotes(): Promise<NoteData[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to get notes');
    }

    const notesRef = collection(firestore, 'notes');
    const q = query(
      notesRef,
      where('createdBy', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NoteData));
  },

  /**
   * Get notes for a specific playlist
   */
  async getPlaylistNotes(playlistId: string): Promise<NoteData[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to get notes');
    }

    const notesRef = collection(firestore, 'notes');
    const q = query(
      notesRef,
      where('playlistId', '==', playlistId),
      where('createdBy', '==', currentUser.uid),
      orderBy('timestamp', 'asc')
    );
    
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NoteData));
  },

  /**
   * Update video progress
   */
  async updateVideoProgress(playlistId: string, videoId: string, watchedSeconds: number, totalSeconds: number): Promise<void> {
    const currentUser = auth.currentUser;
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
    const currentUser = auth.currentUser;
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

  /**
   * Validate YouTube URL
   */
  validateYouTubeUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  },

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  },

  /**
   * Validate YouTube playlist URL
   */
  validateYouTubePlaylistUrl(url: string): boolean {
    const playlistRegex = /^(https?:\/\/)?(www\.)?youtube\.com\/playlist\?list=.+/;
    return playlistRegex.test(url);
  },

  /**
   * Extract playlist ID from YouTube URL
   */
  extractPlaylistId(url: string): string | null {
    const match = url.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
  },

  /**
   * Check authentication status
   */
  async checkAuthStatus(): Promise<boolean> {
    return auth.currentUser !== null;
  },
};

export default playlistService;
