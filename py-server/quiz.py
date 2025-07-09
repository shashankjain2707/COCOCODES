"""
Quiz Generator Module for YouTube Videos
Uses Google Gemini AI to generate quizzes based on video transcripts
"""

import re
import json
import os
from dotenv import load_dotenv
import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

# Load environment variables
load_dotenv()

# Set Gemini API key from environment or use default
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

def extract_video_id(url):
    """Extract the video ID from a YouTube URL"""
    if not url:
        return None
    
    url = url.strip()
    patterns = [
        r"(?:v=|\/)([0-9A-Za-z_-]{11})",
        r"youtu\.be\/([0-9A-Za-z_-]{11})",
        r"youtube\.com\/embed\/([0-9A-Za-z_-]{11})",
        r"youtube\.com\/watch\?v=([0-9A-Za-z_-]{11})",
        r"youtube\.com\/live\/([0-9A-Za-z_-]{11})"
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    # If it's just a video ID (11 characters)
    if re.match(r'^[a-zA-Z0-9_-]{11}$', url):
        return url
        
    return None

def format_transcript_item(item):
    """Format a transcript item for display"""
    if hasattr(item, '_dict_'):
        item_dict = item._dict_
        text = item_dict.get('text', '')
        start = item_dict.get('start', 0)
    elif isinstance(item, dict):
        text = item.get('text', '')
        start = item.get('start', 0)
    else:
        try:
            text = item.text
            start = item.start
        except AttributeError:
            text = str(item)
            start = 0
    return text, start

def get_transcript(video_id_or_url):
    """Fetch the transcript for a YouTube video"""
    try:
        video_id = extract_video_id(video_id_or_url)
        if not video_id:
            return {
                "success": False,
                "error": {
                    "type": "PARSING_ERROR",
                    "message": "Invalid YouTube URL or video ID"
                }
            }
        
        print(f"🔍 Extracting transcript for video ID: {video_id}")
        
        try:
            # Try to get English transcript first
            transcript_data = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'en-US', 'en-GB'])
            print("✅ English transcript found!")
        except NoTranscriptFound:
            # Try to get any available transcript
            try:
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
                for transcript in transcript_list:
                    try:
                        transcript_data = transcript.fetch()
                        print(f"✅ Found transcript in {transcript.language_code}")
                        break
                    except Exception:
                        continue
                else:
                    return {
                        "success": False,
                        "error": {
                            "type": "TRANSCRIPT_UNAVAILABLE",
                            "message": "No transcripts available for this video"
                        }
                    }
            except Exception as e:
                return {
                    "success": False,
                    "error": {
                        "type": "TRANSCRIPT_UNAVAILABLE",
                        "message": f"Error accessing transcripts: {str(e)}"
                    }
                }
        
        # Format the transcript
        formatted_transcript = []
        raw_transcript = []
        
        for item in transcript_data:
            text, start = format_transcript_item(item)
            if text and text.strip():
                timestamp = f"[{int(start // 60):02d}:{int(start % 60):02d}]"
                formatted_transcript.append(f"{timestamp} {text.strip()}")
                raw_transcript.append({
                    "text": text.strip(),
                    "start": start,
                    "timestamp": f"{int(start // 60):02d}:{int(start % 60):02d}"
                })
        
        if not formatted_transcript:
            return {
                "success": False,
                "error": {
                    "type": "TRANSCRIPT_UNAVAILABLE",
                    "message": "No transcript content found"
                }
            }
        
        return {
            "success": True,
            "data": {
                "formatted": "\n".join(formatted_transcript),
                "raw": raw_transcript
            }
        }
        
    except TranscriptsDisabled:
        return {
            "success": False,
            "error": {
                "type": "TRANSCRIPT_UNAVAILABLE",
                "message": "Subtitles are disabled for this video"
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": {
                "type": "SERVER_ERROR",
                "message": f"Error: {str(e)}"
            }
        }

def clean_transcript_text(transcript):
    """Clean the transcript text for quiz generation"""
    # For formatted transcript with timestamps
    if isinstance(transcript, str):
        lines = transcript.split('\n')
        cleaned_text = []
        for line in lines:
            text = re.sub(r'\[\d{2}:\d{2}\]', '', line).strip()
            if text:
                cleaned_text.append(text)
        return ' '.join(cleaned_text)
    
    # For raw transcript data
    elif isinstance(transcript, list):
        return ' '.join([item.get('text', '') for item in transcript if item.get('text', '').strip()])
    
    return ""

def generate_mcq_quiz(transcript_text, num_questions=4):
    """Generate a multiple-choice quiz using Google Gemini AI"""
    try:
        model = initialize_gemini()
        clean_text = clean_transcript_text(transcript_text)
        
        # No transcript length limit since Gemini can handle it
        prompt = f"""Based on the following video transcript, create exactly {num_questions} multiple choice questions (MCQs) in English. Each question should have 4 options (A, B, C, D) with only one correct answer.

The questions should:
1. Test understanding of key concepts from the video
2. Be clear and well-structured
3. Have plausible wrong answers (distractors)
4. Cover different parts of the content

IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
{{
  "quiz": [
    {{
      "question": "Question text here?",
      "options": {{
        "A": "Option A text",
        "B": "Option B text", 
        "C": "Option C text",
        "D": "Option D text"
      }},
      "correct_answer": "A",
      "explanation": "Brief explanation of why this is correct"
    }}
    // more questions...
  ]
}}

Video Transcript:
{clean_text}"""
        
        print("🤖 Generating quiz questions using Google Gemini...")
        response = model.generate_content(prompt)
        quiz_content = response.text.strip()
        
        # Clean up the response to extract valid JSON
        if quiz_content.startswith('```json'):
            quiz_content = quiz_content[7:]
        if quiz_content.startswith('```'):
            quiz_content = quiz_content[3:]
        if quiz_content.endswith('```'):
            quiz_content = quiz_content[:-3]
        quiz_content = quiz_content.strip()
        
        try:
            quiz_data = json.loads(quiz_content)
            return {
                "success": True,
                "data": quiz_data
            }
        except json.JSONDecodeError:
            # Try to extract JSON from response if it's not properly formatted
            json_match = re.search(r'\{.*\}', quiz_content, re.DOTALL)
            if json_match:
                try:
                    quiz_data = json.loads(json_match.group())
                    return {
                        "success": True,
                        "data": quiz_data
                    }
                except json.JSONDecodeError:
                    return {
                        "success": False,
                        "error": {
                            "type": "PARSING_ERROR",
                            "message": "Could not parse quiz data from response"
                        }
                    }
            else:
                return {
                    "success": False,
                    "error": {
                        "type": "PARSING_ERROR",
                        "message": "Could not find valid JSON in response"
                    }
                }
    except Exception as e:
        return {
            "success": False,
            "error": {
                "type": "SERVER_ERROR",
                "message": f"Failed to generate quiz: {str(e)}"
            }
        }

# Main function to generate a quiz for a video
def generate_quiz_for_video(video_id_or_url, num_questions=4):
    """Main function to generate a quiz for a YouTube video"""
    # Step 1: Get the transcript
    transcript_result = get_transcript(video_id_or_url)
    if not transcript_result["success"]:
        return transcript_result
    
    # Step 2: Generate the quiz
    transcript_text = transcript_result["data"]["formatted"]
    quiz_result = generate_mcq_quiz(transcript_text, num_questions)
    
    # Return the result
    if quiz_result["success"]:
        return {
            "success": True,
            "data": {
                "quiz": quiz_result["data"],
                "transcript_summary": {
                    "length": len(transcript_text),
                    "segments": len(transcript_result["data"]["raw"]),
                    "sample": transcript_text[:200] + "..." if len(transcript_text) > 200 else transcript_text
                }
            }
        }
    else:
        return quiz_result
