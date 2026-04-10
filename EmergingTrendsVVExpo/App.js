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
import SplashScreen from './src/components/SplashScreen';
import { mockVaultItems } from './src/data/vaultMockData';
import { logoutUser, subscribeAuthState } from './src/services/firebaseAuth';
import { saveOutfitToDatabase } from './src/services/outfitStorage';

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [vaultItems, setVaultItems] = useState(mockVaultItems);
  const [lastAddedSection, setLastAddedSection] = useState('your selected section');

  useEffect(() => {
    const unsubscribe = subscribeAuthState((user) => {
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

  function handleBottomTabPress(tabKey) {
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
            setScreen('login');
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
