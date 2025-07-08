/**
 * Gemini-powered Notes Generator
 * Generates study notes from video transcripts using Google's Gemini API
 */

import { geminiService } from '../gemini/geminiService';
import { transcriptExtractor } from '../../youtube/transcriptExtractor';
import { VideoNote } from '../../../types/userContent';
import { VideoTranscript } from '../../../types/video';

class GeminiNotesGenerator {
  /**
   * Generates comprehensive notes for an entire video
   */
  async generateNotesForVideo(videoId: string, userId: string): Promise<VideoNote> {
    try {
      // 1. Extract transcript
      const transcriptResponse = await transcriptExtractor.extractTranscript(videoId);
      
      if (!transcriptResponse) {
        throw new Error(`Failed to extract transcript for video ${videoId}`);
      }
      
      const transcript = transcriptResponse;
      
      // 2. Compile the full transcript text
      const fullText = transcript.segments.map((segment: any) => segment.text).join(' ');
      
      // 3. Generate structured notes using Gemini
      const notesPrompt = `
        Create comprehensive educational notes from this video transcript:
        
        "${fullText.substring(0, 8000)}" ${fullText.length > 8000 ? '... (transcript continues)' : ''}
        
        Format the notes with:
        - A clear title summarizing the main topic
        - Key concepts in bullet points
        - Important definitions
        - Summary of main points
        - Any formulas, equations or important data
        
        Use markdown formatting with headers, bullet points, bold for important terms, 
        and code blocks for any technical content.
      `;
      
      const notesContent = await geminiService.generateContent(notesPrompt);
      
      // 4. Create the note object
      const note: VideoNote = {
        id: `note-${videoId}-${Date.now()}`,
        videoId,
        userId,
        title: `AI-Generated Notes: ${transcript.videoId}`,
        content: notesContent,
        isAIGenerated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        tags: []
      };
      
      return note;
    } catch (error) {
      console.error('Error generating notes:', error);
      throw new Error('Failed to generate notes');
    }
  }
  
  /**
   * Generates timestamped notes for different segments of a video
   */
  async generateTimestampedNotes(videoId: string, userId: string): Promise<VideoNote[]> {
    try {
      // 1. Extract transcript
      const transcriptResponse = await transcriptExtractor.extractTranscript(videoId);
      
      if (!transcriptResponse) {
        throw new Error(`Failed to extract transcript for video ${videoId}`);
      }
      
      const transcript = transcriptResponse;
      
      // 2. Split transcript into chunks (every 2-3 minutes)
      const chunkDuration = 180; // 3 minutes
      const chunks: { startTime: number; text: string; }[] = [];
      let currentChunk = "";
      let chunkStartTime = 0;
      
      for (let i = 0; i < transcript.segments.length; i++) {
        const segment = transcript.segments[i];
        
        if (i === 0 || segment.startTime - chunkStartTime >= chunkDuration) {
          if (currentChunk) {
            chunks.push({
              startTime: chunkStartTime,
              text: currentChunk
            });
          }
          currentChunk = segment.text;
          chunkStartTime = segment.startTime;
        } else {
          currentChunk += " " + segment.text;
        }
      }
      
      // Add the last chunk
      if (currentChunk) {
        chunks.push({
          startTime: chunkStartTime,
          text: currentChunk
        });
      }
      
      // 3. Generate notes for each chunk in parallel
      const notePromises = chunks.map(chunk => 
        this.generateNoteForChunk(videoId, userId, chunk.text, chunk.startTime)
      );
      
      const notes = await Promise.all(notePromises);
      
      return notes;
    } catch (error) {
      console.error('Error generating timestamped notes:', error);
      throw new Error('Failed to generate timestamped notes');
    }
  }
  
  /**
   * Generates a note for a specific chunk of transcript
   */
  private async generateNoteForChunk(
    videoId: string,
    userId: string,
    chunkText: string,
    timestamp: number
  ): Promise<VideoNote> {
    const promptTemplate = `
      Create a concise summary and key points from this video transcript segment:
      
      "${chunkText}"
      
      Format as:
      1. A brief title (1 line)
      2. 2-4 key points or concepts discussed
      3. Any important definitions, formulas, or data
      
      Keep it concise but comprehensive.
    `;
    
    try {
      const noteContent = await geminiService.generateContent(promptTemplate);
      
      // Format timestamp as MM:SS
      const minutes = Math.floor(timestamp / 60);
      const seconds = Math.floor(timestamp % 60);
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      return {
        id: `note-${videoId}-${timestamp}-${Date.now()}`,
        videoId,
        userId,
        title: `Notes at ${formattedTime}`,
        content: noteContent,
        isAIGenerated: true,
        timestamp,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        tags: []
      };
    } catch (error) {
      console.error('Error generating note for chunk:', error);
      
      // Return a basic note if generation fails
      return {
        id: `note-${videoId}-${timestamp}-${Date.now()}`,
        videoId,
        userId,
        title: `Notes (Timestamp: ${Math.floor(timestamp / 60)}:${Math.floor(timestamp % 60).toString().padStart(2, '0')})`,
        content: "Failed to generate AI notes for this segment. Please try again later.",
        isAIGenerated: true,
        timestamp,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        tags: []
      };
    }
  }
}

// Create singleton instance
export const geminiNotesGenerator = new GeminiNotesGenerator();

export default geminiNotesGenerator;
