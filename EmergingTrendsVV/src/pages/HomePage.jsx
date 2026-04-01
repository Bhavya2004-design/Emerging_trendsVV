import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const bottomTabs = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'scan', label: 'Scan', icon: '⌗' },
  { key: 'vault', label: 'Vault', icon: '⬡' },
  { key: 'community', label: 'Community', icon: '◌' },
  { key: 'profile', label: 'Profile', icon: '◠' },
];

const quickActions = [
  { key: 'scan', label: 'Scan Outfit', icon: '◉' },
  { key: 'vault', label: 'My Vault', icon: '▦' },
  { key: 'community', label: 'Pack for Trip', icon: '◈' },
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

function OutfitPreview() {
  return (
    <View style={styles.previewImage}>
      <View style={styles.previewJacket} />
      <View style={styles.previewDenim} />
    </View>
  );
}

export default function HomePage({ onNavigate, selectedBottomTab = 'home' }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.userName}>Maria</Text>
              <Text style={styles.subtitle}>Ready to style today?</Text>
            </View>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>M</Text>
            </View>
          </View>

          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionTitle}>AI Outfit Suggestion</Text>
            <View style={styles.suggestionContent}>
              <View style={styles.suggestionTextWrap}>
                <Text style={styles.suggestionText}>Beige jacket + White Shirt + Denim</Text>
                <TouchableOpacity style={styles.viewButton} onPress={() => onNavigate('vault')}>
                  <Text style={styles.viewButtonText}>View Outfit</Text>
                </TouchableOpacity>
              </View>
              <OutfitPreview />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionRow}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={styles.quickActionCard}
                onPress={() => onNavigate(action.key)}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
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

        <View style={styles.bottomNav}>
          {bottomTabs.map((tab) => {
            const active = selectedBottomTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.bottomTab}
                onPress={() => onNavigate(tab.key)}
              >
                <View style={[styles.bottomIconWrap, active && styles.bottomIconWrapActive]}>
                  <Text style={[styles.bottomIcon, active && styles.bottomIconActive]}>{tab.icon}</Text>
                </View>
                <Text style={[styles.bottomLabel, active && styles.bottomLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
    paddingHorizontal: 14,
    paddingTop: 18,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
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
    backgroundColor: '#ebe6de',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#6f665e',
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'serif',
  },
  suggestionCard: {
    backgroundColor: '#f0ede7',
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
  },
  suggestionTitle: {
    color: '#7faf9b',
    fontSize: 35,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  suggestionContent: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 14,
    alignItems: 'center',
  },
  suggestionTextWrap: {
    flex: 1,
  },
  suggestionText: {
    color: '#2b2b2b',
    fontSize: 34,
    lineHeight: 50,
    fontFamily: 'serif',
    marginBottom: 14,
  },
  viewButton: {
    width: 150,
    backgroundColor: '#7faf9b',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#f9f7f3',
    fontSize: 17,
    fontFamily: 'serif',
  },
  previewImage: {
    width: 134,
    height: 134,
    borderRadius: 10,
    backgroundColor: '#ece4d8',
    padding: 10,
    justifyContent: 'space-between',
  },
  previewJacket: {
    width: '92%',
    height: 56,
    borderRadius: 8,
    backgroundColor: '#d8c9b5',
    alignSelf: 'center',
  },
  previewDenim: {
    width: '58%',
    height: 48,
    borderRadius: 8,
    backgroundColor: '#a7bfd1',
    alignSelf: 'flex-end',
  },
  sectionTitle: {
    color: '#2b2b2b',
    fontFamily: 'serif',
    fontSize: 44,
    marginBottom: 10,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  quickActionCard: {
    width: '31%',
    backgroundColor: '#f0ede7',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  quickActionIcon: {
    fontSize: 38,
    color: '#7faf9b',
    marginBottom: 6,
  },
  communityTitle: {
    marginBottom: 2,
  },
  quickActionLabel: {
    fontFamily: 'serif',
    color: '#2b2b2b',
    fontSize: 13,
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
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fbf7f0',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#efe5d8',
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
  },
  bottomIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bottomIconWrapActive: {
    backgroundColor: '#e8f2ed',
  },
  bottomIcon: {
    color: '#64594e',
    fontSize: 20,
  },
  bottomIconActive: {
    color: '#97bfae',
  },
  bottomLabel: {
    color: '#64594e',
    fontSize: 12,
    fontFamily: 'serif',
  },
  bottomLabelActive: {
    color: '#97bfae',
  },
});
