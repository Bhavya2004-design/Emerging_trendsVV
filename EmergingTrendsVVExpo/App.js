import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StatusBar, StyleSheet, View } from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import LoginPage from './src/pages/Login';
import RegisterPage from './src/pages/Register';
import ForgotPasswordPage from './src/pages/ForgotPassword';
import VaultPage from './src/pages/VaultPage';
import ScanPage from './src/pages/ScanPage';
import CommunityPage from './src/pages/CommunityPage';
import AddedToVaultPage from './src/pages/AddedToVaultPage';
import ProfilePage from './src/pages/ProfilePage';
import HomePage from './src/pages/HomePage';
import TripPage from './src/pages/Trip';
import TripOutfitPickerPage from './src/pages/TripOutfitPickerPage';
import PackingProgressPage from './src/pages/PackingProgressPage';
import SplashScreen from './src/components/SplashScreen';
import { mockVaultItems } from './src/data/vaultMockData';
import { logoutUser, subscribeAuthState } from './src/services/firebaseAuth';
import { saveOutfitToDatabase } from './src/services/outfitStorage';

export default function App() {
  const [screen, setScreen] = useState('splash');
  const screenRef = useRef('splash');
  const [screenHistory, setScreenHistory] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [vaultItems, setVaultItems] = useState(mockVaultItems);
  const [lastAddedSection, setLastAddedSection] = useState('');
  const [tripPlan, setTripPlan] = useState({
    destination: 'Paris, France',
    tripType: 'Business',
    startDate: null,
    endDate: null,
  });
  const [selectedTripOutfits, setSelectedTripOutfits] = useState([]);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  const navigateTo = useCallback((next, options = {}) => {
    if (options.resetHistory) {
      setScreenHistory([]);
      setScreen(next);
      return;
    }

    const from = screenRef.current;
    if (!options.skipHistory && from !== next) {
      setScreenHistory(history => {
        if (history.length > 0 && history[history.length - 1] === from) {
          return history;
        }
        return [...history, from];
      });
    }

    setScreen(next);
  }, []);

  const goBack = useCallback(() => {
    setScreenHistory(history => {
      if (history.length === 0) {
        setScreen('home');
        return history;
      }
      const previousScreen = history[history.length - 1];
      setScreen(previousScreen);
      return history.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeAuthState((user) => {
      const nextIsAuthenticated = Boolean(user);
      setIsAuthenticated(nextIsAuthenticated);
      const fallbackName = user?.email ? String(user.email).split('@')[0] : '';
      setCurrentUserName(user?.displayName?.trim() || fallbackName);
      setCurrentUserId(user?.uid || '');

      const current = screenRef.current;
      if (current === 'splash') {
        return;
      }

      if (!nextIsAuthenticated) {
        if (['login', 'register', 'forgot-password'].includes(current)) {
          return;
        }
        setScreenHistory([]);
        setScreen('login');
        return;
      }

      if (['login', 'register', 'forgot-password'].includes(current)) {
        setScreenHistory([]);
        setScreen('home');
      }
    });

    return unsubscribe;
  }, []);

  function handleBottomTabPress(tabKey) {
    if (
      tabKey === 'home' ||
      tabKey === 'vault' ||
      tabKey === 'scan' ||
      tabKey === 'community' ||
      tabKey === 'profile' ||
      tabKey === 'trip'
    ) {
      navigateTo(tabKey);
      return;
    }

    Alert.alert('Coming soon', `${tabKey[0].toUpperCase()}${tabKey.slice(1)} page is not built yet.`);
  }

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutUser();
          } catch {
            // e.g. Firebase misconfigured — still end the session in the app
          } finally {
            // Guests never sign in, so auth state may not change; always go to login
            navigateTo('login', { resetHistory: true });
          }
        },
      },
    ]);
  }

  async function handleAddOutfit(outfitPayload) {
    const newOutfit = {
      id: `scan-${Date.now()}`,
      title: outfitPayload.title || 'Scanned Outfit',
      subtitle: outfitPayload.subtitle,
      category: outfitPayload.category,
      isFavorite: false,
      imageUri: outfitPayload.imageUri,
      aiMeta: {
        itemType: outfitPayload.itemType,
        color: outfitPayload.color,
        material: outfitPayload.material,
        style: outfitPayload.style,
        features: outfitPayload.features,
        occasion: outfitPayload.occasion,
      },
    };

    setVaultItems(currentItems => [newOutfit, ...currentItems]);
    await saveOutfitToDatabase(newOutfit);
    setLastAddedSection(outfitPayload.category === 'travel' ? 'travel section' : 'work section');
    navigateTo('added-to-vault');
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {screen === 'splash' ? (
          <SplashScreen
            onFinish={() =>
              navigateTo(isAuthenticated ? 'home' : 'login', { skipHistory: true })
            }
            logoSource={require('./src/pages/VV_logo.png')}
          />
        ) : null}
        {screen === 'login' ? (
          <LoginPage
            onNavigate={navigateTo}
            onAuthSuccess={() => navigateTo('home', { resetHistory: true })}
          />
        ) : null}
        {screen === 'register' ? (
          <RegisterPage
            onNavigate={navigateTo}
            onAuthSuccess={() => navigateTo('home', { resetHistory: true })}
          />
        ) : null}
        {screen === 'forgot-password' ? (
          <ForgotPasswordPage onNavigate={navigateTo} />
        ) : null}
        {screen === 'home' ? (
          <HomePage
            userName={currentUserName}
            selectedBottomTab="home"
            onNavigate={handleBottomTabPress}
            onLogout={handleLogout}
          />
        ) : null}
        {screen === 'vault' ? (
          <VaultPage
            items={vaultItems}
            selectedBottomTab="vault"
            onBottomTabPress={handleBottomTabPress}
            onGoBack={goBack}
          />
        ) : null}
        {screen === 'scan' ? (
          <ScanPage
            selectedBottomTab="scan"
            onNavigate={handleBottomTabPress}
            onGoBack={goBack}
            onSaveOutfit={handleAddOutfit}
          />
        ) : null}
        {screen === 'community' ? (
          <CommunityPage
            selectedBottomTab="community"
            onNavigate={handleBottomTabPress}
            onGoBack={goBack}
          />
        ) : null}
        {screen === 'trip' ? (
          <TripPage
            selectedBottomTab="home"
            onNavigate={handleBottomTabPress}
            onGoBack={goBack}
            initialTripPlan={tripPlan}
            onGeneratePacking={(nextTripPlan) => {
              setTripPlan({
                destination: nextTripPlan.destination,
                tripType: nextTripPlan.tripType,
                startDate: nextTripPlan.startDate,
                endDate: nextTripPlan.endDate,
              });
              navigateTo('trip-outfit-picker');
            }}
          />
        ) : null}
        {screen === 'trip-outfit-picker' ? (
          <TripOutfitPickerPage
            items={vaultItems}
            onNavigate={navigateTo}
            onContinuePacking={(selectedIds) => {
              const selectedIdsList = Object.keys(selectedIds).filter(
                id => selectedIds[id],
              );
              setSelectedTripOutfits(
                vaultItems.filter(item => selectedIdsList.includes(item.id)),
              );
              navigateTo('packing-progress');
            }}
          />
        ) : null}
        {screen === 'packing-progress' ? (
          <PackingProgressPage
            onNavigate={navigateTo}
            selectedOutfits={selectedTripOutfits}
            onTripReady={() => navigateTo('home', { resetHistory: true })}
          />
        ) : null}
        {screen === 'added-to-vault' ? (
          <AddedToVaultPage
            sectionLabel={lastAddedSection}
            selectedBottomTab="vault"
            onNavigate={handleBottomTabPress}
            onGoBack={goBack}
            onGoToVault={() => navigateTo('vault')}
          />
        ) : null}
        {screen === 'profile' ? (
          <ProfilePage
            userId={currentUserId}
            userName={currentUserName}
            onUserNameChange={setCurrentUserName}
            selectedBottomTab="profile"
            onNavigate={handleBottomTabPress}
            onGoBack={goBack}
            onLoggedOut={() => navigateTo('login', { resetHistory: true })}
          />
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
