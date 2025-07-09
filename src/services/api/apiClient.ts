/**
 * Python Server API Client
 * Handles communication with the Python backend server for YouTube metadata
 */

import { VideoMetadata, YouTubeMetadataResponse, VideoError } from '../../types/video';

// Define the API base URL - this should be configurable for different environments
const API_BASE_URL = 'http://localhost:5000';

/**
 * API Client for communication with the Python backend server
 */
class ApiClient {
  // Expose API base URL
  public readonly API_BASE_URL = API_BASE_URL;
  /**
   * Fetch video metadata from the Python server
   */
  async getVideoMetadata(videoIdOrUrl: string): Promise<YouTubeMetadataResponse> {
    try {
      const url = `${API_BASE_URL}/api/video/metadata?videoId=${encodeURIComponent(videoIdOrUrl)}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            type: errorData.error?.type || 'API_ERROR',
            message: errorData.error?.message || `HTTP error ${response.status}`,
            timestamp: new Date(),
            videoId: videoIdOrUrl,
          },
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ API client error:', error);
      return {
        success: false,
        error: {
          type: 'API_CONNECTION_ERROR' as VideoError,
          message: error instanceof Error ? error.message : 'Failed to connect to Python server',
          timestamp: new Date(),
          videoId: videoIdOrUrl,
        },
      };
    }
  }

  /**
   * Fetch metadata for multiple videos
   */
  async getMultipleVideosMetadata(videoIds: string[]): Promise<(VideoMetadata | null)[]> {
    try {
      // Call the API for each video ID - in the future we could optimize with a batch endpoint
      const promises = videoIds.map(videoId => this.getVideoMetadata(videoId));
      const results = await Promise.all(promises);
      
      // Convert the results to the expected format
      return results.map(result => (result.success ? result.data || null : null));
    } catch (error) {
      console.error('❌ Error fetching multiple videos metadata:', error);
      return videoIds.map(() => null);
    }
  }

  /**
   * Get playlist metadata from the Python server
   */
  async getPlaylistMetadata(playlistId: string) {
    try {
      const url = `${API_BASE_URL}/api/playlist/metadata?playlistId=${encodeURIComponent(playlistId)}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching playlist metadata:', error);
      throw error;
    }
  }

  /**
   * Check server availability
   */
  async checkServerStatus(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE_URL}/api/video/metadata?videoId=dQw4w9WgXcQ`, { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('❌ Python server not available:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
