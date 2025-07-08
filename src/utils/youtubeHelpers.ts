// YouTube URL parsing and validation utilities
// Phase 1 Implementation

import { YouTubeUrlInfo } from '../types/video';

/**
 * Extracts video ID from various YouTube URL formats
 * Supports:
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 * - youtube.com/v/VIDEO_ID
 */
export const extractVideoId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;

  // Remove any whitespace
  url = url.trim();

  // YouTube video ID regex patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If it's just a video ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
};

/**
 * Extracts playlist ID from YouTube URL
 */
export const extractPlaylistId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;

  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

/**
 * Extracts start time from YouTube URL (t parameter)
 */
export const extractStartTime = (url: string): number | null => {
  if (!url || typeof url !== 'string') return null;

  // Look for t parameter (seconds)
  const timeMatch = url.match(/[?&]t=(\d+)/);
  if (timeMatch) {
    return parseInt(timeMatch[1], 10);
  }

  // Look for time in format like "1m30s" or "90s"
  const timeFormatMatch = url.match(/[?&]t=(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
  if (timeFormatMatch) {
    const hours = parseInt(timeFormatMatch[1] || '0', 10);
    const minutes = parseInt(timeFormatMatch[2] || '0', 10);
    const seconds = parseInt(timeFormatMatch[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  return null;
};

/**
 * Comprehensive YouTube URL parser
 */
export const parseYouTubeUrl = (url: string): YouTubeUrlInfo => {
  const videoId = extractVideoId(url);
  const playlistId = extractPlaylistId(url);
  const startTime = extractStartTime(url);

  if (videoId) {
    return {
      videoId,
      playlistId: playlistId || undefined,
      startTime: startTime || undefined,
      isValid: true,
      type: 'video',
    };
  }

  if (playlistId) {
    return {
      playlistId,
      startTime: startTime || undefined,
      isValid: true,
      type: 'playlist',
    };
  }

  return {
    isValid: false,
    type: 'invalid',
  };
};

/**
 * Validates if a string is a valid YouTube URL or video ID
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  const parsed = parseYouTubeUrl(url);
  return parsed.isValid;
};

/**
 * Generates clean YouTube URLs for embedding
 */
export const generateEmbedUrl = (videoId: string, options: {
  autoplay?: boolean;
  controls?: boolean;
  showInfo?: boolean;
  startTime?: number;
} = {}): string => {
  const params = new URLSearchParams();
  
  // Distraction-free parameters
  params.set('modestbranding', '1'); // Minimal YouTube branding
  params.set('rel', '0'); // Don't show related videos
  params.set('showinfo', '0'); // Don't show video info
  params.set('iv_load_policy', '3'); // Don't show annotations
  
  // Optional parameters
  if (options.autoplay) params.set('autoplay', '1');
  if (options.controls !== undefined) params.set('controls', options.controls ? '1' : '0');
  if (options.startTime) params.set('start', options.startTime.toString());

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

/**
 * Generates thumbnail URL for a video
 */
export const generateThumbnailUrl = (videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'): string => {
  const qualityMap = {
    'default': 'default.jpg',
    'medium': 'mqdefault.jpg',
    'high': 'hqdefault.jpg',
    'standard': 'sddefault.jpg',
    'maxres': 'maxresdefault.jpg',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}`;
};

/**
 * Formats duration from seconds to readable format (e.g., "1:23:45" or "5:30")
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Parses duration string (e.g., "1:23:45") to seconds
 */
export const parseDuration = (duration: string): number => {
  const parts = duration.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 3) {
    // Hours:Minutes:Seconds
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // Minutes:Seconds
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // Just seconds
    return parts[0];
  }
  
  return 0;
};

/**
 * Validates video ID format
 */
export const isValidVideoId = (videoId: string): boolean => {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
};

/**
 * Cleans and normalizes YouTube URLs
 */
export const normalizeYouTubeUrl = (url: string): string | null => {
  const parsed = parseYouTubeUrl(url);
  
  if (!parsed.isValid || !parsed.videoId) {
    return null;
  }

  let normalizedUrl = `https://www.youtube.com/watch?v=${parsed.videoId}`;
  
  if (parsed.playlistId) {
    normalizedUrl += `&list=${parsed.playlistId}`;
  }
  
  if (parsed.startTime) {
    normalizedUrl += `&t=${parsed.startTime}`;
  }
  
  return normalizedUrl;
};
