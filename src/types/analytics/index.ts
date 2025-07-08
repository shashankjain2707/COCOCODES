/**
 * Analytics Types
 * Data models for tracking user engagement, learning progress, and content metrics
 */

export interface UserAnalytics {
  userId: string;
  
  // Time-based metrics
  studyTime: {
    total: number; // in minutes
    byDay: Record<string, number>; // '2023-04-15' -> minutes
    byCategory: Record<string, number>; // categoryId -> minutes
    byWeek: Record<string, number>; // '2023-W15' -> minutes
    averageSessionLength: number; // in minutes
    longestSession: number; // in minutes
  };
  
  // Learning progress
  learningProgress: {
    videosWatched: number;
    categoriesExplored: number;
    completedPlaylists: number;
    completionRate: number; // percentage
    averageProgress: number; // percentage across all content
  };
  
  // Quiz performance
  quizPerformance: {
    total: number;
    correct: number;
    accuracy: number; // percentage
    byCategory: Record<string, number>; // categoryId -> accuracy percentage
    averageTimePerQuestion: number; // in seconds
    improvement: number; // percentage improvement over time
  };
  
  // Engagement metrics
  engagement: {
    totalSessions: number;
    averageSessionsPerWeek: number;
    studyStreak: number; // consecutive days
    lastActive: Date;
    completedTasks: number;
    notesCreated: number;
  };
  
  // Content preferences
  preferences: {
    favoriteCategories: string[]; // categoryIds
    favoriteContentCreators: string[]; // userIds
    preferredWatchTimes: Record<string, number>; // hour -> count
    preferredContentLength: number; // average in minutes
  };
}

export interface ContentAnalytics {
  // Playlist analytics
  playlistAnalytics: Record<string, {
    views: number;
    completions: number;
    averageProgress: number; // percentage
    likes: number;
    shares: number;
    bookmarks: number;
    averageRating: number; // 0-5 scale
    dropoffPoints: number[]; // percentage points where users tend to stop
  }>;
  
  // Video analytics
  videoAnalytics: Record<string, {
    views: number;
    completions: number;
    averageWatchTime: number; // in seconds
    replayRate: number; // percentage of users who rewatch
    quizCompletionRate: number; // percentage
    quizAccuracy: number; // percentage
    notesTaken: number;
    watchTimeDistribution: number[]; // watch time heatmap
  }>;
  
  // Category analytics
  categoryAnalytics: Record<string, {
    totalViews: number;
    totalUsers: number;
    averageTimeSpent: number; // in minutes
    popularPlaylists: string[]; // playlist IDs
    trendingGrowth: number; // percentage increase in last 30 days
  }>;
}

export interface SystemAnalytics {
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
    growth: number; // percentage
  };
  
  contentGrowth: {
    videos: number;
    playlists: number;
    categories: number;
    notes: number;
    growthRate: number; // percentage
  };
  
  publicLibrary: {
    totalContributions: number;
    approvalRate: number; // percentage
    averageQualityScore: number; // 0-100
    topCategories: string[]; // category IDs
    contributorGrowth: number; // percentage
  };
  
  performance: {
    averageLoadTime: number; // in milliseconds
    videoCacheHitRate: number; // percentage
    apiResponseTime: number; // in milliseconds
    errorRate: number; // percentage
  };
}
