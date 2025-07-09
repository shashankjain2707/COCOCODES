from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from googleapiclient.discovery import build
import re

# Import the quiz and notes modules
from quiz import generate_quiz_for_video
from notes import generate_notes_for_video

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Get YouTube API key from environment variable
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

# Create YouTube API client
def get_youtube_client():
    if not YOUTUBE_API_KEY:
        return None
    return build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

# Helper function to extract video ID from YouTube URL
def extract_video_id(url):
    if not url:
        return None
    
    # Remove any whitespace
    url = url.strip()
    
    # YouTube video ID regex patterns
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match and match.group(1):
            return match.group(1)
    
    # If it's just a video ID (11 characters)
    if re.match(r'^[a-zA-Z0-9_-]{11}$', url):
        return url
    
    return None

@app.route('/api/video/metadata', methods=['GET'])
def get_video_metadata():
    video_id_or_url = request.args.get('videoId')
    
    if not video_id_or_url:
        return jsonify({
            'success': False,
            'error': {
                'type': 'MISSING_PARAMETER',
                'message': 'videoId parameter is required'
            }
        }), 400
    
    video_id = extract_video_id(video_id_or_url)
    
    if not video_id:
        return jsonify({
            'success': False,
            'error': {
                'type': 'PARSING_ERROR',
                'message': 'Invalid YouTube video ID or URL'
            }
        }), 400
    
    try:
        youtube = get_youtube_client()
        
        if not youtube:
            return jsonify({
                'success': False,
                'error': {
                    'type': 'API_KEY_ERROR',
                    'message': 'YouTube API key not configured'
                }
            }), 500
        
        # Get video details from YouTube API
        response = youtube.videos().list(
            part='snippet,contentDetails,statistics',
            id=video_id
        ).execute()
        
        if not response.get('items'):
            return jsonify({
                'success': False,
                'error': {
                    'type': 'VIDEO_NOT_FOUND',
                    'message': 'Video not found or not accessible'
                }
            }), 404
        
        video_data = response['items'][0]
        snippet = video_data['snippet']
        content_details = video_data['contentDetails']
        statistics = video_data.get('statistics', {})
        
        # Parse ISO 8601 duration format
        duration_str = content_details.get('duration', 'PT0S')  # Default to 0 seconds
        
        # Format thumbnail URL
        thumbnails = snippet.get('thumbnails', {})
        thumbnail_url = (
            thumbnails.get('high', {}).get('url') or
            thumbnails.get('medium', {}).get('url') or
            thumbnails.get('default', {}).get('url') or
            f'https://img.youtube.com/vi/{video_id}/hqdefault.jpg'
        )
        
        # Create response object
        metadata = {
            'id': video_id,
            'title': snippet.get('title', 'Unknown Title'),
            'author': snippet.get('channelTitle', 'Unknown Author'),
            'duration': duration_str,  # Client can parse this if needed
            'thumbnailUrl': thumbnail_url,
            'publishedAt': snippet.get('publishedAt'),
            'description': snippet.get('description', ''),
            'viewCount': statistics.get('viewCount'),
            'likeCount': statistics.get('likeCount'),
            'commentCount': statistics.get('commentCount'),
            'tags': snippet.get('tags', []),
            'categoryId': snippet.get('categoryId')
        }
        
        return jsonify({
            'success': True,
            'data': metadata
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'type': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500

@app.route('/api/playlist/metadata', methods=['GET'])
def get_playlist_metadata():
    playlist_id = request.args.get('playlistId')
    
    if not playlist_id:
        return jsonify({
            'success': False,
            'error': {
                'type': 'MISSING_PARAMETER',
                'message': 'playlistId parameter is required'
            }
        }), 400
    
    try:
        youtube = get_youtube_client()
        
        if not youtube:
            return jsonify({
                'success': False,
                'error': {
                    'type': 'API_KEY_ERROR',
                    'message': 'YouTube API key not configured'
                }
            }), 500
        
        # Get playlist details
        playlist_response = youtube.playlists().list(
            part='snippet,contentDetails',
            id=playlist_id
        ).execute()
        
        if not playlist_response.get('items'):
            return jsonify({
                'success': False,
                'error': {
                    'type': 'PLAYLIST_NOT_FOUND',
                    'message': 'Playlist not found or not accessible'
                }
            }), 404
        
        playlist_data = playlist_response['items'][0]
        playlist_snippet = playlist_data['snippet']
        playlist_details = playlist_data['contentDetails']
        
        # Get playlist items (videos)
        videos = []
        next_page_token = None
        
        # Limit to 50 videos to avoid excessive API usage
        max_results = 50
        
        while True:
            playlist_items_response = youtube.playlistItems().list(
                part='snippet,contentDetails',
                playlistId=playlist_id,
                maxResults=min(max_results - len(videos), 50),  # YouTube API allows max 50 per request
                pageToken=next_page_token
            ).execute()
            
            # Extract video IDs
            video_ids = [item['contentDetails']['videoId'] for item in playlist_items_response.get('items', [])]
            
            if video_ids:
                # Get video details for all videos in one request
                videos_response = youtube.videos().list(
                    part='snippet,contentDetails,statistics',
                    id=','.join(video_ids)
                ).execute()
                
                for video in videos_response.get('items', []):
                    video_snippet = video['snippet']
                    video_content = video['contentDetails']
                    
                    thumbnails = video_snippet.get('thumbnails', {})
                    thumbnail_url = (
                        thumbnails.get('high', {}).get('url') or
                        thumbnails.get('medium', {}).get('url') or
                        thumbnails.get('default', {}).get('url') or
                        f'https://img.youtube.com/vi/{video["id"]}/hqdefault.jpg'
                    )
                    
                    videos.append({
                        'id': video['id'],
                        'title': video_snippet.get('title', 'Unknown Title'),
                        'description': video_snippet.get('description', ''),
                        'thumbnailUrl': thumbnail_url,
                        'duration': video_content.get('duration', 'PT0S'),
                        'author': video_snippet.get('channelTitle', 'Unknown'),
                        'publishedAt': video_snippet.get('publishedAt')
                    })
            
            next_page_token = playlist_items_response.get('nextPageToken')
            
            if not next_page_token or len(videos) >= max_results:
                break
        
        # Create playlist metadata
        thumbnails = playlist_snippet.get('thumbnails', {})
        thumbnail_url = (
            thumbnails.get('high', {}).get('url') or
            thumbnails.get('medium', {}).get('url') or
            thumbnails.get('default', {}).get('url')
        )
        
        playlist_metadata = {
            'id': playlist_id,
            'title': playlist_snippet.get('title', 'Unknown Playlist'),
            'description': playlist_snippet.get('description', ''),
            'thumbnailUrl': thumbnail_url,
            'channelTitle': playlist_snippet.get('channelTitle', 'Unknown Channel'),
            'itemCount': playlist_details.get('itemCount', 0),
            'publishedAt': playlist_snippet.get('publishedAt'),
            'videos': videos
        }
        
        return jsonify({
            'success': True,
            'data': playlist_metadata
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'type': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500

@app.route('/api/notes/generate', methods=['GET'])
def generate_notes():
    video_id_or_url = request.args.get('videoId')
    note_type = request.args.get('type', default='comprehensive')
    
    if not video_id_or_url:
        return jsonify({
            'success': False,
            'error': {
                'type': 'MISSING_PARAMETER',
                'message': 'videoId parameter is required'
            }
        }), 400
    
    # Validate note type
    valid_note_types = ['comprehensive', 'summary', 'key_points', 'study_guide']
    if note_type not in valid_note_types:
        return jsonify({
            'success': False,
            'error': {
                'type': 'INVALID_PARAMETER',
                'message': f'Invalid note type. Must be one of: {", ".join(valid_note_types)}'
            }
        }), 400
    
    try:
        # Use the notes module to generate notes
        result = generate_notes_for_video(video_id_or_url, note_type)
        
        if not result.get('success', False):
            return jsonify(result), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'type': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500

@app.route('/api/quiz/generate', methods=['GET'])
def generate_quiz():
    video_id_or_url = request.args.get('videoId')
    num_questions = request.args.get('questions', default=4, type=int)
    
    if not video_id_or_url:
        return jsonify({
            'success': False,
            'error': {
                'type': 'MISSING_PARAMETER',
                'message': 'videoId parameter is required'
            }
        }), 400
    
    try:
        # Use the quiz module to generate a quiz
        result = generate_quiz_for_video(video_id_or_url, num_questions)
        
        if not result.get('success', False):
            return jsonify(result), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'type': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
