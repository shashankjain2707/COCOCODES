// VideoSlice Types
// Moved to its own file to avoid circular dependencies

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
  currentTime: number;
  duration: number;
  percentage: number;
  lastWatched: Date;
}

export interface VideoError {
  videoId: string;
  errorMessage: string;
  timestamp: Date;
}

export interface QuizQuestion {
  id: string;
  videoId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  triggerTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  keyTopic: string;
  createdAt: Date;
}

export interface QuizAnswer {
  quizId: string;
  selectedAnswer: number;
  correct: boolean;
  timeSpent: number; // seconds
  answeredAt: Date;
}

export interface QuizSession {
  videoId: string;
  startTime: Date;
  endTime?: Date;
  quizzesTaken: number;
  correctAnswers: number;
  totalTimeSpent: number; // seconds
}
