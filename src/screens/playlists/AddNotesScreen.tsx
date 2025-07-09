import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { playlistService, NoteLinkData } from '../../services/playlists/playlistService';

interface NoteLink {
  id: string;
  url: string;
  title: string;
  description: string;
  type: 'notion' | 'google-docs' | 'github' | 'other';
}

export const AddNotesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [noteLinks, setNoteLinks] = useState<NoteLink[]>([]);
  const [currentLink, setCurrentLink] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const detectNoteType = (url: string): 'notion' | 'google-docs' | 'github' | 'other' => {
    if (url.includes('notion.so') || url.includes('notion.site')) return 'notion';
    if (url.includes('docs.google.com')) return 'google-docs';
    if (url.includes('github.com')) return 'github';
    return 'other';
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'notion': return 'file-document-outline';
      case 'google-docs': return 'google-drive';
      case 'github': return 'github';
      default: return 'link';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'notion': return theme.colors.slate[400];
      case 'google-docs': return theme.colors.blue[400];
      case 'github': return theme.colors.slate[300];
      default: return theme.colors.slate[400];
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const addNoteLink = async () => {
    if (!currentLink.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    if (!validateUrl(currentLink)) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    if (!currentTitle.trim()) {
      Alert.alert('Error', 'Please enter a title for the note');
      return;
    }

    // Check if link already exists
    if (noteLinks.some(link => link.url === currentLink)) {
      Alert.alert('Error', 'This link is already added');
      return;
    }

    setIsLoading(true);
    try {
      const newNote: NoteLink = {
        id: Date.now().toString(),
        url: currentLink,
        title: currentTitle,
        description: currentDescription,
        type: detectNoteType(currentLink),
      };

      setNoteLinks([...noteLinks, newNote]);
      setCurrentLink('');
      setCurrentTitle('');
      setCurrentDescription('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add note link');
    } finally {
      setIsLoading(false);
    }
  };

  const removeNoteLink = (id: string) => {
    setNoteLinks(noteLinks.filter(link => link.id !== id));
  };

  const saveNotes = async () => {
    if (noteLinks.length === 0) {
      Alert.alert('Error', 'Please add at least one note link');
      return;
    }

    setIsLoading(true);
    try {
      const notes = noteLinks.map(note => ({
        id: note.id,
        url: note.url,
        title: note.title,
        description: note.description,
        type: note.type,
      }));

      await playlistService.saveNoteLinks(notes);
      Alert.alert('Success', 'Notes saved successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error saving notes:', error);
      Alert.alert('Error', 'Failed to save notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>Add Notes</Text>
          <TouchableOpacity onPress={saveNotes} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <MaterialCommunityIcons name="note-plus" size={48} color={theme.colors.green[400]} />
            <Text style={styles.instructionsTitle}>Add Note Links</Text>
            <Text style={styles.instructionsText}>
              Store links to your notes from Notion, Google Docs, GitHub, or any other platform.
            </Text>
          </View>

          {/* Add Note Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add New Note Link</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>URL *</Text>
              <TextInput
                style={styles.input}
                value={currentLink}
                onChangeText={setCurrentLink}
                placeholder="https://notion.so/my-notes or https://docs.google.com/..."
                placeholderTextColor={theme.colors.slate[400]}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                value={currentTitle}
                onChangeText={setCurrentTitle}
                placeholder="Enter note title"
                placeholderTextColor={theme.colors.slate[400]}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={currentDescription}
                onChangeText={setCurrentDescription}
                placeholder="Brief description of the note"
                placeholderTextColor={theme.colors.slate[400]}
                multiline
                numberOfLines={2}
              />
            </View>

            <TouchableOpacity 
              onPress={addNoteLink} 
              style={[styles.addButton, isLoading && styles.disabledButton]}
              disabled={isLoading}
            >
              <MaterialCommunityIcons 
                name={isLoading ? "loading" : "plus"} 
                size={20} 
                color={theme.colors.white} 
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Add Note Link</Text>
            </TouchableOpacity>
          </View>

          {/* Note Links List */}
          {noteLinks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Note Links ({noteLinks.length})</Text>
              {noteLinks.map((note) => (
                <View key={note.id} style={styles.noteItem}>
                  <View style={styles.noteInfo}>
                    <MaterialCommunityIcons 
                      name={getTypeIcon(note.type) as any} 
                      size={20} 
                      color={getTypeColor(note.type)} 
                    />
                    <View style={styles.noteDetails}>
                      <Text style={styles.noteTitle}>{note.title}</Text>
                      {note.description && (
                        <Text style={styles.noteDescription}>{note.description}</Text>
                      )}
                      <Text style={styles.noteUrl} numberOfLines={1}>{note.url}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => removeNoteLink(note.id)}
                    style={styles.removeButton}
                  >
                    <MaterialCommunityIcons name="close" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Supported Platforms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Supported Platforms</Text>
            <View style={styles.platformsGrid}>
              <View style={styles.platformItem}>
                <MaterialCommunityIcons name="file-document-outline" size={24} color={theme.colors.slate[400]} />
                <Text style={styles.platformText}>Notion</Text>
              </View>
              <View style={styles.platformItem}>
                <MaterialCommunityIcons name="google-drive" size={24} color={theme.colors.blue[400]} />
                <Text style={styles.platformText}>Google Docs</Text>
              </View>
              <View style={styles.platformItem}>
                <MaterialCommunityIcons name="github" size={24} color={theme.colors.slate[300]} />
                <Text style={styles.platformText}>GitHub</Text>
              </View>
              <View style={styles.platformItem}>
                <MaterialCommunityIcons name="link" size={24} color={theme.colors.slate[400]} />
                <Text style={styles.platformText}>Other</Text>
              </View>
            </View>
          </View>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.green[500],
    borderRadius: 8,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  instructionsContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: theme.colors.slate[300],
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.colors.slate[300],
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: theme.colors.white,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.green[500],
    borderRadius: 8,
    paddingVertical: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  noteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  noteDetails: {
    marginLeft: 12,
    flex: 1,
  },
  noteTitle: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  noteDescription: {
    color: theme.colors.slate[300],
    fontSize: 12,
    marginTop: 2,
  },
  noteUrl: {
    color: theme.colors.slate[400],
    fontSize: 11,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  platformItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    minWidth: 80,
  },
  platformText: {
    color: theme.colors.slate[300],
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
