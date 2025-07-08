import React from 'react';
import { 
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ImageBackground,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Category } from '../../types/userContent';

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  const { name, description, icon, color, videoCount } = category;
  
  // Convert hex color to rgba for gradient
  const hexToRgba = (hex: string, alpha: number = 1): string => {
    // Default color if none provided
    if (!hex) return `rgba(59, 130, 246, ${alpha})`;
    
    const hexValue = hex.replace('#', '');
    const r = parseInt(hexValue.substring(0, 2), 16);
    const g = parseInt(hexValue.substring(2, 4), 16);
    const b = parseInt(hexValue.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(category)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[hexToRgba(color, 0.8), hexToRgba(color, 0.4)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Icon name={icon || 'folder'} size={32} color="#FFFFFF" />
          <Text style={styles.title} numberOfLines={1}>{name}</Text>
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Icon name="video-outline" size={16} color="#FFFFFF" />
              <Text style={styles.statText}>{videoCount} videos</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with margins

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: 160,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradient: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
});

export default CategoryCard;
