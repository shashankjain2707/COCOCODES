import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { GlassCard } from '../common/GlassCard';

interface Notification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
}

interface ProfileAction {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  action: string;
}

export const Header: React.FC = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications: Notification[] = [
    { id: 1, text: "New video in Physics playlist", time: "2m ago", unread: true },
    { id: 2, text: "Study reminder: Calculus session", time: "1h ago", unread: true },
    { id: 3, text: "Achievement: 7-day streak!", time: "3h ago", unread: false },
  ];

  const profileActions: ProfileAction[] = [
    { label: "View Profile", icon: "account", action: "profile" },
    { label: "Bookmarks", icon: "bookmark", action: "bookmarks" },
    { label: "History", icon: "history", action: "history" },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <View style={styles.container}>
      <GlassCard style={styles.headerCard}>
        <View style={styles.header}>
          {/* Logo */}
          <TouchableOpacity style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>E</Text>
            </View>
            <Text style={styles.appName}>EduTube</Text>
          </TouchableOpacity>

          {/* Enhanced Search Bar */}
          <View style={styles.searchSection}>
            <View style={[styles.searchContainer, isSearchFocused && styles.searchFocused]}>
              <MaterialCommunityIcons 
                name="magnify" 
                size={16} 
                color={theme.colors.blue[300]} 
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Search educational content..."
                placeholderTextColor={theme.colors.blue[300]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                style={styles.searchInput}
              />
              
              {/* Search actions */}
              <View style={styles.searchActions}>
                <TouchableOpacity style={styles.searchActionButton}>
                  <MaterialCommunityIcons 
                    name="microphone" 
                    size={12} 
                    color={theme.colors.blue[300]} 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.searchActionButton}>
                  <MaterialCommunityIcons 
                    name="tune" 
                    size={12} 
                    color={theme.colors.blue[300]} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Profile Actions */}
          <View style={styles.rightSection}>
            {/* Notifications */}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setShowNotifications(!showNotifications)}
            >
              <MaterialCommunityIcons 
                name="bell" 
                size={16} 
                color={theme.colors.blue[200]} 
              />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setShowProfile(!showProfile)}
            >
              <MaterialCommunityIcons 
                name="account" 
                size={16} 
                color={theme.colors.blue[200]} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <View style={styles.notificationsDropdown}>
            <Text style={styles.dropdownTitle}>Notifications</Text>
            <View style={styles.notificationsList}>
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    notification.unread && styles.unreadNotification
                  ]}
                >
                  <Text style={styles.notificationText}>{notification.text}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Profile Dropdown */}
        {showProfile && (
          <View style={styles.profileDropdown}>
            <View style={styles.profileActionsList}>
              {profileActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.profileActionItem}
                >
                  <MaterialCommunityIcons 
                    name={action.icon} 
                    size={16} 
                    color={theme.colors.blue[300]} 
                  />
                  <Text style={styles.profileActionText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 16,
    zIndex: 50,
  },
  headerCard: {
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 28,
    height: 28,
    backgroundColor: theme.colors.blue[500],
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(59, 130, 246, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  appName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  searchSection: {
    flex: 1,
    maxWidth: 300,
    marginHorizontal: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 64, 175, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchFocused: {
    backgroundColor: 'rgba(30, 64, 175, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
    shadowColor: 'rgba(59, 130, 246, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 14,
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchActionButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    backgroundColor: theme.colors.blue[400],
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  notificationsDropdown: {
    position: 'absolute',
    top: '100%',
    right: 16,
    marginTop: 8,
    width: 320,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 100,
  },
  dropdownTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  notificationsList: {
    gap: 8,
  },
  notificationItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(30, 64, 175, 0.2)',
  },
  unreadNotification: {
    backgroundColor: 'rgba(30, 64, 175, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  notificationText: {
    color: 'white',
    fontSize: 14,
  },
  notificationTime: {
    color: theme.colors.blue[300],
    fontSize: 12,
    marginTop: 4,
  },
  profileDropdown: {
    position: 'absolute',
    top: '100%',
    right: 16,
    marginTop: 8,
    width: 192,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    padding: 12,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 100,
  },
  profileActionsList: {
    gap: 4,
  },
  profileActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 8,
  },
  profileActionText: {
    color: theme.colors.blue[100],
    fontSize: 14,
  },
});
