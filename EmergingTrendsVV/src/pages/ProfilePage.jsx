import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar';
import ScreenBackButton from '../components/ScreenBackButton';
import { communityPosts } from '../data/communityMockData';

const activityLinks = [
  { key: 'my-vault', icon: '🗂', label: 'My Vault' },
  { key: 'saved-outfits', icon: '❤️', label: 'Saved Outfits' },
  { key: 'travel-packing', icon: '🧳', label: 'Travel Packing' },
  { key: 'community-posts', icon: '👥', label: 'Community Posts' },
];

const settingsLinks = [
  { key: 'edit-profile', icon: '✏️', label: 'Edit Profile' },
  { key: 'notifications', icon: '🔔', label: 'Notifications' },
  { key: 'privacy', icon: '🔒', label: 'Privacy' },
  { key: 'app-settings', icon: '⚙️', label: 'App Settings' },
];

const notificationRows = [
  { key: 'newFollowers', label: 'New Followers', icon: '👥' },
  { key: 'outfitLikes', label: 'Outfit Likes', icon: '❤️' },
  { key: 'styleReminders', label: 'Style Reminders', icon: '⏰' },
  { key: 'communityAlerts', label: 'Community Alerts', icon: '🌐' },
];

function buildSavedOutfits() {
  return communityPosts.slice(0, 6).map((post, index) => ({
    id: `saved-${post.id}`,
    title: post.caption,
    category:
      index % 3 === 0 ? 'Casual' : index % 3 === 1 ? 'Formal' : 'Summer',
    isSaved: true,
    mockImage: post.mockImage,
  }));
}

function buildPostHistory() {
  return [
    {
      id: 'up-1',
      caption: 'Neutral layers for coffee run.',
      visibility: 'public',
      likes: 42,
      saves: 11,
    },
    {
      id: 'up-2',
      caption: 'Monochrome workwear capsule.',
      visibility: 'private',
      likes: 31,
      saves: 8,
    },
    {
      id: 'up-3',
      caption: 'Weekend travel essentials.',
      visibility: 'public',
      likes: 57,
      saves: 14,
    },
  ];
}

function ProfileHeader({ profile }) {
  return (
    <View style={styles.profileHeaderWrap}>
      <View style={styles.avatarFrame}>
        <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
      </View>
      <Text style={styles.profileName}>{profile.name}</Text>
      <Text style={styles.profileBio}>{profile.bio}</Text>

      <View style={styles.statsCard}>
        <View style={styles.statCol}>
          <Text style={styles.statValue}>{profile.closetItems}</Text>
          <Text style={styles.statLabel}>Closet Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statValue}>{profile.outfitPosted}</Text>
          <Text style={styles.statLabel}>Outfit Posted</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statValue}>{profile.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
      </View>
    </View>
  );
}

function LinkSection({ title, links, onPress }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {links.map((link, index) => (
        <Pressable
          key={link.key}
          onPress={() => onPress(link.key)}
          style={[
            styles.linkRow,
            index === links.length - 1 && styles.linkRowLast,
          ]}
        >
          <View style={styles.linkLeft}>
            <View style={styles.linkIconWrap}>
              <Text style={styles.linkIcon}>{link.icon}</Text>
            </View>
            <Text style={styles.linkLabel}>{link.label}</Text>
          </View>
          <Text style={styles.linkArrow}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ViewTitle({ title, onBack }) {
  return (
    <View style={styles.subHeaderRow}>
      <Pressable onPress={onBack} hitSlop={8} style={styles.backBtn}>
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.subHeaderTitle}>{title}</Text>
      <View style={styles.subHeaderSpacer} />
    </View>
  );
}

function SavedOutfitCard({ item, onToggleSave }) {
  return (
    <View style={styles.savedCard}>
      <View
        style={[
          styles.savedImage,
          { backgroundColor: item.mockImage.background },
        ]}
      >
        <View
          style={[
            styles.savedAccent,
            {
              backgroundColor: item.mockImage.accents[0],
              width: 20,
              height: 20,
              borderRadius: 10,
            },
          ]}
        />
        <View
          style={[
            styles.savedAccent,
            {
              backgroundColor: item.mockImage.accents[1],
              width: 40,
              height: 16,
              borderRadius: 8,
            },
          ]}
        />
        <View
          style={[
            styles.savedAccent,
            {
              backgroundColor: item.mockImage.accents[2],
              width: 28,
              height: 28,
              borderRadius: 8,
            },
          ]}
        />
      </View>
      <Text numberOfLines={2} style={styles.savedTitle}>
        {item.title}
      </Text>
      <View style={styles.savedMetaRow}>
        <Text style={styles.savedTag}>{item.category}</Text>
        <Pressable onPress={() => onToggleSave(item.id)}>
          <Text
            style={[styles.saveToggle, !item.isSaved && styles.saveToggleOff]}
          >
            {item.isSaved ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ProfilePage({
  onNavigate,
  selectedBottomTab = 'profile',
}) {
  const [view, setView] = useState('home');
  const [profile, setProfile] = useState({
    userID: 'user-maria-01',
    name: 'Maria',
    bio: 'Sustainable fashion lover 🌿',
    closetItems: 30,
    outfitPosted: 26,
    followers: 120,
    height: '',
    size: '',
    instagram: '',
    tiktok: '',
  });

  const [savedOutfits, setSavedOutfits] = useState(buildSavedOutfits());
  const [savedFilter, setSavedFilter] = useState('All');
  const [tripCards, setTripCards] = useState([
    { id: 't-1', name: 'Paris 2026', itemCount: 18, weight: 11.2 },
    { id: 't-2', name: 'Mumbai Weekend', itemCount: 9, weight: 5.1 },
  ]);
  const [selectedTripId, setSelectedTripId] = useState(null);

  const [posts, setPosts] = useState(buildPostHistory());
  const [editingPostId, setEditingPostId] = useState('');
  const [editingCaption, setEditingCaption] = useState('');

  const [notificationSettings, setNotificationSettings] = useState({
    newFollowers: true,
    outfitLikes: true,
    styleReminders: false,
    communityAlerts: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    privateAccount: false,
    closetVisibility: 'Followers',
    blockedUsers: ['@spamcloset', '@style_bot_22'],
  });

  const [theme, setTheme] = useState('Cream');

  const savedCategories = useMemo(() => {
    const tags = Array.from(
      new Set(savedOutfits.map(item => item.category).filter(tag => tag !== 'Summer')),
    );
    return ['All', ...tags];
  }, [savedOutfits]);

  const visibleSavedOutfits = useMemo(() => {
    if (savedFilter === 'All') {
      return savedOutfits;
    }
    return savedOutfits.filter(item => item.category === savedFilter);
  }, [savedOutfits, savedFilter]);

  const selectedTrip =
    tripCards.find(trip => trip.id === selectedTripId) || null;

  function updateProfileField(field, value) {
    setProfile(current => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleSavedOutfit(id) {
    setSavedOutfits(current =>
      current.map(item =>
        item.id === id
          ? {
              ...item,
              isSaved: !item.isSaved,
            }
          : item,
      ),
    );
  }

  function toggleNotification(key) {
    setNotificationSettings(current => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function togglePrivacyAccount() {
    setPrivacySettings(current => ({
      ...current,
      privateAccount: !current.privateAccount,
    }));
  }

  function updateClosetVisibility(next) {
    setPrivacySettings(current => ({
      ...current,
      closetVisibility: next,
    }));
  }

  function startEditPost(post) {
    setEditingPostId(post.id);
    setEditingCaption(post.caption);
  }

  function savePostCaption(postId) {
    setPosts(current =>
      current.map(post =>
        post.id === postId
          ? {
              ...post,
              caption: editingCaption.trim() || post.caption,
            }
          : post,
      ),
    );
    setEditingPostId('');
    setEditingCaption('');
  }

  function togglePostVisibility(postId) {
    setPosts(current =>
      current.map(post =>
        post.id === postId
          ? {
              ...post,
              visibility: post.visibility === 'public' ? 'private' : 'public',
            }
          : post,
      ),
    );
  }

  function deletePost(postId) {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setPosts(current => current.filter(post => post.id !== postId));
          if (editingPostId === postId) {
            setEditingPostId('');
            setEditingCaption('');
          }
        },
      },
    ]);
  }

  function renderHome() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentPadBottom}
      >
        <View style={styles.topBar}>
          <ScreenBackButton onPress={() => onNavigate('home')} />
        </View>

        <ProfileHeader profile={profile} />

        <LinkSection
          title="My Activity"
          links={activityLinks}
          onPress={setView}
        />
        <LinkSection title="Settings" links={settingsLinks} onPress={setView} />
      </ScrollView>
    );
  }

  function renderMyVaultShortcut() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentPadBottom}
      >
        <ViewTitle title="My Vault" onBack={() => setView('home')} />
        <View style={styles.sectionCard}>
          <Text style={styles.subCopy}>
            Owner Mode route will pass this user ID to VaultMainPage:
          </Text>
          <Text style={styles.codeLike}>{profile.userID}</Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => onNavigate('vault')}
          >
            <Text style={styles.primaryBtnText}>Open VaultMainPage</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  function renderSavedOutfits() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentPadBottom}
      >
        <ViewTitle title="Saved Outfits" onBack={() => setView('home')} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {savedCategories.map(tag => (
            <Pressable
              key={tag}
              onPress={() => setSavedFilter(tag)}
              style={[
                styles.filterChip,
                savedFilter === tag && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  savedFilter === tag && styles.filterChipTextActive,
                ]}
              >
                {tag}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.savedGrid}>
          {visibleSavedOutfits.map(item => (
            <SavedOutfitCard
              key={item.id}
              item={item}
              onToggleSave={toggleSavedOutfit}
            />
          ))}
        </View>
      </ScrollView>
    );
  }

  function renderTravelPacking() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentPadBottom}
      >
        <ViewTitle title="Travel Packing" onBack={() => setView('home')} />

        <View style={styles.sectionCard}>
          <Text style={styles.sectionSubtitle}>Trip Cards</Text>
          {tripCards.map(trip => {
            const isActive = selectedTripId === trip.id;
            return (
              <Pressable
                key={trip.id}
                onPress={() => setSelectedTripId(trip.id)}
                style={[styles.tripRow, isActive && styles.tripRowActive]}
              >
                <Text style={styles.tripTitle}>{trip.name}</Text>
                <Text style={styles.tripMeta}>
                  {trip.itemCount} items • {trip.weight} kg
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selectedTrip ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionSubtitle}>Checklist</Text>
            <Text style={styles.subCopy}>
              Add from Closet Items database to {selectedTrip.name}
            </Text>
            <View style={styles.chipRow}>
              <View style={styles.smallChip}>
                <Text style={styles.smallChipText}>Blazer</Text>
              </View>
              <View style={styles.smallChip}>
                <Text style={styles.smallChipText}>Sneakers</Text>
              </View>
              <View style={styles.smallChip}>
                <Text style={styles.smallChipText}>Linen Shirt</Text>
              </View>
            </View>

            <Text style={styles.sectionSubtitle}>Outfit Planner Canvas</Text>
            <View style={styles.plannerCard}>
              <Text style={styles.plannerTitle}>Day 1</Text>
              <Text style={styles.plannerText}>Drag from closet to slot</Text>
            </View>
            <View style={styles.plannerCard}>
              <Text style={styles.plannerTitle}>Day 2</Text>
              <Text style={styles.plannerText}>Drag from closet to slot</Text>
            </View>

            <Text style={styles.sectionSubtitle}>Status Bar</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      100,
                      Math.round((selectedTrip.itemCount / 30) * 100),
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.subCopy}>
              {selectedTrip.itemCount}/30 items packed
            </Text>
          </View>
        ) : null}
      </ScrollView>
    );
  }

  function renderCommunityPosts() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentPadBottom}
      >
        <ViewTitle title="Community Posts" onBack={() => setView('home')} />

        {posts.map(post => {
          const isEditing = editingPostId === post.id;
          return (
            <View key={post.id} style={styles.sectionCard}>
              <Text style={styles.sectionSubtitle}>Post #{post.id}</Text>

              {isEditing ? (
                <TextInput
                  value={editingCaption}
                  onChangeText={setEditingCaption}
                  style={styles.input}
                  placeholder="Update caption"
                  placeholderTextColor="#a29a90"
                />
              ) : (
                <Text style={styles.subCopy}>{post.caption}</Text>
              )}

              <View style={styles.analyticsRow}>
                <Text style={styles.analyticsText}>Likes: {post.likes}</Text>
                <Text style={styles.analyticsText}>Saves: {post.saves}</Text>
                <Text style={styles.analyticsText}>
                  Visibility: {post.visibility}
                </Text>
              </View>

              <View style={styles.actionButtonsRow}>
                {isEditing ? (
                  <Pressable
                    style={styles.smallActionBtn}
                    onPress={() => savePostCaption(post.id)}
                  >
                    <Text style={styles.smallActionBtnText}>Save Caption</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={styles.smallActionBtn}
                    onPress={() => startEditPost(post)}
                  >
                    <Text style={styles.smallActionBtnText}>Edit Caption</Text>
                  </Pressable>
                )}

                <Pressable
                  style={styles.smallActionBtn}
                  onPress={() => togglePostVisibility(post.id)}
                >
                  <Text style={styles.smallActionBtnText}>
                    Make {post.visibility === 'public' ? 'Private' : 'Public'}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => deletePost(post.id)}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  }

  function renderEditProfile() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentPadBottom}
      >
        <ViewTitle title="Edit Profile" onBack={() => setView('home')} />

        <View style={styles.sectionCard}>
          <Pressable
            style={styles.avatarEditRow}
            onPress={() =>
              Alert.alert('Avatar Picker', 'Hook your image picker here.')
            }
          >
            <View style={styles.avatarMini}>
              <Text style={styles.avatarMiniText}>
                {profile.name.charAt(0)}
              </Text>
            </View>
            <Text style={styles.linkLabel}>Change Avatar</Text>
          </Pressable>

          <TextInput
            value={profile.name}
            onChangeText={text => updateProfileField('name', text)}
            style={styles.input}
            placeholder="Display Name"
            placeholderTextColor="#a29a90"
          />
          <TextInput
            value={profile.bio}
            onChangeText={text => updateProfileField('bio', text)}
            style={[styles.input, styles.inputTall]}
            multiline
            placeholder="Bio"
            placeholderTextColor="#a29a90"
          />
          <TextInput
            value={profile.height}
            onChangeText={text => updateProfileField('height', text)}
            style={styles.input}
            placeholder="Height (optional/private)"
            placeholderTextColor="#a29a90"
          />
          <TextInput
            value={profile.size}
            onChangeText={text => updateProfileField('size', text)}
            style={styles.input}
            placeholder="Size (optional/private)"
            placeholderTextColor="#a29a90"
          />
          <TextInput
            value={profile.instagram}
            onChangeText={text => updateProfileField('instagram', text)}
            style={styles.input}
            placeholder="Instagram handle"
            placeholderTextColor="#a29a90"
          />
          <TextInput
            value={profile.tiktok}
            onChangeText={text => updateProfileField('tiktok', text)}
            style={styles.input}
            placeholder="TikTok handle"
            placeholderTextColor="#a29a90"
          />
        </View>
      </ScrollView>
    );
  }

  function renderNotificationSettings() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentPadBottom}
      >
        <ViewTitle title="Notifications" onBack={() => setView('home')} />

        <View style={styles.notificationsCard}>
          {notificationRows.map((row, index) => {
            const enabled = notificationSettings[row.key];

            return (
              <View
                key={row.key}
                style={[
                  styles.notificationRow,
                  index === notificationRows.length - 1 && styles.notificationRowLast,
                ]}
              >
                <View style={styles.notificationLeft}>
                  <View style={[styles.notificationIconWrap, enabled && styles.notificationIconWrapActive]}>
                    <Text style={styles.notificationIcon}>{row.icon}</Text>
                  </View>
                  <Text style={styles.notificationLabel}>{row.label}</Text>
                </View>

                <Switch
                  value={enabled}
                  onValueChange={() => toggleNotification(row.key)}
                  trackColor={{ false: '#d6cec2', true: '#9bc7b7' }}
                  thumbColor={enabled ? '#ffffff' : '#f6f2eb'}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  function renderPrivacy() {
    const closetVisibilityOptions = ['Everyone', 'Followers', 'Only Me'];

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentPadBottom}
      >
        <ViewTitle title="Privacy" onBack={() => setView('home')} />

        <View style={styles.sectionCard}>
          <View style={styles.toggleRow}>
            <Text style={styles.linkLabel}>Private Account</Text>
            <Switch
              value={privacySettings.privateAccount}
              onValueChange={togglePrivacyAccount}
              trackColor={{ false: '#d6cec2', true: '#9bc7b7' }}
            />
          </View>

          <Text style={styles.sectionSubtitle}>Closet Visibility</Text>
          <View style={styles.chipRow}>
            {closetVisibilityOptions.map(option => (
              <Pressable
                key={option}
                onPress={() => updateClosetVisibility(option)}
                style={[
                  styles.smallChip,
                  privacySettings.closetVisibility === option &&
                    styles.smallChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.smallChipText,
                    privacySettings.closetVisibility === option &&
                      styles.smallChipTextActive,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionSubtitle}>Blocked Users</Text>
          {privacySettings.blockedUsers.map(user => (
            <View key={user} style={styles.blockedRow}>
              <Text style={styles.subCopy}>{user}</Text>
              <Pressable
                onPress={() =>
                  setPrivacySettings(current => ({
                    ...current,
                    blockedUsers: current.blockedUsers.filter(
                      entry => entry !== user,
                    ),
                  }))
                }
              >
                <Text style={styles.smallActionBtnText}>Unblock</Text>
              </Pressable>
            </View>
          ))}

          <Pressable
            style={styles.primaryBtn}
            onPress={() =>
              Alert.alert('Data Export', 'CSV export hook goes here.')
            }
          >
            <Text style={styles.primaryBtnText}>Export Closet CSV</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  function renderAppSettings() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentPadBottom}
      >
        <ViewTitle title="App Settings" onBack={() => setView('home')} />

        <View style={styles.sectionCard}>
          <Text style={styles.sectionSubtitle}>Theme</Text>
          <View style={styles.chipRow}>
            {['Light', 'Cream'].map(entry => (
              <Pressable
                key={entry}
                onPress={() => setTheme(entry)}
                style={[
                  styles.smallChip,
                  theme === entry && styles.smallChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.smallChipText,
                    theme === entry && styles.smallChipTextActive,
                  ]}
                >
                  {entry}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.linkRow}
            onPress={() =>
              Alert.alert('Storage', 'Clear cache action can be attached here.')
            }
          >
            <View style={styles.linkLeft}>
              <Text style={styles.linkIcon}>⌂</Text>
              <Text style={styles.linkLabel}>Storage Management</Text>
            </View>
            <Text style={styles.linkArrow}>›</Text>
          </Pressable>
          <Pressable
            style={styles.linkRow}
            onPress={() =>
              Alert.alert(
                'Help & Support',
                'Connect FAQ / bug report links here.',
              )
            }
          >
            <View style={styles.linkLeft}>
              <Text style={styles.linkIcon}>◌</Text>
              <Text style={styles.linkLabel}>Help / Support</Text>
            </View>
            <Text style={styles.linkArrow}>›</Text>
          </Pressable>

          <Pressable
            style={styles.logoutBtn}
            onPress={() => onNavigate('login')}
          >
            <Text style={styles.logoutBtnText}>Logout</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  function renderCurrentView() {
    if (view === 'my-vault') {
      return renderMyVaultShortcut();
    }
    if (view === 'saved-outfits') {
      return renderSavedOutfits();
    }
    if (view === 'travel-packing') {
      return renderTravelPacking();
    }
    if (view === 'community-posts') {
      return renderCommunityPosts();
    }
    if (view === 'edit-profile') {
      return renderEditProfile();
    }
    if (view === 'notifications') {
      return renderNotificationSettings();
    }
    if (view === 'privacy') {
      return renderPrivacy();
    }
    if (view === 'app-settings') {
      return renderAppSettings();
    }

    return renderHome();
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        {renderCurrentView()}
      </View>

      <BottomTabBar selectedTab={selectedBottomTab} onNavigate={onNavigate} />
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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: '#1f1e1a',
    lineHeight: 32,
  },
  profileHeaderWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarFrame: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#ffffff',
    borderWidth: 5,
    borderColor: '#e8e3da',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'serif',
    color: '#5e544c',
    fontWeight: '700',
  },
  profileName: {
    marginTop: 8,
    color: '#1f1e1a',
    fontSize: 30,
    fontFamily: 'serif',
  },
  profileBio: {
    color: '#4e423c',
    marginTop: 2,
    fontSize: 16,
    fontFamily: 'serif',
  },
  statsCard: {
    marginTop: 16,
    backgroundColor: '#fbf7f0',
    borderRadius: 12,
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ece2d5',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ece2d5',
    marginVertical: 4,
  },
  statValue: {
    color: '#1f1e1a',
    fontSize: 28,
    fontFamily: 'serif',
  },
  statLabel: {
    marginTop: 4,
    color: '#4e423c',
    fontSize: 14,
    fontFamily: 'serif',
  },
  sectionCard: {
    marginTop: 16,
    backgroundColor: '#fbf7f0',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ece2d5',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  sectionTitle: {
    color: '#1f1e1a',
    fontFamily: 'serif',
    fontSize: 30,
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#3f362f',
    fontFamily: 'serif',
    fontSize: 19,
    marginTop: 10,
    marginBottom: 8,
  },
  linkRow: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#ece2d5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkRowLast: {
    borderBottomWidth: 0,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#f3ede5',
  },
  linkIcon: {
    color: '#3f362f',
    fontSize: 17,
    lineHeight: 20,
    textAlign: 'center',
  },
  linkLabel: {
    color: '#3f362f',
    fontFamily: 'serif',
    fontSize: 23,
  },
  linkArrow: {
    color: '#4e423c',
    fontSize: 24,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  subHeaderTitle: {
    flex: 1,
    color: '#1f1e1a',
    fontFamily: 'serif',
    fontSize: 30,
    textAlign: 'center',
  },
  subHeaderSpacer: {
    width: 32,
  },
  subCopy: {
    color: '#5d5249',
    fontFamily: 'serif',
    fontSize: 16,
  },
  codeLike: {
    marginTop: 8,
    marginBottom: 14,
    color: '#4b7466',
    fontFamily: 'serif',
    fontSize: 16,
  },
  primaryBtn: {
    marginTop: 10,
    backgroundColor: '#97bfae',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#1f2b26',
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '700',
  },
  filterRow: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  filterChip: {
    marginRight: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d9d1c5',
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: '#fbf7f0',
  },
  filterChipActive: {
    backgroundColor: '#dff0e9',
    borderColor: '#97bfae',
  },
  filterChipText: {
    color: '#5d5249',
    fontFamily: 'serif',
    fontSize: 14,
  },
  filterChipTextActive: {
    color: '#2f5042',
    fontWeight: '700',
  },
  savedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  savedCard: {
    width: '48%',
    marginTop: 12,
    backgroundColor: '#fbf7f0',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ece2d5',
    padding: 10,
  },
  savedImage: {
    height: 116,
    borderRadius: 12,
    padding: 8,
    justifyContent: 'space-between',
  },
  savedAccent: {
    marginBottom: 5,
  },
  savedTitle: {
    marginTop: 8,
    color: '#40372f',
    fontFamily: 'serif',
    fontSize: 14,
    minHeight: 38,
  },
  savedMetaRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedTag: {
    color: '#5f554c',
    fontFamily: 'serif',
    fontSize: 12,
  },
  saveToggle: {
    color: '#d0a94d',
    fontSize: 18,
  },
  saveToggleOff: {
    color: '#8f8479',
  },
  tripRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7ddd1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: '#f8f3eb',
  },
  tripRowActive: {
    borderColor: '#97bfae',
    backgroundColor: '#e8f2ed',
  },
  tripTitle: {
    color: '#3f362f',
    fontFamily: 'serif',
    fontSize: 18,
  },
  tripMeta: {
    color: '#655a50',
    fontFamily: 'serif',
    fontSize: 14,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  smallChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d9d1c5',
    backgroundColor: '#f8f3eb',
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  smallChipActive: {
    borderColor: '#97bfae',
    backgroundColor: '#e8f2ed',
  },
  smallChipText: {
    color: '#655a50',
    fontFamily: 'serif',
    fontSize: 13,
  },
  smallChipTextActive: {
    color: '#2f5042',
    fontWeight: '700',
  },
  plannerCard: {
    backgroundColor: '#f8f3eb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9dfd2',
    padding: 10,
    marginBottom: 8,
  },
  plannerTitle: {
    color: '#3f362f',
    fontFamily: 'serif',
    fontSize: 16,
    marginBottom: 2,
  },
  plannerText: {
    color: '#6a5f55',
    fontFamily: 'serif',
    fontSize: 13,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#e9dfd2',
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 6,
  },
  progressFill: {
    height: 10,
    backgroundColor: '#97bfae',
  },
  analyticsRow: {
    marginTop: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsText: {
    color: '#5f544a',
    fontFamily: 'serif',
    fontSize: 13,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  smallActionBtn: {
    backgroundColor: '#e8f2ed',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  smallActionBtnText: {
    color: '#355648',
    fontFamily: 'serif',
    fontSize: 13,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#f6dddc',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  deleteBtnText: {
    color: '#873f3b',
    fontFamily: 'serif',
    fontSize: 13,
    fontWeight: '700',
  },
  avatarEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarMini: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ddd4c8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarMiniText: {
    color: '#5e544c',
    fontFamily: 'serif',
    fontSize: 17,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd4c8',
    backgroundColor: '#fdfbf6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#3f362f',
    fontFamily: 'serif',
    fontSize: 15,
    marginBottom: 8,
  },
  inputTall: {
    minHeight: 74,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationsCard: {
    marginTop: 16,
    backgroundColor: '#fbf7f0',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ece2d5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#2c2a24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ede4d8',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  notificationRowLast: {
    borderBottomWidth: 0,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    paddingRight: 8,
  },
  notificationIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#f1eadd',
    borderWidth: 1,
    borderColor: '#e7ddcf',
  },
  notificationIconWrapActive: {
    backgroundColor: '#e2efe8',
    borderColor: '#b9d8cb',
  },
  notificationIcon: {
    fontSize: 15,
  },
  notificationLabel: {
    color: '#3f362f',
    fontFamily: 'serif',
    fontSize: 23,
  },
  blockedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5dacd',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: '#f8f3eb',
  },
  logoutBtn: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: '#f2d4d2',
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#7f3a37',
    fontFamily: 'serif',
    fontWeight: '700',
    fontSize: 16,
  },
  contentPadBottom: {
    paddingBottom: 132,
  },
});
