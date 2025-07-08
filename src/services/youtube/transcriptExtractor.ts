/**
 * Enhanced Transcript Extraction Service
 * Extracts YouTube auto-generated English transcripts for AI processing
 */

import { VideoTranscript, TranscriptSegment } from '../../types/video';

interface YouTubeTranscriptResponse {
  actions?: Array<{
    updateEngagementPanelAction?: {
      content?: {
        transcriptRenderer?: {
          body?: {
            transcriptBodyRenderer?: {
              cueGroups?: Array<{
                transcriptCueGroupRenderer?: {
                  cues?: Array<{
                    transcriptCueRenderer?: {
                      cue?: {
                        simpleText?: string;
                      };
                      startOffsetMs?: string;
                      durationMs?: string;
                    };
                  }>;
                };
              }>;
            };
          };
        };
      };
    };
  }>;
}

class TranscriptExtractor {
  private readonly TRANSCRIPT_API_URL = 'https://www.youtube.com/youtubei/v1/get_transcript';
  private readonly YOUTUBE_WATCH_URL = 'https://www.youtube.com/watch?v=';

  /**
   * Extract transcript from YouTube video
   */
  async extractTranscript(videoId: string): Promise<VideoTranscript | null> {
    try {
      console.log(`Extracting transcript for video: ${videoId}`);
      
      // First, get the initial page to extract necessary parameters
      const initialData = await this.getInitialPageData(videoId);
      if (!initialData) {
        console.warn(`Could not get initial data for video: ${videoId}`);
        return null;
      }

      // Extract transcript using the parameters
      const transcript = await this.fetchTranscriptData(videoId, initialData);
      if (!transcript) {
        console.warn(`No transcript available for video: ${videoId}`);
        return null;
      }

      return transcript;
    } catch (error) {
      console.error(`Error extracting transcript for ${videoId}:`, error);
      return null;
    }
  }

  /**
   * Get initial YouTube page data for transcript extraction
   */
  private async getInitialPageData(videoId: string): Promise<any> {
    try {
      const response = await fetch(`${this.YOUTUBE_WATCH_URL}${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      const html = await response.text();
      
      // Extract ytInitialPlayerResponse
      const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
      if (!playerResponseMatch) {
        throw new Error('Could not find ytInitialPlayerResponse');
      }

      const playerResponse = JSON.parse(playerResponseMatch[1]);
      
      // Extract necessary parameters for transcript API
      const videoDetails = playerResponse?.videoDetails;
      if (!videoDetails) {
        throw new Error('Video details not found');
      }

      return {
        videoId: videoDetails.videoId,
        title: videoDetails.title,
        lengthSeconds: videoDetails.lengthSeconds,
        channelId: videoDetails.channelId,
      };
    } catch (error) {
      console.error('Error getting initial page data:', error);
      return null;
    }
  }

  /**
   * Fetch transcript data using alternative method
   */
  private async fetchTranscriptData(videoId: string, initialData: any): Promise<VideoTranscript | null> {
    try {
      // Alternative approach: Parse transcript from video page directly
      const transcriptUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`;
      
      const response = await fetch(transcriptUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        // Try alternative method with auto-generated transcript
        return await this.extractTranscriptFromHTML(videoId);
      }

      const data = await response.json();
      return this.parseTranscriptResponse(videoId, data, initialData);
    } catch (error) {
      console.error('Error fetching transcript data:', error);
      // Fallback to HTML extraction
      return await this.extractTranscriptFromHTML(videoId);
    }
  }

  /**
   * Extract transcript from YouTube page HTML (fallback method)
   */
  private async extractTranscriptFromHTML(videoId: string): Promise<VideoTranscript | null> {
    try {
      const response = await fetch(`${this.YOUTUBE_WATCH_URL}${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const html = await response.text();
      
      // Look for transcript data in the page
      const transcriptMatches = html.match(/"captions":\s*({.+?}),/);
      if (!transcriptMatches) {
        console.warn(`No captions found for video: ${videoId}`);
        return null;
      }

      const captionsData = JSON.parse(transcriptMatches[1]);
      const transcriptTracks = captionsData?.playerCaptionsTracklistRenderer?.captionTracks;
      
      if (!transcriptTracks || transcriptTracks.length === 0) {
        console.warn(`No transcript tracks found for video: ${videoId}`);
        return null;
      }

      // Find English auto-generated transcript
      const englishTrack = transcriptTracks.find((track: any) => 
        track.languageCode === 'en' && track.kind === 'asr'
      ) || transcriptTracks.find((track: any) => track.languageCode === 'en');

      if (!englishTrack) {
        console.warn(`No English transcript found for video: ${videoId}`);
        return null;
      }

      // Fetch the actual transcript content
      const transcriptResponse = await fetch(englishTrack.baseUrl + '&fmt=json3');
      const transcriptData = await transcriptResponse.json();

      return this.parseTranscriptResponse(videoId, transcriptData);
    } catch (error) {
      console.error('Error extracting transcript from HTML:', error);
      return null;
    }
  }

  /**
   * Parse transcript response into our format
   */
  private parseTranscriptResponse(videoId: string, data: any, initialData?: any): VideoTranscript {
    const segments: TranscriptSegment[] = [];
    
    try {
      const events = data?.events || [];
      
      for (const event of events) {
        if (event.segs) {
          const startTime = parseFloat(event.tStartMs) / 1000 || 0;
          const duration = parseFloat(event.dDurationMs) / 1000 || 0;
          const endTime = startTime + duration;
          
          const text = event.segs
            .map((seg: any) => seg.utf8 || '')
            .join('')
            .replace(/\n/g, ' ')
            .trim();

          if (text) {
            segments.push({
              startTime,
              endTime,
              text,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error parsing transcript response:', error);
    }

    return {
      videoId,
      segments,
      language: 'en',
      duration: segments.length > 0 ? segments[segments.length - 1].endTime : 0,
      extractedAt: new Date(),
    };
  }

  /**
   * Get transcript as continuous text for AI processing
   */
  async getTranscriptText(videoId: string): Promise<string | null> {
    const transcript = await this.extractTranscript(videoId);
    if (!transcript || transcript.segments.length === 0) {
      return null;
    }

    return transcript.segments
      .map(segment => segment.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Get transcript with timestamps for quiz timing
   */
  async getTranscriptWithTimings(videoId: string): Promise<Array<{text: string, startTime: number, endTime: number}> | null> {
    const transcript = await this.extractTranscript(videoId);
    if (!transcript || transcript.segments.length === 0) {
      return null;
    }

    return transcript.segments.map(segment => ({
      text: segment.text,
      startTime: segment.startTime,
      endTime: segment.endTime,
    }));
  }

  /**
   * Check if transcript is available for a video
   */
  async isTranscriptAvailable(videoId: string): Promise<boolean> {
    try {
      const transcript = await this.extractTranscript(videoId);
      return transcript !== null && transcript.segments.length > 0;
    } catch (error) {
      console.error(`Error checking transcript availability for ${videoId}:`, error);
      return false;
    }
  }

  /**
   * Get transcript segments for specific time range
   */
  getSegmentsInRange(transcript: VideoTranscript, startTime: number, endTime: number): TranscriptSegment[] {
    return transcript.segments.filter(segment =>
      segment.startTime >= startTime && segment.endTime <= endTime
    );
  }

  /**
   * Search for specific text in transcript
   */
  searchInTranscript(transcript: VideoTranscript, searchText: string): Array<{segment: TranscriptSegment, index: number}> {
    const results: Array<{segment: TranscriptSegment, index: number}> = [];
    const searchLower = searchText.toLowerCase();

    transcript.segments.forEach((segment, index) => {
      if (segment.text.toLowerCase().includes(searchLower)) {
        results.push({ segment, index });
      }
    });

    return results;
  }
}

// Export singleton instance
export const transcriptExtractor = new TranscriptExtractor();
export default transcriptExtractor;
