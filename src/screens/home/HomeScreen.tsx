import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { theme } from '../../styles/theme';
import { HomeScreenProps } from '../../types/home';
import { RootState } from '../../store';

// Components
import { Header } from '../../components/home/Header';
import { WelcomeSection } from '../../components/home/WelcomeSection';
import { QuickActions } from '../../components/home/QuickActions';
import { SubjectCategories } from '../../components/home/SubjectCategories';
import { RecentActivity } from '../../components/home/RecentActivity';
import { RecommendedSection } from '../../components/home/RecommendedSection';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
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
    if (continueSession) {
      navigation.navigate('Player', { 
        videoId: continueSession.videoId,
        title: continueSession.title 
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
      navigation.navigate('Player', { 
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header - Fixed at top */}
      <Header
        user={user}
        onSearchPress={handleSearchPress}
        onProfilePress={handleProfilePress}
        onNotificationPress={handleNotificationPress}
      />
      
      {/* Main Content - Scrollable */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        {/* Welcome Section */}
        <View style={styles.sectionContainer}>
          <WelcomeSection user={user} />
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <QuickActions
            continueSession={continueSession}
            onContinuePress={handleContinuePress}
            onNewSessionPress={handleNewSessionPress}
            onLibraryPress={handleLibraryPress}
            onStatsPress={handleStatsPress}
          />
        </View>

        {/* Recommended Content */}
        <View style={styles.sectionContainer}>
          <RecommendedSection
            content={recommendedContent}
            onContentPress={handleRecommendedContentPress}
            onExplorePress={handleExplorePress}
          />
        </View>

        {/* Subject Categories */}
        <View style={styles.sectionContainer}>
          <SubjectCategories
            categories={categories}
            onCategoryPress={handleCategoryPress}
            onViewAllPress={handleViewAllCategoriesPress}
          />
        </View>

        {/* Bottom Spacing for Tab Navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sectionContainer: {
    marginBottom: theme.spacing.md,
  },
  bottomSpacer: {
    height: 120, // Space for bottom tab navigation
  },
});
