/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
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

function App() {
  const [screen, setScreen] = useState<
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
    | 'packing-progress'
  >('splash');
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

      setScreen((current) => {
        if (current === 'splash') {
          return current;
        }
        return nextIsAuthenticated ? 'home' : 'login';
      });
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
      setScreen(tabKey);
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
            setScreen('login');
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
    setScreen('added-to-vault');
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {screen === 'splash' ? (
          <SplashScreen
            onFinish={() => setScreen(isAuthenticated ? 'home' : 'login')}
            logoSource={require('./src/pages/VV_logo.png')}
          />
        ) : null}
        {screen === 'login' ? (
          <LoginPage
            onNavigate={setScreen}
            onAuthSuccess={() => setScreen('home')}
          />
        ) : null}
        {screen === 'register' ? (
          <RegisterPage
            onNavigate={setScreen}
            onAuthSuccess={() => setScreen('home')}
          />
        ) : null}
        {screen === 'forgot-password' ? (
          <ForgotPasswordPage onNavigate={setScreen} />
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
          />
        ) : null}
        {screen === 'scan' ? (
          <ScanPage
            selectedBottomTab="scan"
            onNavigate={handleBottomTabPress}
            onSaveOutfit={handleAddOutfit}
          />
        ) : null}
        {screen === 'community' ? (
          <CommunityPage
            selectedBottomTab="community"
            onNavigate={handleBottomTabPress}
          />
        ) : null}
        {screen === 'trip' ? (
          <TripPage
            selectedBottomTab="home"
            onNavigate={handleBottomTabPress}
            initialTripPlan={tripPlan}
            onGeneratePacking={(nextTripPlan: TripPlan) => {
              setTripPlan(nextTripPlan);
              setScreen('trip-outfit-picker');
            }}
          />
        ) : null}
        {screen === 'trip-outfit-picker' ? (
          <TripOutfitPickerPage
            items={vaultItems}
            onNavigate={handleBottomTabPress}
            onOpenAiSuggestions={() => setScreen('trip-ai-suggestions')}
            onContinuePacking={(selectedIds: Record<string, boolean>) => {
              const selectedIdsList = Object.keys(selectedIds).filter(
                id => selectedIds[id],
              );
              setSelectedTripOutfitIds(selectedIdsList);
              setSelectedTripOutfits(
                vaultItems.filter(item => selectedIdsList.includes(item.id)),
              );
              setScreen('packing-progress');
            }}
          />
        ) : null}
        {screen === 'trip-ai-suggestions' ? (
          <TripAiSuggestionsPage
            tripPlan={tripPlan}
            onBack={() => setScreen('trip-outfit-picker')}
            onUseSuggestions={(suggestedOutfits: VaultItem[]) => {
              setSelectedTripOutfitIds([]);
              setSelectedTripOutfits(suggestedOutfits);
              setScreen('packing-progress');
            }}
          />
        ) : null}
        {screen === 'packing-progress' ? (
          <PackingProgressPage
            onNavigate={handleBottomTabPress}
            selectedOutfits={selectedTripOutfits}
            onTripReady={() => setScreen('home')}
          />
        ) : null}
        {screen === 'added-to-vault' ? (
          <AddedToVaultPage
            sectionLabel={lastAddedSection}
            selectedBottomTab="vault"
            onNavigate={handleBottomTabPress}
            onGoToVault={() => setScreen('vault')}
            onViewSuggestions={() => setScreen('community')}
          />
        ) : null}
        {screen === 'profile' ? (
          <ProfilePage
            userId={currentUserId}
            userName={currentUserName}
            onUserNameChange={setCurrentUserName}
            selectedBottomTab="profile"
            onNavigate={handleBottomTabPress}
            onLogout={handleLogout}
            onLoggedOut={() => setScreen('login')}
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
