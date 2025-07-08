import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchUserCategories } from '../../store/userContentSlice';
import { Category } from '../../types/userContent';
import CategoryList from '../../components/categories/CategoryList';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type CategoriesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Categories'>;

const CategoriesScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<CategoriesScreenNavigationProp>();
  const { 
    categories, 
    categoriesLoading 
  } = useSelector((state: RootState) => state.userContent);
  const userId = useSelector((state: RootState) => state.auth.user?.uid);

  // Convert categories object to array
  const categoriesArray = Object.values(categories);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserCategories(userId));
    }
  }, [dispatch, userId]);

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('CategoryDetail', { categoryId: category.id });
  };

  const handleAddCategory = () => {
    navigation.navigate('CategoryForm', {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
      </View>
      
      <CategoryList 
        categories={categoriesArray}
        loading={categoriesLoading}
        onCategoryPress={handleCategoryPress}
        onAddPress={handleAddCategory}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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

export default CategoriesScreen;
