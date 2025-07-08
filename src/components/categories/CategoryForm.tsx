import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Category } from '../../types/userContent';

interface CategoryFormProps {
  initialValues?: Partial<Category>;
  onSubmit: (values: Partial<Category>) => void;
  onCancel: () => void;
  loading?: boolean;
}

// Predefined color options
const colorOptions = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

// Predefined icon options
const iconOptions = [
  'folder',
  'folder-outline',
  'book-open',
  'math-compass',
  'atom',
  'flask',
  'language-javascript',
  'book-education',
  'brain',
  'chart-bar',
  'chart-line',
  'calculator',
  'code-tags',
  'notebook',
  'earth',
  'palette',
  'music',
];

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [name, setName] = useState(initialValues.name || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [selectedColor, setSelectedColor] = useState(initialValues.color || colorOptions[0]);
  const [selectedIcon, setSelectedIcon] = useState(initialValues.icon || 'folder');
  const [isPublic, setIsPublic] = useState(initialValues.isPublic || false);

  const handleSubmit = () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Error', 'Category name is required');
      return;
    }

    // Prepare the category data
    const categoryData: Partial<Category> = {
      ...initialValues,
      name: name.trim(),
      description: description.trim(),
      color: selectedColor,
      icon: selectedIcon,
      isPublic,
    };

    onSubmit(categoryData);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>Category Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter category name"
        placeholderTextColor="#999"
        maxLength={50}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter category description"
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
        maxLength={200}
      />

      <Text style={styles.label}>Color</Text>
      <View style={styles.colorContainer}>
        {colorOptions.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColorOption,
            ]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>

      <Text style={styles.label}>Icon</Text>
      <View style={styles.iconContainer}>
        {/* This would ideally show icons using react-native-vector-icons */}
        {/* For now we're just showing placeholder text */}
        <Text style={styles.iconPlaceholder}>
          Icon selector would be implemented with actual icons
        </Text>
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
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: 8,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#000',
  },
  iconContainer: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  iconPlaceholder: {
    color: '#999',
    textAlign: 'center',
    padding: 24,
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

export default CategoryForm;
