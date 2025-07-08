/**
 * User Content Types
 * Core data models for user-generated content in EduTube
 */

// User Profile Extensions
export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  joinDate: Date;
  role: 'user' | 'contributor' | 'moderator' | 'admin';
  
  // User stats and metrics
  stats: UserStats;
  preferences: UserPreferences;
  
  // Public profile for contributors
  publicProfile?: ContributorProfile;
}

export interface UserStats {
  totalWatchTime: number; // in minutes
  videosWatched: number;
  categoriesExplored: number;
  quizzesCompleted: number;
  quizAccuracy: number; // percentage
  studyStreak: number; // consecutive days
  lastActive: Date;
  totalContributions: number;
  contributionScore: number; // 0-100 rating
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  autoPlayVideos: boolean;
  showQuizzes: boolean;
  quizFrequency: number; // number of quizzes per video (default: 4)
  defaultPlaybackSpeed: number;
  defaultResolution: string;
  notificationsEnabled: boolean;
  studyReminderTime?: string; // '08:00' format
}

// Category Management
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parentId?: string; // for hierarchical categories
  createdBy: string; // userId
  isPublic: boolean;
  isOfficial: boolean; // created by admin/system
  createdAt: Date;
  updatedAt: Date;
  popularity: number; // based on usage
  videoCount: number;
  subcategories: string[]; // category IDs
}

// Playlist Management
export interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  createdBy: string; // userId
  isPublic: boolean;
  categoryIds: string[]; // associated categories
  tags: string[];
  
  // Videos in the playlist
  videos: PlaylistVideo[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastWatchedAt?: Date;
  totalDuration: number; // in seconds
  watchedDuration: number; // in seconds
  progress: number; // percentage (0-100)
  
  // Public stats (when shared)
  likes: number;
  views: number;
  shares: number;
  bookmarks: number;
  
  // Content moderation
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
}

export interface PlaylistVideo {
  videoId: string;
  title: string;
  duration: number; // in seconds
  position: number; // order in playlist
  thumbnailUrl?: string; // URL to video thumbnail
  addedAt: Date;
  watchedDuration: number; // in seconds
  progress: number; // percentage (0-100)
  lastWatchedAt?: Date;
  notes: VideoNote[]; // user notes for this video
}

// Note-taking System
export interface VideoNote {
  id: string;
  videoId: string;
  userId: string;
  playlistId?: string;
  title?: string;
  content: string;
  isAIGenerated: boolean;
  timestamp?: number; // in seconds, position in video
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
}

// Study Schedule
export interface StudySchedule {
  id: string;
  userId: string;
  title: string;
  description?: string;
  scheduleItems: ScheduleItem[];
  createdAt: Date;
  updatedAt: Date;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekdays' | 'weekly' | 'monthly';
  reminderEnabled: boolean;
  reminderTime?: string; // '08:00' format
}

export interface ScheduleItem {
  id: string;
  type: 'video' | 'playlist' | 'task' | 'break';
  title: string;
  description?: string;
  duration: number; // in minutes
  videoId?: string;
  playlistId?: string;
  startTime?: Date;
  endTime?: Date;
  isCompleted: boolean;
  progress: number; // percentage (0-100)
}

// Task Management
export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  relatedVideoId?: string;
  relatedPlaylistId?: string;
  categoryId?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  reminderEnabled: boolean;
  reminderTime?: Date;
}

// Contributor Profile (for Public Library integration)
export interface ContributorProfile {
  userId: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  expertise: string[]; // areas of expertise
  joinDate: Date;
  
  // Contribution metrics
  contributionStats: {
    totalPlaylists: number;
    totalVideos: number;
    totalNotes: number;
    totalLikes: number;
    totalViews: number;
    averageRating: number; // 0-5 scale
  };
  
  // Trust and reputation
  trustScore: number; // 0-100 scale
  badges: string[]; // 'Top Contributor', 'Subject Expert', etc.
  verified: boolean; // verified expertise
  
  // Social
  followers: number;
  following: number;
}
