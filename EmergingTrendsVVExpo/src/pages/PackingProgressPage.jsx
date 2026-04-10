import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackButton from '../components/ScreenBackButton';

const INITIAL_CHECKLIST = [
  { id: 'passport', label: 'Passport & ID', packed: true },
  { id: 'charger', label: 'Phone charger', packed: true },
  { id: 'toiletries', label: 'Travel toiletries', packed: false },
  { id: 'shoes', label: 'Comfortable shoes', packed: true },
  { id: 'jacket', label: 'Light jacket', packed: false },
  { id: 'meds', label: 'Medicines', packed: true },
];

const HARD_CODED_PROGRESS = 67;

export default function PackingProgressPage({ onNavigate, onTripReady, selectedOutfits = [] }) {
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const packedCount = useMemo(
    () => checklist.filter(item => item.packed).length,
    [checklist],
  );

  function toggleChecklistItem(itemId) {
    setChecklist(current =>
      current.map(item =>
        item.id === itemId ? { ...item, packed: !item.packed } : item,
      ),
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <ScreenBackButton onPress={() => onNavigate('trip-outfit-picker')} />
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Packing Progress</Text>
            <Text style={styles.subtitle}>Final checklist before your trip</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>On Track</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.progressCard}>
            <View style={styles.progressTopRow}>
              <Text style={styles.progressTitle}>Packing Completion</Text>
              <Text style={styles.progressMiniLabel}>{packedCount}/{checklist.length} packed</Text>
            </View>
            <Text style={styles.progressValue}>{HARD_CODED_PROGRESS}%</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${HARD_CODED_PROGRESS}%` }]} />
            </View>
            <Text style={styles.progressHint}>You are almost ready. Just a few items left.</Text>
          </View>

          <View style={styles.selectedCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.checklistTitle}>Selected Outfits</Text>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{selectedOutfits.length}</Text>
              </View>
            </View>
            {selectedOutfits.length === 0 ? (
              <Text style={styles.emptySelectedText}>No outfits selected from vault yet.</Text>
            ) : (
              selectedOutfits.map(item => (
                <View key={item.id} style={styles.selectedRow}>
                  <View style={styles.selectedThumbWrap}>
                    {item.imageUri ? (
                      <Image source={{ uri: item.imageUri }} style={styles.selectedThumb} resizeMode="cover" />
                    ) : item?.mockImage ? (
                      <OutfitMockImageSmall mockImage={item.mockImage} />
                    ) : (
                      <View
                        style={[
                          styles.selectedThumb,
                          { backgroundColor: '#dfe7e1' },
                          styles.selectedThumbPlaceholder,
                        ]}
                      >
                        <Text style={styles.selectedThumbText}>
                          {(item.title || 'Outfit').slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.selectedTextWrap}>
                    <Text style={styles.selectedTitle}>{item.title || 'Untitled Outfit'}</Text>
                    <Text style={styles.selectedSubtitle}>{item.subtitle || 'Saved in vault'}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.checklistCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.checklistTitle}>Packing Checklist</Text>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{packedCount}/{checklist.length}</Text>
              </View>
            </View>
            {checklist.map(item => (
              <Pressable
                key={item.id}
                style={[styles.checkRow, item.packed && styles.checkRowPacked]}
                onPress={() => toggleChecklistItem(item.id)}
              >
                <Text style={styles.checkIcon}>{item.packed ? '✅' : '⬜'}</Text>
                <Text style={styles.checkText}>{item.label}</Text>
                <Text style={[styles.checkStatus, item.packed && styles.checkStatusPacked]}>
                  {item.packed ? 'Packed' : 'Pending'}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.tripReadyButton}
            onPress={() => {
              Alert.alert('Trip Ready', 'Great! You are ready for your trip.');
              if (onTripReady) {
                onTripReady();
              }
            }}
          >
            <Text style={styles.tripReadyText}>Trip Ready</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function OutfitMockImageSmall({ mockImage }) {
  const { accents, background, layout } = mockImage;

  return (
    <View style={[styles.outfitMockSmall, { backgroundColor: background }]}>
      {layout === 'travel-kit' ? <TravelKitSmall accents={accents} /> : null}
      {layout === 'carry-on' ? <CarryOnSmall accents={accents} /> : null}
      {layout === 'city-tour' ? <CityTourSmall accents={accents} /> : null}
      {layout === 'resort' ? <ResortSmall accents={accents} /> : null}
      {layout === 'minimal-pack' ? <MinimalPackSmall accents={accents} /> : null}
      {layout === 'denim-combo' ? <DenimComboSmall accents={accents} /> : null}
      {layout === 'blazer-set' ? <BlazerSetSmall accents={accents} /> : null}
      {layout === 'executive' ? <ExecutiveSmall accents={accents} /> : null}
      {layout === 'boardroom' ? <BoardroomSmall accents={accents} /> : null}
      {layout === 'desk-day' ? <DeskDaySmall accents={accents} /> : null}
      {layout === 'capsule' ? <CapsuleSmall accents={accents} /> : null}
      {layout === 'conference' ? <ConferenceSmall accents={accents} /> : null}
    </View>
  );
}

function TravelKitSmall({ accents }) {
  return (
    <>
      <SmallCircle style={{ backgroundColor: accents[0], left: '8%', top: '10%', width: 8, height: 8 }} />
      <SmallBlock style={{ backgroundColor: accents[1], right: '10%', top: '12%', width: 10, height: 6 }} />
      <SmallBlock style={{ backgroundColor: accents[2], left: '8%', bottom: '10%', width: 10, height: 5 }} />
      <SmallBlock style={{ backgroundColor: accents[3], right: '8%', bottom: '10%', width: 8, height: 6 }} />
    </>
  );
}

function CarryOnSmall({ accents }) {
  return (
    <>
      <SmallCircle style={{ backgroundColor: accents[0], left: '10%', top: '8%', width: 7, height: 7 }} />
      <SmallBlock style={{ backgroundColor: accents[1], right: '10%', top: '10%', width: 9, height: 6 }} />
      <SmallBlock style={{ backgroundColor: accents[2], right: '11%', bottom: '12%', width: 8, height: 5 }} />
      <SmallBlock style={{ backgroundColor: accents[3], left: '12%', bottom: '13%', width: 6, height: 4 }} />
    </>
  );
}

function CityTourSmall({ accents }) {
  return (
    <>
      <SmallBlock style={{ backgroundColor: accents[0], left: '8%', top: '45%', width: 12, height: 3, borderRadius: 3 }} />
      <SmallCircle style={{ backgroundColor: accents[1], right: '10%', top: '20%', width: 5, height: 5 }} />
      <SmallBlock style={{ backgroundColor: accents[2], right: '20%', bottom: '12%', width: 2, height: 7 }} />
      <SmallCircle style={{ backgroundColor: accents[3], left: '12%', top: '22%', width: 4, height: 4 }} />
    </>
  );
}

function ResortSmall({ accents }) {
  return (
    <>
      <SmallBlock style={{ backgroundColor: accents[0], left: '8%', top: '8%', width: 6, height: 12, transform: [{ rotate: '-8deg' }] }} />
      <SmallBlock style={{ backgroundColor: accents[1], right: '11%', top: '6%', width: 8, height: 10, transform: [{ rotate: '12deg' }] }} />
      <SmallBlock style={{ backgroundColor: accents[2], left: '24%', bottom: '10%', width: 8, height: 7, transform: [{ rotate: '-6deg' }] }} />
      <SmallBlock style={{ backgroundColor: accents[3], right: '8%', bottom: '14%', width: 3, height: 7, transform: [{ rotate: '20deg' }] }} />
    </>
  );
}

function MinimalPackSmall({ accents }) {
  return (
    <>
      <SmallBlock style={{ backgroundColor: accents[0], left: '6%', top: '16%', width: 7, height: 7 }} />
      <SmallBlock style={{ backgroundColor: accents[1], left: '32%', top: '10%', width: 8, height: 11 }} />
      <SmallBlock style={{ backgroundColor: accents[2], left: '32%', bottom: '10%', width: 5, height: 4 }} />
      <SmallBlock style={{ backgroundColor: accents[3], right: '10%', top: '24%', width: 3, height: 9 }} />
    </>
  );
}

function DenimComboSmall({ accents }) {
  return (
    <>
      <SmallBlock style={{ backgroundColor: accents[0], left: '9%', top: '10%', width: 14, height: 3 }} />
      <SmallBlock style={{ backgroundColor: accents[1], right: '10%', top: '22%', width: 6, height: 9 }} />
      <SmallBlock style={{ backgroundColor: accents[2], left: '13%', bottom: '10%', width: 5, height: 7 }} />
      <SmallBlock style={{ backgroundColor: accents[3], right: '34%', bottom: '11%', width: 6, height: 4 }} />
    </>
  );
}

function BlazerSetSmall({ accents }) {
  return (
    <>
      <SmallBlock style={{ backgroundColor: accents[0], left: '10%', top: '12%', width: 13, height: 3 }} />
      <SmallBlock style={{ backgroundColor: accents[1], right: '7%', top: '10%', width: 6, height: 11 }} />
      <SmallBlock style={{ backgroundColor: accents[2], left: '12%', bottom: '11%', width: 6, height: 7 }} />
      <SmallBlock style={{ backgroundColor: accents[3], left: '23%', bottom: '11%', width: 9, height: 2 }} />
    </>
  );
}

function ExecutiveSmall({ accents }) {
  return (
    <>
      <SmallBlock style={{ backgroundColor: accents[0], left: '8%', top: '10%', width: 12, height: 3 }} />
      <SmallBlock style={{ backgroundColor: accents[1], left: '9%', top: '34%', width: 6, height: 8 }} />
      <SmallBlock style={{ backgroundColor: accents[2], right: '10%', top: '14%', width: 7, height: 11 }} />
      <SmallCircle style={{ backgroundColor: accents[3], left: '33%', bottom: '16%', width: 2, height: 2 }} />
    </>
  );
}

function BoardroomSmall({ accents }) {
  return (
    <>
      <SmallBlock style={{ backgroundColor: accents[0], left: '7%', top: '8%', width: 8, height: 4, transform: [{ rotate: '-6deg' }] }} />
      <SmallBlock style={{ backgroundColor: accents[1], right: '12%', top: '6%', width: 7, height: 11 }} />
      <SmallBlock style={{ backgroundColor: accents[2], left: '30%', bottom: '10%', width: 4, height: 3 }} />
      <SmallBlock style={{ backgroundColor: accents[3], left: '12%', bottom: '14%', width: 8, height: 2, transform: [{ rotate: '8deg' }] }} />
    </>
  );
}

function DeskDaySmall({ accents }) {
  return (
    <>
      <SmallBlock style={{ backgroundColor: accents[0], left: '8%', top: '10%', width: 5, height: 10, transform: [{ rotate: '-8deg' }] }} />
      <SmallBlock style={{ backgroundColor: accents[1], left: '28%', top: '10%', width: 10, height: 9 }} />
      <SmallBlock style={{ backgroundColor: accents[2], right: '12%', bottom: '12%', width: 5, height: 3 }} />
      <SmallCircle style={{ backgroundColor: accents[3], left: '35%', bottom: '18%', width: 3, height: 3 }} />
    </>
  );
}

function CapsuleSmall({ accents }) {
  return (
    <>
      <SmallBlock style={{ backgroundColor: accents[0], left: '8%', top: '9%', width: 5, height: 12 }} />
      <SmallBlock style={{ backgroundColor: accents[1], left: '26%', top: '12%', width: 4, height: 11 }} />
      <SmallBlock style={{ backgroundColor: accents[2], right: '13%', top: '16%', width: 4, height: 10 }} />
      <SmallCircle style={{ backgroundColor: accents[3], left: '40%', bottom: '14%', width: 1.5, height: 1.5 }} />
    </>
  );
}

function ConferenceSmall({ accents }) {
  return (
    <>
      <SmallBlock style={{ backgroundColor: accents[0], left: '6%', top: '14%', width: 9, height: 3 }} />
      <SmallCircle style={{ backgroundColor: accents[1], left: '16%', top: '8%', width: 5, height: 5 }} />
      <SmallBlock style={{ backgroundColor: accents[2], right: '10%', top: '18%', width: 9, height: 8 }} />
      <SmallBlock style={{ backgroundColor: accents[3], left: '7%', bottom: '12%', width: 12, height: 2 }} />
    </>
  );
}

function SmallBlock({ style }) {
  return <View style={[styles.mockBlockSmall, style]} />;
}

function SmallCircle({ style }) {
  return <View style={[styles.mockCircleSmall, style]} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0ede6' },
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTextWrap: { flex: 1 },
  headerBadge: {
    backgroundColor: '#e5f2eb',
    borderWidth: 1,
    borderColor: '#cfe3d8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 8,
  },
  headerBadgeText: { color: '#4f7f6f', fontSize: 11, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', color: '#2c3e50' },
  subtitle: { marginTop: 2, fontSize: 13, color: '#808b86' },
  scrollContent: { padding: 20, paddingTop: 8, paddingBottom: 130 },

  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5ebe7',
    marginBottom: 14,
    shadowColor: '#21342f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  progressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitle: { fontSize: 14, fontWeight: '700', color: '#57635e' },
  progressMiniLabel: { fontSize: 12, color: '#6c7c75', fontWeight: '600' },
  progressValue: { fontSize: 36, fontWeight: '800', color: '#6d9f8d', marginTop: 8 },
  progressTrack: {
    marginTop: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#e8efea',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6d9f8d',
    borderRadius: 999,
  },
  progressHint: { marginTop: 10, color: '#73807a', fontSize: 12 },

  selectedCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5ebe7',
    marginBottom: 14,
    shadowColor: '#21342f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  countPill: {
    backgroundColor: '#e5f2eb',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countPillText: { color: '#4f7f6f', fontSize: 12, fontWeight: '700' },
  emptySelectedText: { color: '#73807a', fontSize: 13 },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  selectedThumbWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 10,
  },
  selectedThumb: {
    width: '100%',
    height: '100%',
  },
  selectedThumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedThumbText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2c3e50',
  },
  outfitMockSmall: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  mockBlockSmall: {
    position: 'absolute',
    borderRadius: 2,
  },
  mockCircleSmall: {
    position: 'absolute',
    borderRadius: 999,
  },
  selectedTextWrap: { flex: 1 },
  selectedTitle: { fontSize: 15, fontWeight: '700', color: '#2c3e50' },
  selectedSubtitle: { fontSize: 12, color: '#73807a', marginTop: 2 },

  checklistCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5ebe7',
    shadowColor: '#21342f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 2,
  },
  checklistTitle: { fontSize: 17, fontWeight: '700', color: '#2c3e50' },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#f7faf8',
    marginBottom: 8,
  },
  checkRowPacked: {
    backgroundColor: '#eef6f2',
  },
  checkIcon: { fontSize: 18, marginRight: 10 },
  checkText: { fontSize: 15, color: '#4d5b55', flex: 1 },
  checkStatus: { fontSize: 12, color: '#9aa7a1', fontWeight: '600' },
  checkStatusPacked: { color: '#5d8d7d' },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
    backgroundColor: '#f0ede6',
    borderTopWidth: 1,
    borderTopColor: '#e3e8e4',
  },
  tripReadyButton: {
    backgroundColor: '#6d9f8d',
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#31584d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 3,
  },
  tripReadyText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});