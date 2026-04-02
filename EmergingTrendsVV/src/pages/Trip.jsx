import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  Alert,
  Pressable,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenBackButton from '../components/ScreenBackButton';
import BottomTabBar from '../components/BottomTabBar';

const DESTINATIONS = ['Paris, France', 'London, UK', 'New York, USA'];

const PERIOD_MAIN = '#6d9f8d';
const PERIOD_MID = '#b8d9cc';

function stripToLocalDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toYMD(d) {
  const x = stripToLocalDay(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
}

function inclusiveTripDays(start, end) {
  const a = stripToLocalDay(start);
  const b = stripToLocalDay(end);
  const diffMs = b.getTime() - a.getTime();
  return Math.max(1, Math.round(diffMs / 86400000) + 1);
}

function buildPeriodMarkedDates(start, end) {
  const marks = {};
  const s = stripToLocalDay(start);
  const e = stripToLocalDay(end);
  if (e < s) {
    return marks;
  }
  const cur = new Date(s);
  while (cur <= e) {
    const key = toYMD(cur);
    const isFirst = key === toYMD(s);
    const isLast = key === toYMD(e);
    if (isFirst && isLast) {
      marks[key] = {
        startingDay: true,
        endingDay: true,
        color: PERIOD_MAIN,
        textColor: '#fff',
      };
    } else if (isFirst) {
      marks[key] = { startingDay: true, color: PERIOD_MAIN, textColor: '#fff' };
    } else if (isLast) {
      marks[key] = { endingDay: true, color: PERIOD_MAIN, textColor: '#fff' };
    } else {
      marks[key] = { color: PERIOD_MID, textColor: '#2b2b2b' };
    }
    cur.setDate(cur.getDate() + 1);
  }
  return marks;
}

export default function TripPage({ onNavigate, selectedBottomTab = 'home' }) {
  const insets = useSafeAreaInsets();
  const [destination, setDestination] = useState('Paris, France');
  const [showDest, setShowDest] = useState(false);
  const [startDate, setStartDate] = useState(new Date(2026, 6, 12));
  const [endDate, setEndDate] = useState(new Date(2026, 6, 18));
  const [aiToggle, setAiToggle] = useState(true);

  const [showCalendar, setShowCalendar] = useState(false);
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);
  const [rangeStarted, setRangeStarted] = useState(false);

  const minDateStr = useMemo(() => toYMD(stripToLocalDay(new Date())), []);

  const markedDates = useMemo(
    () => buildPeriodMarkedDates(draftStart, draftEnd),
    [draftStart, draftEnd],
  );

  const tripDayCount = useMemo(
    () => inclusiveTripDays(startDate, endDate),
    [startDate, endDate],
  );

  function openCalendar() {
    setDraftStart(startDate);
    setDraftEnd(endDate);
    setRangeStarted(false);
    setShowCalendar(true);
  }

  function onCalendarDayPress(day) {
    const d = stripToLocalDay(new Date(day.year, day.month - 1, day.day));
    const minD = stripToLocalDay(new Date());
    if (d < minD) {
      return;
    }

    if (!rangeStarted) {
      setDraftStart(d);
      setDraftEnd(d);
      setRangeStarted(true);
      return;
    }

    if (d < draftStart) {
      setDraftEnd(stripToLocalDay(draftStart));
      setDraftStart(d);
    } else {
      setDraftEnd(d);
    }
  }

  function confirmCalendar() {
    setStartDate(stripToLocalDay(draftStart));
    setEndDate(stripToLocalDay(draftEnd));
    setShowCalendar(false);
  }

  function resetCalendarRange() {
    setRangeStarted(false);
    const t = stripToLocalDay(new Date());
    setDraftStart(t);
    setDraftEnd(t);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.screen}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ScreenBackButton onPress={() => onNavigate('home')} />
            <Text style={styles.title}>Pack For Trip</Text>
          </View>

          <Text style={styles.subtitle}>
            Plan your trip & get smart packing suggestions
          </Text>

          <TouchableOpacity style={styles.card} onPress={() => setShowDest(true)}>
            <Text style={styles.label}>Destination</Text>
            <View style={styles.row}>
              <Text style={styles.rowIcon}>⌖</Text>
              <Text style={[styles.value, styles.valueFlex]} numberOfLines={1}>
                {destination}
              </Text>
              <Text style={styles.chevron}>▼</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateCardFull}
            onPress={openCalendar}
            activeOpacity={0.85}
          >
            <View style={styles.dateCardHeader}>
              <Text style={styles.rowIcon}>▦</Text>
              <Text style={styles.label}>Travel Dates</Text>
            </View>
            <Text style={styles.dateRangeText}>
              {formatDate(startDate)} → {formatDate(endDate)}
            </Text>
            <Text style={styles.daysBadge}>{tripDayCount} days</Text>
            <Text style={styles.daysHint}>Tap to open calendar</Text>
          </TouchableOpacity>

          <View style={styles.smallCard}>
            <Text style={styles.rowIcon}>◫</Text>
            <Text style={styles.label}>Trip Type</Text>
            <Text style={styles.value}>Vacation</Text>
          </View>

          <View style={styles.weather}>
            <View style={styles.overlay}>
              <Text style={styles.weatherTitle}>Weather in Paris</Text>
              <View style={styles.weatherRow}>
                <Text style={styles.temp}>24°C</Text>
                <Text style={styles.sun}>☀</Text>
              </View>
              <Text style={styles.weatherText}>Mostly Sunny</Text>
              <View style={styles.weatherStats}>
                <Text style={styles.stat}>💧 55%</Text>
                <Text style={styles.stat}>🌬 8 km/h</Text>
                <Text style={styles.stat}>🌡 26°C</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Packing Tips</Text>
            <Text style={styles.tip}>Light clothes + jacket recommended</Text>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              Use AI to analyze my closet for this trip
            </Text>
            <Switch value={aiToggle} onValueChange={setAiToggle} />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              Alert.alert(
                'Packing list',
                'Your smart packing list will appear here once the feature is connected.',
              )
            }
          >
            <Text style={styles.buttonText}>Generate Packing List →</Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomTabBar selectedTab={selectedBottomTab} onNavigate={onNavigate} />

        <Modal visible={showDest} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowDest(false)}
          >
            <View style={styles.modalSheet}>
              {DESTINATIONS.map(city => (
                <TouchableOpacity
                  key={city}
                  style={styles.modalItemWrap}
                  onPress={() => {
                    setDestination(city);
                    setShowDest(false);
                  }}
                >
                  <Text style={styles.modalItem}>{city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal
          visible={showCalendar}
          animationType="slide"
          transparent
          onRequestClose={() => setShowCalendar(false)}
        >
          <View style={styles.calModalRoot}>
            <Pressable
              style={styles.calModalBackdrop}
              onPress={() => setShowCalendar(false)}
            />
            <View
              style={[
                styles.calModalSheet,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              <Text style={styles.calModalTitle}>Travel dates</Text>
              <Text style={styles.calModalHint}>
                {rangeStarted
                  ? 'Tap the last day of your trip (or tap Reset to start over).'
                  : 'Tap your first travel day to begin.'}
              </Text>
              <Calendar
                current={toYMD(draftStart)}
                minDate={minDateStr}
                markingType="period"
                markedDates={markedDates}
                onDayPress={onCalendarDayPress}
                enableSwipeMonths
                theme={{
                  backgroundColor: '#fff',
                  calendarBackground: '#fff',
                  textSectionTitleColor: '#534740',
                  todayTextColor: PERIOD_MAIN,
                  dayTextColor: '#2b2b2b',
                  textDisabledColor: '#d0c9bf',
                  arrowColor: PERIOD_MAIN,
                  monthTextColor: '#2b2b2b',
                  textDayHeaderFontSize: 12,
                  textDayFontSize: 15,
                  textMonthFontSize: 17,
                }}
              />
              <View style={styles.calActions}>
                <TouchableOpacity
                  style={styles.calSecondaryBtn}
                  onPress={resetCalendarRange}
                >
                  <Text style={styles.calSecondaryBtnText}>Reset range</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.calPrimaryBtn}
                  onPress={confirmCalendar}
                >
                  <Text style={styles.calPrimaryBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 132,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2b2b2b',
    fontFamily: 'serif',
  },
  subtitle: {
    marginTop: 4,
    color: '#666',
    marginBottom: 14,
    fontSize: 14,
    fontFamily: 'serif',
  },
  card: {
    backgroundColor: '#ede6dc',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  smallCard: {
    backgroundColor: '#ede6dc',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  dateCardFull: {
    backgroundColor: '#ede6dc',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  dateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateRangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b2b2b',
    fontFamily: 'serif',
  },
  daysBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#d4ebe2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '600',
    color: '#3d6b5c',
    fontFamily: 'serif',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  rowIcon: {
    fontSize: 16,
    color: '#534740',
  },
  chevron: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#888',
  },
  label: {
    color: '#666',
    fontSize: 13,
    fontFamily: 'serif',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2b2b2b',
  },
  valueFlex: {
    flex: 1,
    minWidth: 0,
  },
  daysHint: {
    color: '#7faf9b',
    fontSize: 11,
    marginTop: 6,
    fontFamily: 'serif',
  },
  weather: {
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#5a7a8e',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    padding: 12,
    borderRadius: 20,
    justifyContent: 'center',
  },
  weatherTitle: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'serif',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sun: {
    fontSize: 28,
  },
  temp: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
  },
  weatherText: {
    color: '#fff',
    fontSize: 12,
  },
  weatherStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  stat: {
    color: '#fff',
    fontSize: 11,
  },
  tip: {
    fontSize: 13,
    marginTop: 4,
    color: '#444',
    fontFamily: 'serif',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    gap: 12,
  },
  switchText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    fontFamily: 'serif',
  },
  button: {
    backgroundColor: '#6d9f8d',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'serif',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  modalItemWrap: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0dcd4',
  },
  modalItem: {
    fontSize: 17,
    color: '#2b2b2b',
    fontFamily: 'serif',
  },
  calModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  calModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  calModalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 18,
    maxHeight: '88%',
  },
  calModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2b2b2b',
    fontFamily: 'serif',
    marginBottom: 6,
  },
  calModalHint: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'serif',
    marginBottom: 12,
    lineHeight: 18,
  },
  calActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  calSecondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c5bdb3',
    alignItems: 'center',
  },
  calSecondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#534740',
    fontFamily: 'serif',
  },
  calPrimaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#6d9f8d',
    alignItems: 'center',
  },
  calPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'serif',
  },
});
