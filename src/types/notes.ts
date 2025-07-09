/**
 * Notes Types
 * Data structures for the AI-generated notes feature
 */

export type NoteType = 'comprehensive' | 'summary' | 'key_points' | 'study_guide';

export interface NotesData {
  notes: string;
  note_type: NoteType;
  transcript_summary: {
    length: number;
    sample: string;
  };
}

export interface NotesResponse {
  success: boolean;
  data?: NotesData;
  error?: {
    type: string;
    message: string;
  };
}
