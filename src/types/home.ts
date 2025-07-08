// EduTube Home Screen Types

export interface User {
  id: string;
  name: string;
  email: string;
  studyTime: string;
  dailyGoalProgress: number;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  notifications: boolean;
  autoPlayVideos: boolean;
  preferredCategories: string[];
}

export interface StudySession {
  id: string;
  title: string;
  subject: string;
  thumbnail: string;
  progress: number;
  duration: string;
  lastAccessed: string;
  videoId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  videoCount: number;
  color: string;
  description?: string;
}

export interface Activity {
  id: string;
  title: string;
  type: 'video' | 'quiz' | 'playlist' | 'session';
  subject: string;
  thumbnail?: string;
  score?: string;
  duration?: string;
  timestamp: string;
  completed: boolean;
}

export interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
}

export interface RecommendedContent {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  author: string;
  rating: number;
  videoCount: number;
  duration: string;
  subject: string;
  tags: string[];
}

// Component Props Interfaces
export interface HomeScreenProps {
  navigation: any;
}

export interface HeaderProps {
  user: User;
  onSearchPress: () => void;
  onProfilePress: () => void;
  onNotificationPress: () => void;
}

export interface WelcomeSectionProps {
  user: User;
}

export interface QuickActionsProps {
  continueSession?: StudySession;
  onContinuePress: () => void;
  onNewSessionPress: () => void;
  onLibraryPress: () => void;
  onStatsPress: () => void;
}

export interface SubjectCategoriesProps {
  categories: Category[];
  onCategoryPress: (category: Category) => void;
  onViewAllPress: () => void;
}

export interface RecentActivityProps {
  activities: Activity[];
  onActivityPress: (activity: Activity) => void;
  onViewAllPress: () => void;
}

export interface RecommendedSectionProps {
  content: RecommendedContent[];
  onContentPress: (content: RecommendedContent) => void;
  onExplorePress: () => void;
}

// Redux State Interfaces
export interface HomeState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  continueSession: StudySession | null;
  categories: Category[];
  recentActivity: Activity[];
  recommendedContent: RecommendedContent[];
  dailyGoal: {
    target: number; // in minutes
    completed: number;
    percentage: number;
  };
}
