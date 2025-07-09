/**
 * YouTube Data API v3 Service
 * Fetches video metadata using the official YouTube Data API
 */

import { VideoMetadata, YouTubeMetadataResponse, VideoError } from '../../types/video';
import { extractVideoId, isValidVideoId, formatDuration } from '../../utils/youtubeHelpers';

interface YouTubeApiVideoResponse {
  kind: string;
  etag: string;
  items: YouTubeApiVideo[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

interface YouTubeApiVideo {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
      standard?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    tags?: string[];
    categoryId: string;
    liveBroadcastContent: string;
    defaultLanguage?: string;
    localized: {
      title: string;
      description: string;
    };
  };
  contentDetails: {
    duration: string; // ISO 8601 duration format (e.g., "PT4M13S")
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    regionRestriction?: {
      allowed?: string[];
      blocked?: string[];
    };
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
}

interface YouTubeApiPlaylistResponse {
  kind: string;
  etag: string;
  items: YouTubeApiPlaylist[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

interface YouTubeApiPlaylist {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
      standard?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    defaultLanguage?: string;
    localized: {
      title: string;
      description: string;
    };
  };
  contentDetails: {
    itemCount: number;
  };
}

interface YouTubeApiPlaylistItemsResponse {
  kind: string;
  etag: string;
  items: YouTubeApiPlaylistItem[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

interface YouTubeApiPlaylistItem {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
      standard?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    playlistId: string;
    position: number;
    resourceId: {
      kind: string;
      videoId: string;
    };
  };
}

class YouTubeDataApiService {
  private readonly API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
  private readonly API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;

  constructor() {
    if (!this.API_KEY) {
      console.warn('YouTube API key not found. Some features may not work.');
    }
  }

  /**
   * Fetch video metadata using YouTube Data API
   */
  async getVideoMetadata(videoIdOrUrl: string): Promise<YouTubeMetadataResponse> {
    try {
      if (!this.API_KEY) {
        return {
          success: false,
          error: {
            type: 'API_KEY_ERROR',
            message: 'YouTube API key not configured',
            timestamp: new Date(),
            videoId: videoIdOrUrl,
          },
        };
      }

      const videoId = extractVideoId(videoIdOrUrl);
      
      if (!videoId || !isValidVideoId(videoId)) {
        return {
          success: false,
          error: {
            type: 'PARSING_ERROR',
            message: 'Invalid YouTube video ID or URL',
            timestamp: new Date(),
            videoId: videoIdOrUrl,
          },
        };
      }

      const url = `${this.API_BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${this.API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data: YouTubeApiVideoResponse = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return {
          success: false,
          error: {
            type: 'VIDEO_NOT_FOUND',
            message: 'Video not found or not accessible',
            timestamp: new Date(),
            videoId,
          },
        };
      }

      const videoData = data.items[0];
      const metadata: VideoMetadata = {
        id: videoId,
        title: videoData.snippet.title,
        author: videoData.snippet.channelTitle,
        duration: this.parseIsoDuration(videoData.contentDetails.duration),
        thumbnailUrl: videoData.snippet.thumbnails.high?.url || videoData.snippet.thumbnails.medium?.url || videoData.snippet.thumbnails.default.url,
        uploadDate: new Date(videoData.snippet.publishedAt),
        description: videoData.snippet.description,
        viewCount: parseInt(videoData.statistics.viewCount, 10),
        likeCount: parseInt(videoData.statistics.likeCount, 10),
        tags: videoData.snippet.tags,
        categoryId: videoData.snippet.categoryId,
      };

      return {
        success: true,
        data: metadata,
      };

    } catch (error) {
      console.error('Error fetching video metadata:', error);
      
      return {
        success: false,
        error: {
          type: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date(),
          videoId: videoIdOrUrl,
        },
      };
    }
  }

  /**
   * Fetch playlist metadata using YouTube Data API
   */
  async getPlaylistMetadata(playlistId: string) {
    try {
      if (!this.API_KEY) {
        throw new Error('YouTube API key not configured');
      }

      const url = `${this.API_BASE_URL}/playlists?part=snippet,contentDetails&id=${playlistId}&key=${this.API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data: YouTubeApiPlaylistResponse = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('Playlist not found or not accessible');
      }

      const playlistData = data.items[0];
      
      return {
        id: playlistId,
        title: playlistData.snippet.title,
        description: playlistData.snippet.description,
        channelTitle: playlistData.snippet.channelTitle,
        thumbnailUrl: playlistData.snippet.thumbnails.high?.url || playlistData.snippet.thumbnails.medium?.url || playlistData.snippet.thumbnails.default.url,
        itemCount: playlistData.contentDetails.itemCount,
        publishedAt: new Date(playlistData.snippet.publishedAt),
      };

    } catch (error) {
      console.error('Error fetching playlist metadata:', error);
      throw error;
    }
  }

  /**
   * Fetch playlist items using YouTube Data API
   */
  async getPlaylistItems(playlistId: string, maxResults: number = 50) {
    try {
      if (!this.API_KEY) {
        throw new Error('YouTube API key not configured');
      }

      const videos: VideoMetadata[] = [];
      let nextPageToken = '';

      do {
        const url = `${this.API_BASE_URL}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${Math.min(maxResults, 50)}&pageToken=${nextPageToken}&key=${this.API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
        }

        const data: YouTubeApiPlaylistItemsResponse = await response.json();
        
        // Fetch detailed information for each video
        const videoIds = data.items.map(item => item.snippet.resourceId.videoId);
        const videoDetails = await this.getMultipleVideosMetadata(videoIds);
        
        videos.push(...videoDetails.filter(video => video !== null) as VideoMetadata[]);
        
        nextPageToken = data.nextPageToken || '';
        
      } while (nextPageToken && videos.length < maxResults);

      return videos;

    } catch (error) {
      console.error('Error fetching playlist items:', error);
      throw error;
    }
  }

  /**
   * Fetch metadata for multiple videos in a single API call
   */
  async getMultipleVideosMetadata(videoIds: string[]): Promise<(VideoMetadata | null)[]> {
    try {
      if (!this.API_KEY) {
        throw new Error('YouTube API key not configured');
      }

      if (videoIds.length === 0) {
        return [];
      }

      // YouTube API allows up to 50 video IDs per request
      const chunks = this.chunkArray(videoIds, 50);
      const allVideos: (VideoMetadata | null)[] = [];

      for (const chunk of chunks) {
        const url = `${this.API_BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${chunk.join(',')}&key=${this.API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
        }

        const data: YouTubeApiVideoResponse = await response.json();
        
        const videos = data.items.map(videoData => ({
          id: videoData.id,
          title: videoData.snippet.title,
          author: videoData.snippet.channelTitle,
          duration: this.parseIsoDuration(videoData.contentDetails.duration),
          thumbnailUrl: videoData.snippet.thumbnails.high?.url || videoData.snippet.thumbnails.medium?.url || videoData.snippet.thumbnails.default.url,
          uploadDate: new Date(videoData.snippet.publishedAt),
          description: videoData.snippet.description,
          viewCount: parseInt(videoData.statistics.viewCount, 10),
          likeCount: parseInt(videoData.statistics.likeCount, 10),
          tags: videoData.snippet.tags,
          categoryId: videoData.snippet.categoryId,
        }));

        allVideos.push(...videos);
      }

      return allVideos;

    } catch (error) {
      console.error('Error fetching multiple videos metadata:', error);
      // Return array of nulls for failed requests
      return videoIds.map(() => null);
    }
  }

  /**
   * Parse ISO 8601 duration format to readable format
   * Example: PT4M13S -> "4:13"
   */
  private parseIsoDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    
    if (!match) {
      return '0:00';
    }

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Utility function to chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Check if video is accessible
   */
  async isVideoAccessible(videoId: string): Promise<boolean> {
    try {
      const result = await this.getVideoMetadata(videoId);
      return result.success;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const youtubeDataApi = new YouTubeDataApiService();

// Export class for testing or custom instances
export { YouTubeDataApiService };
