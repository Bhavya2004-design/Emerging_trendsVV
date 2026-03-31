/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginPage from './src/pages/Login';
import RegisterPage from './src/pages/Register';
import VaultPage from './src/pages/VaultPage';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [screen, setScreen] = useState<'login' | 'register' | 'vault'>('login');

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        {screen === 'login' ? (
          <LoginPage onNavigate={setScreen} />
        ) : null}
        {screen === 'register' ? (
          <RegisterPage onNavigate={setScreen} />
        ) : null}
        {screen === 'vault' ? <VaultPage /> : null}
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
