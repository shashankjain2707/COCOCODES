/**
 * Gemini API Service
 * Core service for interacting with Google's Generative AI API
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { EXPO_PUBLIC_GEMINI_API_KEY } from '@env';

// Load environment variables
const GEMINI_API_KEY = EXPO_PUBLIC_GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.warn('EXPO_PUBLIC_GEMINI_API_KEY is not set. Gemini API calls will fail.');
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }
  
  /**
   * Generate text content from a prompt
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw new Error('Failed to generate content with Gemini API');
    }
  }
  
  /**
   * Generate structured content as JSON based on a schema
   */
  async generateStructuredContent<T>(prompt: string, schema: any): Promise<T> {
    try {
      const structurePrompt = `${prompt}\n\nProvide your response as valid JSON matching this schema: ${JSON.stringify(schema)}`;
      
      const result = await this.model.generateContent(structurePrompt);
      const response = await result.response;
      const textContent = response.text();
      
      // Extract JSON from the response if it's wrapped in markdown code blocks
      const jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/) || 
                        textContent.match(/```\n([\s\S]*?)\n```/) ||
                        [null, textContent];
      
      const jsonContent = jsonMatch[1] || textContent;
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error('Error generating structured content with Gemini:', error);
      throw new Error('Failed to generate structured content with Gemini API');
    }
  }
  
  /**
   * Check if the Gemini API is properly configured and working
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.generateContent('Hello, can you hear me?');
      return result.length > 0;
    } catch (error) {
      console.error('Gemini API connection test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const geminiService = new GeminiService(GEMINI_API_KEY);

export default geminiService;
