import React, { useMemo, useState } from 'react';
import {
  Platform,
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  communityUsers,
  communityPosts,
  currentUser,
  initialFollowedUserIds,
  initialCommentsByPost,
} from '../data/communityMockData';

import BottomTabBar from '../components/BottomTabBar';
import ScreenBackButton from '../components/ScreenBackButton';

const userMap = communityUsers.reduce((acc, user) => {
  acc[user.id] = user;
  return acc;
}, {});

function MockOutfitImage({ mockImage, compact = false }) {
  return (
    <View
      style={[
        styles.mockImage,
        { backgroundColor: mockImage.background },
        compact && styles.mockImageCompact,
      ]}
    >
      <View style={styles.mockTopRow}>
        <View
          style={[
            styles.mockAccentCircle,
            { backgroundColor: mockImage.accents[0] },
          ]}
        />
        <View
          style={[
            styles.mockAccentCircleSmall,
            { backgroundColor: mockImage.accents[1] },
          ]}
        />
      </View>
      <View style={styles.mockCenterBar}>
        <View
          style={[
            styles.mockBlockTall,
            { backgroundColor: mockImage.accents[2] },
          ]}
        />
        <View
          style={[
            styles.mockBlockWide,
            { backgroundColor: mockImage.accents[3] },
          ]}
        />
      </View>
    </View>
  );
}

function Avatar({ user, size = 42 }) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: user.avatarColor,
        },
      ]}
    >
      <Text
        style={[
          styles.avatarText,
          { fontSize: Math.max(12, Math.floor(size * 0.34)) },
        ]}
      >
        {user.name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

function NotificationSeparator() {
  return <View style={styles.notificationSeparator} />;
}

function PostCard({
  post,
  user,
  isFollowing,
  isLiked,
  commentCount,
  commentPreview,
  onToggleLike,
  onToggleFollow,
  onOpenProfile,
  onOpenComments,
  compact = false,
}) {
  return (
    <View style={[styles.postCard, compact && styles.postCardCompact]}>
      <View style={styles.postHeader}>
        <TouchableOpacity
          style={styles.postUser}
          onPress={() => onOpenProfile(user.id)}
        >
          <Avatar user={user} size={compact ? 34 : 42} />
          <View>
            <Text style={styles.postName}>{user.name}</Text>
            <Text style={styles.postHandle}>{user.handle}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.followBtn, isFollowing && styles.followBtnActive]}
          onPress={() => onToggleFollow(user.id)}
        >
          <Text
            style={[
              styles.followBtnText,
              isFollowing && styles.followBtnTextActive,
            ]}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>

      <MockOutfitImage mockImage={post.mockImage} compact={compact} />

      <Text style={styles.postCaption}>{post.caption}</Text>

      <View style={styles.postMetaRow}>
        <Text style={styles.postMeta}>{post.category}</Text>
        <Text style={styles.postMeta}>•</Text>
        <Text style={styles.postMeta}>{post.createdAt}</Text>
      </View>

      <View style={styles.socialStatsRow}>
        <Text style={styles.socialStatText}>
          {post.likes + (isLiked ? 1 : 0)} likes
        </Text>
        <Text style={styles.socialStatText}>{commentCount} comments</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.iconActionBtn}
          onPress={() => onToggleLike(post.id)}
        >
          <Text style={[styles.iconAction, isLiked && styles.iconActionActive]}>
            {isLiked ? '♥' : '♡'}
          </Text>
          <Text
            style={[
              styles.iconActionLabel,
              isLiked && styles.iconActionLabelActive,
            ]}
          >
            Like
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconActionBtn}
          onPress={() => onOpenComments(post.id)}
        >
          <Text style={styles.iconAction}>💬</Text>
          <Text style={styles.iconActionLabel}>Comment</Text>
        </TouchableOpacity>
      </View>

      {commentPreview ? (
        <TouchableOpacity
          style={styles.commentPreviewBox}
          onPress={() => onOpenComments(post.id)}
        >
          <Text style={styles.commentPreviewAuthor}>
            {commentPreview.author}
          </Text>
          <Text style={styles.commentPreviewText}>{commentPreview.text}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function CommunityPage({
  onNavigate,
  selectedBottomTab = 'community',
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const topSpacing = Math.max(insets.top, statusBarHeight) + 14;
  const isSmall = width < 380;

  const [timelineTab, setTimelineTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [followedIds, setFollowedIds] = useState(initialFollowedUserIds);
  const [likedPostIds, setLikedPostIds] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [draftComment, setDraftComment] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [commentsByPost, setCommentsByPost] = useState(initialCommentsByPost);
  const [notifications, setNotifications] = useState([
    {
      id: 'n-welcome',
      text: 'Welcome to Community. Start by following creators you like.',
      time: 'now',
    },
  ]);

  const filteredPosts = useMemo(() => {
    if (timelineTab === 'following') {
      return communityPosts.filter(post => followedIds.includes(post.userId));
    }
    return communityPosts;
  }, [timelineTab, followedIds]);

  const selectedProfilePosts = useMemo(() => {
    if (!selectedProfileId) {
      return [];
    }
    return communityPosts.filter(post => post.userId === selectedProfileId);
  }, [selectedProfileId]);

  const activeComments = activeCommentsPostId
    ? commentsByPost[activeCommentsPostId] || []
    : [];

  const activeCommentsPost = activeCommentsPostId
    ? communityPosts.find(post => post.id === activeCommentsPostId)
    : null;

  const toggleFollow = userId => {
    const user = userMap[userId];

    setFollowedIds(prev => {
      const already = prev.includes(userId);
      const next = already
        ? prev.filter(id => id !== userId)
        : [...prev, userId];

      setNotifications(existing => [
        {
          id: `n-follow-${userId}-${Date.now()}`,
          text: already
            ? `You unfollowed ${user.name}.`
            : `You started following ${user.name}.`,
          time: 'now',
        },
        ...existing,
      ]);

      return next;
    });
  };

  const toggleLike = postId => {
    setLikedPostIds(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId],
    );
  };

  const openProfile = userId => {
    setSelectedProfileId(userId);
  };

  const closeProfile = () => {
    setSelectedProfileId(null);
  };

  const openComments = postId => {
    setActiveCommentsPostId(postId);
  };

  const closeComments = () => {
    setActiveCommentsPostId(null);
    setDraftComment('');
  };

  const submitComment = () => {
    const nextComment = draftComment.trim();

    if (!activeCommentsPostId || !nextComment) {
      return;
    }

    setCommentsByPost(prev => ({
      ...prev,
      [activeCommentsPostId]: [
        ...(prev[activeCommentsPostId] || []),
        {
          id: `c-${activeCommentsPostId}-${Date.now()}`,
          author: currentUser.name,
          text: nextComment,
          time: 'now',
        },
      ],
    }));
    setNotifications(existing => [
      {
        id: `n-comment-${activeCommentsPostId}-${Date.now()}`,
        text: 'Your comment was added.',
        time: 'now',
      },
      ...existing,
    ]);
    setDraftComment('');
  };

  const renderGrid = () => (
    <View style={styles.gridWrap}>
      {filteredPosts.map(post => {
        const user = userMap[post.userId];
        return (
          <TouchableOpacity
            key={post.id}
            style={[styles.gridCard, isSmall && styles.gridCardSmall]}
            onPress={() => openProfile(user.id)}
            activeOpacity={0.9}
          >
            <MockOutfitImage mockImage={post.mockImage} compact />
            <View style={styles.gridCardBottom}>
              <Avatar user={user} size={28} />
              <View style={styles.gridTextWrap}>
                <Text style={styles.gridName}>{user.name}</Text>
                <Text style={styles.gridSub}>{post.category}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderFeed = () => (
    <View style={styles.feedWrap}>
      {filteredPosts.map(post => {
        const user = userMap[post.userId];
        return (
          <PostCard
            key={post.id}
            post={post}
            user={user}
            isFollowing={followedIds.includes(user.id)}
            isLiked={likedPostIds.includes(post.id)}
            commentCount={(commentsByPost[post.id] || []).length}
            commentPreview={(commentsByPost[post.id] || []).slice(-1)[0]}
            onToggleLike={toggleLike}
            onToggleFollow={toggleFollow}
            onOpenProfile={openProfile}
            onOpenComments={openComments}
          />
        );
      })}
    </View>
  );

  const renderProfile = () => {
    const user = userMap[selectedProfileId];
    const isFollowing = followedIds.includes(user.id);
    const followerCount = user.followers + (isFollowing ? 1 : 0);

    return (
      <View style={styles.overlayCard}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={closeProfile} style={styles.simpleBtn}>
            <Text style={styles.simpleBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.profileTitle}>Profile</Text>
          <View style={styles.simpleBtn} />
        </View>

        <View style={styles.profileMain}>
          <Avatar user={user} size={68} />
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileHandle}>{user.handle}</Text>
          <Text style={styles.profileBio}>{user.bio}</Text>

          <View style={styles.profileStatsRow}>
            <View style={styles.profileStatBox}>
              <Text style={styles.profileStatNum}>
                {selectedProfilePosts.length}
              </Text>
              <Text style={styles.profileStatLabel}>Posts</Text>
            </View>
            <View style={styles.profileStatBox}>
              <Text style={styles.profileStatNum}>{followerCount}</Text>
              <Text style={styles.profileStatLabel}>Followers</Text>
            </View>
            <View style={styles.profileStatBox}>
              <Text style={styles.profileStatNum}>{user.following}</Text>
              <Text style={styles.profileStatLabel}>Following</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.followBtnLarge,
              isFollowing && styles.followBtnLargeActive,
            ]}
            onPress={() => toggleFollow(user.id)}
          >
            <Text
              style={[
                styles.followBtnLargeText,
                isFollowing && styles.followBtnLargeTextActive,
              ]}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.profilePostsTitle}>Posts</Text>
        <View style={styles.gridWrap}>
          {selectedProfilePosts.map(post => (
            <View
              key={post.id}
              style={[styles.gridCard, isSmall && styles.gridCardSmall]}
            >
              <MockOutfitImage mockImage={post.mockImage} compact />
              <Text style={styles.profilePostCaption} numberOfLines={1}>
                {post.caption}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <ScreenBackButton onPress={() => onNavigate('home')} />
          <View style={styles.topBarCenter}>
            <Text style={styles.headerTitle}>Community</Text>
            <Text style={styles.headerSub}>
              Discover and follow style creators
            </Text>
          </View>

          <TouchableOpacity
            style={styles.notifyBtn}
            onPress={() => setShowNotifications(prev => !prev)}
          >
            <Text style={styles.notifyBtnText}>🔔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              timelineTab === 'following' && styles.segmentBtnActive,
            ]}
            onPress={() => setTimelineTab('following')}
          >
            <Text
              style={[
                styles.segmentBtnText,
                timelineTab === 'following' && styles.segmentBtnTextActive,
              ]}
            >
              Following
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              timelineTab === 'all' && styles.segmentBtnActive,
            ]}
            onPress={() => setTimelineTab('all')}
          >
            <Text
              style={[
                styles.segmentBtnText,
                timelineTab === 'all' && styles.segmentBtnTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              viewMode === 'grid' && styles.modeBtnActive,
            ]}
            onPress={() => setViewMode('grid')}
          >
            <Text
              style={[
                styles.modeText,
                viewMode === 'grid' && styles.modeTextActive,
              ]}
            >
              Grid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              viewMode === 'feed' && styles.modeBtnActive,
            ]}
            onPress={() => setViewMode('feed')}
          >
            <Text
              style={[
                styles.modeText,
                viewMode === 'feed' && styles.modeTextActive,
              ]}
            >
              Feed
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredPosts.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No posts here yet</Text>
              <Text style={styles.emptySub}>
                Follow creators to see posts in your Following timeline.
              </Text>
            </View>
          ) : viewMode === 'grid' ? (
            renderGrid()
          ) : (
            renderFeed()
          )}
        </ScrollView>

        {showNotifications ? (
          <View style={styles.notificationsOverlay}>
            <View style={styles.notificationsCard}>
              <View style={styles.notificationsHeader}>
                <Text style={styles.notificationsTitle}>Notifications</Text>
                <TouchableOpacity onPress={() => setShowNotifications(false)}>
                  <Text style={styles.notificationsClose}>Close</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.notificationItem}>
                    <Text style={styles.notificationText}>{item.text}</Text>
                    <Text style={styles.notificationTime}>{item.time}</Text>
                  </View>
                )}
                ItemSeparatorComponent={NotificationSeparator}
                style={styles.notificationList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        ) : null}

        {selectedProfileId ? (
          <View style={styles.profileOverlay}>
            <ScrollView
              contentContainerStyle={styles.profileOverlayContent}
              showsVerticalScrollIndicator={false}
            >
              {renderProfile()}
            </ScrollView>
          </View>
        ) : null}

        {activeCommentsPost ? (
          <View style={styles.commentsOverlay}>
            <View style={styles.commentsCard}>
              <View style={styles.commentsHeader}>
                <TouchableOpacity
                  onPress={closeComments}
                  style={styles.commentsBackBtn}
                >
                  <Text style={styles.commentsBackText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.commentsTitle}>Comments</Text>
                <View style={styles.commentsBackBtn} />
              </View>

              <Text style={styles.commentsCaption} numberOfLines={2}>
                {activeCommentsPost.caption}
              </Text>

              <FlatList
                data={activeComments}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.commentItem}>
                    <View style={styles.commentAvatarMini}>
                      <Text style={styles.commentAvatarMiniText}>
                        {item.author.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.commentBubble}>
                      <View style={styles.commentTopLine}>
                        <Text style={styles.commentAuthor}>{item.author}</Text>
                        <Text style={styles.commentTime}>{item.time}</Text>
                      </View>
                      <Text style={styles.commentBody}>{item.text}</Text>
                    </View>
                  </View>
                )}
                ItemSeparatorComponent={NotificationSeparator}
                style={styles.commentsList}
                contentContainerStyle={styles.commentsListContent}
                showsVerticalScrollIndicator={false}
              />

              <View style={styles.commentComposer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  placeholderTextColor="#8a92a4"
                  value={draftComment}
                  onChangeText={setDraftComment}
                  multiline
                />
                <TouchableOpacity
                  style={styles.commentSendBtn}
                  onPress={submitComment}
                >
                  <Text style={styles.commentSendText}>Post</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

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
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
    gap: 6,
  },
  topBarCenter: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 27,
    lineHeight: 33,
    color: '#534740',
    fontFamily: 'serif',
    fontWeight: '500',
  },
  headerSub: {
    marginTop: 2,
    color: '#6e6258',
    fontSize: 13,
    fontFamily: 'serif',
  },
  notifyBtn: {
    backgroundColor: '#fbf7f0',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#efe5d8',
  },
  notifyBtnText: {
    color: '#534740',
    fontWeight: '700',
    fontSize: 17,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f3eb',
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#9bc7b7',
  },
  segmentBtnText: {
    color: '#6c6057',
    fontWeight: '700',
    fontSize: 13,
    fontFamily: 'serif',
  },
  segmentBtnTextActive: {
    color: '#ffffff',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  modeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#f8f3eb',
  },
  modeBtnActive: {
    backgroundColor: '#9bc7b7',
  },
  modeText: {
    color: '#6c6057',
    fontWeight: '700',
    fontFamily: 'serif',
  },
  modeTextActive: {
    color: '#ffffff',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 132,
  },
  emptyBox: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#4e423c',
    fontFamily: 'serif',
  },
  emptySub: {
    marginTop: 8,
    textAlign: 'center',
    color: '#6e6258',
    lineHeight: 20,
    fontFamily: 'serif',
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#fbf7f0',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#b49e84',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },
  gridCardSmall: {
    width: '100%',
  },
  gridCardBottom: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gridTextWrap: {
    flex: 1,
  },
  gridName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4e423c',
    fontFamily: 'serif',
  },
  gridSub: {
    fontSize: 11,
    color: '#6e6258',
    marginTop: 1,
    fontFamily: 'serif',
  },
  feedWrap: {
    gap: 10,
  },
  postCard: {
    backgroundColor: '#fbf7f0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#b49e84',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  postCardCompact: {
    padding: 10,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postName: {
    color: '#4e423c',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: 'serif',
  },
  postHandle: {
    color: '#6e6258',
    fontSize: 11,
    fontFamily: 'serif',
  },
  followBtn: {
    backgroundColor: '#97bfae',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },
  followBtnActive: {
    backgroundColor: '#e8f2ed',
  },
  followBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  followBtnTextActive: {
    color: '#64594e',
  },
  postCaption: {
    marginTop: 10,
    color: '#4e423c',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'serif',
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  postMeta: {
    color: '#6e6258',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'serif',
  },
  actionRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 18,
  },
  socialStatsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 14,
  },
  socialStatText: {
    fontWeight: '700',
    color: '#4e423c',
    fontSize: 12,
    fontFamily: 'serif',
  },
  iconActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconAction: {
    fontSize: 20,
    color: '#64594e',
  },
  iconActionActive: {
    color: '#e3ba4e',
  },
  iconActionLabel: {
    color: '#6e6258',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  iconActionLabelActive: {
    color: '#9d8f82',
  },
  commentPreviewBox: {
    marginTop: 10,
    backgroundColor: '#f8f3eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  commentPreviewAuthor: {
    color: '#4e423c',
    fontWeight: '800',
    fontSize: 12,
    fontFamily: 'serif',
  },
  commentPreviewText: {
    marginTop: 2,
    color: '#6e6258',
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'serif',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  mockImage: {
    borderRadius: 12,
    padding: 10,
    height: 142,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5d8c8',
  },
  mockImageCompact: {
    height: 104,
  },
  mockTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mockAccentCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  mockAccentCircleSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  mockCenterBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  mockBlockTall: {
    width: '46%',
    height: 66,
    borderRadius: 10,
  },
  mockBlockWide: {
    width: '46%',
    height: 44,
    borderRadius: 10,
  },
  notificationsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 24, 35, 0.25)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 90,
    zIndex: 20,
  },
  notificationsCard: {
    width: '92%',
    maxHeight: '58%',
    backgroundColor: '#fbf7f0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#efe5d8',
    padding: 12,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4e423c',
    fontFamily: 'serif',
  },
  notificationsClose: {
    color: '#64594e',
    fontWeight: '700',
    fontFamily: 'serif',
  },
  notificationList: {
    maxHeight: 300,
  },
  notificationItem: {
    paddingVertical: 8,
  },
  notificationText: {
    color: '#4e423c',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'serif',
  },
  notificationTime: {
    marginTop: 4,
    color: '#6e6258',
    fontSize: 11,
    fontFamily: 'serif',
  },
  notificationSeparator: {
    height: 1,
    backgroundColor: '#efe5d8',
  },
  profileOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 20, 30, 0.35)',
    zIndex: 30,
  },
  profileOverlayContent: {
    paddingTop: 28,
    paddingBottom: 120,
    paddingHorizontal: 12,
  },
  overlayCard: {
    backgroundColor: '#fbf7f0',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#efe5d8',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simpleBtn: {
    minWidth: 46,
  },
  simpleBtnText: {
    color: '#64594e',
    fontWeight: '700',
    fontFamily: 'serif',
  },
  profileTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: '#4e423c',
    fontFamily: 'serif',
  },
  profileMain: {
    alignItems: 'center',
    marginTop: 12,
  },
  profileName: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: '800',
    color: '#4e423c',
    fontFamily: 'serif',
  },
  profileHandle: {
    marginTop: 3,
    color: '#6e6258',
    fontWeight: '600',
    fontFamily: 'serif',
  },
  profileBio: {
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
    color: '#6e6258',
    paddingHorizontal: 8,
    fontFamily: 'serif',
  },
  profileStatsRow: {
    marginTop: 14,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 8,
  },
  profileStatBox: {
    flex: 1,
    backgroundColor: '#f8f3eb',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  profileStatNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4e423c',
    fontFamily: 'serif',
  },
  profileStatLabel: {
    marginTop: 3,
    color: '#6e6258',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  followBtnLarge: {
    marginTop: 14,
    backgroundColor: '#97bfae',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  followBtnLargeActive: {
    backgroundColor: '#e8f2ed',
  },
  followBtnLargeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: 'serif',
  },
  followBtnLargeTextActive: {
    color: '#64594e',
  },
  commentsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(16, 20, 30, 0.35)',
    justifyContent: 'flex-end',
    zIndex: 40,
  },
  commentsCard: {
    backgroundColor: '#fbf7f0',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    minHeight: '62%',
    maxHeight: '82%',
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentsBackBtn: {
    minWidth: 28,
    alignItems: 'center',
  },
  commentsBackText: {
    fontSize: 20,
    color: '#64594e',
    fontWeight: '700',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4e423c',
    fontFamily: 'serif',
  },
  commentsCaption: {
    marginTop: 12,
    marginBottom: 10,
    color: '#6e6258',
    lineHeight: 19,
    fontFamily: 'serif',
  },
  commentsList: {
    flexGrow: 0,
  },
  commentsListContent: {
    paddingBottom: 12,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
  },
  commentAvatarMini: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#97bfae',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarMiniText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  commentBubble: {
    flex: 1,
    backgroundColor: '#f8f3eb',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  commentTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  commentAuthor: {
    color: '#4e423c',
    fontWeight: '800',
    fontSize: 12,
    fontFamily: 'serif',
  },
  commentTime: {
    color: '#6e6258',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'serif',
  },
  commentBody: {
    marginTop: 4,
    color: '#4e423c',
    lineHeight: 18,
    fontFamily: 'serif',
  },
  commentComposer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#efe5d8',
    paddingTop: 12,
  },
  commentInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 96,
    backgroundColor: '#f8f3eb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#4e423c',
    fontFamily: 'serif',
  },
  commentSendBtn: {
    backgroundColor: '#97bfae',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentSendText: {
    color: '#ffffff',
    fontWeight: '800',
    fontFamily: 'serif',
  },
  profilePostsTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '800',
    color: '#4e423c',
    fontSize: 16,
    fontFamily: 'serif',
  },
  profilePostCaption: {
    marginTop: 8,
    fontSize: 12,
    color: '#6e6258',
    fontFamily: 'serif',
  },
});
