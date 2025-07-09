# Python Server for YouTube Metadata

This folder contains a Python server that handles all YouTube API interactions for the COCOCODES project.

## Features

1. **YouTube Video Metadata**: Fetch metadata (title, description, etc.) for any YouTube video
2. **YouTube Playlist Metadata**: Fetch metadata for YouTube playlists and their videos
3. **Quiz Generation**: Generate quizzes based on YouTube video transcripts using Google Gemini AI
4. **AI Notes Generation**: Create structured notes from video transcripts using Google Gemini AI

## Setup Instructions

1. **Create a virtual environment**:
   ```bash
   python -m venv venv
   ```

2. **Activate the virtual environment**:
   - On Windows:
     ```bash
     .\venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install flask python-dotenv google-api-python-client
   ```

4. **Configure environment variables**:
   Create a `.env` file in the `py-server` directory with the following content:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5000
   ```

5. **Run the server**:
   ```bash
   python app.py
   ```

The server should now be running at `http://localhost:5000`.

## API Endpoints

### 1. Video Metadata

**Endpoint**: `/api/video/metadata`  
**Method**: GET  
**Parameters**:
- `videoId`: YouTube video ID or URL

**Example**:
```
GET /api/video/metadata?videoId=dQw4w9WgXcQ
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "dQw4w9WgXcQ",
    "title": "Rick Astley - Never Gonna Give You Up (Official Music Video)",
    "author": "Rick Astley",
    "duration": "PT3M33S",
    "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "publishedAt": "2009-10-25T06:57:33Z",
    "description": "...",
    "viewCount": "1334943323",
    "likeCount": "15473110",
    "commentCount": "2345782",
    "tags": ["Rick Astley", "Never Gonna Give You Up", "..."],
    "categoryId": "10"
  }
}
```

### 2. Playlist Metadata

**Endpoint**: `/api/playlist/metadata`  
**Method**: GET  
**Parameters**:
- `playlistId`: YouTube playlist ID

**Example**:
```
GET /api/playlist/metadata?playlistId=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI",
    "title": "Example Playlist",
    "description": "...",
    "thumbnailUrl": "https://i.ytimg.com/vi/...",
    "channelTitle": "Example Channel",
    "itemCount": 50,
    "publishedAt": "2022-01-01T00:00:00Z",
    "videos": [
      {
        "id": "video_id_1",
        "title": "Video 1",
        "description": "...",
        "thumbnailUrl": "https://i.ytimg.com/vi/...",
        "duration": "PT5M30S",
        "author": "Example Author",
        "publishedAt": "2022-01-01T00:00:00Z"
      },
      // More videos...
    ]
  }
}
```

## Error Handling

All endpoints return a standard error format:

```json
{
  "success": false,
  "error": {
    "type": "ERROR_TYPE",
    "message": "Human-readable error message"
  }
}
```

Common error types:
- `MISSING_PARAMETER`: Required parameter is missing
- `PARSING_ERROR`: Could not parse video ID from URL
- `API_KEY_ERROR`: YouTube API key not configured
- `VIDEO_NOT_FOUND`: Video not found or not accessible
- `PLAYLIST_NOT_FOUND`: Playlist not found or not accessible
- `SERVER_ERROR`: Internal server error

### 3. Quiz Generation

**Endpoint**: `/api/quiz/generate`  
**Method**: GET  
**Parameters**:
- `videoId`: YouTube video ID or URL
- `questions` (optional): Number of questions to generate (default: 4)

**Example**:
```
GET /api/quiz/generate?videoId=dQw4w9WgXcQ&questions=5
```

**Response**:
```json
{
  "success": true,
  "data": {
    "quiz": {
      "quiz": [
        {
          "question": "What is the main theme of the song 'Never Gonna Give You Up'?",
          "options": {
            "A": "Heartbreak and betrayal",
            "B": "Commitment and dedication",
            "C": "Fame and fortune",
            "D": "Rebellion and independence"
          },
          "correct_answer": "B",
          "explanation": "The song consistently emphasizes the singer's commitment to never giving up on, letting down, or deserting the person they care about."
        },
        // More questions...
      ]
    },
    "transcript_summary": {
      "length": 1524,
      "segments": 42,
      "sample": "[00:00] We're no strangers to love..."
    }
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "type": "TRANSCRIPT_UNAVAILABLE",
    "message": "No transcripts available for this video"
  }
}
```

Common error types:
- `MISSING_PARAMETER`: Required parameter is missing
- `PARSING_ERROR`: Could not parse video ID from URL
- `TRANSCRIPT_UNAVAILABLE`: Video transcript is not available
- `SERVER_ERROR`: Internal server error

### 4. AI Notes Generation

**Endpoint**: `/api/notes/generate`  
**Method**: GET  
**Description**: Generates AI-powered study notes from a YouTube video transcript in various formats.

**Parameters**:
- `videoId`: YouTube video ID or URL (required)
- `type` (optional): Type of notes to generate (default: "comprehensive")
  - Valid types: "comprehensive", "summary", "key_points", "study_guide"

**Example**:
```
GET /api/notes/generate?videoId=dQw4w9WgXcQ&type=key_points
```

**Response**:
```json
{
  "success": true,
  "data": {
    "notes": "## Key Points\n\n- The song 'Never Gonna Give You Up' was released in 1987 by Rick Astley\n- The lyrics emphasize commitment and dedication to a relationship\n- The chorus repeats the phrase 'never gonna give you up, never gonna let you down'\n- The music video features Rick Astley singing and dancing\n- The song became an internet phenomenon known as 'Rickrolling'",
    "note_type": "key_points",
    "transcript_summary": {
      "length": 1524,
      "sample": "We're no strangers to love, you know the rules and so do I..."
    }
  }
}
```

**Note Types Explained**:

1. **comprehensive**: Detailed notes with all important concepts, definitions, examples, and relationships
2. **summary**: Brief overview focusing on main ideas and conclusions only
3. **key_points**: List of essential facts, statistics, definitions, and concepts
4. **study_guide**: Learning resource with summary, key concepts, important facts, relationships, and sample questions

**Error Response**:
```json
{
  "success": false,
  "error": {
    "type": "TRANSCRIPT_UNAVAILABLE",
    "message": "No transcripts available for this video"
  }
}
```

Common error types:
- `MISSING_PARAMETER`: Required parameter is missing
- `INVALID_PARAMETER`: Invalid note type specified
- `PARSING_ERROR`: Could not parse video ID from URL
- `TRANSCRIPT_UNAVAILABLE`: Video transcript is not available
- `SERVER_ERROR`: Internal server error
