import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { theme } from '../../styles/theme';
import { HeaderProps } from '../../types/home';

export const Header: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Left Section - Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>E</Text>
          </View>
          <Text style={styles.appName}>EduTube</Text>
        </View>

        {/* Center Section - Search */}
        <TouchableOpacity style={styles.searchContainer} onPress={() => {}}>
          <View style={styles.searchIconContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
          </View>
          <Text style={styles.searchPlaceholder}>Search...</Text>
        </TouchableOpacity>

        {/* Right Section - Actions */}
        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
            <Text style={styles.icon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={() => {}}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>A</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '800' as const,
    color: theme.colors.text,
  },
  appName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    opacity: 0.7,
  },
  searchPlaceholder: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  profileInitial: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  icon: {
    fontSize: 18,
    opacity: 0.8,
  },
  profileIcon: {
    fontSize: 18,
    color: theme.colors.text,
  },
});
