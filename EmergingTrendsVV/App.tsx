/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

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
import TripAiSuggestionsPage from './src/pages/TripAiSuggestionsPage';
import PackingProgressPage from './src/pages/PackingProgressPage';
import SplashScreen from './src/components/SplashScreen';
import { mockVaultItems } from './src/data/vaultMockData';
import { logoutUser, subscribeAuthState } from './src/services/firebaseAuth';
import { saveOutfitToDatabase } from './src/services/outfitStorage';
import type { VaultItem } from './src/types/vaultItem';

type ScanOutfitPayload = {
  imageUri: string;
  category: 'travel' | 'work';
  title?: string;
  subtitle?: string;
  itemType?: string;
  color?: string;
  material?: string;
  style?: string;
  features?: string[];
  occasion?: string;
};

type TripPlan = {
  destination: string;
  tripType: 'Business' | 'Personal';
  startDate: string | null;
  endDate: string | null;
};

type AppScreen =
  | 'splash'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'home'
  | 'vault'
  | 'scan'
  | 'community'
  | 'profile'
  | 'added-to-vault'
  | 'trip'
  | 'trip-outfit-picker'
  | 'trip-ai-suggestions'
  | 'packing-progress';

function App() {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const screenRef = useRef<AppScreen>('splash');

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  const [screenHistory, setScreenHistory] = useState<AppScreen[]>([]);

  const navigateTo = useCallback(
    (
      next: AppScreen,
      options?: { skipHistory?: boolean; resetHistory?: boolean },
    ) => {
      if (options?.resetHistory) {
        setScreenHistory([]);
        setScreen(next);
        return;
      }
      const from = screenRef.current;
      if (!options?.skipHistory && from !== next) {
        setScreenHistory(h => {
          if (h.length > 0 && h[h.length - 1] === from) {
            return h;
          }
          return [...h, from];
        });
      }
      setScreen(next);
    },
    [],
  );

  const goBack = useCallback(() => {
    setScreenHistory(h => {
      if (h.length === 0) {
        setScreen('home');
        return h;
      }
      const prev = h[h.length - 1];
      setScreen(prev);
      return h.slice(0, -1);
    });
  }, []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [vaultItems, setVaultItems] = useState<VaultItem[]>(
    mockVaultItems as VaultItem[],
  );
  const [lastAddedSection, setLastAddedSection] = useState(
    'your selected section',
  );

  const [selectedTripOutfitIds, setSelectedTripOutfitIds] = useState<string[]>([]);
  const [selectedTripOutfits, setSelectedTripOutfits] = useState<VaultItem[]>([]);
  const [tripPlan, setTripPlan] = useState<TripPlan>({
    destination: 'Paris, France',
    tripType: 'Business',
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    const unsubscribe = subscribeAuthState((user: any) => {
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

  function handleBottomTabPress(tabKey: string) {
    if (
      tabKey === 'home' ||
      tabKey === 'vault' ||
      tabKey === 'scan' ||
      tabKey === 'community' ||
      tabKey === 'profile' ||
      tabKey === 'trip'
    ) {
      navigateTo(tabKey as AppScreen);
      return;
    }

    Alert.alert(
      'Coming soon',
      `${tabKey[0].toUpperCase()}${tabKey.slice(1)} page is not built yet.`,
    );
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
            // Guest or misconfigured Firebase — still leave session
          } finally {
            navigateTo('login', { resetHistory: true });
          }
        },
      },
    ]);
  }

  async function handleAddOutfit(outfitPayload: ScanOutfitPayload) {
    const newOutfit: VaultItem = {
      id: `scan-${Date.now()}`,
      title: outfitPayload.title || 'Scanned Outfit',
      subtitle: outfitPayload.subtitle || '',
      category: outfitPayload.category,
      isFavorite: false,
      mockImage: {
        background: '#f0f0f0',
        accents: ['#999999', '#cccccc'],
        layout: 'scanned-item',
      },
    };

    setVaultItems(currentItems => [newOutfit, ...currentItems]);
    await saveOutfitToDatabase(newOutfit);
    setLastAddedSection(
      outfitPayload.category === 'travel' ? 'travel section' : 'work section',
    );
    navigateTo('added-to-vault');
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {screen === 'splash' ? (
          <SplashScreen
            onFinish={() =>
              navigateTo(isAuthenticated ? 'home' : 'login', {
                skipHistory: true,
              })
            }
            logoSource={require('./src/pages/VV_logo.png')}
          />
        ) : null}
        {screen === 'login' ? (
          <LoginPage
            onNavigate={navigateTo}
            onAuthSuccess={() =>
              navigateTo('home', { resetHistory: true })
            }
          />
        ) : null}
        {screen === 'register' ? (
          <RegisterPage
            onNavigate={navigateTo}
            onAuthSuccess={() =>
              navigateTo('home', { resetHistory: true })
            }
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
            onGeneratePacking={(nextTripPlan: TripPlan) => {
              setTripPlan(nextTripPlan);
              navigateTo('trip-outfit-picker');
            }}
          />
        ) : null}
        {screen === 'trip-outfit-picker' ? (
          <TripOutfitPickerPage
            items={vaultItems}
            onNavigate={handleBottomTabPress}
            onGoBack={goBack}
            onOpenAiSuggestions={() => navigateTo('trip-ai-suggestions')}
            onContinuePacking={(selectedIds: Record<string, boolean>) => {
              const selectedIdsList = Object.keys(selectedIds).filter(
                id => selectedIds[id],
              );
              setSelectedTripOutfitIds(selectedIdsList);
              setSelectedTripOutfits(
                vaultItems.filter(item => selectedIdsList.includes(item.id)),
              );
              navigateTo('packing-progress');
            }}
          />
        ) : null}
        {screen === 'trip-ai-suggestions' ? (
          <TripAiSuggestionsPage
            tripPlan={tripPlan}
            onBack={goBack}
            onUseSuggestions={(suggestedOutfits: VaultItem[]) => {
              setSelectedTripOutfitIds([]);
              setSelectedTripOutfits(suggestedOutfits);
              navigateTo('packing-progress');
            }}
          />
        ) : null}
        {screen === 'packing-progress' ? (
          <PackingProgressPage
            onNavigate={handleBottomTabPress}
            onGoBack={goBack}
            selectedOutfits={selectedTripOutfits}
            onTripReady={() =>
              navigateTo('home', { resetHistory: true })
            }
          />
        ) : null}
        {screen === 'added-to-vault' ? (
          <AddedToVaultPage
            sectionLabel={lastAddedSection}
            selectedBottomTab="vault"
            onNavigate={handleBottomTabPress}
            onGoBack={goBack}
            onGoToVault={() => navigateTo('vault')}
            onViewSuggestions={() => navigateTo('community')}
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
            onLogout={handleLogout}
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

export default App;
