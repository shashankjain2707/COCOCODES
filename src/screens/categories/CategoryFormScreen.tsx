import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootState, AppDispatch } from '../../store';
import { Category } from '../../types/userContent';
import { RootStackParamList } from '../../types/navigation';
import CategoryForm from '../../components/categories/CategoryForm';
import { createCategory, updateCategory } from '../../store/userContentSlice';

type CategoryFormScreenRouteProp = RouteProp<RootStackParamList, 'CategoryForm'>;
type CategoryFormScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CategoryForm'>;

const CategoryFormScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<CategoryFormScreenNavigationProp>();
  const route = useRoute<CategoryFormScreenRouteProp>();
  const { categoryId } = route.params || {};

  const { categories } = useSelector((state: RootState) => state.userContent);
  const userId = useSelector((state: RootState) => state.auth.user?.uid);

  const [loading, setLoading] = useState(false);
  const category = categoryId ? categories[categoryId] : undefined;
  const isEditing = !!category;

  const handleSubmit = async (values: Partial<Category>) => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to create a category');
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        await dispatch(
          updateCategory({
            ...category,
            ...values,
          })
        );
        Alert.alert('Success', 'Category updated successfully');
      } else {
        await dispatch(
          createCategory({
            name: values.name || '',
            description: values.description || '',
            icon: values.icon || 'category',
            color: values.color || '#6B7280',
            parentId: values.parentId,
            isPublic: values.isPublic || false,
            subcategories: values.subcategories || [],
            createdBy: userId,
            isOfficial: false,
          })
        );
        Alert.alert('Success', 'Category created successfully');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        isEditing
          ? 'Failed to update category. Please try again.'
          : 'Failed to create category. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? 'Edit Category' : 'Create Category'}
          </Text>
        </View>

        <CategoryForm
          initialValues={category}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default CategoryFormScreen;
