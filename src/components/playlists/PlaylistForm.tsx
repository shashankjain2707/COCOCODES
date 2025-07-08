import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Playlist, Category } from '../../types/userContent';

interface PlaylistFormProps {
  initialValues?: Partial<Playlist>;
  categoryId?: string; // Optional pre-selected category
  onSubmit: (values: Partial<Playlist>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const PlaylistForm: React.FC<PlaylistFormProps> = ({
  initialValues = {},
  categoryId,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { categories } = useSelector((state: RootState) => state.userContent);
  
  // Form state
  const [title, setTitle] = useState(initialValues.title || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialValues.categoryIds || (categoryId ? [categoryId] : [])
  );
  const [tags, setTags] = useState<string[]>(initialValues.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(initialValues.isPublic || false);

  // Convert categories object to array for display
  const categoriesArray = Object.values(categories);

  const handleCategoryToggle = (id: string) => {
    if (selectedCategoryIds.includes(id)) {
      setSelectedCategoryIds(selectedCategoryIds.filter((catId) => catId !== id));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, id]);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = () => {
    // Validate inputs
    if (!title.trim()) {
      Alert.alert('Error', 'Playlist title is required');
      return;
    }

    // Prepare the playlist data
    const playlistData: Partial<Playlist> = {
      ...initialValues,
      title: title.trim(),
      description: description.trim(),
      categoryIds: selectedCategoryIds,
      tags,
      isPublic,
    };

    onSubmit(playlistData);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>Playlist Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter playlist title"
        placeholderTextColor="#999"
        maxLength={100}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter playlist description"
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
        maxLength={500}
      />

      <Text style={styles.label}>Categories</Text>
      {categoriesArray.length === 0 ? (
        <Text style={styles.noCategories}>
          No categories available. Create categories first.
        </Text>
      ) : (
        <View style={styles.categoriesContainer}>
          {categoriesArray.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategoryIds.includes(category.id) && styles.selectedCategoryChip,
              ]}
              onPress={() => handleCategoryToggle(category.id)}
            >
              <Icon
                name={category.icon || 'folder'}
                size={16}
                color={selectedCategoryIds.includes(category.id) ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategoryIds.includes(category.id) && styles.selectedCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.label}>Tags</Text>
      <View style={styles.tagInputContainer}>
        <TextInput
          style={styles.tagInput}
          value={tagInput}
          onChangeText={setTagInput}
          placeholder="Add a tag and press +"
          placeholderTextColor="#999"
          onSubmitEditing={handleAddTag}
        />
        <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
          <Icon name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tagsContainer}>
        {tags.map((tag) => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagText}>{tag}</Text>
            <TouchableOpacity
              style={styles.removeTagButton}
              onPress={() => handleRemoveTag(tag)}
            >
              <Icon name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Text style={styles.label}>Visibility</Text>
      <View style={styles.visibilityContainer}>
        <TouchableOpacity
          style={[
            styles.visibilityOption,
            !isPublic && styles.selectedVisibilityOption,
          ]}
          onPress={() => setIsPublic(false)}
        >
          <Text
            style={[
              styles.visibilityText,
              !isPublic && styles.selectedVisibilityText,
            ]}
          >
            Private
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.visibilityOption,
            isPublic && styles.selectedVisibilityOption,
          ]}
          onPress={() => setIsPublic(true)}
        >
          <Text
            style={[
              styles.visibilityText,
              isPublic && styles.selectedVisibilityText,
            ]}
          >
            Public
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Saving...' : initialValues.id ? 'Update' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  selectedCategoryChip: {
    backgroundColor: '#3B82F6',
  },
  categoryText: {
    marginLeft: 4,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  noCategories: {
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  addTagButton: {
    backgroundColor: '#3B82F6',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  tagText: {
    color: '#fff',
    marginRight: 4,
  },
  removeTagButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  visibilityContainer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  visibilityOption: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  selectedVisibilityOption: {
    backgroundColor: '#3B82F6',
  },
  visibilityText: {
    fontWeight: 'bold',
    color: '#666',
  },
  selectedVisibilityText: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PlaylistForm;
