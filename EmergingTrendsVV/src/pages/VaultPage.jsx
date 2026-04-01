/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getVaultItems, vaultTabs } from '../data/vaultMockData';

const bottomTabs = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'scan', label: 'Scan', icon: '⌗' },
  { key: 'vault', label: 'Vault', icon: '⬡' },
  { key: 'community', label: 'Community', icon: '◌' },
  { key: 'profile', label: 'Profile', icon: '◠' },
];

export default function VaultPage({
  loadVaultItems = getVaultItems,
  items,
  selectedBottomTab = 'vault',
  onBottomTabPress,
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const topSpacing = Math.max(insets.top, statusBarHeight) + 14;
  const [activeTab, setActiveTab] = useState('all');
  const [loadedItems, setLoadedItems] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  const sourceItems = items || loadedItems;

  useEffect(() => {
    let isMounted = true;

    async function loadItems() {
      const result = await loadVaultItems();

      if (!isMounted) {
        return;
      }

      setLoadedItems(result);
      setFavoriteIds(
        result.reduce((accumulator, item) => {
          accumulator[item.id] = item.isFavorite;
          return accumulator;
        }, {}),
      );
    }

    loadItems();

    return () => {
      isMounted = false;
    };
  }, [loadVaultItems]);

  const filteredItems = useMemo(() => {
    let result;
    if (activeTab === 'favorites') {
      result = sourceItems.filter(item => favoriteIds[item.id]);
    } else if (activeTab === 'all') {
      result = sourceItems;
    } else {
      result = sourceItems.filter(item => item.category === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        item =>
          item.title?.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [activeTab, favoriteIds, sourceItems, searchQuery]);

  const summary = useMemo(() => {
    const favoritesCount = Object.values(favoriteIds).filter(Boolean).length;

    return {
      savedCount: sourceItems.length,
      favoritesCount,
    };
  }, [favoriteIds, sourceItems]);

  useEffect(() => {
    setFavoriteIds(currentFavorites =>
      sourceItems.reduce((accumulator, item) => {
        accumulator[item.id] = item.isFavorite || currentFavorites[item.id] || false;
        return accumulator;
      }, {}),
    );
  }, [sourceItems]);

  const gutter = width < 380 ? 14 : 18;
  const horizontalPadding = width < 380 ? 18 : 24;
  const cardWidth = (width - horizontalPadding * 2 - gutter) / 2;

  function handleToggleFavorite(itemId) {
    setFavoriteIds(currentFavorites => ({
      ...currentFavorites,
      [itemId]: !currentFavorites[itemId],
    }));
  }

  function handleBottomTabPress(tabKey) {
    if (onBottomTabPress) {
      onBottomTabPress(tabKey);
      return;
    }

    if (tabKey === 'vault') {
      return;
    }

    Alert.alert('Coming soon', `${tabKey[0].toUpperCase()}${tabKey.slice(1)} page is not built yet.`);
  }

  function renderHeader() {
    return (
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Vault</Text>
          <View style={styles.headerActions}>
            <Pressable
              hitSlop={10}
              onPress={() => {
                setSearchVisible(v => !v);
                setSearchQuery('');
              }}
              style={styles.headerIconButton}>
              <Text style={[styles.headerIcon, searchVisible && { color: '#97bfae' }]}>⌕</Text>
            </Pressable>
            <Pressable
              hitSlop={10}
              onPress={() => Alert.alert('Menu', 'Vault actions menu will be added here.')}
              style={styles.headerIconButton}>
              <Text style={styles.headerIcon}>⋯</Text>
            </Pressable>
          </View>
        </View>

        {searchVisible ? (
          <View style={styles.searchBarWrap}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              autoFocus
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search your vault…"
              placeholderTextColor="#b0a89e"
              style={styles.searchInput}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <Pressable hitSlop={8} onPress={() => setSearchQuery('')}>
                <Text style={styles.searchClear}>✕</Text>
              </Pressable>
            )}
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}>
          {vaultTabs.map(tab => {
            const isActive = tab.key === activeTab;

            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabChip, isActive && styles.tabChipActive]}>
                <Text style={[styles.tabChipText, isActive && styles.tabChipTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeTab === 'all' ? (
          <Pressable
            onPress={() => Alert.alert('Closet Summary', `${summary.savedCount} items saved and ${summary.favoritesCount} favourites in your vault.`)}
            style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Closet Summary</Text>
            <Text style={styles.summaryText}>{summary.savedCount} items saved</Text>
            <Text style={styles.summaryText}>{summary.favoritesCount} favourites</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  function renderCard({ item, index }) {
    const isFavorite = Boolean(favoriteIds[item.id]);
    const isLeftColumn = index % 2 === 0;

    return (
      <Pressable
        onPress={() => Alert.alert(item.title, `${item.subtitle}\n\nThis card is ready for a details page or database-driven view.`)}
        style={[
          styles.card,
          {
            width: cardWidth,
            marginRight: isLeftColumn ? gutter : 0,
          },
        ]}>
        <View style={styles.favoriteButtonWrap}>
          <Pressable
            hitSlop={8}
            onPress={() => handleToggleFavorite(item.id)}
            style={styles.favoriteButton}>
            <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>

        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.imageMock} />
        ) : (
          <OutfitMockImage mockImage={item.mockImage} />
        )}

        <View style={styles.cardTextWrap}>
          <Text numberOfLines={2} style={styles.cardTitle}>
            {item.title}
          </Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { paddingTop: topSpacing }]}>
      <View style={styles.screen}>
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          numColumns={2}
          renderItem={renderCard}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: 128,
            },
          ]}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.bottomBar}>
          {bottomTabs.map(tab => {
            const isActive = tab.key === selectedBottomTab;

            return (
              <Pressable
                key={tab.key}
                onPress={() => handleBottomTabPress(tab.key)}
                style={styles.bottomTab}>
                <View style={[styles.bottomIconWrap, isActive && styles.bottomIconWrapActive]}>
                  <Text style={[styles.bottomIcon, isActive && styles.bottomIconActive]}>
                    {tab.icon}
                  </Text>
                </View>
                <Text style={[styles.bottomLabel, isActive && styles.bottomLabelActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

function OutfitMockImage({ mockImage }) {
  const { accents, background, layout } = mockImage;

  return (
    <View style={[styles.imageMock, { backgroundColor: background }]}> 
      {layout === 'travel-kit' ? <TravelKitLayout accents={accents} /> : null}
      {layout === 'carry-on' ? <CarryOnLayout accents={accents} /> : null}
      {layout === 'city-tour' ? <CityTourLayout accents={accents} /> : null}
      {layout === 'resort' ? <ResortLayout accents={accents} /> : null}
      {layout === 'minimal-pack' ? <MinimalPackLayout accents={accents} /> : null}
      {layout === 'denim-combo' ? <DenimComboLayout accents={accents} /> : null}
      {layout === 'blazer-set' ? <BlazerSetLayout accents={accents} /> : null}
      {layout === 'executive' ? <ExecutiveLayout accents={accents} /> : null}
      {layout === 'boardroom' ? <BoardroomLayout accents={accents} /> : null}
      {layout === 'desk-day' ? <DeskDayLayout accents={accents} /> : null}
      {layout === 'capsule' ? <CapsuleLayout accents={accents} /> : null}
      {layout === 'conference' ? <ConferenceLayout accents={accents} /> : null}
    </View>
  );
}

function TravelKitLayout({ accents }) {
  return (
    <>
      <Circle style={{ backgroundColor: accents[0], left: '9%', top: '12%', width: 48, height: 48 }} />
      <RoundedBlock style={{ backgroundColor: accents[1], right: '13%', top: '14%', width: 60, height: 36 }} />
      <RoundedBlock style={{ backgroundColor: accents[2], left: '10%', bottom: '12%', width: 62, height: 24 }} />
      <RoundedBlock style={{ backgroundColor: accents[3], right: '10%', bottom: '11%', width: 54, height: 34 }} />
      <Circle style={{ backgroundColor: '#f6edd8', left: '42%', top: '40%', width: 18, height: 18 }} />
      <RoundedBlock style={{ backgroundColor: '#8ba5ba', left: '38%', top: '22%', width: 10, height: 48 }} />
    </>
  );
}

function CarryOnLayout({ accents }) {
  return (
    <>
      <Circle style={{ backgroundColor: accents[0], left: '11%', top: '10%', width: 40, height: 40 }} />
      <RoundedBlock style={{ backgroundColor: accents[1], right: '11%', top: '11%', width: 56, height: 34 }} />
      <RoundedBlock style={{ backgroundColor: accents[2], right: '12%', bottom: '14%', width: 56, height: 28 }} />
      <RoundedBlock style={{ backgroundColor: accents[3], left: '13%', bottom: '15%', width: 42, height: 18 }} />
      <RoundedBlock style={{ backgroundColor: '#d3b58f', left: '32%', top: '48%', width: 28, height: 16 }} />
    </>
  );
}

function CityTourLayout({ accents }) {
  return (
    <>
      <RoundedBlock style={{ backgroundColor: accents[0], left: '9%', top: '46%', width: 78, height: 18, borderRadius: 20, transform: [{ rotate: '6deg' }] }} />
      <Circle style={{ backgroundColor: accents[1], right: '11%', top: '23%', width: 24, height: 24 }} />
      <RoundedBlock style={{ backgroundColor: accents[2], right: '21%', bottom: '13%', width: 10, height: 38 }} />
      <Circle style={{ backgroundColor: accents[3], left: '13%', top: '25%', width: 20, height: 20 }} />
      <Circle style={{ backgroundColor: '#efe1cb', right: '33%', top: '18%', width: 18, height: 18 }} />
    </>
  );
}

function ResortLayout({ accents }) {
  return (
    <>
      <RoundedBlock style={{ backgroundColor: accents[0], left: '8%', top: '10%', width: 42, height: 70, transform: [{ rotate: '-10deg' }] }} />
      <RoundedBlock style={{ backgroundColor: accents[1], right: '12%', top: '8%', width: 48, height: 58, transform: [{ rotate: '16deg' }] }} />
      <RoundedBlock style={{ backgroundColor: accents[2], left: '26%', bottom: '12%', width: 54, height: 44, transform: [{ rotate: '-8deg' }] }} />
      <RoundedBlock style={{ backgroundColor: accents[3], right: '10%', bottom: '17%', width: 14, height: 40, transform: [{ rotate: '24deg' }] }} />
    </>
  );
}

function MinimalPackLayout({ accents }) {
  return (
    <>
      <RoundedBlock style={{ backgroundColor: accents[0], left: '7%', top: '18%', width: 48, height: 42 }} />
      <RoundedBlock style={{ backgroundColor: accents[1], left: '35%', top: '12%', width: 52, height: 66 }} />
      <RoundedBlock style={{ backgroundColor: accents[2], left: '34%', bottom: '11%', width: 30, height: 20 }} />
      <RoundedBlock style={{ backgroundColor: accents[3], right: '11%', top: '26%', width: 16, height: 56 }} />
    </>
  );
}

function DenimComboLayout({ accents }) {
  return (
    <>
      <RoundedBlock style={{ backgroundColor: accents[0], left: '10%', top: '12%', width: 86, height: 18 }} />
      <RoundedBlock style={{ backgroundColor: accents[1], right: '11%', top: '24%', width: 38, height: 56 }} />
      <RoundedBlock style={{ backgroundColor: accents[2], left: '14%', bottom: '12%', width: 34, height: 44 }} />
      <RoundedBlock style={{ backgroundColor: accents[3], right: '35%', bottom: '13%', width: 42, height: 26 }} />
    </>
  );
}

function BlazerSetLayout({ accents }) {
  return (
    <>
      <RoundedBlock style={{ backgroundColor: accents[0], left: '11%', top: '10%', width: 54, height: 88 }} />
      <RoundedBlock style={{ backgroundColor: accents[1], right: '11%', top: '16%', width: 44, height: 76 }} />
      <RoundedBlock style={{ backgroundColor: accents[2], left: '16%', bottom: '18%', width: 70, height: 8 }} />
    </>
  );
}

function ExecutiveLayout({ accents }) {
  return (
    <>
      <RoundedBlock style={{ backgroundColor: accents[0], left: '9%', top: '10%', width: 52, height: 44 }} />
      <RoundedBlock style={{ backgroundColor: accents[1], right: '9%', top: '14%', width: 42, height: 58 }} />
      <RoundedBlock style={{ backgroundColor: accents[2], left: '18%', bottom: '14%', width: 34, height: 34 }} />
      <RoundedBlock style={{ backgroundColor: accents[3], right: '13%', bottom: '11%', width: 30, height: 24 }} />
    </>
  );
}

function BoardroomLayout({ accents }) {
  return (
    <>
      <RoundedBlock style={{ backgroundColor: accents[0], left: '14%', top: '16%', width: 66, height: 62, transform: [{ rotate: '-8deg' }] }} />
      <RoundedBlock style={{ backgroundColor: accents[1], left: '31%', top: '29%', width: 18, height: 34 }} />
      <RoundedBlock style={{ backgroundColor: accents[2], right: '17%', top: '30%', width: 28, height: 30 }} />
      <RoundedBlock style={{ backgroundColor: accents[3], left: '24%', bottom: '13%', width: 62, height: 10 }} />
    </>
  );
}

function DeskDayLayout({ accents }) {
  return (
    <>
      <RoundedBlock style={{ backgroundColor: accents[0], left: '9%', top: '12%', width: 36, height: 62, transform: [{ rotate: '-10deg' }] }} />
      <RoundedBlock style={{ backgroundColor: accents[1], left: '30%', top: '12%', width: 62, height: 56 }} />
      <RoundedBlock style={{ backgroundColor: accents[2], right: '13%', bottom: '14%', width: 34, height: 18 }} />
      <Circle style={{ backgroundColor: accents[3], left: '36%', bottom: '20%', width: 12, height: 12 }} />
    </>
  );
}

function CapsuleLayout({ accents }) {
  return (
    <>
      <RoundedBlock style={{ backgroundColor: accents[0], left: '22%', top: '11%', width: 54, height: 54, transform: [{ rotate: '-9deg' }] }} />
      <RoundedBlock style={{ backgroundColor: accents[1], right: '8%', bottom: '11%', width: 30, height: 42 }} />
      <RoundedBlock style={{ backgroundColor: accents[2], left: '11%', top: '21%', width: 22, height: 56 }} />
      <RoundedBlock style={{ backgroundColor: accents[3], left: '12%', bottom: '12%', width: 20, height: 18 }} />
    </>
  );
}

function ConferenceLayout({ accents }) {
  return (
    <>
      <RoundedBlock style={{ backgroundColor: accents[0], left: '19%', top: '10%', width: 66, height: 74 }} />
      <RoundedBlock style={{ backgroundColor: accents[1], left: '30%', top: '18%', width: 14, height: 56 }} />
      <RoundedBlock style={{ backgroundColor: accents[2], left: '20%', bottom: '15%', width: 64, height: 8 }} />
      <Circle style={{ backgroundColor: accents[3], right: '18%', top: '26%', width: 10, height: 10 }} />
    </>
  );
}

function RoundedBlock({ style }) {
  return <View style={[styles.mockBlock, style]} />;
}

function Circle({ style }) {
  return <View style={[styles.mockCircle, style]} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f0e5',
  },
  screen: {
    flex: 1,
    backgroundColor: '#f5f0e5',
  },
  listContent: {
    paddingTop: 10,
  },
  headerWrapper: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 27,
    lineHeight: 33,
    color: '#534740',
    fontFamily: 'serif',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  headerIcon: {
    fontSize: 20,
    color: '#534740',
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbf7f0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d6cfc5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    color: '#97bfae',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'serif',
    color: '#4e423c',
    paddingVertical: 2,
  },
  searchClear: {
    fontSize: 14,
    color: '#b0a89e',
    paddingLeft: 6,
  },
  tabsRow: {
    paddingBottom: 10,
  },
  tabChip: {
    backgroundColor: '#f8f3eb',
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },
  tabChipActive: {
    backgroundColor: '#9bc7b7',
  },
  tabChipText: {
    color: '#6c6057',
    fontSize: 14,
    fontFamily: 'serif',
  },
  tabChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#fbf7f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: '#b49e84',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#554941',
    fontFamily: 'serif',
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6e6258',
    fontFamily: 'serif',
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  card: {
    backgroundColor: '#fbf7f0',
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
    shadowColor: '#b49e84',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },
  favoriteButtonWrap: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 2,
  },
  favoriteButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#af9985',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  favoriteIcon: {
    color: '#9d8f82',
    fontSize: 11,
  },
  favoriteIconActive: {
    color: '#e3ba4e',
  },
  imageMock: {
    height: 126,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  mockBlock: {
    position: 'absolute',
    borderRadius: 10,
  },
  mockCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  cardTextWrap: {
    paddingHorizontal: 2,
  },
  cardTitle: {
    color: '#4e423c',
    fontFamily: 'serif',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    color: '#6e6258',
    fontFamily: 'serif',
    fontSize: 13,
    lineHeight: 18,
  },
  bottomBar: {
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
    fontSize: 20,
    color: '#64594e',
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
