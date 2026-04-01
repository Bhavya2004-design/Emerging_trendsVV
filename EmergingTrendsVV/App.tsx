/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { Alert, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginPage from './src/pages/Login';
import RegisterPage from './src/pages/Register';
import ForgotPasswordPage from './src/pages/ForgotPassword';
import VaultPage from './src/pages/VaultPage';
import ScanPage from './src/pages/ScanPage';
import CommunityPage from './src/pages/CommunityPage';
import AddedToVaultPage from './src/pages/AddedToVaultPage';
import ProfilePage from './src/pages/ProfilePage';
import HomePage from './src/pages/HomePage';
import SplashScreen from './src/components/SplashScreen';
import { mockVaultItems } from './src/data/vaultMockData';
import { saveOutfitToDatabase } from './src/services/outfitStorage';

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

function App() {
  const [screen, setScreen] = useState<'splash' | 'login' | 'register' | 'forgot-password' | 'home' | 'vault' | 'scan' | 'community' | 'profile' | 'added-to-vault'>('splash');
  const [vaultItems, setVaultItems] = useState(mockVaultItems);
  const [lastAddedSection, setLastAddedSection] = useState('your selected section');

  function handleBottomTabPress(tabKey: string) {
    if (tabKey === 'home' || tabKey === 'vault' || tabKey === 'scan' || tabKey === 'community' || tabKey === 'profile') {
      setScreen(tabKey);
      return;
    }

    Alert.alert('Coming soon', `${tabKey[0].toUpperCase()}${tabKey.slice(1)} page is not built yet.`);
  }

  async function handleAddOutfit(outfitPayload: ScanOutfitPayload) {
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
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {screen === 'splash' ? (
          <SplashScreen
            onFinish={() => setScreen('login')}
            logoSource={require('./src/pages/VV_logo.png')}
          />
        ) : null}
        {screen === 'login' ? (
          <LoginPage onNavigate={setScreen} />
        ) : null}
        {screen === 'register' ? (
          <RegisterPage onNavigate={setScreen} />
        ) : null}
        {screen === 'forgot-password' ? (
          <ForgotPasswordPage onNavigate={setScreen} />
        ) : null}
        {screen === 'home' ? (
          <HomePage
            selectedBottomTab="home"
            onNavigate={handleBottomTabPress}
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

export default App;
