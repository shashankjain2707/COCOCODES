import { Category, Playlist } from '../types/userContent';

export type RootStackParamList = {
  // Root tabs
  Home: undefined;
  Library: undefined;
  Player: { videoId: string };
  Stats: undefined;
  Profile: undefined;
  
  // Category screens
  Categories: undefined;
  CategoryDetail: { categoryId: string };
  CategoryForm: { categoryId?: string };
  
  // Playlist screens
  Playlists: undefined;
  PlaylistDetail: { playlistId: string };
  PlaylistForm: { playlistId?: string; categoryId?: string };
  
  // Notes screens
  Notes: undefined;
  NoteDetail: { noteId: string };
  NoteEditor: { noteId?: string; videoId?: string };
  
  // Schedule screens
  Schedule: undefined;
  ScheduleForm: { scheduleId?: string };
  
  // Public Library screens
  PublicLibrary: undefined;
  PublicPlaylistDetail: { playlistId: string };
  ContentSubmission: undefined;
  ContributorProfile: { contributorId: string };
};

// Extend the React Navigation types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
