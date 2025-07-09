/**
 * Unified YouTube Service
 * Combines YouTube Data API and fallback scraping methods
 */

import { YouTubeMetadataResponse, VideoMetadata } from '../../types/video';
import { youtubeDataApi } from './youtubeDataApi';
import { youtubeMetadataExtractor } from './metadataExtractor';

class YouTubeService {
  /**
   * Get video metadata with fallback strategy
   * 1. Try YouTube Data API first (if API key is available)
   * 2. Fall back to scraping methods if API fails
   */
  async getVideoMetadata(videoIdOrUrl: string): Promise<YouTubeMetadataResponse> {
    try {
      // First, try the YouTube Data API
      const apiResult = await youtubeDataApi.getVideoMetadata(videoIdOrUrl);
      
      if (apiResult.success) {
        console.log('✅ YouTube Data API: Successfully fetched metadata');
        return apiResult;
      }
      
      // If API failed but not due to missing API key, log the error
      if (apiResult.error?.type !== 'API_KEY_ERROR') {
        console.warn('⚠️ YouTube Data API failed:', apiResult.error?.message);
      }
      
      // Fall back to scraping methods
      console.log('🔄 Falling back to scraping methods...');
      const scrapingResult = await youtubeMetadataExtractor.extractVideoMetadata(videoIdOrUrl);
      
      if (scrapingResult.success) {
        console.log('✅ Scraping fallback: Successfully fetched metadata');
        return scrapingResult;
      }
      
      console.error('❌ All methods failed to fetch metadata');
      return scrapingResult;
      
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
      // Try YouTube Data API first for bulk operations
      const apiResults = await youtubeDataApi.getMultipleVideosMetadata(videoIds);
      
      // Check if all results are successful
      const hasFailures = apiResults.some(result => result === null);
      
      if (!hasFailures) {
        console.log('✅ YouTube Data API: Successfully fetched all videos metadata');
        return apiResults;
      }
      
      // For failed ones, try scraping individually
      console.log('🔄 Some videos failed, trying scraping for failed ones...');
      const finalResults: (VideoMetadata | null)[] = [];
      
      for (let i = 0; i < videoIds.length; i++) {
        if (apiResults[i] !== null) {
          finalResults.push(apiResults[i]);
        } else {
          // Try scraping for this video
          const scrapingResult = await youtubeMetadataExtractor.extractVideoMetadata(videoIds[i]);
          finalResults.push(scrapingResult.success ? scrapingResult.data || null : null);
        }
      }
      
      return finalResults;
      
    } catch (error) {
      console.error('❌ Error fetching multiple videos metadata:', error);
      
      // Fall back to individual scraping for all videos
      const promises = videoIds.map(async (videoId) => {
        const result = await youtubeMetadataExtractor.extractVideoMetadata(videoId);
        return result.success ? result.data || null : null;
      });
      
      return Promise.all(promises);
    }
  }

  /**
   * Get playlist metadata (YouTube Data API only)
   */
  async getPlaylistMetadata(playlistId: string) {
    try {
      return await youtubeDataApi.getPlaylistMetadata(playlistId);
    } catch (error) {
      console.error('❌ Error fetching playlist metadata:', error);
      throw error;
    }
  }

  /**
   * Get playlist items (YouTube Data API only)
   */
  async getPlaylistItems(playlistId: string, maxResults: number = 50) {
    try {
      return await youtubeDataApi.getPlaylistItems(playlistId, maxResults);
    } catch (error) {
      console.error('❌ Error fetching playlist items:', error);
      throw error;
    }
  }

  /**
   * Get service status and available features
   */
  getServiceStatus() {
    const hasApiKey = !!process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
    
    return {
      hasApiKey,
      features: {
        videoMetadata: true, // Always available (API + scraping)
        playlistMetadata: hasApiKey, // Only available with API key
        playlistItems: hasApiKey, // Only available with API key
        bulkVideoMetadata: hasApiKey, // More efficient with API key
        videoStatistics: hasApiKey, // Only available with API key
      },
      methods: {
        primary: hasApiKey ? 'YouTube Data API' : 'Web Scraping',
        fallback: hasApiKey ? 'Web Scraping' : 'None',
      },
    };
  }
}

// Export singleton instance
export const youtubeService = new YouTubeService();

// Export class for testing or custom instances
export { YouTubeService };
