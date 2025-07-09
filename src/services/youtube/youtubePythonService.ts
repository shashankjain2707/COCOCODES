/**
 * Unified YouTube Service
 * Uses Python server for all YouTube metadata fetching
 */

import { YouTubeMetadataResponse, VideoMetadata } from '../../types/video';
import { apiClient } from '../api/apiClient';

class YouTubeService {
  private serverAvailable = true;
  
  constructor() {
    // Check if Python server is available
    this.checkServerStatus();
  }

  /**
   * Check if Python server is available
   */
  private async checkServerStatus() {
    try {
      this.serverAvailable = await apiClient.checkServerStatus();
      if (!this.serverAvailable) {
        console.warn('⚠️ Python server not available. YouTube metadata features will not work.');
      } else {
        console.log('✅ Python server available for YouTube metadata.');
      }
    } catch (error) {
      this.serverAvailable = false;
      console.error('❌ Error checking Python server status:', error);
    }
  }

  /**
   * Get video metadata from Python server
   */
  async getVideoMetadata(videoIdOrUrl: string): Promise<YouTubeMetadataResponse> {
    try {
      if (!this.serverAvailable) {
        return {
          success: false,
          error: {
            type: 'VIDEO_UNAVAILABLE',
            message: 'Python server is not available',
            timestamp: new Date(),
            videoId: videoIdOrUrl,
          },
        };
      }

      console.log('🔍 Fetching video metadata from Python server...');
      const result = await apiClient.getVideoMetadata(videoIdOrUrl);
      
      if (result.success) {
        console.log('✅ Python server: Successfully fetched video metadata');
      } else {
        console.warn('⚠️ Python server failed to fetch metadata:', result.error?.message);
      }
      
      return result;
    } catch (error) {
      console.error('❌ YouTube service error:', error);
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
   * Check if video is accessible
   */
  async isVideoAccessible(videoIdOrUrl: string): Promise<boolean> {
    try {
      const result = await this.getVideoMetadata(videoIdOrUrl);
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * Get metadata for multiple videos
   */
  async getMultipleVideosMetadata(videoIds: string[]): Promise<(VideoMetadata | null)[]> {
    try {
      if (!this.serverAvailable) {
        return videoIds.map(() => null);
      }
      
      console.log('🔍 Fetching multiple videos metadata from Python server...');
      return await apiClient.getMultipleVideosMetadata(videoIds);
    } catch (error) {
      console.error('❌ Error fetching multiple videos metadata:', error);
      return videoIds.map(() => null);
    }
  }

  /**
   * Get playlist metadata from Python server
   */
  async getPlaylistMetadata(playlistId: string) {
    try {
      if (!this.serverAvailable) {
        throw new Error('Python server is not available');
      }
      
      console.log('🔍 Fetching playlist metadata from Python server...');
      return await apiClient.getPlaylistMetadata(playlistId);
    } catch (error) {
      console.error('❌ Error fetching playlist metadata:', error);
      throw error;
    }
  }

  /**
   * Get service status and available features
   */
  getServiceStatus() {    
    return {
      serverAvailable: this.serverAvailable,
      features: {
        videoMetadata: this.serverAvailable,
        playlistMetadata: this.serverAvailable,
        bulkVideoMetadata: this.serverAvailable,
        videoStatistics: this.serverAvailable,
      },
      source: 'Python Server',
    };
  }
}

// Export singleton instance
export const youtubeService = new YouTubeService();

// Export class for testing or custom instances
export { YouTubeService };
