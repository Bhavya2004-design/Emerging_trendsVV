import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackButton from '../components/ScreenBackButton';
import BottomTabBar from '../components/BottomTabBar';

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) {
    return 'Dates not set';
  }
  if (!startDate || !endDate) {
    return `${startDate || endDate}`;
  }
  return `${startDate} to ${endDate}`;
}

function OutfitThumb({ outfit }) {
  if (outfit?.imageUri) {
    return (
      <Image
        source={{ uri: outfit.imageUri }}
        style={styles.outfitThumb}
        resizeMode="cover"
      />
    );
  }
  return (
    <View style={[styles.outfitThumb, styles.outfitThumbFallback]}>
      <Text style={styles.outfitThumbText}>
        {(outfit?.title || 'Outfit').slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}

export default function MyTripsPage({
  onNavigate,
  onGoBack,
  trips = [],
  selectedBottomTab = 'home',
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <ScreenBackButton onPress={onGoBack} />
          <View>
            <Text style={styles.title}>My Trips</Text>
            <Text style={styles.subtitle}>Saved trip details and selected outfits</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {trips.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No trips saved yet</Text>
              <Text style={styles.emptyText}>
                Use Pack for Trip to create one, then it will appear here.
              </Text>
            </View>
          ) : (
            trips.map((trip, index) => (
              <View key={trip.id || `${trip.destination}-${index}`} style={styles.tripCard}>
                <View style={styles.tripTopRow}>
                  <Text style={styles.destination}>{trip.destination || 'Destination'}</Text>
                  <Text style={styles.tripType}>{trip.tripType || 'Trip'}</Text>
                </View>
                <Text style={styles.tripDates}>{formatDateRange(trip.startDate, trip.endDate)}</Text>

                <Text style={styles.outfitSectionTitle}>
                  Selected outfits ({trip.selectedOutfits?.length || 0})
                </Text>

                {trip.selectedOutfits?.length ? (
                  trip.selectedOutfits.map((outfit) => (
                    <View key={outfit.id} style={styles.outfitRow}>
                      <OutfitThumb outfit={outfit} />
                      <View style={styles.outfitTextWrap}>
                        <Text style={styles.outfitTitle}>{outfit.title || 'Untitled Outfit'}</Text>
                        <Text style={styles.outfitSubtitle}>{outfit.subtitle || 'Saved outfit'}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noOutfitText}>No outfits selected for this trip.</Text>
                )}
              </View>
            ))
          )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  title: {
    fontSize: 30,
    color: '#2c3e50',
    fontWeight: '700',
    fontFamily: 'serif',
  },
  subtitle: {
    color: '#7a7268',
    fontSize: 14,
    marginTop: 2,
    fontFamily: 'serif',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 130,
  },
  emptyState: {
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: '#fbf7f0',
    borderWidth: 1,
    borderColor: '#e4ddd2',
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#3c332c',
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 8,
    color: '#7e756b',
    fontFamily: 'serif',
    textAlign: 'center',
    fontSize: 14,
  },
  tripCard: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: '#fbf7f0',
    borderWidth: 1,
    borderColor: '#e4ddd2',
    padding: 14,
  },
  tripTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  destination: {
    flex: 1,
    color: '#2c3e50',
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '700',
    marginRight: 8,
  },
  tripType: {
    color: '#6d9f8d',
    fontFamily: 'serif',
    fontWeight: '700',
    fontSize: 13,
  },
  tripDates: {
    marginTop: 5,
    color: '#72695f',
    fontFamily: 'serif',
    fontSize: 13,
  },
  outfitSectionTitle: {
    marginTop: 12,
    color: '#4c433b',
    fontFamily: 'serif',
    fontWeight: '700',
    fontSize: 14,
  },
  outfitRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  outfitThumb: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  outfitThumbFallback: {
    backgroundColor: '#e6ddcf',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outfitThumbText: {
    color: '#6b5e52',
    fontWeight: '700',
    fontSize: 12,
  },
  outfitTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  outfitTitle: {
    color: '#2f3a35',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'serif',
  },
  outfitSubtitle: {
    marginTop: 1,
    color: '#7e756b',
    fontSize: 12,
    fontFamily: 'serif',
  },
  noOutfitText: {
    marginTop: 8,
    color: '#7e756b',
    fontSize: 12,
    fontFamily: 'serif',
  },
});
