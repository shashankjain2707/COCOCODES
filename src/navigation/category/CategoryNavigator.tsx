import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoriesScreen from '../../screens/categories/CategoriesScreen';
import CategoryDetailScreen from '../../screens/categories/CategoryDetailScreen';
import CategoryFormScreen from '../../screens/categories/CategoryFormScreen';
import PlaylistFormScreen from '../../screens/playlists/PlaylistFormScreen';

const Stack = createNativeStackNavigator();

const CategoryNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <Stack.Screen name="CategoryForm" component={CategoryFormScreen} />
      <Stack.Screen name="PlaylistForm" component={PlaylistFormScreen} />
    </Stack.Navigator>
  );
};

export default CategoryNavigator;
