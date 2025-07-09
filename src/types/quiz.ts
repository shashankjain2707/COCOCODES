/**
 * Quiz Types
 * Data structures for the quiz feature
 */

export interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface Quiz {
  quiz: QuizQuestion[];
}

export interface QuizResponse {
  success: boolean;
  data?: {
    quiz: Quiz;
    transcript_summary: {
      length: number;
      segments: number;
      sample: string;
    };
  };
  error?: {
    type: string;
    message: string;
  };
}
