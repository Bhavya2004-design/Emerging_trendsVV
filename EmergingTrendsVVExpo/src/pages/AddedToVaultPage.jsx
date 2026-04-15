import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar';
import ScreenBackButton from '../components/ScreenBackButton';

export default function AddedToVaultPage({
  onNavigate,
  onGoBack,
  onGoToVault,
  sectionLabel,
  selectedBottomTab = 'vault',
}) {
  const normalizedSectionLabel = sectionLabel ? sectionLabel.toUpperCase() : '';
  const description = normalizedSectionLabel
    ? `YOUR OUTFIT ANALYSIS HAS BEEN ADDED TO ${normalizedSectionLabel} AND IS READY FOR MATCHING.`
    : 'YOUR OUTFIT ANALYSIS HAS BEEN ADDED AND IS READY FOR MATCHING.';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.screen}>
        <View style={styles.topBack}>
          <ScreenBackButton onPress={onGoBack} />
        </View>
        <View style={styles.contentWrap}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>ADDED TO VAULT</Text>
          </View>

          <View style={styles.confirmBadge}>
            <Text style={styles.confirmIcon}>✓</Text>
          </View>

          <Text style={styles.confirmedText}>CONFIRMED!</Text>
          <Text style={styles.descriptionText}>{description}</Text>

          <Pressable style={styles.primaryButton} onPress={onGoToVault}>
            <Text style={styles.primaryButtonText}>GO TO MY VAULT</Text>
          </Pressable>

        </View>

        <BottomTabBar selectedTab={selectedBottomTab} onNavigate={onNavigate} />
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
  topBack: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 4,
  },
  contentWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  titleWrap: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    color: '#1f1e1a',
    fontWeight: '700',
    fontFamily: 'serif',
    letterSpacing: 1,
    textAlign: 'center',
    alignSelf: 'center',
  },
  confirmBadge: {
    marginTop: 32,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#92c557',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmIcon: {
    color: '#f5f0e5',
    fontSize: 74,
    lineHeight: 78,
    fontWeight: '800',
  },
  confirmedText: {
    marginTop: 34,
    fontSize: 44,
    color: '#1f1e1a',
    fontWeight: '700',
    fontFamily: 'serif',
  },
  descriptionText: {
    marginTop: 24,
    textAlign: 'center',
    color: '#2f2b25',
    fontSize: 14,
    lineHeight: 19,
    fontFamily: 'serif',
    letterSpacing: 0.3,
  },
  primaryButton: {
    marginTop: 44,
    minWidth: 250,
    backgroundColor: '#79b39b',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#1e2622',
    fontFamily: 'serif',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
