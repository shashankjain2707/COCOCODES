// Core YouTube Integration Data Structures
// Phase 1 Implementation

export interface VideoMetadata {
  id: string;
  title: string;
  author: string;
  duration: string; // "15:30" format
  thumbnailUrl: string;
  uploadDate: Date;
  viewCount?: number;
  description?: string;
  tags?: string[];
}

export interface PlaylistData {
  id: string;
  title: string;
  description: string;
  videos: VideoMetadata[];
  totalDuration: string;
  totalVideos: number;
  createdBy: string;
  isPublic: boolean;
  category?: string;
}

export interface VideoTranscript {
  videoId: string;
  segments: TranscriptSegment[];
  language: string;
  duration: number;
  extractedAt: Date;
}

export interface TranscriptSegment {
  startTime: number; // seconds
  endTime: number; // seconds
  text: string;
}

export interface VideoPlayerState {
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface VideoProgress {
  videoId: string;
  userId: string;
  watchedDuration: number; // seconds
  totalDuration: number;
  percentageWatched: number;
  lastWatchedAt: Date;
  completed: boolean;
}

// YouTube URL parsing helpers
export interface YouTubeUrlInfo {
  videoId?: string;
  playlistId?: string;
  startTime?: number;
  isValid: boolean;
  type: 'video' | 'playlist' | 'invalid';
}

// Player configuration
export interface PlayerConfig {
  autoplay: boolean;
  controls: boolean;
  showInfo: boolean;
  showRelated: boolean;
  modestBranding: boolean;
  disableKeyboard: boolean;
  allowFullscreen: boolean;
}

// Video categories for Phase 3
export interface VideoCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  subcategories: string[];
  videoCount: number;
}

// Error types for robust error handling
export type VideoError = 
  | 'VIDEO_NOT_FOUND'
  | 'VIDEO_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'PARSING_ERROR'
  | 'TRANSCRIPT_UNAVAILABLE'
  | 'UNKNOWN_ERROR';

export interface VideoErrorState {
  type: VideoError;
  message: string;
  timestamp: Date;
  videoId?: string;
}

// API Response types for metadata extraction
export interface YouTubeMetadataResponse {
  success: boolean;
  data?: VideoMetadata;
  error?: VideoErrorState;
}

export interface TranscriptResponse {
  success: boolean;
  data?: VideoTranscript;
  error?: VideoErrorState;
}

// Quiz System Types - Phase 2 Implementation
export interface QuizQuestion {
  id: string;
  videoId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  triggerTime: number; // When to show in video (seconds)
  difficulty: 'easy' | 'medium' | 'hard';
  keyTopic?: string;
  createdAt: Date;
}

export interface QuizAnswer {
  quizId: string;
  selectedAnswer: number;
  correct: boolean;
  timeSpent: number; // Time spent answering (seconds)
  answeredAt: Date;
}

export interface QuizSession {
  videoId: string;
  quizzes: QuizQuestion[];
  answers: QuizAnswer[];
  startedAt: Date;
  completedAt?: Date;
  totalQuizzes: number;
  correctAnswers: number;
  accuracy: number;
}

export interface QuizMetrics {
  totalQuizzes: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  completionRate: number;
}
