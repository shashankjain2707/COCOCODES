/**
 * Gemini-powered Quiz Generator
 * Generates quiz questions from video transcripts using Google's Gemini API
 */

import { geminiService } from '../gemini/geminiService';
import { transcriptExtractor } from '../../youtube/transcriptExtractor';
import { QuizQuestion, VideoTranscript } from '../../../types/video';

class GeminiQuizGenerator {
  /**
   * Generates 4 quiz questions for a video based on its transcript
   */
  async generateQuizzesForVideo(videoId: string): Promise<QuizQuestion[]> {
    try {
      // 1. Extract transcript
      const transcriptResponse = await transcriptExtractor.extractTranscript(videoId);
      
      if (!transcriptResponse) {
        throw new Error(`Failed to extract transcript for video ${videoId}`);
      }
      
      const transcript = transcriptResponse;
      
      // 2. Determine appropriate trigger points (25%, 50%, 75%, 90% of video)
      const duration = transcript.duration;
      const triggerPoints = [
        Math.floor(duration * 0.25),
        Math.floor(duration * 0.5),
        Math.floor(duration * 0.75),
        Math.floor(duration * 0.9)
      ];
      
      // 3. Generate transcript segments for each quiz
      const segmentPromises = triggerPoints.map(triggerTime => {
        // Find segments around the trigger time (1 minute before to provide context)
        const relevantSegments = transcript.segments
          .filter((segment: any) => segment.startTime <= triggerTime && segment.endTime >= (triggerTime - 60))
          .map((segment: any) => segment.text)
          .join(' ');
          
        return this.generateQuizFromSegment(videoId, relevantSegments, triggerTime);
      });
      
      // 4. Generate all quizzes in parallel
      const quizzes = await Promise.all(segmentPromises);
      
      return quizzes;
    } catch (error) {
      console.error('Error generating quizzes:', error);
      throw new Error('Failed to generate quizzes');
    }
  }
  
  /**
   * Generates a single quiz question from a transcript segment
   */
  private async generateQuizFromSegment(
    videoId: string,
    transcriptSegment: string,
    triggerTime: number
  ): Promise<QuizQuestion> {
    // Define the schema for Gemini to follow
    const quizSchema = {
      question: "string",
      options: ["string", "string", "string", "string"],
      correctAnswer: "number",
      explanation: "string",
      difficulty: "string",
      keyTopic: "string"
    };
    
    const prompt = `
      Create an educational multiple-choice quiz question based on this video transcript segment:
      
      "${transcriptSegment}"
      
      Generate a quiz question that:
      1. Tests understanding of a key concept in the segment
      2. Has 4 answer options with only one correct answer (index 0-3)
      3. Includes a brief explanation of why the correct answer is right
      4. Assign a difficulty level (easy, medium, or hard)
      5. Identify the key topic or concept being tested
      
      The question should be challenging but fair, and directly related to the content.
      The correctAnswer should be a number from 0-3 representing the index of the correct option.
    `;
    
    try {
      const quizData = await geminiService.generateStructuredContent<{
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
        difficulty: 'easy' | 'medium' | 'hard';
        keyTopic: string;
      }>(prompt, quizSchema);
      
      // Validate and structure the response
      return {
        id: `quiz-${videoId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        videoId,
        question: quizData.question,
        options: quizData.options,
        correctAnswer: quizData.correctAnswer,
        explanation: quizData.explanation,
        triggerTime,
        difficulty: quizData.difficulty,
        keyTopic: quizData.keyTopic,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error generating quiz from segment:', error);
      
      // Fallback to a default quiz question if generation fails
      return {
        id: `quiz-${videoId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        videoId,
        question: 'What is the main topic discussed in this section of the video?',
        options: [
          'Option A',
          'Option B',
          'Option C',
          'Option D'
        ],
        correctAnswer: 0,
        explanation: 'This is a placeholder question. The AI was unable to generate a specific question.',
        triggerTime,
        difficulty: 'medium',
        keyTopic: 'Video Content',
        createdAt: new Date()
      };
    }
  }
}

// Create singleton instance
export const geminiQuizGenerator = new GeminiQuizGenerator();

export default geminiQuizGenerator;
