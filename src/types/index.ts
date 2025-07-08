// Core Types for EduTube

export interface Video {
  id: string;
  title: string;
  author: string;
  duration: string;
  thumbnail: string;
  url: string;
  transcriptAvailable: boolean;
  category: string;
  tags: string[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  videos: Video[];
  contributorId: string;
  tags: string[];
  subject: string;
  totalDuration: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  likes: number;
  bookmarks: number;
}

export interface Quiz {
  id: string;
  videoId: string;
  questions: QuizQuestion[];
  timestamp: string; // When in video this quiz appears
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Note {
  id: string;
  videoId: string;
  content: string;
  timestamps: TimestampNote[];
  createdBy: string;
  createdAt: Date;
  aiGenerated: boolean;
}

export interface TimestampNote {
  time: string;
  note: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  contributions: number;
  totalLikes: number;
  trustScore: number;
  badges: string[];
  joinedAt: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  videoId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  quizzesCompleted: number;
  quizAccuracy: number;
}

export type Category = 
  | 'Math'
  | 'Physics' 
  | 'Chemistry'
  | 'Biology'
  | 'Computer Science'
  | 'Engineering'
  | 'Literature'
  | 'History'
  | 'Economics'
  | 'Other';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
