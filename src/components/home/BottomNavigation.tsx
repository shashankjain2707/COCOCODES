import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface QuickAction {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  action: string;
  color: string;
}

interface Tab {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  quickActions: QuickAction[];
}

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs: Tab[] = [
  {
    id: "home",
    label: "Home",
    icon: "home",
    quickActions: [
      { label: "Continue Learning", icon: "play-circle", action: "continue", color: theme.colors.blue[300] },
      { label: "Recent Activity", icon: "clock", action: "recent", color: theme.colors.blue[300] },
      { label: "Bookmarks", icon: "heart", action: "bookmarks", color: theme.colors.blue[300] },
    ],
  },
  {
    id: "library",
    label: "Library",
    icon: "library",
    quickActions: [
      { label: "My Playlists", icon: "folder-plus", action: "playlists", color: theme.colors.blue[300] },
      { label: "Saved Videos", icon: "book-open", action: "saved", color: theme.colors.blue[300] },
      { label: "Downloads", icon: "download", action: "downloads", color: theme.colors.blue[300] },
    ],
  },
  {
    id: "add",
    label: "Add",
    icon: "plus",
    quickActions: [
      { label: "Create Playlist", icon: "folder-plus", action: "create-playlist", color: theme.colors.green[300] },
      { label: "Add Video", icon: "video", action: "add-video", color: theme.colors.purple[300] },
      { label: "Add Notes", icon: "note", action: "add-notes", color: theme.colors.yellow[300] },
    ],
  },
  {
    id: "stats",
    label: "Stats",
    icon: "chart-bar",
    quickActions: [
      { label: "Study Analytics", icon: "chart-bar", action: "analytics", color: theme.colors.blue[300] },
      { label: "Achievements", icon: "trophy", action: "achievements", color: theme.colors.yellow[300] },
      { label: "Progress Report", icon: "trending-up", action: "progress", color: theme.colors.green[300] },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    icon: "account",
    quickActions: [
      { label: "Edit Profile", icon: "account", action: "edit-profile", color: theme.colors.blue[300] },
      { label: "Settings", icon: "cog", action: "settings", color: theme.colors.slate[300] },
      { label: "My Content", icon: "play-circle", action: "my-content", color: theme.colors.purple[300] },
    ],
  },
];

const { width } = Dimensions.get('window');

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ left: 0 });

  const handleQuickAction = (action: string, tabId: string) => {
    console.log(`Quick action: ${action} from ${tabId}`);
    onTabChange(tabId);
  };

  const handleTabPress = (tabId: string) => {
    if (hoveredTab === tabId) {
      setHoveredTab(null);
    } else {
      setHoveredTab(tabId);
      // Calculate menu position based on tab position
      const tabIndex = tabs.findIndex(tab => tab.id === tabId);
      const tabWidth = width / tabs.length;
      const menuLeft = (tabIndex * tabWidth) + (tabWidth / 2);
      setMenuPosition({ left: menuLeft });
    }
    onTabChange(tabId);
  };

  const hoveredTabData = tabs.find((tab) => tab.id === hoveredTab);

  return (
    <View style={styles.container}>
      {/* Quick Actions Menu */}
      {hoveredTab && hoveredTabData && (
        <View style={[styles.quickActionsMenu, { left: menuPosition.left - 104 }]}>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{hoveredTabData.label} Actions</Text>
            <View style={styles.actionsList}>
              {hoveredTabData.quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleQuickAction(action.action, hoveredTab)}
                  style={styles.actionItem}
                >
                  <View style={styles.actionIconContainer}>
                    <MaterialCommunityIcons 
                      name={action.icon} 
                      size={16} 
                      color={action.color} 
                    />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Arrow pointing down */}
            <View style={styles.menuArrow} />
          </View>
        </View>
      )}

      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isHovered = hoveredTab === tab.id;

            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => handleTabPress(tab.id)}
                style={[
                  styles.tabButton,
                  isActive && styles.activeTab,
                  isHovered && styles.hoveredTab,
                ]}
              >
                <MaterialCommunityIcons 
                  name={tab.icon} 
                  size={16} 
                  color={isActive ? 'white' : theme.colors.blue[300]} 
                />
                <Text style={[
                  styles.tabLabel,
                  isActive && styles.activeTabLabel,
                ]}>
                  {tab.label}
                </Text>

                {/* Active indicator */}
                {isActive && <View style={styles.activeIndicator} />}

                {/* Hover indicator */}
                {isHovered && !isActive && <View style={styles.hoverIndicator} />}

                {/* Quick actions count indicator */}
                {isHovered && (
                  <View style={styles.actionsCountBadge}>
                    <Text style={styles.badgeText}>{tab.quickActions.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    padding: 16,
  },
  quickActionsMenu: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 12,
    width: 208,
  },
  menuContent: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    padding: 12,
    shadowColor: 'rgba(30, 58, 138, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  menuTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: theme.colors.blue[200],
    fontSize: 12,
    fontWeight: '500',
  },
  actionsList: {
    gap: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(30, 64, 175, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    color: theme.colors.blue[100],
    fontSize: 14,
    flex: 1,
  },
  menuArrow: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    marginLeft: -6,
    marginTop: -1,
    width: 12,
    height: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    transform: [{ rotate: '45deg' }],
  },
  navigationBar: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 16,
    padding: 8,
    shadowColor: 'rgba(30, 58, 138, 0.2)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: 12,
    borderRadius: 12,
    position: 'relative',
    minWidth: 60,
  },
  activeTab: {
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  hoveredTab: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 12,
    color: theme.colors.blue[300],
  },
  activeTabLabel: {
    color: 'white',
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 4,
    backgroundColor: theme.colors.blue[400],
    borderRadius: 2,
  },
  hoverIndicator: {
    position: 'absolute',
    top: -8,
    right: -4,
    width: 8,
    height: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    borderRadius: 4,
  },
  actionsCountBadge: {
    position: 'absolute',
    top: -8,
    left: -4,
    width: 16,
    height: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
});
