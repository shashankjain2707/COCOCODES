/**
 * AI-Powered Quiz Generation Service
 * Generates 4 strategic quizzes per video using LLM analysis of transcripts
 */

import { QuizQuestion, VideoTranscript } from '../../types/video';
import { transcriptExtractor } from '../youtube/transcriptExtractor';

interface QuizGenerationConfig {
  numberOfQuizzes: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionTypes: Array<'multiple-choice' | 'true-false' | 'fill-blank'>;
  maxOptionsPerQuestion: number;
}

interface LLMResponse {
  quizzes: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    triggerTime: number;
    keyTopic: string;
  }>;
}

class QuizGenerator {
  private readonly DEFAULT_CONFIG: QuizGenerationConfig = {
    numberOfQuizzes: 4,
    difficulty: 'mixed',
    questionTypes: ['multiple-choice'],
    maxOptionsPerQuestion: 4,
  };

  private readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  private apiKey: string | null = null;

  constructor() {
    // Initialize API key from environment
    this.apiKey = process.env.OPENAI_API_KEY || null;
  }

  /**
   * Generate 4 strategic quizzes for a video based on its transcript
   */
  async generateQuizzesForVideo(
    videoId: string,
    config: Partial<QuizGenerationConfig> = {}
  ): Promise<QuizQuestion[]> {
    try {
      console.log(`Generating quizzes for video: ${videoId}`);
      
      // Get video transcript
      const transcript = await transcriptExtractor.extractTranscript(videoId);
      if (!transcript || transcript.segments.length === 0) {
        console.warn(`No transcript available for video: ${videoId}`);
        return [];
      }

      // Analyze transcript and generate quizzes
      const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
      const quizzes = await this.generateQuizzesFromTranscript(
        videoId,
        transcript,
        finalConfig
      );

      console.log(`Generated ${quizzes.length} quizzes for video: ${videoId}`);
      return quizzes;
    } catch (error) {
      console.error(`Error generating quizzes for video ${videoId}:`, error);
      return [];
    }
  }

  /**
   * Generate quizzes from transcript using AI
   */
  private async generateQuizzesFromTranscript(
    videoId: string,
    transcript: VideoTranscript,
    config: QuizGenerationConfig
  ): Promise<QuizQuestion[]> {
    try {
      // Prepare transcript text for AI processing
      const transcriptText = transcript.segments
        .map(seg => seg.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (transcriptText.length < 100) {
        console.warn(`Transcript too short for quiz generation: ${videoId}`);
        return [];
      }

      // Calculate optimal quiz timing based on video duration
      const videoDuration = transcript.duration;
      const quizTimings = this.calculateOptimalQuizTimings(videoDuration, config.numberOfQuizzes);

      // Generate quizzes using LLM
      const llmQuizzes = await this.callLLMForQuizGeneration(
        transcriptText,
        transcript.segments,
        quizTimings,
        config
      );

      // Convert to our QuizQuestion format
      return this.convertLLMResponseToQuizzes(videoId, llmQuizzes, quizTimings);
    } catch (error) {
      console.error('Error generating quizzes from transcript:', error);
      return [];
    }
  }

  /**
   * Calculate optimal timing for quiz placement
   */
  private calculateOptimalQuizTimings(duration: number, numberOfQuizzes: number): number[] {
    const timings: number[] = [];
    
    // Avoid placing quizzes too early or too late
    const startBuffer = Math.min(duration * 0.1, 60); // 10% or 1 minute
    const endBuffer = Math.min(duration * 0.1, 30);   // 10% or 30 seconds
    
    const effectiveDuration = duration - startBuffer - endBuffer;
    const interval = effectiveDuration / (numberOfQuizzes + 1);

    for (let i = 1; i <= numberOfQuizzes; i++) {
      const timing = startBuffer + (interval * i);
      timings.push(Math.round(timing));
    }

    return timings;
  }

  /**
   * Call LLM API for quiz generation
   */
  private async callLLMForQuizGeneration(
    transcriptText: string,
    segments: any[],
    quizTimings: number[],
    config: QuizGenerationConfig
  ): Promise<LLMResponse> {
    if (!this.apiKey) {
      console.warn('No OpenAI API key provided, using fallback quiz generation');
      return this.generateFallbackQuizzes(transcriptText, quizTimings);
    }

    try {
      const prompt = this.createQuizGenerationPrompt(transcriptText, quizTimings, config);
      
      const response = await fetch(this.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator specializing in creating engaging quizzes for video-based learning.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Error calling LLM API:', error);
      return this.generateFallbackQuizzes(transcriptText, quizTimings);
    }
  }

  /**
   * Create prompt for LLM quiz generation
   */
  private createQuizGenerationPrompt(
    transcriptText: string,
    quizTimings: number[],
    config: QuizGenerationConfig
  ): string {
    return `
Analyze this educational video transcript and create ${config.numberOfQuizzes} strategic multiple-choice quizzes to enhance student engagement and comprehension.

TRANSCRIPT:
"${transcriptText.substring(0, 3000)}${transcriptText.length > 3000 ? '...' : ''}"

QUIZ TIMING REQUIREMENTS:
- Place quizzes at these approximate timestamps: ${quizTimings.map(t => `${Math.floor(t/60)}:${(t%60).toString().padStart(2, '0')}`).join(', ')}
- Each quiz should test content from the preceding segment

REQUIREMENTS:
1. Create exactly ${config.numberOfQuizzes} questions
2. Mix difficulty levels: ${config.difficulty === 'mixed' ? 'easy, medium, hard' : config.difficulty}
3. Each question must have exactly 4 multiple-choice options
4. Focus on key educational concepts, not trivial details
5. Include clear explanations for correct answers
6. Questions should encourage active learning and comprehension

OUTPUT FORMAT (JSON only):
{
  "quizzes": [
    {
      "question": "Clear, concise question testing understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct and learning reinforcement",
      "difficulty": "easy|medium|hard",
      "triggerTime": ${quizTimings[0]},
      "keyTopic": "Main concept being tested"
    }
  ]
}

Generate engaging quizzes that will keep students actively engaged with the educational content.`;
  }

  /**
   * Generate fallback quizzes when LLM is not available
   */
  private generateFallbackQuizzes(transcriptText: string, quizTimings: number[]): LLMResponse {
    const quizzes = quizTimings.map((timing, index) => ({
      question: `Based on the content around ${Math.floor(timing/60)}:${(timing%60).toString().padStart(2, '0')}, what is a key concept discussed?`,
      options: [
        "The main topic discussed in this section",
        "A secondary concept mentioned",
        "An example or illustration used",
        "A conclusion or summary point"
      ],
      correctAnswer: 0,
      explanation: "This question helps reinforce the key learning concepts from this section of the video.",
      difficulty: 'medium' as const,
      triggerTime: timing,
      keyTopic: `Topic ${index + 1}`
    }));

    return { quizzes };
  }

  /**
   * Convert LLM response to QuizQuestion format
   */
  private convertLLMResponseToQuizzes(
    videoId: string,
    llmResponse: LLMResponse,
    quizTimings: number[]
  ): QuizQuestion[] {
    return llmResponse.quizzes.map((quiz, index) => ({
      id: `${videoId}_quiz_${index + 1}`,
      videoId,
      question: quiz.question,
      options: quiz.options,
      correctAnswer: quiz.correctAnswer,
      explanation: quiz.explanation,
      triggerTime: quiz.triggerTime || quizTimings[index] || 0,
      difficulty: quiz.difficulty,
      keyTopic: quiz.keyTopic || `Topic ${index + 1}`,
      createdAt: new Date(),
    }));
  }

  /**
   * Validate quiz questions for quality
   */
  private validateQuizzes(quizzes: QuizQuestion[]): QuizQuestion[] {
    return quizzes.filter(quiz => {
      // Basic validation
      if (!quiz.question || quiz.question.length < 10) return false;
      if (!quiz.options || quiz.options.length !== 4) return false;
      if (quiz.correctAnswer < 0 || quiz.correctAnswer >= quiz.options.length) return false;
      if (!quiz.explanation || quiz.explanation.length < 10) return false;
      
      // Check for duplicate options
      const uniqueOptions = new Set(quiz.options);
      if (uniqueOptions.size !== quiz.options.length) return false;

      return true;
    });
  }

  /**
   * Get quiz at specific time
   */
  getQuizAtTime(quizzes: QuizQuestion[], currentTime: number, tolerance: number = 5): QuizQuestion | null {
    return quizzes.find(quiz => 
      Math.abs(quiz.triggerTime - currentTime) <= tolerance
    ) || null;
  }

  /**
   * Get next upcoming quiz
   */
  getNextQuiz(quizzes: QuizQuestion[], currentTime: number): QuizQuestion | null {
    const upcomingQuizzes = quizzes
      .filter(quiz => quiz.triggerTime > currentTime)
      .sort((a, b) => a.triggerTime - b.triggerTime);
    
    return upcomingQuizzes[0] || null;
  }

  /**
   * Check if it's time to show a quiz
   */
  shouldShowQuiz(quizzes: QuizQuestion[], currentTime: number, tolerance: number = 2): QuizQuestion | null {
    return this.getQuizAtTime(quizzes, currentTime, tolerance);
  }

  /**
   * Calculate quiz performance metrics
   */
  calculateQuizMetrics(answers: Array<{quizId: string, selectedAnswer: number, correct: boolean, timeSpent: number}>) {
    if (answers.length === 0) return null;

    const totalQuizzes = answers.length;
    const correctAnswers = answers.filter(a => a.correct).length;
    const averageTime = answers.reduce((sum, a) => sum + a.timeSpent, 0) / totalQuizzes;
    const accuracy = (correctAnswers / totalQuizzes) * 100;

    return {
      totalQuizzes,
      correctAnswers,
      accuracy,
      averageTime,
      completionRate: 100, // User completed all presented quizzes
    };
  }

  /**
   * Set custom API key
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }
}

// Export singleton instance
export const quizGenerator = new QuizGenerator();
export default quizGenerator;
