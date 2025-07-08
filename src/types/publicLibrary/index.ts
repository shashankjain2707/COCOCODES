/**
 * Public Library Types
 * Data models for community content sharing and public library functionality
 */

import { Playlist } from '../userContent';

export interface PublicLibrary {
  featuredPlaylists: string[]; // playlist IDs
  trendingPlaylists: string[]; // playlist IDs
  popularCategories: string[]; // category IDs
  topContributors: string[]; // user IDs
  recentlyAdded: string[]; // playlist IDs
}

export interface PublicPlaylist extends Playlist {
  // Additional fields for public playlists
  reviews: PlaylistReview[];
  averageRating: number; // 0-5 scale
  featured: boolean;
  trending: boolean;
  moderation: {
    moderatedBy?: string; // userId
    moderatedAt?: Date;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
  };
}

export interface PlaylistReview {
  id: string;
  playlistId: string;
  userId: string;
  rating: number; // 1-5 scale
  comment: string;
  createdAt: Date;
  likes: number;
  reports: number;
}

export interface UserInteraction {
  id: string;
  userId: string;
  contentType: 'playlist' | 'video' | 'note' | 'contributor';
  contentId: string;
  interactionType: 'like' | 'bookmark' | 'share' | 'report' | 'follow';
  createdAt: Date;
  metadata?: Record<string, any>; // additional interaction data
}
