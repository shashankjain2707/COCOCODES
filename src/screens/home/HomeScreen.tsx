import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { theme } from '../../styles/theme';
import { HomeScreenProps } from '../../types/home';
import { RootState } from '../../store';

// Components
import { Header } from '../../components/home/Header';
import { WelcomeSection } from '../../components/home/WelcomeSection';
import { QuickActions } from '../../components/home/QuickActions';
import { SmartRecommendations } from '../../components/home/SmartRecommendations';
import { SubjectCategories } from '../../components/home/SubjectCategories';
import { PublicLibrarySection } from '../../components/home/PublicLibrarySection';
import { RecentActivity } from '../../components/home/RecentActivity';
import { BottomNavigation } from '../../components/home/BottomNavigation';

const { width, height } = Dimensions.get('window');

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("home");
  
  const { 
    user, 
    continueSession, 
    categories, 
    recentActivity, 
    recommendedContent,
    isLoading 
  } = useSelector((state: RootState) => state.home);

  // Navigation handlers
  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const handleContinuePress = () => {
    if (continueSession && continueSession.videoId) {
      navigation.navigate('VideoPlayer', { 
        videoId: continueSession.videoId,
        title: continueSession.title 
      });
    } else {
      // Test with a sample YouTube video ID
      navigation.navigate('VideoPlayer', { 
        videoId: 'dQw4w9WgXcQ', // Rick Roll - Never Gonna Give You Up
        title: 'Sample Video - Never Gonna Give You Up' 
      });
    }
  };

  const handleNewSessionPress = () => {
    navigation.navigate('AddVideo');
  };

  const handleLibraryPress = () => {
    navigation.navigate('Library');
  };

  const handleStatsPress = () => {
    navigation.navigate('Stats');
  };

  const handleCategoryPress = (category: any) => {
    navigation.navigate('CategoryVideos', { 
      categoryId: category.id,
      categoryName: category.name 
    });
  };

  const handleViewAllCategoriesPress = () => {
    navigation.navigate('AllCategories');
  };

  const handleActivityPress = (activity: any) => {
    if (activity.type === 'video') {
      navigation.navigate('VideoPlayer', { 
        videoId: activity.id,
        title: activity.title 
      });
    }
  };

  const handleViewAllActivityPress = () => {
    navigation.navigate('ActivityHistory');
  };

  const handleRecommendedContentPress = (content: any) => {
    navigation.navigate('PlaylistDetail', { 
      playlistId: content.id,
      title: content.title 
    });
  };

  const handleExplorePress = () => {
    navigation.navigate('Explore');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          {/* Add loading component here */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Main Background Gradient - from-slate-950 via-blue-950 to-navy-950 */}
      <LinearGradient
        colors={[theme.colors.slate[950], theme.colors.blue[950], theme.colors.navy[900]]} // slate-950, blue-950, navy-950
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />
      


      {/* Subtle grid overlay */}
      <View style={styles.gridOverlay} />

      {/* Main Content Container with relative z-index */}
      <View style={styles.contentContainer}>
        <SafeAreaView style={styles.safeArea}>
          <Header />
          
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <View style={styles.mainContent}>
              <WelcomeSection />
              <QuickActions />
              <SmartRecommendations />
              <SubjectCategories />
              <PublicLibrarySection />
              <RecentActivity />
            </View>
          </ScrollView>
        </SafeAreaView>

        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: height,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    zIndex: 1,
    // This simulates the grid pattern effect
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 2,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80, // pb-20 = 80px
  },
  mainContent: {
    paddingHorizontal: 16, // px-4 = 16px
    gap: 20, // space-y-5 = 20px gap
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
