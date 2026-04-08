import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarList } from 'react-native-calendars';
import ScreenBackButton from '../components/ScreenBackButton';
import BottomTabBar from '../components/BottomTabBar';

/* =========================
   DATA
========================= */
const DESTINATIONS = ['Paris, France', 'London, UK', 'New York, USA'];

const DESTINATION_EMOJI = {
  'Paris, France': '🗼',
  'London, UK': '🎡',
  'New York, USA': '🗽',
};

const WEATHER_DATA = {
  'Paris, France': {
    temp: '24°C',
    condition: 'Mostly Sunny',
    humidity: '55%',
    wind: '8 km/h',
    feels: '26°C',
    icon: '☀️',
    bg: ['#f7971e', '#ffd200'],
  },
  'London, UK': {
    temp: '18°C',
    condition: 'Cloudy',
    humidity: '65%',
    wind: '12 km/h',
    feels: '17°C',
    icon: '☁️',
    bg: ['#4b6cb7', '#182848'],
  },
  'New York, USA': {
    temp: '28°C',
    condition: 'Hot & Sunny',
    humidity: '60%',
    wind: '10 km/h',
    feels: '30°C',
    icon: '🌤️',
    bg: ['#11998e', '#38ef7d'],
  },
};

const TRIP_TYPES = [
  { label: 'Business', icon: '💼' },
  { label: 'Personal', icon: '🌴' },
];

/* =========================
   COMPONENT
========================= */
export default function TripPage({
  onNavigate,
  selectedBottomTab = 'home',
  initialTripPlan,
  onGeneratePacking,
}) {
  const [destination, setDestination] = useState(initialTripPlan?.destination || 'Paris, France');
  const [tripType, setTripType] = useState(initialTripPlan?.tripType || 'Business');
  const [showDest, setShowDest] = useState(false);
  const [showTripType, setShowTripType] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState(initialTripPlan?.startDate || null);
  const [endDate, setEndDate] = useState(initialTripPlan?.endDate || null);
  const [selectingEnd, setSelectingEnd] = useState(false);

  const weather = WEATHER_DATA[destination];
  const cityName = destination.split(',')[0];
  const destEmoji = DESTINATION_EMOJI[destination];
  const tripIcon = TRIP_TYPES.find(t => t.label === tripType)?.icon;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Select';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getTripNights = () => {
    if (!startDate || !endDate) return null;
    const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : null;
  };

  const getMarkedDates = () => {
    if (!startDate) return {};
    const marked = {};
    marked[startDate] = { startingDay: true, color: '#6d9f8d', textColor: '#fff' };
    if (endDate && endDate !== startDate) {
      marked[endDate] = { endingDay: true, color: '#6d9f8d', textColor: '#fff' };
      let cur = new Date(startDate);
      cur.setDate(cur.getDate() + 1);
      const end = new Date(endDate);
      while (cur < end) {
        const key = cur.toISOString().split('T')[0];
        marked[key] = { color: '#c8e6c9', textColor: '#333' };
        cur.setDate(cur.getDate() + 1);
      }
    }
    return marked;
  };

  const handleDayPress = (day) => {
    if (!startDate || selectingEnd === false) {
      setStartDate(day.dateString);
      setEndDate(null);
      setSelectingEnd(true);
    } else {
      if (day.dateString < startDate) {
        setStartDate(day.dateString);
        setEndDate(null);
        setSelectingEnd(true);
      } else {
        setEndDate(day.dateString);
        setSelectingEnd(false);
        setShowCalendar(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* HEADER */}
          <View style={styles.header}>
            <ScreenBackButton onPress={() => onNavigate('home')} />
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>✈️ Pack For Trip</Text>
              <Text style={styles.subtitle}>Smart packing, stress-free travel</Text>
            </View>
          </View>

          {/* SECTION LABEL */}
          <Text style={styles.sectionLabel}>WHERE ARE YOU GOING?</Text>

          {/* DESTINATION CARD */}
          <TouchableOpacity style={styles.selectorCard} onPress={() => setShowDest(true)} activeOpacity={0.8}>
            <View style={styles.selectorLeft}>
              <Text style={styles.selectorEmoji}>{destEmoji}</Text>
              <View>
                <Text style={styles.selectorHint}>Destination</Text>
                <Text style={styles.selectorValue}>{destination}</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* TRAVEL DATES */}
          <Text style={styles.sectionLabel}>TRAVEL DATES</Text>
          <TouchableOpacity style={styles.dateCard} onPress={() => { setSelectingEnd(false); setShowCalendar(true); }} activeOpacity={0.8}>
            <View style={styles.dateBox}>
              <Text style={styles.dateHint}>📅  Departure</Text>
              <Text style={[styles.dateValue, !startDate && styles.datePlaceholder]}>
                {formatDate(startDate)}
              </Text>
            </View>
            <View style={styles.dateDivider} />
            <View style={styles.dateBox}>
              <Text style={styles.dateHint}>🏁  Return</Text>
              <Text style={[styles.dateValue, !endDate && styles.datePlaceholder]}>
                {formatDate(endDate)}
              </Text>
            </View>
            {getTripNights() && (
              <View style={styles.nightsBadge}>
                <Text style={styles.nightsText}>{getTripNights()}N</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* TRIP TYPE CARD */}
          <Text style={styles.sectionLabel}>TRIP TYPE</Text>
          <View style={styles.tripTypeRow}>
            {TRIP_TYPES.map(t => (
              <TouchableOpacity
                key={t.label}
                style={[styles.tripTypeChip, tripType === t.label && styles.tripTypeChipActive]}
                onPress={() => setTripType(t.label)}
                activeOpacity={0.8}
              >
                <Text style={styles.tripTypeIcon}>{t.icon}</Text>
                <Text style={[styles.tripTypeLabel, tripType === t.label && styles.tripTypeLabelActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* WEATHER CARD */}
          <Text style={styles.sectionLabel}>CURRENT WEATHER</Text>
          <View style={styles.weatherCard}>
            <View style={styles.weatherTop}>
              <View>
                <Text style={styles.weatherCity}>{cityName}</Text>
                <Text style={styles.weatherCondition}>{weather.condition}</Text>
              </View>
              <View style={styles.weatherTempWrap}>
                <Text style={styles.weatherIcon}>{weather.icon}</Text>
                <Text style={styles.weatherTemp}>{weather.temp}</Text>
              </View>
            </View>
            <View style={styles.weatherDivider} />
            <View style={styles.weatherStatsRow}>
              <View style={styles.weatherStat}>
                <Text style={styles.weatherStatIcon}>💧</Text>
                <Text style={styles.weatherStatValue}>{weather.humidity}</Text>
                <Text style={styles.weatherStatLabel}>Humidity</Text>
              </View>
              <View style={styles.weatherStat}>
                <Text style={styles.weatherStatIcon}>🌬️</Text>
                <Text style={styles.weatherStatValue}>{weather.wind}</Text>
                <Text style={styles.weatherStatLabel}>Wind</Text>
              </View>
              <View style={styles.weatherStat}>
                <Text style={styles.weatherStatIcon}>🌡️</Text>
                <Text style={styles.weatherStatValue}>{weather.feels}</Text>
                <Text style={styles.weatherStatLabel}>Feels Like</Text>
              </View>
            </View>
          </View>

          {/* GENERATE BUTTON */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (onGeneratePacking) {
                onGeneratePacking({
                  destination,
                  tripType,
                  startDate,
                  endDate,
                });
                return;
              }
              onNavigate('trip-outfit-picker');
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Generate Packing List  →</Text>
          </TouchableOpacity>

        </ScrollView>

        <BottomTabBar selectedTab={selectedBottomTab} onNavigate={onNavigate} />

        {/* CALENDAR MODAL */}
        <Modal visible={showCalendar} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setShowCalendar(false)}>
            <Pressable style={[styles.modalSheet, styles.calendarSheet, { paddingHorizontal: 0 }]} onPress={() => {}}>
              <View style={styles.modalHandle} />
              <Text style={[styles.modalTitle, { paddingHorizontal: 24 }]}>
                {selectingEnd ? '🏁 Select Return Date' : '📅 Select Departure Date'}
              </Text>
              <CalendarList
                onDayPress={handleDayPress}
                markingType="period"
                markedDates={getMarkedDates()}
                minDate={new Date().toISOString().split('T')[0]}
                pastScrollRange={0}
                futureScrollRange={12}
                scrollEnabled
                showScrollIndicator
                theme={{
                  todayTextColor: '#6d9f8d',
                  arrowColor: '#6d9f8d',
                  selectedDayBackgroundColor: '#6d9f8d',
                  selectedDayTextColor: '#fff',
                  dotColor: '#6d9f8d',
                  textDayFontWeight: '500',
                  textMonthFontWeight: '700',
                  textMonthFontSize: 16,
                  calendarBackground: '#fff',
                }}
                style={styles.calendarList}
                calendarHeight={340}
                staticHeader
              />
              <TouchableOpacity
                style={[styles.button, { margin: 16 }]}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        {/* DESTINATION MODAL */}
        <Modal visible={showDest} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setShowDest(false)}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Choose Destination</Text>
              {DESTINATIONS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.modalOption, destination === d && styles.modalOptionActive]}
                  onPress={() => { setDestination(d); setShowDest(false); }}
                >
                  <Text style={styles.modalOptionEmoji}>{DESTINATION_EMOJI[d]}</Text>
                  <Text style={[styles.modalOptionText, destination === d && styles.modalOptionTextActive]}>
                    {d}
                  </Text>
                  {destination === d && <Text style={styles.modalCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>

        {/* TRIP TYPE MODAL - replaced by chips, kept for safety */}
        <Modal visible={showTripType} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setShowTripType(false)}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Trip Type</Text>
              {TRIP_TYPES.map(t => (
                <TouchableOpacity
                  key={t.label}
                  style={[styles.modalOption, tripType === t.label && styles.modalOptionActive]}
                  onPress={() => { setTripType(t.label); setShowTripType(false); }}
                >
                  <Text style={styles.modalOptionEmoji}>{t.icon}</Text>
                  <Text style={[styles.modalOptionText, tripType === t.label && styles.modalOptionTextActive]}>
                    {t.label}
                  </Text>
                  {tripType === t.label && <Text style={styles.modalCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0ede6' },
  screen: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },

  /* HEADER */
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  headerTextWrap: { marginLeft: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#6d9f8d', letterSpacing: 0.3 },
  subtitle: { fontSize: 13, color: '#888', marginTop: 2 },

  /* SECTION LABELS */
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#aaa',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 4,
  },

  /* SELECTOR CARD */
  selectorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  selectorLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  selectorEmoji: { fontSize: 32 },
  selectorHint: { fontSize: 11, color: '#aaa', marginBottom: 2 },
  selectorValue: { fontSize: 16, fontWeight: '600', color: '#6d9f8d' },
  chevron: { fontSize: 26, color: '#ccc', fontWeight: '300' },

  /* TRIP TYPE CHIPS */
  tripTypeRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  tripTypeChip: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tripTypeChipActive: {
    backgroundColor: '#6d9f8d',
    borderColor: '#6d9f8d',
  },
  tripTypeIcon: { fontSize: 24, marginBottom: 4 },
  tripTypeLabel: { fontSize: 13, fontWeight: '600', color: '#555' },
  tripTypeLabelActive: { color: '#fff' },

  /* WEATHER CARD */
  weatherCard: {
    backgroundColor: '#2c3e50',
    borderRadius: 20,
    padding: 20,
    marginBottom: 22,
    shadowColor: '#2c3e50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  weatherTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  weatherCity: { fontSize: 22, fontWeight: '700', color: '#fff' },
  weatherCondition: { fontSize: 13, color: '#aac', marginTop: 4 },
  weatherTempWrap: { alignItems: 'flex-end' },
  weatherIcon: { fontSize: 36 },
  weatherTemp: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 2 },
  weatherDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 16 },
  weatherStatsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  weatherStat: { alignItems: 'center', gap: 4 },
  weatherStatIcon: { fontSize: 18 },
  weatherStatValue: { fontSize: 14, fontWeight: '700', color: '#fff' },
  weatherStatLabel: { fontSize: 10, color: '#aac' },

  /* BUTTON */
  button: {
    backgroundColor: '#6d9f8d',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#6d9f8d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  calendarSheet: {
    minHeight: '78%',
  },
  calendarList: {
    borderTopWidth: 1,
    borderTopColor: '#f0eee8',
    paddingTop: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6d9f8d',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#f8f8f8',
    gap: 12,
  },
  modalOptionActive: { backgroundColor: '#eef0ff' },
  modalOptionEmoji: { fontSize: 22 },
  modalOptionText: { flex: 1, fontSize: 15, color: '#333', fontWeight: '500' },
  modalOptionTextActive: { color: '#6d9f8d', fontWeight: '700' },
  modalCheck: { fontSize: 16, color: '#4f46e5', fontWeight: '700' },

  /* DATE CARD */
  dateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  dateBox: { flex: 1, alignItems: 'center' },
  dateHint: { fontSize: 11, color: '#aaa', marginBottom: 4 },
  dateValue: { fontSize: 15, fontWeight: '700', color: '#333' },
  datePlaceholder: { color: '#ccc', fontWeight: '400' },
  dateDivider: { width: 1, height: 36, backgroundColor: '#eee', marginHorizontal: 8 },
  nightsBadge: {
    backgroundColor: '#6d9f8d',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  nightsText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
