import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { playlistService, PlaylistData, NoteLinkData } from '../../services/playlists/playlistService';
import { auth, onAuthStateChanged } from '../../services/firebase/config';
import { authService } from '../../services/firebase/auth';

export const LibraryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [notes, setNotes] = useState<NoteLinkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(false);

  const loadPlaylists = async () => {
    try {
      // Check if user is authenticated
      if (!user) {
        console.log('User not authenticated, showing empty state');
        setPlaylists([]);
        return;
      }
      
      const userPlaylists = await playlistService.getUserPlaylists();
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
      Alert.alert('Error', 'Failed to load playlists. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      // Check if user is authenticated
      if (!user) {
        console.log('User not authenticated, showing empty notes');
        setNotes([]);
        return;
      }
      
      const userNotes = await playlistService.getUserNoteLinks();
      setNotes(userNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      Alert.alert('Error', 'Failed to load notes. Please try again.');
    }
  };

  const handleSignIn = async () => {
    try {
      setAuthLoading(true);
      await authService.signInWithGoogle();
      // User state will be updated by the auth listener
    } catch (error) {
      console.error('Sign in failed:', error);
      Alert.alert('Sign In Failed', 'Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadPlaylists(), loadNotes()]);
    setRefreshing(false);
  };

  const handlePlaylistPress = (playlist: PlaylistData) => {
    console.log('Navigating to playlist:', playlist.id, playlist.name);
    
    if (!playlist.id) {
      Alert.alert('Error', 'Invalid playlist ID');
      return;
    }
    
    navigation.navigate('PlaylistDetail' as any, {
      playlistId: playlist.id,
      title: playlist.name,
    });
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'notion': return 'file-document-outline';
      case 'google-docs': return 'google-drive';
      case 'github': return 'github';
      default: return 'link';
    }
  };

  useEffect(() => {
    // Set up auth listener
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        // User signed in, load data
        loadPlaylists();
        loadNotes();
      } else {
        // User signed out, clear data
        setPlaylists([]);
        setNotes([]);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={[theme.colors.slate[950], theme.colors.blue[950], theme.colors.navy[900]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Library</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreatePlaylist' as any)} style={styles.addButton}>
            <MaterialCommunityIcons name="plus" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Authentication check */}
          {!user ? (
            <View style={styles.authContainer}>
              <MaterialCommunityIcons name="account-circle" size={80} color={theme.colors.blue[400]} />
              <Text style={styles.authTitle}>Sign In Required</Text>
              <Text style={styles.authDescription}>
                Please sign in to access your playlists and notes
              </Text>
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSignIn}
                disabled={authLoading}
              >
                <MaterialCommunityIcons name="google" size={20} color={theme.colors.white} />
                <Text style={styles.signInButtonText}>
                  {authLoading ? 'Signing in...' : 'Sign in with Google'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Stats */}
              <View style={styles.stats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{playlists.length}</Text>
                  <Text style={styles.statLabel}>Playlists</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {playlists.reduce((total, playlist) => total + playlist.videos.length, 0)}
                  </Text>
                  <Text style={styles.statLabel}>Videos</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{notes.length}</Text>
                  <Text style={styles.statLabel}>Notes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {playlists.filter(p => p.type === 'imported').length}
                  </Text>
                  <Text style={styles.statLabel}>Imported</Text>
                </View>
              </View>

              {/* Playlists */}
              {isLoading ? (
            <View style={styles.loadingContainer}>
              <MaterialCommunityIcons name="loading" size={48} color={theme.colors.blue[400]} />
              <Text style={styles.loadingText}>Loading playlists...</Text>
            </View>
          ) : playlists.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="playlist-music" size={64} color={theme.colors.slate[400]} />
              <Text style={styles.emptyStateTitle}>No playlists yet</Text>
              <Text style={styles.emptyStateText}>Create your first playlist to get started</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => navigation.navigate('CreatePlaylist' as any)}
              >
                <MaterialCommunityIcons name="plus" size={20} color={theme.colors.white} />
                <Text style={styles.createButtonText}>Create Playlist</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.playlistsSection}>
              <Text style={styles.sectionTitle}>Your Playlists</Text>
              {playlists.map((playlist) => (
                <TouchableOpacity
                  key={playlist.id}
                  style={styles.playlistItem}
                  onPress={() => handlePlaylistPress(playlist)}
                >
                  <View style={styles.playlistInfo}>
                    <MaterialCommunityIcons 
                      name={playlist.type === 'imported' ? 'import' : 'playlist-music'} 
                      size={24} 
                      color={theme.colors.blue[400]} 
                    />
                    <View style={styles.playlistDetails}>
                      <Text style={styles.playlistName}>{playlist.name}</Text>
                      <Text style={styles.playlistMeta}>
                        {playlist.videos.length} video{playlist.videos.length !== 1 ? 's' : ''} • {playlist.type}
                      </Text>
                      {playlist.description && (
                        <Text style={styles.playlistDescription} numberOfLines={2}>
                          {playlist.description}
                        </Text>
                      )}
                      {/* Progress indicator */}
                      {(() => {
                        const progress = playlistService.getPlaylistProgress(playlist);
                        return progress.totalVideos > 0 && progress.completedVideos > 0 ? (
                          <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                              <View 
                                style={[
                                  styles.progressFill, 
                                  { width: `${progress.completionPercentage}%` }
                                ]} 
                              />
                            </View>
                            <Text style={styles.progressText}>
                              {progress.completedVideos}/{progress.totalVideos} completed
                            </Text>
                          </View>
                        ) : null;
                      })()}
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.slate[400]} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Notes Section */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Your Notes</Text>
            {notes.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="note-outline" size={48} color={theme.colors.slate[400]} />
                <Text style={styles.emptyStateText}>No notes yet</Text>
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={() => navigation.navigate('AddNotes' as any)}
                >
                  <MaterialCommunityIcons name="plus" size={20} color={theme.colors.white} />
                  <Text style={styles.createButtonText}>Add Notes</Text>
                </TouchableOpacity>
              </View>
            ) : (
              notes.slice(0, 5).map((note) => (
                <TouchableOpacity
                  key={note.id}
                  style={styles.noteItem}
                  onPress={() => {
                    // Open the note link in browser or handle accordingly
                    console.log('Opening note:', note.url);
                  }}
                >
                  <View style={styles.noteInfo}>
                    <MaterialCommunityIcons 
                      name={getTypeIcon(note.type || 'note') as any} 
                      size={24} 
                      color={theme.colors.green[400]} 
                    />
                    <View style={styles.noteDetails}>
                      <Text style={styles.noteName}>{note.title}</Text>
                      <Text style={styles.noteDescription} numberOfLines={2}>
                        {note.description || note.notes}
                      </Text>
                      <Text style={styles.noteUrl} numberOfLines={1}>
                        {note.url}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.slate[400]} />
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('CreatePlaylist' as any)}
            >
              <MaterialCommunityIcons name="plus-circle" size={20} color={theme.colors.white} />
              <Text style={styles.actionButtonText}>Create Playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ImportPlaylist' as any)}
            >
              <MaterialCommunityIcons name="import" size={20} color={theme.colors.white} />
              <Text style={styles.actionButtonText}>Import YouTube</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddNotes' as any)}
            >
              <MaterialCommunityIcons name="note-plus" size={20} color={theme.colors.white} />
              <Text style={styles.actionButtonText}>Add Notes</Text>
            </TouchableOpacity>
          </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  authDescription: {
    fontSize: 16,
    color: theme.colors.slate[300],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  signInButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.slate[400],
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.white,
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    marginTop: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.slate[400],
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[600],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  playlistsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 12,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  playlistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playlistDetails: {
    marginLeft: 12,
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 4,
  },
  playlistMeta: {
    fontSize: 14,
    color: theme.colors.slate[300],
    marginBottom: 4,
  },
  playlistDescription: {
    fontSize: 12,
    color: theme.colors.slate[400],
    lineHeight: 16,
  },
  progressContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1.5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.blue[400],
    borderRadius: 1.5,
  },
  progressText: {
    fontSize: 10,
    color: theme.colors.blue[400],
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  notesSection: {
    marginTop: 24,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  noteInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noteDetails: {
    flex: 1,
  },
  noteName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 4,
  },
  noteDescription: {
    fontSize: 12,
    color: theme.colors.slate[400],
    lineHeight: 16,
    marginBottom: 4,
  },
  noteUrl: {
    fontSize: 11,
    color: theme.colors.green[400],
    opacity: 0.7,
  },
});
