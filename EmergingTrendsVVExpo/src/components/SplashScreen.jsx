import React, { useEffect } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen({ onFinish, logoSource }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 1400);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {logoSource ? (
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        ) : null}
        <Text style={styles.brand}>VogueVault</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f0e5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f0e5',
  },
  logo: {
    width: 150,
    height: 150,
  },
  brand: {
    marginTop: 10,
    color: '#2E2E2E',
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '700',
  },
});
