/**
 * Quiz Redux Slice
 * Manages quiz state, answers, and analytics
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { QuizQuestion, QuizAnswer, QuizSession, QuizMetrics } from '../types/video';
import { quizGenerator } from '../services/ai/quizGenerator';

interface QuizState {
  // Current video quiz session
  currentVideoId: string | null;
  currentQuizzes: QuizQuestion[];
  currentQuizIndex: number;
  currentQuiz: QuizQuestion | null;
  showQuiz: boolean;
  
  // Quiz answers and progress
  currentAnswers: QuizAnswer[];
  quizSessions: QuizSession[];
  
  // Loading and error states
  isGeneratingQuizzes: boolean;
  quizGenerationError: string | null;
  
  // Analytics
  totalQuizzesCompleted: number;
  totalCorrectAnswers: number;
  averageAccuracy: number;
  
  // Settings
  quizzesEnabled: boolean;
  autoAdvanceAfterQuiz: boolean;
  quizDisplayDuration: number; // seconds
}

const initialState: QuizState = {
  currentVideoId: null,
  currentQuizzes: [],
  currentQuizIndex: -1,
  currentQuiz: null,
  showQuiz: false,
  
  currentAnswers: [],
  quizSessions: [],
  
  isGeneratingQuizzes: false,
  quizGenerationError: null,
  
  totalQuizzesCompleted: 0,
  totalCorrectAnswers: 0,
  averageAccuracy: 0,
  
  quizzesEnabled: true,
  autoAdvanceAfterQuiz: true,
  quizDisplayDuration: 30,
};

// Async thunks
export const generateQuizzesForVideo = createAsyncThunk(
  'quiz/generateQuizzesForVideo',
  async (videoId: string, { rejectWithValue }) => {
    try {
      const quizzes = await quizGenerator.generateQuizzesForVideo(videoId);
      return { videoId, quizzes };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to generate quizzes');
    }
  }
);

export const submitQuizAnswer = createAsyncThunk(
  'quiz/submitQuizAnswer',
  async (
    {
      quizId,
      selectedAnswer,
      timeSpent,
    }: {
      quizId: string;
      selectedAnswer: number;
      timeSpent: number;
    },
    { getState }
  ) => {
    const state = getState() as { quiz: QuizState };
    const quiz = state.quiz.currentQuizzes.find(q => q.id === quizId);
    
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    const correct = selectedAnswer === quiz.correctAnswer;
    
    const answer: QuizAnswer = {
      quizId,
      selectedAnswer,
      correct,
      timeSpent,
      answeredAt: new Date(),
    };
    
    return answer;
  }
);

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    // Quiz display control
    showQuizForTime: (state, action: PayloadAction<{ quiz: QuizQuestion; currentTime: number }>) => {
      state.currentQuiz = action.payload.quiz;
      state.showQuiz = true;
      state.currentQuizIndex = state.currentQuizzes.findIndex(q => q.id === action.payload.quiz.id);
    },
    
    hideQuiz: (state) => {
      state.showQuiz = false;
      state.currentQuiz = null;
    },
    
    // Quiz navigation
    nextQuiz: (state) => {
      if (state.currentQuizIndex < state.currentQuizzes.length - 1) {
        state.currentQuizIndex += 1;
        state.currentQuiz = state.currentQuizzes[state.currentQuizIndex];
        state.showQuiz = true;
      }
    },
    
    previousQuiz: (state) => {
      if (state.currentQuizIndex > 0) {
        state.currentQuizIndex -= 1;
        state.currentQuiz = state.currentQuizzes[state.currentQuizIndex];
        state.showQuiz = true;
      }
    },
    
    // Quiz session management
    startQuizSession: (state, action: PayloadAction<string>) => {
      const videoId = action.payload;
      state.currentVideoId = videoId;
      state.currentAnswers = [];
      state.currentQuizIndex = -1;
      state.currentQuiz = null;
      state.showQuiz = false;
    },
    
    endQuizSession: (state) => {
      if (state.currentVideoId && state.currentQuizzes.length > 0) {
        const session: QuizSession = {
          videoId: state.currentVideoId,
          quizzes: state.currentQuizzes,
          answers: state.currentAnswers,
          startedAt: new Date(), // This should be tracked when session starts
          completedAt: new Date(),
          totalQuizzes: state.currentQuizzes.length,
          correctAnswers: state.currentAnswers.filter(a => a.correct).length,
          accuracy: state.currentAnswers.length > 0 
            ? (state.currentAnswers.filter(a => a.correct).length / state.currentAnswers.length) * 100 
            : 0,
        };
        
        state.quizSessions.push(session);
        
        // Update global stats
        state.totalQuizzesCompleted += state.currentAnswers.length;
        state.totalCorrectAnswers += state.currentAnswers.filter(a => a.correct).length;
        state.averageAccuracy = state.totalQuizzesCompleted > 0
          ? (state.totalCorrectAnswers / state.totalQuizzesCompleted) * 100
          : 0;
      }
      
      // Reset current session
      state.currentVideoId = null;
      state.currentQuizzes = [];
      state.currentAnswers = [];
      state.currentQuizIndex = -1;
      state.currentQuiz = null;
      state.showQuiz = false;
    },
    
    // Settings
    toggleQuizzes: (state) => {
      state.quizzesEnabled = !state.quizzesEnabled;
    },
    
    setQuizzesEnabled: (state, action: PayloadAction<boolean>) => {
      state.quizzesEnabled = action.payload;
    },
    
    setAutoAdvanceAfterQuiz: (state, action: PayloadAction<boolean>) => {
      state.autoAdvanceAfterQuiz = action.payload;
    },
    
    setQuizDisplayDuration: (state, action: PayloadAction<number>) => {
      state.quizDisplayDuration = Math.max(10, Math.min(60, action.payload));
    },
    
    // Clear data
    clearQuizHistory: (state) => {
      state.quizSessions = [];
      state.totalQuizzesCompleted = 0;
      state.totalCorrectAnswers = 0;
      state.averageAccuracy = 0;
    },
    
    clearCurrentSession: (state) => {
      state.currentVideoId = null;
      state.currentQuizzes = [];
      state.currentAnswers = [];
      state.currentQuizIndex = -1;
      state.currentQuiz = null;
      state.showQuiz = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate quizzes
      .addCase(generateQuizzesForVideo.pending, (state) => {
        state.isGeneratingQuizzes = true;
        state.quizGenerationError = null;
      })
      .addCase(generateQuizzesForVideo.fulfilled, (state, action) => {
        state.isGeneratingQuizzes = false;
        state.currentVideoId = action.payload.videoId;
        state.currentQuizzes = action.payload.quizzes;
        state.currentAnswers = [];
        state.currentQuizIndex = -1;
        state.currentQuiz = null;
        state.showQuiz = false;
      })
      .addCase(generateQuizzesForVideo.rejected, (state, action) => {
        state.isGeneratingQuizzes = false;
        state.quizGenerationError = action.payload as string;
      })
      
      // Submit answer
      .addCase(submitQuizAnswer.fulfilled, (state, action) => {
        state.currentAnswers.push(action.payload);
        state.showQuiz = false;
        state.currentQuiz = null;
      });
  },
});

export const {
  showQuizForTime,
  hideQuiz,
  nextQuiz,
  previousQuiz,
  startQuizSession,
  endQuizSession,
  toggleQuizzes,
  setQuizzesEnabled,
  setAutoAdvanceAfterQuiz,
  setQuizDisplayDuration,
  clearQuizHistory,
  clearCurrentSession,
} = quizSlice.actions;

// Selectors
export const selectQuizState = (state: { quiz: QuizState }) => state.quiz;
export const selectCurrentQuizzes = (state: { quiz: QuizState }) => state.quiz.currentQuizzes;
export const selectCurrentQuiz = (state: { quiz: QuizState }) => state.quiz.currentQuiz;
export const selectShowQuiz = (state: { quiz: QuizState }) => state.quiz.showQuiz;
export const selectQuizzesEnabled = (state: { quiz: QuizState }) => state.quiz.quizzesEnabled;
export const selectIsGeneratingQuizzes = (state: { quiz: QuizState }) => state.quiz.isGeneratingQuizzes;
export const selectQuizSessions = (state: { quiz: QuizState }) => state.quiz.quizSessions;

// Computed selectors
export const selectQuizMetrics = (state: { quiz: QuizState }): QuizMetrics => {
  const quiz = state.quiz;
  return {
    totalQuizzes: quiz.totalQuizzesCompleted,
    correctAnswers: quiz.totalCorrectAnswers,
    accuracy: quiz.averageAccuracy,
    averageTime: quiz.quizSessions.length > 0
      ? quiz.quizSessions.reduce((sum, session) => {
          const avgTime = session.answers.reduce((ansSum, ans) => ansSum + ans.timeSpent, 0) / session.answers.length;
          return sum + avgTime;
        }, 0) / quiz.quizSessions.length
      : 0,
    completionRate: quiz.currentQuizzes.length > 0
      ? (quiz.currentAnswers.length / quiz.currentQuizzes.length) * 100
      : 0,
  };
};

export const selectQuizAtTime = (currentTime: number) => (state: { quiz: QuizState }) => {
  return state.quiz.currentQuizzes.find(quiz => 
    Math.abs(quiz.triggerTime - currentTime) <= 2 && 
    !state.quiz.currentAnswers.find(answer => answer.quizId === quiz.id)
  ) || null;
};

export const selectNextUpcomingQuiz = (currentTime: number) => (state: { quiz: QuizState }) => {
  const upcomingQuizzes = state.quiz.currentQuizzes
    .filter(quiz => 
      quiz.triggerTime > currentTime && 
      !state.quiz.currentAnswers.find(answer => answer.quizId === quiz.id)
    )
    .sort((a, b) => a.triggerTime - b.triggerTime);
  
  return upcomingQuizzes[0] || null;
};

export const selectQuizProgress = (state: { quiz: QuizState }) => {
  const total = state.quiz.currentQuizzes.length;
  const completed = state.quiz.currentAnswers.length;
  const current = state.quiz.currentQuizIndex + 1;
  
  return {
    total,
    completed,
    current,
    remaining: total - completed,
    percentage: total > 0 ? (completed / total) * 100 : 0,
  };
};

export default quizSlice.reducer;
