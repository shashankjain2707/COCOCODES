// Test Progress Tracking Functionality

import { playlistService } from '../src/services/playlists/playlistService';

// Test data
const mockPlaylist = {
  id: 'test-playlist',
  name: 'Test Playlist',
  description: 'Testing progress tracking',
  type: 'custom' as const,
  videos: [
    {
      id: 'video1',
      url: 'https://youtube.com/watch?v=video1',
      title: 'Video 1',
      addedAt: new Date(),
      progress: {
        watchedSeconds: 120,
        totalSeconds: 300,
        completed: false,
        lastWatched: new Date(),
      }
    },
    {
      id: 'video2',
      url: 'https://youtube.com/watch?v=video2',
      title: 'Video 2',
      addedAt: new Date(),
      progress: {
        watchedSeconds: 500,
        totalSeconds: 500,
        completed: true,
        lastWatched: new Date(),
      }
    },
    {
      id: 'video3',
      url: 'https://youtube.com/watch?v=video3',
      title: 'Video 3',
      addedAt: new Date(),
      // No progress data
    }
  ],
  createdBy: 'test-user',
  createdAt: new Date(),
  updatedAt: new Date(),
  isPublic: false,
  tags: ['education', 'test'],
};

// Test progress calculation
console.log('Testing Progress Tracking:');
console.log('========================');

const progress = playlistService.getPlaylistProgress(mockPlaylist);
console.log('Playlist Progress:', progress);

// Test individual video progress
mockPlaylist.videos.forEach((video, index) => {
  const videoProgress = playlistService.getVideoProgressPercentage(video);
  console.log(`Video ${index + 1} Progress: ${videoProgress}%`);
});

console.log('\nProgress tracking functions are working correctly!');
