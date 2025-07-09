/**
 * Quiz Service
 * Handles interaction with the quiz API endpoints on the Python server
 */

import { apiClient } from '../api/apiClient';
import { QuizResponse } from '../../types/quiz';

class QuizService {
  /**
   * Generate a quiz for a YouTube video
   * @param videoIdOrUrl YouTube video ID or URL
   * @param numQuestions Number of questions to generate (default: 4)
   */
  async generateQuiz(videoIdOrUrl: string, numQuestions: number = 4): Promise<QuizResponse> {
    try {
      const url = `${apiClient.API_BASE_URL}/api/quiz/generate?videoId=${encodeURIComponent(videoIdOrUrl)}&questions=${numQuestions}`;
      
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
      console.error('❌ Quiz service error:', error);
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
export const quizService = new QuizService();
