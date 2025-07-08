import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Category } from '../../types/userContent';
import CategoryCard from './CategoryCard';

interface CategoryListProps {
  categories: Category[];
  loading: boolean;
  onCategoryPress: (category: Category) => void;
  onAddPress: () => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  categories, 
  loading, 
  onCategoryPress,
  onAddPress 
}) => {
  // If there are no categories and we're not loading
  if (categories.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="folder-plus-outline" size={64} color="#3B82F6" />
        <Text style={styles.emptyTitle}>No Categories Yet</Text>
        <Text style={styles.emptyText}>
          Create your first category to organize your educational content
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={onAddPress}>
          <Text style={styles.emptyButtonText}>Create Category</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  // Render the category grid
  return (
    <FlatList
      data={categories}
      renderItem={({ item }) => (
        <CategoryCard category={item} onPress={onCategoryPress} />
      )}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={onAddPress}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Category</Text>
        </TouchableOpacity>
      }
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default CategoryList;
