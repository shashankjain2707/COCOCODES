import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HomeState, User, StudySession, Category, Activity, RecommendedContent } from '../../types/home';

// Mock data for development
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Mathematics',
    icon: '📊',
    videoCount: 24,
    color: '#3B82F6',
    description: 'Algebra, Calculus, Statistics'
  },
  {
    id: '2',
    name: 'Physics',
    icon: '⚛️',
    videoCount: 18,
    color: '#10B981',
    description: 'Mechanics, Thermodynamics, Quantum'
  },
  {
    id: '3',
    name: 'Chemistry',
    icon: '🧪',
    videoCount: 32,
    color: '#F59E0B',
    description: 'Organic, Inorganic, Physical'
  },
  {
    id: '4',
    name: 'Biology',
    icon: '🧬',
    videoCount: 12,
    color: '#10B981',
    description: 'Cell Biology, Genetics, Ecology'
  }
];

const mockRecentActivity: Activity[] = [
  {
    id: '1',
    title: 'Linear Algebra: Eigenvalues',
    type: 'video',
    subject: 'Mathematics',
    thumbnail: '',
    duration: '45 min',
    timestamp: 'Based on your progress',
    completed: false
  },
  {
    id: '2',
    title: 'Thermodynamics Laws',
    type: 'video',
    subject: 'Physics',
    thumbnail: '',
    duration: '32 min',
    timestamp: 'Complements physics studies',
    completed: true
  }
];

const mockUser: User = {
  id: '1',
  name: 'Alex',
  email: 'alex@example.com',
  studyTime: '2h 45m',
  dailyGoalProgress: 92,
  preferences: {
    theme: 'dark',
    notifications: true,
    autoPlayVideos: false,
    preferredCategories: ['Mathematics', 'Physics', 'Computer Science']
  }
};

const mockRecommendedContent: RecommendedContent[] = [
  {
    id: '1',
    title: 'Linear Algebra: Eigenvalues',
    description: 'Based on your progress',
    thumbnail: '',
    author: 'Math Professor',
    rating: 4.8,
    videoCount: 1,
    duration: '45 min',
    subject: 'Mathematics',
    tags: ['Linear Algebra', 'Eigenvalues', 'Mathematics']
  },
  {
    id: '2',
    title: 'Thermodynamics Laws',
    description: 'Complements physics studies',
    thumbnail: '',
    author: 'Physics Expert',
    rating: 4.9,
    videoCount: 1,
    duration: '32 min',
    subject: 'Physics',
    tags: ['Thermodynamics', 'Physics', 'Laws']
  }
];

const initialState: HomeState = {
  user: mockUser,
  isLoading: false,
  error: null,
  continueSession: {
    id: '1',
    title: 'Linear Algebra: Eigenvalues',
    subject: 'Mathematics',
    thumbnail: '',
    progress: 65,
    duration: '45 min',
    lastAccessed: '2 hours ago',
    videoId: 'abc123'
  },
  categories: mockCategories,
  recentActivity: mockRecentActivity,
  recommendedContent: mockRecommendedContent,
  dailyGoal: {
    target: 180, // 3 hours in minutes
    completed: 165, // 2h 45m in minutes
    percentage: 92
  }
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setContinueSession: (state, action: PayloadAction<StudySession | null>) => {
      state.continueSession = action.payload;
    },
    updateDailyGoal: (state, action: PayloadAction<{ completed: number }>) => {
      state.dailyGoal.completed = action.payload.completed;
      state.dailyGoal.percentage = Math.round(
        (action.payload.completed / state.dailyGoal.target) * 100
      );
    },
    addRecentActivity: (state, action: PayloadAction<Activity>) => {
      state.recentActivity.unshift(action.payload);
      // Keep only the latest 10 activities
      if (state.recentActivity.length > 10) {
        state.recentActivity = state.recentActivity.slice(0, 10);
      }
    },
    setRecommendedContent: (state, action: PayloadAction<RecommendedContent[]>) => {
      state.recommendedContent = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setUser,
  setLoading,
  setError,
  setContinueSession,
  updateDailyGoal,
  addRecentActivity,
  setRecommendedContent,
  clearError
} = homeSlice.actions;

export default homeSlice.reducer;
