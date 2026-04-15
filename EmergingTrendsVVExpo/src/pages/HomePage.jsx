import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar';

const quickActions = [
  { key: 'scan', label: 'Scan Outfit', icon: '📷' },
  { key: 'vault', label: 'My Vault', icon: '🧥' },
  { key: 'trip', label: 'Pack for Trip', icon: '🧳' },
  { key: 'my-trip', label: 'My Trip', icon: '✈️' },
];

const posts = [
  {
    id: 'p1',
    name: 'Priya',
    message: 'Love this neutral outfit! Perfect for spring!',
    likes: 45,
    comments: 12,
  },
  {
    id: 'p2',
    name: 'Jenny',
    message: 'Bringing out my summer dresses.',
    likes: 36,
    comments: 45,
  },
];

export default function HomePage({
  onNavigate,
  onLogout,
  selectedBottomTab = 'home',
  userName = '',
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const displayName = userName && userName.trim() ? userName.trim() : 'Maria';

  function handleProfileMenuAction(target) {
    setIsProfileMenuOpen(false);
    if (target) {
      onNavigate(target);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.screen}>
        {isProfileMenuOpen ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsProfileMenuOpen(false)}
            style={styles.menuBackdrop}
          />
        ) : null}
        {isProfileMenuOpen ? (
          <View style={styles.profileMenu}>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => handleProfileMenuAction('profile')}
            >
              <Text style={styles.profileMenuItemText}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setIsProfileMenuOpen(false);
                if (onLogout) {
                  onLogout();
                }
              }}
            >
              <Text style={styles.profileMenuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.subtitle}>Ready to style today?</Text>
            </View>
            <TouchableOpacity
              style={styles.profileAvatar}
              activeOpacity={0.85}
              onPress={() => setIsProfileMenuOpen((open) => !open)}
            >
              <Image
                source={require('../../assets/maria.png')}
                style={styles.profileAvatarImage}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionTitle}>AI Outfit Suggestion</Text>
            <TouchableOpacity style={styles.viewButton} onPress={() => onNavigate('vault')}>
              <Text style={styles.viewButtonText}>View Outfit</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionRow}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={styles.quickActionCard}
                onPress={() => {
                  if (action.key === 'my-trip') {
                    return;
                  }
                  onNavigate(action.key);
                }}
              >
                <Text style={styles.quickActionIcon} allowFontScaling={false}>
                  {action.icon}
                </Text>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, styles.communityTitle]}>Community Looks</Text>
          {posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.postCard}
              onPress={() => onNavigate('community')}
              activeOpacity={0.9}
            >
              <View style={styles.postHeader}>
                <View style={styles.userChip}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>{post.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.postName}>{post.name}</Text>
                </View>
                <Text style={styles.menuDots}>...</Text>
              </View>
              <Text style={styles.postMessage}>{post.message}</Text>
              <View style={styles.postFooter}>
                <Text style={styles.postStat}>♡ {post.likes}</Text>
                <Text style={styles.postStat}>◌ {post.comments}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <BottomTabBar selectedTab={selectedBottomTab} onNavigate={onNavigate} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e8e4da',
  },
  screen: {
    flex: 1,
    backgroundColor: '#e8e4da',
    paddingTop: 18,
  },
  scrollArea: {
    flex: 1,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  profileMenu: {
    position: 'absolute',
    top: 84,
    right: 22,
    width: 168,
    backgroundColor: '#fbf7f0',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ddd4c8',
    zIndex: 30,
    shadowColor: '#1a1814',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  profileMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ece2d5',
  },
  profileMenuItemText: {
    color: '#3b332d',
    fontFamily: 'serif',
    fontSize: 15,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 132,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  greeting: {
    color: '#2b2b2b',
    fontSize: 31,
    fontFamily: 'serif',
  },
  userName: {
    color: '#7faf9b',
    fontSize: 39,
    marginTop: -2,
    fontFamily: 'serif',
    fontWeight: '700',
  },
  subtitle: {
    color: '#7e7870',
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'serif',
  },
  profileAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#5a9d86',
    shadowColor: '#1a1814',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 4,
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
  },
  suggestionCard: {
    backgroundColor: '#f0ede7',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 14,
    marginBottom: 16,
    minHeight: 136,
    justifyContent: 'center',
  },
  suggestionTitle: {
    color: '#7faf9b',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'serif',
    marginBottom: 12,
  },
  viewButton: {
    alignSelf: 'flex-start',
    marginTop: 0,
    backgroundColor: '#7faf9b',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    color: '#f9f7f3',
    fontSize: 12,
    fontFamily: 'serif',
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#2b2b2b',
    fontFamily: 'serif',
    fontSize: 22,
    marginBottom: 10,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 18,
  },
  quickActionCard: {
    flex: 1,
    minHeight: 124,
    backgroundColor: '#f0ede7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  quickActionIcon: {
    fontSize: 46,
    lineHeight: 52,
    marginBottom: 10,
  },
  communityTitle: {
    marginBottom: 2,
  },
  quickActionLabel: {
    fontFamily: 'serif',
    color: '#2b2b2b',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#f0ede7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#bf8e6c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  postName: {
    fontFamily: 'serif',
    color: '#2b2b2b',
    fontSize: 16,
    fontWeight: '700',
  },
  menuDots: {
    color: '#5f574f',
    fontSize: 18,
  },
  postMessage: {
    marginTop: 8,
    color: '#4b433d',
    fontFamily: 'serif',
    fontSize: 14,
    lineHeight: 20,
  },
  postFooter: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 20,
  },
  postStat: {
    color: '#4b433d',
    fontFamily: 'serif',
    fontSize: 13,
  },
});
