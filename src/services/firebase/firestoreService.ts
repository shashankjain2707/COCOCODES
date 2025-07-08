/**
 * Firestore Service
 * Handles database operations for user content, public library, and analytics
 */

import { firestore } from './config';
import { 
  serverTimestamp,
  Timestamp
} from '@react-native-firebase/firestore';
import { 
  Category, 
  Playlist, 
  VideoNote, 
  StudySchedule, 
  Task 
} from '../../types/userContent';
import {
  PublicLibrary,
  PublicPlaylist,
  PlaylistReview
} from '../../types/publicLibrary';
import {
  UserAnalytics
} from '../../types/analytics';

class FirestoreService {
  // Collections
  private get users() { return firestore().collection('users'); }
  private get categories() { return firestore().collection('categories'); }
  private get playlists() { return firestore().collection('playlists'); }
  private get notes() { return firestore().collection('notes'); }
  private get schedules() { return firestore().collection('schedules'); }
  private get tasks() { return firestore().collection('tasks'); }
  private get publicLibrary() { return firestore().collection('publicLibrary'); }
  private get contributors() { return firestore().collection('contributors'); }
  private get analytics() { return firestore().collection('analytics'); }
  
  // ============= User Content Methods =============
  
  /**
   * Get all categories created by a user
   */
  async getUserCategories(userId: string): Promise<Category[]> {
    const snapshot = await this.categories
      .where('createdBy', '==', userId)
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Category));
  }
  
  /**
   * Create or update a category
   */
  async saveCategory(category: Category): Promise<string> {
    const docRef = category.id ? 
      this.categories.doc(category.id) : 
      this.categories.doc();
      
    await docRef.set({
      ...category,
      id: docRef.id,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return docRef.id;
  }
  
  /**
   * Delete a category
   */
  async deleteCategory(categoryId: string): Promise<void> {
    await this.categories.doc(categoryId).delete();
  }
  
  /**
   * Get all playlists created by a user
   */
  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    const snapshot = await this.playlists
      .where('createdBy', '==', userId)
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Playlist));
  }
  
  /**
   * Get playlists by category
   */
  async getPlaylistsByCategory(categoryId: string): Promise<Playlist[]> {
    const snapshot = await this.playlists
      .where('categoryIds', 'array-contains', categoryId)
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Playlist));
  }
  
  /**
   * Create or update a playlist
   */
  async savePlaylist(playlist: Playlist): Promise<string> {
    const docRef = playlist.id ? 
      this.playlists.doc(playlist.id) : 
      this.playlists.doc();
      
    await docRef.set({
      ...playlist,
      id: docRef.id,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return docRef.id;
  }
  
  /**
   * Delete a playlist
   */
  async deletePlaylist(playlistId: string): Promise<void> {
    await this.playlists.doc(playlistId).delete();
  }
  
  /**
   * Get notes for a specific video
   */
  async getVideoNotes(userId: string, videoId: string): Promise<VideoNote[]> {
    const snapshot = await this.notes
      .where('userId', '==', userId)
      .where('videoId', '==', videoId)
      .orderBy('timestamp', 'asc')
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as VideoNote));
  }
  
  /**
   * Create or update a note
   */
  async saveVideoNote(note: VideoNote): Promise<string> {
    const docRef = note.id ? 
      this.notes.doc(note.id) : 
      this.notes.doc();
      
    await docRef.set({
      ...note,
      id: docRef.id,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return docRef.id;
  }
  
  /**
   * Delete a note
   */
  async deleteVideoNote(noteId: string): Promise<void> {
    await this.notes.doc(noteId).delete();
  }
  
  /**
   * Get all study schedules for a user
   */
  async getUserSchedules(userId: string): Promise<StudySchedule[]> {
    const snapshot = await this.schedules
      .where('userId', '==', userId)
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StudySchedule));
  }
  
  /**
   * Create or update a study schedule
   */
  async saveStudySchedule(schedule: StudySchedule): Promise<string> {
    const docRef = schedule.id ? 
      this.schedules.doc(schedule.id) : 
      this.schedules.doc();
      
    await docRef.set({
      ...schedule,
      id: docRef.id,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return docRef.id;
  }
  
  /**
   * Get all tasks for a user
   */
  async getUserTasks(userId: string): Promise<Task[]> {
    const snapshot = await this.tasks
      .where('userId', '==', userId)
      .orderBy('dueDate', 'asc')
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Task));
  }
  
  /**
   * Create or update a task
   */
  async saveTask(task: Task): Promise<string> {
    const docRef = task.id ? 
      this.tasks.doc(task.id) : 
      this.tasks.doc();
      
    await docRef.set({
      ...task,
      id: docRef.id,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return docRef.id;
  }
  
  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    await this.tasks.doc(taskId).delete();
  }
  
  // ============= Public Library Methods =============
  
  /**
   * Get the main public library data
   */
  async getPublicLibrary(): Promise<PublicLibrary> {
    const doc = await this.publicLibrary.doc('main').get();
    return doc.data() as PublicLibrary;
  }
  
  /**
   * Get a public playlist by ID
   */
  async getPublicPlaylist(playlistId: string): Promise<PublicPlaylist | null> {
    const doc = await this.playlists.doc(playlistId).get();
    
    if (!doc.exists() || !doc.data()?.isPublic) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    } as PublicPlaylist;
  }
  
  /**
   * Search for public playlists
   */
  async searchPublicLibrary(query: string, filters?: any): Promise<PublicPlaylist[]> {
    let baseQuery = this.playlists.where('isPublic', '==', true);
    
    // Apply filters if provided
    if (filters?.category) {
      baseQuery = baseQuery.where('categoryIds', 'array-contains', filters.category);
    }
    
    // Get results
    const snapshot = await baseQuery.get();
    
    // Filter by query string (client-side for now)
    const results = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PublicPlaylist))
      .filter(playlist => 
        playlist.title.toLowerCase().includes(query.toLowerCase()) ||
        playlist.description.toLowerCase().includes(query.toLowerCase()) ||
        playlist.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      
    return results;
  }
  
  /**
   * Submit a review for a playlist
   */
  async submitPlaylistReview(review: Omit<PlaylistReview, 'id' | 'createdAt' | 'likes' | 'reports'>): Promise<PlaylistReview> {
    // Create review
    const reviewRef = this.playlists
      .doc(review.playlistId)
      .collection('reviews')
      .doc();
      
    const newReview: PlaylistReview = {
      id: reviewRef.id,
      ...review,
      createdAt: new Date(),
      likes: 0,
      reports: 0
    };
    
    await reviewRef.set(newReview);
    
    // Update playlist rating
    const playlistRef = this.playlists.doc(review.playlistId);
    const playlistDoc = await playlistRef.get();
    
    if (playlistDoc.exists()) {
      const reviews = await playlistRef.collection('reviews').get();
      
      const totalRating = reviews.docs.reduce((sum, doc) => sum + doc.data().rating, 0);
      const averageRating = totalRating / reviews.size;
      
      await playlistRef.update({
        averageRating
      });
    }
    
    return newReview;
  }
  
  // ============= Analytics Methods =============
  
  /**
   * Get analytics for a user
   */
  async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    const doc = await this.analytics
      .doc('users')
      .collection('userAnalytics')
      .doc(userId)
      .get();
      
    if (!doc.exists) {
      return null;
    }
    
    return doc.data() as UserAnalytics;
  }
  
  /**
   * Track user activity for analytics
   */
  async trackUserActivity(userId: string, activity: any): Promise<void> {
    // Log the activity
    await this.analytics
      .doc('users')
      .collection('activities')
      .add({
        userId,
        ...activity,
        timestamp: serverTimestamp()
      });
      
    // Update user analytics
    const userAnalyticsRef = this.analytics
      .doc('users')
      .collection('userAnalytics')
      .doc(userId);
      
    // Use transactions for atomic updates
    await firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(userAnalyticsRef);
      
      if (!doc.exists) {
        // Create new analytics document
        transaction.set(userAnalyticsRef, {
          userId,
          // Initialize analytics data with default values
          studyTime: {
            total: 0,
            byDay: {},
            byCategory: {},
            byWeek: {},
            averageSessionLength: 0,
            longestSession: 0
          },
          learningProgress: {
            videosWatched: 0,
            categoriesExplored: 0,
            completedPlaylists: 0,
            completionRate: 0,
            averageProgress: 0
          },
          quizPerformance: {
            total: 0,
            correct: 0,
            accuracy: 0,
            byCategory: {},
            averageTimePerQuestion: 0,
            improvement: 0
          },
          engagement: {
            totalSessions: 0,
            averageSessionsPerWeek: 0,
            studyStreak: 0,
            lastActive: new Date(),
            completedTasks: 0,
            notesCreated: 0
          },
          preferences: {
            favoriteCategories: [],
            favoriteContentCreators: [],
            preferredWatchTimes: {},
            preferredContentLength: 0
          }
        });
      } else {
        // Update existing analytics based on activity type
        const analyticsData = doc.data() as UserAnalytics;
        
        switch (activity.type) {
          case 'video_watch':
            // Update video watch stats
            transaction.update(userAnalyticsRef, {
              'learningProgress.videosWatched': analyticsData.learningProgress.videosWatched + 1,
              'engagement.lastActive': new Date()
            });
            break;
            
          case 'quiz_complete':
            // Update quiz stats
            transaction.update(userAnalyticsRef, {
              'quizPerformance.total': analyticsData.quizPerformance.total + 1,
              'quizPerformance.correct': analyticsData.quizPerformance.correct + (activity.correct ? 1 : 0),
              'engagement.lastActive': new Date()
            });
            break;
            
          case 'note_create':
            // Update note stats
            transaction.update(userAnalyticsRef, {
              'engagement.notesCreated': analyticsData.engagement.notesCreated + 1,
              'engagement.lastActive': new Date()
            });
            break;
            
          case 'task_complete':
            // Update task stats
            transaction.update(userAnalyticsRef, {
              'engagement.completedTasks': analyticsData.engagement.completedTasks + 1,
              'engagement.lastActive': new Date()
            });
            break;
        }
      }
    });
  }
}

// Create singleton instance
export const firestoreService = new FirestoreService();

export default firestoreService;
