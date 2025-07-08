/**
 * User Content Redux Slice
 * Manages state for user-generated content (categories, playlists, notes, schedules, tasks)
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Category, 
  Playlist, 
  VideoNote, 
  StudySchedule, 
  Task 
} from '../types/userContent';
import { firestoreService } from '../services/firebase/firestoreService';
import { geminiNotesGenerator } from '../services/ai/gemini/notesGenerator';

// State interface
interface UserContentState {
  // Categories
  categories: Record<string, Category>;
  categoriesLoading: boolean;
  categoriesError: string | null;
  
  // Playlists
  playlists: Record<string, Playlist>;
  playlistsLoading: boolean;
  playlistsError: string | null;
  
  // Notes
  notes: Record<string, VideoNote[]>;
  notesLoading: boolean;
  notesError: string | null;
  
  // Schedules
  schedules: StudySchedule[];
  schedulesLoading: boolean;
  schedulesError: string | null;
  
  // Tasks
  tasks: Task[];
  tasksLoading: boolean;
  tasksError: string | null;
}

// Initial state
const initialState: UserContentState = {
  categories: {},
  categoriesLoading: false,
  categoriesError: null,
  
  playlists: {},
  playlistsLoading: false,
  playlistsError: null,
  
  notes: {},
  notesLoading: false,
  notesError: null,
  
  schedules: [],
  schedulesLoading: false,
  schedulesError: null,
  
  tasks: [],
  tasksLoading: false,
  tasksError: null,
};

// Async thunks
export const fetchUserCategories = createAsyncThunk(
  'userContent/fetchUserCategories',
  async (userId: string) => {
    const categories = await firestoreService.getUserCategories(userId);
    return categories;
  }
);

export const createCategory = createAsyncThunk(
  'userContent/createCategory',
  async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'popularity' | 'videoCount'>) => {
    const newCategory: Category = {
      ...category,
      id: '', // Will be set by Firestore
      createdAt: new Date(),
      updatedAt: new Date(),
      popularity: 0,
      videoCount: 0,
    };
    
    const categoryId = await firestoreService.saveCategory(newCategory);
    return { ...newCategory, id: categoryId };
  }
);

export const updateCategory = createAsyncThunk(
  'userContent/updateCategory',
  async (category: Category) => {
    const updatedCategory = {
      ...category,
      updatedAt: new Date()
    };
    
    await firestoreService.saveCategory(updatedCategory);
    return updatedCategory;
  }
);

export const deleteCategory = createAsyncThunk(
  'userContent/deleteCategory',
  async (categoryId: string) => {
    await firestoreService.deleteCategory(categoryId);
    return categoryId;
  }
);

export const fetchUserPlaylists = createAsyncThunk(
  'userContent/fetchUserPlaylists',
  async (userId: string) => {
    const playlists = await firestoreService.getUserPlaylists(userId);
    return playlists;
  }
);

export const createPlaylist = createAsyncThunk(
  'userContent/createPlaylist',
  async (playlist: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'views' | 'shares' | 'bookmarks' | 'moderationStatus'>) => {
    const newPlaylist: Playlist = {
      ...playlist,
      id: '', // Will be set by Firestore
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      views: 0,
      shares: 0,
      bookmarks: 0,
      moderationStatus: 'pending',
    };
    
    const playlistId = await firestoreService.savePlaylist(newPlaylist);
    return { ...newPlaylist, id: playlistId };
  }
);

export const updatePlaylist = createAsyncThunk(
  'userContent/updatePlaylist',
  async (playlist: Playlist) => {
    const updatedPlaylist = {
      ...playlist,
      updatedAt: new Date()
    };
    
    await firestoreService.savePlaylist(updatedPlaylist);
    return updatedPlaylist;
  }
);

export const deletePlaylist = createAsyncThunk(
  'userContent/deletePlaylist',
  async (playlistId: string) => {
    await firestoreService.deletePlaylist(playlistId);
    return playlistId;
  }
);

export const fetchVideoNotes = createAsyncThunk(
  'userContent/fetchVideoNotes',
  async ({ userId, videoId }: { userId: string; videoId: string }) => {
    const notes = await firestoreService.getVideoNotes(userId, videoId);
    return { videoId, notes };
  }
);

export const generateAiNotes = createAsyncThunk(
  'userContent/generateAiNotes',
  async ({ userId, videoId }: { userId: string; videoId: string }) => {
    const note = await geminiNotesGenerator.generateNotesForVideo(videoId, userId);
    await firestoreService.saveVideoNote(note);
    return { videoId, note };
  }
);

export const generateTimestampedNotes = createAsyncThunk(
  'userContent/generateTimestampedNotes',
  async ({ userId, videoId }: { userId: string; videoId: string }) => {
    const notes = await geminiNotesGenerator.generateTimestampedNotes(videoId, userId);
    
    // Save all notes to Firestore
    for (const note of notes) {
      await firestoreService.saveVideoNote(note);
    }
    
    return { videoId, notes };
  }
);

export const createNote = createAsyncThunk(
  'userContent/createNote',
  async (note: Omit<VideoNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: VideoNote = {
      ...note,
      id: '', // Will be set by Firestore
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const noteId = await firestoreService.saveVideoNote(newNote);
    return { ...newNote, id: noteId };
  }
);

export const updateNote = createAsyncThunk(
  'userContent/updateNote',
  async (note: VideoNote) => {
    const updatedNote = {
      ...note,
      updatedAt: new Date()
    };
    
    await firestoreService.saveVideoNote(updatedNote);
    return updatedNote;
  }
);

export const deleteNote = createAsyncThunk(
  'userContent/deleteNote',
  async ({ noteId, videoId }: { noteId: string; videoId: string }) => {
    await firestoreService.deleteVideoNote(noteId);
    return { noteId, videoId };
  }
);

export const fetchUserSchedules = createAsyncThunk(
  'userContent/fetchUserSchedules',
  async (userId: string) => {
    const schedules = await firestoreService.getUserSchedules(userId);
    return schedules;
  }
);

export const fetchUserTasks = createAsyncThunk(
  'userContent/fetchUserTasks',
  async (userId: string) => {
    const tasks = await firestoreService.getUserTasks(userId);
    return tasks;
  }
);

// Create the slice
const userContentSlice = createSlice({
  name: 'userContent',
  initialState,
  reducers: {
    // Synchronous reducers
    clearUserContent: (state) => {
      state.categories = {};
      state.playlists = {};
      state.notes = {};
      state.schedules = [];
      state.tasks = [];
    },
    
    addLocalNote: (state, action: PayloadAction<{ videoId: string; note: VideoNote }>) => {
      const { videoId, note } = action.payload;
      
      if (!state.notes[videoId]) {
        state.notes[videoId] = [];
      }
      
      state.notes[videoId].push(note);
      state.notes[videoId].sort((a, b) => {
        if (a.timestamp === undefined && b.timestamp === undefined) return 0;
        if (a.timestamp === undefined) return -1;
        if (b.timestamp === undefined) return 1;
        return a.timestamp - b.timestamp;
      });
    },
    
    updateTaskStatus: (state, action: PayloadAction<{ taskId: string; status: 'todo' | 'in-progress' | 'completed' }>) => {
      const { taskId, status } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1) {
        state.tasks[taskIndex].status = status;
        if (status === 'completed') {
          state.tasks[taskIndex].completedAt = new Date();
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Handle category actions
    builder
      .addCase(fetchUserCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchUserCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload.reduce((acc, category) => {
          acc[category.id] = category;
          return acc;
        }, {} as Record<string, Category>);
      })
      .addCase(fetchUserCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.error.message || 'Failed to fetch categories';
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories[action.payload.id] = action.payload;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.categories[action.payload.id] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        delete state.categories[action.payload];
      })
      
      // Handle playlist actions
      .addCase(fetchUserPlaylists.pending, (state) => {
        state.playlistsLoading = true;
        state.playlistsError = null;
      })
      .addCase(fetchUserPlaylists.fulfilled, (state, action) => {
        state.playlistsLoading = false;
        state.playlists = action.payload.reduce((acc, playlist) => {
          acc[playlist.id] = playlist;
          return acc;
        }, {} as Record<string, Playlist>);
      })
      .addCase(fetchUserPlaylists.rejected, (state, action) => {
        state.playlistsLoading = false;
        state.playlistsError = action.error.message || 'Failed to fetch playlists';
      })
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.playlists[action.payload.id] = action.payload;
      })
      .addCase(updatePlaylist.fulfilled, (state, action) => {
        state.playlists[action.payload.id] = action.payload;
      })
      .addCase(deletePlaylist.fulfilled, (state, action) => {
        delete state.playlists[action.payload];
      })
      
      // Handle note actions
      .addCase(fetchVideoNotes.pending, (state) => {
        state.notesLoading = true;
        state.notesError = null;
      })
      .addCase(fetchVideoNotes.fulfilled, (state, action) => {
        state.notesLoading = false;
        state.notes[action.payload.videoId] = action.payload.notes;
      })
      .addCase(fetchVideoNotes.rejected, (state, action) => {
        state.notesLoading = false;
        state.notesError = action.error.message || 'Failed to fetch notes';
      })
      .addCase(generateAiNotes.pending, (state) => {
        state.notesLoading = true;
        state.notesError = null;
      })
      .addCase(generateAiNotes.fulfilled, (state, action) => {
        state.notesLoading = false;
        
        if (!state.notes[action.payload.videoId]) {
          state.notes[action.payload.videoId] = [];
        }
        
        state.notes[action.payload.videoId].push(action.payload.note);
      })
      .addCase(generateAiNotes.rejected, (state, action) => {
        state.notesLoading = false;
        state.notesError = action.error.message || 'Failed to generate AI notes';
      })
      .addCase(generateTimestampedNotes.pending, (state) => {
        state.notesLoading = true;
        state.notesError = null;
      })
      .addCase(generateTimestampedNotes.fulfilled, (state, action) => {
        state.notesLoading = false;
        state.notes[action.payload.videoId] = action.payload.notes;
      })
      .addCase(generateTimestampedNotes.rejected, (state, action) => {
        state.notesLoading = false;
        state.notesError = action.error.message || 'Failed to generate timestamped notes';
      })
      .addCase(createNote.fulfilled, (state, action) => {
        const note = action.payload;
        
        if (!state.notes[note.videoId]) {
          state.notes[note.videoId] = [];
        }
        
        state.notes[note.videoId].push(note);
        state.notes[note.videoId].sort((a, b) => {
          if (a.timestamp === undefined && b.timestamp === undefined) return 0;
          if (a.timestamp === undefined) return -1;
          if (b.timestamp === undefined) return 1;
          return a.timestamp - b.timestamp;
        });
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const updatedNote = action.payload;
        const videoId = updatedNote.videoId;
        
        if (state.notes[videoId]) {
          const noteIndex = state.notes[videoId].findIndex(note => note.id === updatedNote.id);
          
          if (noteIndex !== -1) {
            state.notes[videoId][noteIndex] = updatedNote;
          }
        }
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        const { noteId, videoId } = action.payload;
        
        if (state.notes[videoId]) {
          state.notes[videoId] = state.notes[videoId].filter(note => note.id !== noteId);
        }
      })
      
      // Handle schedule actions
      .addCase(fetchUserSchedules.pending, (state) => {
        state.schedulesLoading = true;
        state.schedulesError = null;
      })
      .addCase(fetchUserSchedules.fulfilled, (state, action) => {
        state.schedulesLoading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchUserSchedules.rejected, (state, action) => {
        state.schedulesLoading = false;
        state.schedulesError = action.error.message || 'Failed to fetch schedules';
      })
      
      // Handle task actions
      .addCase(fetchUserTasks.pending, (state) => {
        state.tasksLoading = true;
        state.tasksError = null;
      })
      .addCase(fetchUserTasks.fulfilled, (state, action) => {
        state.tasksLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchUserTasks.rejected, (state, action) => {
        state.tasksLoading = false;
        state.tasksError = action.error.message || 'Failed to fetch tasks';
      });
  },
});

// Export actions and reducer
export const { clearUserContent, addLocalNote, updateTaskStatus } = userContentSlice.actions;
export default userContentSlice.reducer;
