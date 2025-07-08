// YouTube Metadata Extraction Service
// Phase 1 Implementation - No API Key Required

import { VideoMetadata, YouTubeMetadataResponse, VideoError } from '../../types/video';
import { extractVideoId, generateThumbnailUrl, isValidVideoId } from '../../utils/youtubeHelpers';

/**
 * Extracts video metadata using web scraping methods
 * No YouTube API key required
 */
class YouTubeMetadataExtractor {
  private readonly YOUTUBE_BASE_URL = 'https://www.youtube.com';
  private readonly YOUTUBE_OEMBED_URL = 'https://www.youtube.com/oembed';

  /**
   * Extract metadata for a single video
   */
  async extractVideoMetadata(videoIdOrUrl: string): Promise<YouTubeMetadataResponse> {
    try {
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

      // Try multiple methods to extract metadata
      const metadata = await this.tryMultipleExtractionMethods(videoId);
      
      if (!metadata) {
        return {
          success: false,
          error: {
            type: 'VIDEO_NOT_FOUND',
            message: 'Could not extract video metadata',
            timestamp: new Date(),
            videoId,
          },
        };
      }

      return {
        success: true,
        data: metadata,
      };

    } catch (error) {
      console.error('Error extracting video metadata:', error);
      
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
   * Try multiple methods to extract metadata
   */
  private async tryMultipleExtractionMethods(videoId: string): Promise<VideoMetadata | null> {
    // Method 1: YouTube oEmbed API (most reliable)
    try {
      const oembedData = await this.extractFromOEmbed(videoId);
      if (oembedData) return oembedData;
    } catch (error) {
      console.warn('oEmbed extraction failed:', error);
    }

    // Method 2: Page scraping (fallback)
    try {
      const scrapedData = await this.extractFromPageScraping(videoId);
      if (scrapedData) return scrapedData;
    } catch (error) {
      console.warn('Page scraping failed:', error);
    }

    // Method 3: Basic metadata with thumbnail (last resort)
    return this.createBasicMetadata(videoId);
  }

  /**
   * Extract metadata using YouTube oEmbed API
   */
  private async extractFromOEmbed(videoId: string): Promise<VideoMetadata | null> {
    const oembedUrl = `${this.YOUTUBE_OEMBED_URL}?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error(`oEmbed API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      id: videoId,
      title: data.title || 'Unknown Title',
      author: data.author_name || 'Unknown Author',
      duration: '0:00', // oEmbed doesn't provide duration
      thumbnailUrl: data.thumbnail_url || generateThumbnailUrl(videoId),
      uploadDate: new Date(), // Not available from oEmbed
      description: '',
    };
  }

  /**
   * Extract metadata by scraping the YouTube page
   * Note: This is more fragile and may break if YouTube changes their structure
   */
  private async extractFromPageScraping(videoId: string): Promise<VideoMetadata | null> {
    const pageUrl = `${this.YOUTUBE_BASE_URL}/watch?v=${videoId}`;
    
    // In a real React Native app, you'd need a web scraping service
    // This is a placeholder for the actual implementation
    // You might need to use a proxy service or implement this server-side
    
    try {
      const response = await fetch(pageUrl);
      const html = await response.text();
      
      // Extract title from page title or meta tags
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Unknown Title';
      
      // Extract author from meta tags
      const authorMatch = html.match(/<meta name="author" content="([^"]+)"/);
      const author = authorMatch ? authorMatch[1] : 'Unknown Author';
      
      // Extract description from meta tags
      const descriptionMatch = html.match(/<meta name="description" content="([^"]+)"/);
      const description = descriptionMatch ? descriptionMatch[1] : '';
      
      return {
        id: videoId,
        title,
        author,
        duration: '0:00', // Would need more complex parsing
        thumbnailUrl: generateThumbnailUrl(videoId),
        uploadDate: new Date(),
        description,
      };
      
    } catch (error) {
      console.error('Page scraping failed:', error);
      return null;
    }
  }

  /**
   * Create basic metadata with just video ID and thumbnail
   */
  private createBasicMetadata(videoId: string): VideoMetadata {
    return {
      id: videoId,
      title: 'YouTube Video',
      author: 'Unknown',
      duration: '0:00',
      thumbnailUrl: generateThumbnailUrl(videoId),
      uploadDate: new Date(),
      description: '',
    };
  }

  /**
   * Extract metadata for multiple videos
   */
  async extractMultipleVideosMetadata(videoIds: string[]): Promise<(VideoMetadata | null)[]> {
    const promises = videoIds.map(videoId => 
      this.extractVideoMetadata(videoId).then(result => 
        result.success ? result.data || null : null
      )
    );

    return Promise.all(promises);
  }

  /**
   * Check if a video exists and is accessible
   */
  async isVideoAccessible(videoId: string): Promise<boolean> {
    try {
      const result = await this.extractVideoMetadata(videoId);
      return result.success;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const youtubeMetadataExtractor = new YouTubeMetadataExtractor();

// Export class for testing or custom instances
export { YouTubeMetadataExtractor };
