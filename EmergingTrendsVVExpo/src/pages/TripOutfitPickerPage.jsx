import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackButton from '../components/ScreenBackButton';

export default function TripOutfitPickerPage({
  items = [],
  onNavigate,
  onGoBack,
  onContinuePacking,
  onOpenAiSuggestions,
}) {
  const [selectedIds, setSelectedIds] = useState({});
  const [showAlert, setShowAlert] = useState(false);

  const outfitItems = useMemo(
    () =>
      items.filter(item => {
        if (item?.category === 'travel' || item?.category === 'work') {
          return true;
        }
        return Boolean(item?.title);
      }),
    [items],
  );

  const selectedCount = useMemo(
    () => Object.values(selectedIds).filter(Boolean).length,
    [selectedIds],
  );

  function toggleItem(itemId) {
    setSelectedIds(current => ({
      ...current,
      [itemId]: !current[itemId],
    }));
  }

  function handleAiSuggestions() {
    if (outfitItems.length === 0) {
      Alert.alert('No outfits available', 'Add outfits to your vault first to get AI suggestions.');
      return;
    }

    if (onOpenAiSuggestions) {
      onOpenAiSuggestions();
    }
  }

  function handleContinue() {
    if (selectedCount === 0) {
      setShowAlert(true);
      return;
    }

    if (onContinuePacking) {
      onContinuePacking(selectedIds);
    }
  }

  return (
    <>
      <Modal
        visible={showAlert}
        transparent
        animationType="fade"
        hardwareAccelerated
        onRequestClose={() => setShowAlert(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertModal} collapsable={false}>
            <View style={styles.alertIconWrap}>
              <Text style={styles.alertIcon}>📋</Text>
            </View>
            <Text style={styles.alertTitle}>Select Outfits</Text>
            <Text style={styles.alertMessage}>Please select at least one outfit before continuing.</Text>
            
            <View style={styles.alertButtonsRow}>
              <TouchableOpacity 
                style={styles.alertButtonSecondary}
                onPress={() => setShowAlert(false)}
              >
                <Text style={styles.alertButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.alertButtonPrimary}
                onPress={() => setShowAlert(false)}
              >
                <Text style={styles.alertButtonPrimaryText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <ScreenBackButton
            onPress={() => (onGoBack ? onGoBack() : onNavigate('trip'))}
          />
          <View>
            <Text style={styles.title}>Select Outfits</Text>
            <Text style={styles.subtitle}>Choose outfits from your vault for this trip</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {outfitItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No outfits in your vault yet</Text>
              <Text style={styles.emptyText}>Save outfits first, then come back to build packing.</Text>
            </View>
          ) : (
            outfitItems.map(item => {
              const selected = Boolean(selectedIds[item.id]);

              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggleItem(item.id)}
                  style={[styles.card, selected && styles.cardSelected]}
                >
                  <View style={styles.imageWrap}>
                    {item.imageUri ? (
                      <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
                    ) : item?.mockImage ? (
                      <OutfitMockImage mockImage={item.mockImage} />
                    ) : (
                      <View style={[styles.placeholder, { backgroundColor: '#dfe7e1' }]}>
                        <Text style={styles.placeholderText}>
                          {(item.title || 'Outfit').slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.content}>
                    <Text style={styles.itemTitle}>{item.title || 'Untitled Outfit'}</Text>
                    <Text style={styles.itemSubtitle}>{item.subtitle || 'Saved in vault'}</Text>
                    <Text style={styles.itemCategory}>{item.category || 'outfit'}</Text>
                  </View>

                  <View style={[styles.selectPill, selected && styles.selectPillActive]}>
                    <Text style={[styles.selectPillText, selected && styles.selectPillTextActive]}>
                      {selected ? 'Selected' : 'Select'}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Continue Packing ({selectedCount})</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    </>
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
      {layout === 'minimal-pack' ? (
        <MinimalPackLayout accents={accents} />
      ) : null}
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
      <Circle
        style={{
          backgroundColor: accents[0],
          left: '9%',
          top: '12%',
          width: 48,
          height: 48,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[1],
          right: '13%',
          top: '14%',
          width: 60,
          height: 36,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[2],
          left: '10%',
          bottom: '12%',
          width: 62,
          height: 24,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[3],
          right: '10%',
          bottom: '11%',
          width: 54,
          height: 34,
        }}
      />
      <Circle
        style={{
          backgroundColor: '#f6edd8',
          left: '42%',
          top: '40%',
          width: 18,
          height: 18,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: '#8ba5ba',
          left: '38%',
          top: '22%',
          width: 10,
          height: 48,
        }}
      />
    </>
  );
}

function CarryOnLayout({ accents }) {
  return (
    <>
      <Circle
        style={{
          backgroundColor: accents[0],
          left: '11%',
          top: '10%',
          width: 40,
          height: 40,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[1],
          right: '11%',
          top: '11%',
          width: 56,
          height: 34,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[2],
          right: '12%',
          bottom: '14%',
          width: 56,
          height: 28,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[3],
          left: '13%',
          bottom: '15%',
          width: 42,
          height: 18,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: '#d3b58f',
          left: '32%',
          top: '48%',
          width: 28,
          height: 16,
        }}
      />
    </>
  );
}

function CityTourLayout({ accents }) {
  return (
    <>
      <RoundedBlock
        style={{
          backgroundColor: accents[0],
          left: '9%',
          top: '46%',
          width: 78,
          height: 18,
          borderRadius: 20,
          transform: [{ rotate: '6deg' }],
        }}
      />
      <Circle
        style={{
          backgroundColor: accents[1],
          right: '11%',
          top: '23%',
          width: 24,
          height: 24,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[2],
          right: '21%',
          bottom: '13%',
          width: 10,
          height: 38,
        }}
      />
      <Circle
        style={{
          backgroundColor: accents[3],
          left: '13%',
          top: '25%',
          width: 20,
          height: 20,
        }}
      />
      <Circle
        style={{
          backgroundColor: '#efe1cb',
          right: '33%',
          top: '18%',
          width: 18,
          height: 18,
        }}
      />
    </>
  );
}

function ResortLayout({ accents }) {
  return (
    <>
      <RoundedBlock
        style={{
          backgroundColor: accents[0],
          left: '8%',
          top: '10%',
          width: 42,
          height: 70,
          transform: [{ rotate: '-10deg' }],
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[1],
          right: '12%',
          top: '8%',
          width: 48,
          height: 58,
          transform: [{ rotate: '16deg' }],
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[2],
          left: '26%',
          bottom: '12%',
          width: 54,
          height: 44,
          transform: [{ rotate: '-8deg' }],
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[3],
          right: '10%',
          bottom: '17%',
          width: 14,
          height: 40,
          transform: [{ rotate: '24deg' }],
        }}
      />
    </>
  );
}

function MinimalPackLayout({ accents }) {
  return (
    <>
      <RoundedBlock
        style={{
          backgroundColor: accents[0],
          left: '7%',
          top: '18%',
          width: 48,
          height: 42,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[1],
          left: '35%',
          top: '12%',
          width: 52,
          height: 66,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[2],
          left: '34%',
          bottom: '11%',
          width: 30,
          height: 20,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[3],
          right: '11%',
          top: '26%',
          width: 16,
          height: 56,
        }}
      />
    </>
  );
}

function DenimComboLayout({ accents }) {
  return (
    <>
      <RoundedBlock
        style={{
          backgroundColor: accents[0],
          left: '10%',
          top: '12%',
          width: 86,
          height: 18,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[1],
          right: '11%',
          top: '24%',
          width: 38,
          height: 56,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[2],
          left: '14%',
          bottom: '12%',
          width: 34,
          height: 44,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[3],
          right: '35%',
          bottom: '13%',
          width: 42,
          height: 26,
        }}
      />
    </>
  );
}

function BlazerSetLayout({ accents }) {
  return (
    <>
      <RoundedBlock
        style={{
          backgroundColor: accents[0],
          left: '11%',
          top: '14%',
          width: 82,
          height: 20,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[1],
          right: '8%',
          top: '12%',
          width: 36,
          height: 64,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[2],
          left: '13%',
          bottom: '13%',
          width: 40,
          height: 44,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[3],
          left: '24%',
          bottom: '13%',
          width: 62,
          height: 10,
        }}
      />
    </>
  );
}

function ExecutiveLayout({ accents }) {
  return (
    <>
      <RoundedBlock
        style={{
          backgroundColor: accents[0],
          left: '9%',
          top: '12%',
          width: 76,
          height: 16,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[1],
          left: '10%',
          top: '36%',
          width: 36,
          height: 50,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[2],
          right: '11%',
          top: '16%',
          width: 42,
          height: 66,
        }}
      />
      <Circle
        style={{
          backgroundColor: accents[3],
          left: '34%',
          bottom: '18%',
          width: 12,
          height: 12,
        }}
      />
    </>
  );
}

function BoardroomLayout({ accents }) {
  return (
    <>
      <RoundedBlock
        style={{
          backgroundColor: accents[0],
          left: '8%',
          top: '10%',
          width: 48,
          height: 22,
          transform: [{ rotate: '-8deg' }],
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[1],
          right: '13%',
          top: '8%',
          width: 40,
          height: 68,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[2],
          left: '32%',
          bottom: '12%',
          width: 26,
          height: 18,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[3],
          left: '13%',
          bottom: '16%',
          width: 50,
          height: 14,
          transform: [{ rotate: '10deg' }],
        }}
      />
    </>
  );
}

function DeskDayLayout({ accents }) {
  return (
    <>
      <RoundedBlock
        style={{
          backgroundColor: accents[0],
          left: '9%',
          top: '12%',
          width: 36,
          height: 62,
          transform: [{ rotate: '-10deg' }],
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[1],
          left: '30%',
          top: '12%',
          width: 62,
          height: 56,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[2],
          right: '13%',
          bottom: '14%',
          width: 34,
          height: 18,
        }}
      />
      <Circle
        style={{
          backgroundColor: accents[3],
          left: '36%',
          bottom: '20%',
          width: 16,
          height: 16,
        }}
      />
    </>
  );
}

function CapsuleLayout({ accents }) {
  return (
    <>
      <RoundedBlock
        style={{
          backgroundColor: accents[0],
          left: '9%',
          top: '11%',
          width: 32,
          height: 72,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[1],
          left: '27%',
          top: '14%',
          width: 26,
          height: 66,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[2],
          right: '14%',
          top: '18%',
          width: 24,
          height: 58,
        }}
      />
      <Circle
        style={{
          backgroundColor: accents[3],
          left: '41%',
          bottom: '16%',
          width: 8,
          height: 8,
        }}
      />
    </>
  );
}

function ConferenceLayout({ accents }) {
  return (
    <>
      <RoundedBlock
        style={{
          backgroundColor: accents[0],
          left: '7%',
          top: '16%',
          width: 56,
          height: 18,
        }}
      />
      <Circle
        style={{
          backgroundColor: accents[1],
          left: '18%',
          top: '11%',
          width: 28,
          height: 28,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[2],
          right: '11%',
          top: '20%',
          width: 54,
          height: 50,
        }}
      />
      <RoundedBlock
        style={{
          backgroundColor: accents[3],
          left: '8%',
          bottom: '14%',
          width: 78,
          height: 14,
        }}
      />
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
  safeArea: { flex: 1, backgroundColor: '#f0ede6' },
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#2c3e50' },
  subtitle: { marginTop: 2, fontSize: 13, color: '#808b86' },
  scrollContent: { padding: 20, paddingTop: 8, paddingBottom: 160 },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e3e7e5',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#2c3e50' },
  emptyText: { marginTop: 6, color: '#6a726f' },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e7ece8',
  },
  cardSelected: {
    borderColor: '#6d9f8d',
    backgroundColor: '#f6fbf8',
  },
  imageWrap: {
    width: 64,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { fontSize: 18, fontWeight: '700', color: '#2c3e50' },
  imageMock: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mockBlock: {
    position: 'absolute',
    borderRadius: 10,
  },
  mockCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  content: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#2c3e50' },
  itemSubtitle: { marginTop: 2, fontSize: 12, color: '#6a726f' },
  itemCategory: { marginTop: 4, fontSize: 11, color: '#6d9f8d', textTransform: 'capitalize' },
  selectPill: {
    borderWidth: 1,
    borderColor: '#d7dedb',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  selectPillActive: {
    backgroundColor: '#6d9f8d',
    borderColor: '#6d9f8d',
  },
  selectPillText: { fontSize: 12, color: '#66716d', fontWeight: '600' },
  selectPillTextActive: { color: '#fff' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertModal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  alertIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f1eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  alertIcon: {
    fontSize: 32,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: '#6a726f',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  alertButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertButtonSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d7dedb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  alertButtonSecondaryText: {
    color: '#6a726f',
    fontSize: 14,
    fontWeight: '600',
  },
  alertButtonPrimary: {
    flex: 1,
    backgroundColor: '#6d9f8d',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  alertButtonPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
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
  secondaryButton: {
    borderRadius: 26,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#eef5f1',
    borderWidth: 1,
    borderColor: '#6d9f8d',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#4f7d6d',
    fontWeight: '700',
    fontSize: 14,
  },
  primaryButton: {
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#6d9f8d',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});