import React, { useMemo, useState } from 'react';
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

function getFirstName(value) {
  const raw = String(value || '').trim();

  if (!raw) {
    return 'User';
  }

  if (raw.includes(' ')) {
    return raw.split(' ')[0];
  }

  const cleaned = raw
    .replace(/[0-9]+$/g, '')
    .replace(/[._-]+/g, ' ')
    .trim();

  if (!cleaned) {
    return 'User';
  }

  return cleaned.split(' ')[0];
}

export default function HomePage({
  onNavigate,
  onLogout,
  selectedBottomTab = 'home',
  userName = '',
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const displayName = useMemo(() => getFirstName(userName), [userName]);

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
            <View style={styles.headerTextWrap}>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.subtitle}>Ready to style today?</Text>
            </View>

            <TouchableOpacity
              style={styles.profileAvatar}
              activeOpacity={0.85}
              onPress={() => setIsProfileMenuOpen(open => !open)}
            >
              <Image
                source={require('../../assets/maria.png')}
                style={styles.profileAvatarImage}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionTitle}>AI Outfit Suggestion</Text>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => onNavigate('vault')}
            >
              <Text style={styles.viewButtonText}>View Outfit</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.quickActionRow}>
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.key}
                style={styles.quickActionCard}
                onPress={() => onNavigate(action.key)}
              >
                <Text style={styles.quickActionIcon} allowFontScaling={false}>
                  {action.icon}
                </Text>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 140,
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
    fontSize: 15,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 28,
    gap: 16,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  greeting: {
    fontSize: 30,
    color: '#2f2a28',
    fontWeight: '400',
  },
  userName: {
    fontSize: 44,
    lineHeight: 50,
    color: '#88b8a5',
    fontWeight: '700',
    marginTop: 4,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#7c7570',
  },
  profileAvatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#7fb09b',
    backgroundColor: '#f8f5ef',
    flexShrink: 0,
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
  },
  suggestionCard: {
    backgroundColor: '#f7f4ee',
    borderRadius: 28,
    padding: 28,
    minHeight: 170,
    marginBottom: 32,
  },
  suggestionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#7fb09b',
    marginBottom: 28,
  },
  viewButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#7fb09b',
    borderRadius: 999,
    paddingVertical: 18,
    paddingHorizontal: 36,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 28,
    color: '#2f2a28',
    marginBottom: 20,
    fontWeight: '500',
  },
  quickActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 18,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: '#f7f4ee',
    borderRadius: 28,
    minHeight: 240,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  quickActionIcon: {
    fontSize: 58,
    marginBottom: 24,
  },
  quickActionLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2f2a28',
    textAlign: 'center',
  },
});