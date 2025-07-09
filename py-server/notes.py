"""
AI Notes Generator for YouTube Videos
Uses Google Gemini AI to generate structured notes based on video transcripts
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai
from quiz import extract_video_id, get_transcript, clean_transcript_text

# Load environment variables
load_dotenv()

# Set Gemini API key from environment
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', "")

def initialize_gemini():
    """Initialize the Google Gemini API client"""
    try:
        api_key = GEMINI_API_KEY
        if not api_key or api_key == "your-gemini-api-key-here":
            raise ValueError("Gemini API key not configured")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        print(f"✅ Using Gemini API key: {api_key[:5]}...{api_key[-4:] if len(api_key) > 9 else ''}")
        return model
    except Exception as e:
        raise ValueError(f"Failed to initialize Gemini API: {str(e)}")

def generate_notes(transcript_text, note_type="comprehensive"):
    """
    Generate structured notes from video transcript
    
    Parameters:
    - transcript_text: The transcript text from the video
    - note_type: Type of notes to generate (comprehensive, summary, key_points, study_guide)
    
    Returns:
    - Dictionary with success flag and generated notes or error
    """
    try:
        model = initialize_gemini()
        clean_text = clean_transcript_text(transcript_text)
        
        # Different prompts based on note type
        prompts = {
            "comprehensive": """
                Create comprehensive notes from this video transcript. 
                Format the notes with clear sections, bullet points, and hierarchical organization.
                Include all important concepts, definitions, examples, and relationships.
                
                Structure your response in markdown format with:
                - Main topic headings (##)
                - Subtopics (###)
                - Bullet points for details
                - Numbered lists for sequential information
                - Bold for important terms
                - Include a brief summary at the beginning
            """,
            
            "summary": """
                Create a concise summary of this video transcript.
                Focus on the main ideas and conclusions only.
                Keep it brief but comprehensive, capturing the essence of the content.
                
                Format your response in markdown with:
                - A title (# Summary)
                - 3-5 bullet points of key takeaways
                - A 1-2 paragraph summary of the content
            """,
            
            "key_points": """
                Extract just the key points from this video transcript.
                Focus on facts, statistics, definitions, and essential concepts.
                
                Format your response in markdown as a list of key points with:
                - ## Key Points
                - Bullet points for each important piece of information
                - Bold for terms, numbers, or dates
                - Group related points under ### subheadings if appropriate
            """,
            
            "study_guide": """
                Create a study guide from this video transcript.
                Format it as a learning resource with sections for:
                
                ## Summary (brief overview)
                ## Key Concepts (definitions and explanations)
                ## Important Facts (bullet points)
                ## Relationships (how concepts connect)
                ## Sample Questions (3-5 questions to test understanding)
                
                Use markdown formatting with appropriate headings, bullet points, 
                and emphasis for important terms.
            """
        }
        
        # Default to comprehensive if type not found
        prompt_template = prompts.get(note_type, prompts["comprehensive"])
        
        # Build the full prompt
        prompt = f"""
        {prompt_template}
        
        VIDEO TRANSCRIPT:
        {clean_text}
        """
        
        print(f"🤖 Generating {note_type} notes using Google Gemini...")
        response = model.generate_content(prompt)
        notes_content = response.text.strip()
        
        return {
            "success": True,
            "data": {
                "notes": notes_content,
                "note_type": note_type,
                "transcript_summary": {
                    "length": len(clean_text),
                    "sample": clean_text[:200] + "..." if len(clean_text) > 200 else clean_text
                }
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": {
                "type": "SERVER_ERROR",
                "message": f"Failed to generate notes: {str(e)}"
            }
        }

# Main function to generate notes for a video
def generate_notes_for_video(video_id_or_url, note_type="comprehensive"):
    """Main function to generate notes for a YouTube video"""
    # Step 1: Get the transcript
    transcript_result = get_transcript(video_id_or_url)
    if not transcript_result["success"]:
        return transcript_result
    
    # Step 2: Generate the notes
    transcript_text = transcript_result["data"]["formatted"]
    notes_result = generate_notes(transcript_text, note_type)
    
    # Return the result
    if notes_result["success"]:
        return notes_result
    else:
        return notes_result
