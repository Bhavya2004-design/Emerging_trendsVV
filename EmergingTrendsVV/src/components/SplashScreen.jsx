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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e8e4da',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e4da',
  },
  logo: {
    width: 400,
    height: 400,
  },
  brand: {
    marginTop: 10,
    color: '#2E2E2E',
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '700',
  },
});
