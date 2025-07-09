/**
 * Notes Service
 * Handles interaction with the notes API endpoints on the Python server
 */

import { apiClient } from '../api/apiClient';
import { NotesResponse, NoteType } from '../../types/notes';

class NotesService {
  /**
   * Generate AI notes for a YouTube video
   * @param videoIdOrUrl YouTube video ID or URL
   * @param noteType Type of notes to generate (comprehensive, summary, key_points, study_guide)
   */
  async generateNotes(videoIdOrUrl: string, noteType: NoteType = 'comprehensive'): Promise<NotesResponse> {
    try {
      const url = `${apiClient.API_BASE_URL}/api/notes/generate?videoId=${encodeURIComponent(videoIdOrUrl)}&type=${noteType}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            type: errorData.error?.type || 'API_ERROR',
            message: errorData.error?.message || `HTTP error ${response.status}`,
          },
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Notes service error:', error);
      return {
        success: false,
        error: {
          type: 'API_CONNECTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to connect to Python server',
        },
      };
    }
  }
}

// Export singleton instance
export const notesService = new NotesService();
