import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarList } from 'react-native-calendars';
import ScreenBackButton from '../components/ScreenBackButton';
import BottomTabBar from '../components/BottomTabBar';

/* =========================
   DATA
========================= */
const DEFAULT_DESTINATION = {
  label: 'Paris, France',
  latitude: 48.8566,
  longitude: 2.3522,
  emoji: '📍',
};

const WEATHER_CODE_LOOKUP = {
  0: { condition: 'Clear Sky', icon: '☀️' },
  1: { condition: 'Mostly Clear', icon: '🌤️' },
  2: { condition: 'Partly Cloudy', icon: '⛅' },
  3: { condition: 'Cloudy', icon: '☁️' },
  45: { condition: 'Foggy', icon: '🌫️' },
  48: { condition: 'Foggy', icon: '🌫️' },
  51: { condition: 'Light Drizzle', icon: '🌦️' },
  53: { condition: 'Drizzle', icon: '🌦️' },
  55: { condition: 'Heavy Drizzle', icon: '🌧️' },
  61: { condition: 'Light Rain', icon: '🌦️' },
  63: { condition: 'Rain', icon: '🌧️' },
  65: { condition: 'Heavy Rain', icon: '🌧️' },
  66: { condition: 'Freezing Rain', icon: '🌨️' },
  67: { condition: 'Freezing Rain', icon: '🌨️' },
  71: { condition: 'Light Snow', icon: '🌨️' },
  73: { condition: 'Snow', icon: '🌨️' },
  75: { condition: 'Heavy Snow', icon: '❄️' },
  77: { condition: 'Snow Grains', icon: '❄️' },
  80: { condition: 'Rain Showers', icon: '🌦️' },
  81: { condition: 'Rain Showers', icon: '🌧️' },
  82: { condition: 'Heavy Showers', icon: '⛈️' },
  85: { condition: 'Snow Showers', icon: '🌨️' },
  86: { condition: 'Snow Showers', icon: '❄️' },
  95: { condition: 'Thunderstorm', icon: '⛈️' },
  96: { condition: 'Storm and Hail', icon: '⛈️' },
  99: { condition: 'Storm and Hail', icon: '⛈️' },
};

const TRIP_TYPES = [
  { label: 'Business', icon: '💼' },
  { label: 'Personal', icon: '🌴' },
];

const createDestinationLabel = (result) => {
  const locality =
    result.name ||
    result.city ||
    result.admin1 ||
    result.admin2 ||
    result.admin3 ||
    'Unknown place';
  const country = result.country || '';

  if (!country || locality.toLowerCase() === country.toLowerCase()) {
    return locality;
  }

  return `${locality}, ${country}`;
};

const createDestinationOption = (result) => ({
  label: createDestinationLabel(result),
  latitude: Number(result.latitude),
  longitude: Number(result.longitude),
  emoji: '📍',
});

const normalizeDestination = (value) => {
  if (value && typeof value === 'object') {
    return {
      label: value.label || value.destination || DEFAULT_DESTINATION.label,
      latitude:
        value.latitude === null || value.latitude === undefined
          ? null
          : Number(value.latitude),
      longitude:
        value.longitude === null || value.longitude === undefined
          ? null
          : Number(value.longitude),
      emoji: value.emoji || '📍',
    };
  }

  if (typeof value === 'string' && value.trim()) {
    if (value.trim().toLowerCase() === DEFAULT_DESTINATION.label.toLowerCase()) {
      return { ...DEFAULT_DESTINATION };
    }

    return {
      label: value.trim(),
      latitude: null,
      longitude: null,
      emoji: '📍',
    };
  }

  return { ...DEFAULT_DESTINATION };
};

const getWeatherPresentation = (weatherCode) => {
  return WEATHER_CODE_LOOKUP[weatherCode] || { condition: 'Weather Update', icon: '🌤️' };
};

/* =========================
   COMPONENT
========================= */
export default function TripPage({
  onNavigate,
  onGoBack,
  selectedBottomTab = 'home',
  initialTripPlan,
  onGeneratePacking,
}) {
  const initialDestination = normalizeDestination(initialTripPlan?.destination);
  const [selectedDestination, setSelectedDestination] = useState(initialDestination);
  const [tripType, setTripType] = useState(initialTripPlan?.tripType || 'Business');
  const [showDest, setShowDest] = useState(false);
  const [showTripType, setShowTripType] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState(initialTripPlan?.startDate || null);
  const [endDate, setEndDate] = useState(initialTripPlan?.endDate || null);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState(initialDestination.label);
  const [destinationResults, setDestinationResults] = useState([]);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [destinationError, setDestinationError] = useState('');
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  const destination = selectedDestination.label;
  const cityName = destination.split(',')[0];
  const destEmoji = selectedDestination.emoji || '📍';

  useEffect(() => {
    let isCancelled = false;

    const hydrateDestinationCoordinates = async () => {
      if (selectedDestination.latitude !== null && selectedDestination.longitude !== null) {
        return;
      }

      const query = selectedDestination.label.trim();
      if (!query) {
        return;
      }

      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&format=json&name=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error('Failed to resolve destination');
        }

        const data = await response.json();
        if (!isCancelled && Array.isArray(data.results) && data.results[0]) {
          const resolvedDestination = createDestinationOption(data.results[0]);
          setSelectedDestination(currentDestination => {
            if (currentDestination.label !== query) {
              return currentDestination;
            }

            return {
              ...currentDestination,
              ...resolvedDestination,
            };
          });
        }
      } catch (error) {
        // Leave the selected label intact even if coordinates cannot be resolved.
      }
    };

    hydrateDestinationCoordinates();

    return () => {
      isCancelled = true;
    };
  }, [selectedDestination]);

  useEffect(() => {
    if (!showDest) {
      return undefined;
    }

    const query = destinationQuery.trim();
    if (query.length < 2) {
      setDestinationResults([]);
      setDestinationLoading(false);
      setDestinationError('');
      return undefined;
    }

    let isCancelled = false;
    const timeoutId = setTimeout(async () => {
      try {
        setDestinationLoading(true);
        setDestinationError('');

        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?count=8&language=en&format=json&name=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error('Destination search failed');
        }

        const data = await response.json();
        const seen = new Set();
        const results = Array.isArray(data.results)
          ? data.results
              .map(createDestinationOption)
              .filter(option => {
                const key = `${option.label}-${option.latitude}-${option.longitude}`;
                if (seen.has(key)) {
                  return false;
                }
                seen.add(key);
                return true;
              })
          : [];

        if (!isCancelled) {
          setDestinationResults(results);
        }
      } catch (error) {
        if (!isCancelled) {
          setDestinationResults([]);
          setDestinationError('Unable to load destinations right now.');
        }
      } finally {
        if (!isCancelled) {
          setDestinationLoading(false);
        }
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [destinationQuery, showDest]);

  useEffect(() => {
    let isCancelled = false;

    const loadWeather = async () => {
      if (selectedDestination.latitude === null || selectedDestination.longitude === null) {
        setWeather(null);
        setWeatherLoading(false);
        setWeatherError('');
        return;
      }

      try {
        setWeatherLoading(true);
        setWeatherError('');

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${selectedDestination.latitude}&longitude=${selectedDestination.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
        );

        if (!response.ok) {
          throw new Error('Weather request failed');
        }

        const data = await response.json();
        const currentWeather = data.current;

        if (!currentWeather) {
          throw new Error('Weather data missing');
        }

        const presentation = getWeatherPresentation(currentWeather.weather_code);

        if (!isCancelled) {
          setWeather({
            temp: `${Math.round(currentWeather.temperature_2m)}°C`,
            condition: presentation.condition,
            humidity: `${currentWeather.relative_humidity_2m ?? '--'}%`,
            wind: `${Math.round(currentWeather.wind_speed_10m ?? 0)} km/h`,
            feels: `${Math.round(currentWeather.apparent_temperature ?? currentWeather.temperature_2m)}°C`,
            icon: presentation.icon,
          });
        }
      } catch (error) {
        if (!isCancelled) {
          setWeather(null);
          setWeatherError('Live weather unavailable right now.');
        }
      } finally {
        if (!isCancelled) {
          setWeatherLoading(false);
        }
      }
    };

    loadWeather();

    return () => {
      isCancelled = true;
    };
  }, [selectedDestination.latitude, selectedDestination.longitude]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Select';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getTripDays = () => {
    if (!startDate || !endDate) return null;
    const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : null;
  };

  const getTripDurationLabel = () => {
    const tripDays = getTripDays();
    if (!tripDays) return null;
    return tripDays === 1 ? '1 day' : `${tripDays} days`;
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
      } else if (day.dateString === startDate) {
        Alert.alert('Invalid return date', 'Return date must be after the departure date.');
        setSelectingEnd(true);
      } else {
        setEndDate(day.dateString);
        setSelectingEnd(false);
        setShowCalendar(false);
      }
    }
  };

  const handleOpenDestinationModal = () => {
    setDestinationQuery(destination);
    setDestinationResults([]);
    setDestinationError('');
    setShowDest(true);
  };

  const handleSelectDestination = (nextDestination) => {
    setSelectedDestination(nextDestination);
    setDestinationQuery(nextDestination.label);
    setDestinationResults([]);
    setDestinationError('');
    setShowDest(false);
  };

  const weatherCardData = weather || {
    temp: '--',
    condition: weatherLoading ? 'Loading live weather...' : weatherError || 'Weather will appear here',
    humidity: '--',
    wind: '--',
    feels: '--',
    icon: weatherLoading ? '⏳' : weatherError ? '⚠️' : '🌤️',
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* HEADER */}
          <View style={styles.header}>
            <ScreenBackButton onPress={onGoBack} />
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>✈️ Pack For Trip</Text>
              <Text style={styles.subtitle}>Smart packing, stress-free travel</Text>
            </View>
          </View>

          {/* SECTION LABEL */}
          <Text style={styles.sectionLabel}>WHERE ARE YOU GOING?</Text>

          {/* DESTINATION CARD */}
          <TouchableOpacity style={styles.selectorCard} onPress={handleOpenDestinationModal} activeOpacity={0.8}>
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
          <TouchableOpacity
            style={styles.dateCard}
            onPress={() => {
              setSelectingEnd(false);
              setShowCalendar(true);
            }}
            activeOpacity={0.8}
          >
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
            {getTripDurationLabel() && (
              <View style={styles.nightsBadge}>
                <Text style={styles.nightsText}>{getTripDurationLabel()}</Text>
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
                <Text style={styles.weatherCondition}>{weatherCardData.condition}</Text>
              </View>
              <View style={styles.weatherTempWrap}>
                <Text style={styles.weatherIcon}>{weatherCardData.icon}</Text>
                <Text style={styles.weatherTemp}>{weatherCardData.temp}</Text>
              </View>
            </View>
            <View style={styles.weatherDivider} />
            <View style={styles.weatherStatsRow}>
              <View style={styles.weatherStat}>
                <Text style={styles.weatherStatIcon}>💧</Text>
                <Text style={styles.weatherStatValue}>{weatherCardData.humidity}</Text>
                <Text style={styles.weatherStatLabel}>Humidity</Text>
              </View>
              <View style={styles.weatherStat}>
                <Text style={styles.weatherStatIcon}>🌬️</Text>
                <Text style={styles.weatherStatValue}>{weatherCardData.wind}</Text>
                <Text style={styles.weatherStatLabel}>Wind</Text>
              </View>
              <View style={styles.weatherStat}>
                <Text style={styles.weatherStatIcon}>🌡️</Text>
                <Text style={styles.weatherStatValue}>{weatherCardData.feels}</Text>
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
                  destinationDetails: selectedDestination,
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
            <Pressable style={[styles.modalSheet, styles.destinationSheet]} onPress={() => {}}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Choose Destination</Text>
              <TextInput
                value={destinationQuery}
                onChangeText={setDestinationQuery}
                placeholder="Search any city or country"
                placeholderTextColor="#b8b1a6"
                style={styles.destinationInput}
                autoCapitalize="words"
                autoCorrect={false}
                autoFocus
              />
              <Text style={styles.destinationHelper}>Results powered by Open-Meteo geocoding.</Text>
              <ScrollView style={styles.destinationResults} keyboardShouldPersistTaps="handled">
                {destinationLoading && (
                  <View style={styles.destinationStatusRow}>
                    <ActivityIndicator color="#6d9f8d" />
                    <Text style={styles.destinationStatusText}>Searching destinations...</Text>
                  </View>
                )}

                {!destinationLoading && destinationError ? (
                  <Text style={styles.destinationEmptyText}>{destinationError}</Text>
                ) : null}

                {!destinationLoading && !destinationError && destinationQuery.trim().length < 2 ? (
                  <Text style={styles.destinationEmptyText}>Type at least 2 characters to search.</Text>
                ) : null}

                {!destinationLoading && !destinationError && destinationQuery.trim().length >= 2 && destinationResults.length === 0 ? (
                  <Text style={styles.destinationEmptyText}>No destinations found for this search.</Text>
                ) : null}

                {destinationResults.map(option => {
                  const isActive = destination === option.label;

                  return (
                    <TouchableOpacity
                      key={`${option.label}-${option.latitude}-${option.longitude}`}
                      style={[styles.modalOption, isActive && styles.modalOptionActive]}
                      onPress={() => handleSelectDestination(option)}
                    >
                      <Text style={styles.modalOptionEmoji}>{option.emoji}</Text>
                      <Text style={[styles.modalOptionText, isActive && styles.modalOptionTextActive]}>
                        {option.label}
                      </Text>
                      {isActive ? <Text style={styles.modalCheck}>✓</Text> : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        {/* TRIP TYPE MODAL - kept for safety */}
        <Modal visible={showTripType} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setShowTripType(false)}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Trip Type</Text>
              {TRIP_TYPES.map(t => (
                <TouchableOpacity
                  key={t.label}
                  style={[styles.modalOption, tripType === t.label && styles.modalOptionActive]}
                  onPress={() => {
                    setTripType(t.label);
                    setShowTripType(false);
                  }}
                >
                  <Text style={styles.modalOptionEmoji}>{t.icon}</Text>
                  <Text style={[styles.modalOptionText, tripType === t.label && styles.modalOptionTextActive]}>
                    {t.label}
                  </Text>
                  {tripType === t.label ? <Text style={styles.modalCheck}>✓</Text> : null}
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
  screen: { flex: 1, backgroundColor: '#f0ede6' },
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
  weatherCondition: { fontSize: 13, color: '#aac', marginTop: 4, maxWidth: 180 },
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
  destinationSheet: {
    maxHeight: '76%',
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
  destinationInput: {
    borderWidth: 1,
    borderColor: '#e3ddd3',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fcfbf8',
    marginBottom: 8,
  },
  destinationHelper: {
    fontSize: 12,
    color: '#938b80',
    marginBottom: 12,
  },
  destinationResults: {
    maxHeight: 320,
  },
  destinationStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  destinationStatusText: {
    fontSize: 14,
    color: '#6d9f8d',
    fontWeight: '500',
  },
  destinationEmptyText: {
    fontSize: 14,
    color: '#938b80',
    paddingVertical: 12,
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
