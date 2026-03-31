import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const bottomTabs = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'scan', label: 'Scan', icon: '⌗' },
  { key: 'vault', label: 'Vault', icon: '⬡' },
  { key: 'community', label: 'Community', icon: '◌' },
  { key: 'profile', label: 'Profile', icon: '◠' },
];

export default function AddedToVaultPage({
  onNavigate,
  onGoToVault,
  onViewSuggestions,
  sectionLabel = 'your selected section',
  selectedBottomTab = 'vault',
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.contentWrap}>
          <Text style={styles.title}>ADDED TO VAULT</Text>

          <View style={styles.confirmBadge}>
            <Text style={styles.confirmIcon}>✓</Text>
          </View>

          <Text style={styles.confirmedText}>CONFIRMED!</Text>
          <Text style={styles.descriptionText}>
            YOUR OUTFIT ANALYSIS HAS BEEN ADDED TO {sectionLabel.toUpperCase()} AND IS READY FOR MATCHING.
          </Text>

          <Pressable style={styles.primaryButton} onPress={onGoToVault}>
            <Text style={styles.primaryButtonText}>GO TO MY VAULT</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onViewSuggestions}>
            <Text style={styles.secondaryButtonText}>VIEW MY OUTFIT SUGGESTIONS</Text>
          </Pressable>
        </View>

        <View style={styles.bottomBar}>
          {bottomTabs.map((tab) => {
            const isActive = tab.key === selectedBottomTab;

            return (
              <Pressable key={tab.key} onPress={() => onNavigate(tab.key)} style={styles.bottomTab}>
                <View style={[styles.bottomIconWrap, isActive && styles.bottomIconWrapActive]}>
                  <Text style={[styles.bottomIcon, isActive && styles.bottomIconActive]}>{tab.icon}</Text>
                </View>
                <Text style={[styles.bottomLabel, isActive && styles.bottomLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f0e5',
  },
  screen: {
    flex: 1,
    backgroundColor: '#f5f0e5',
  },
  contentWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 40,
    color: '#1f1e1a',
    fontWeight: '700',
    fontFamily: 'serif',
    letterSpacing: 1,
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
  secondaryButton: {
    marginTop: 16,
    minWidth: 250,
    borderWidth: 3,
    borderColor: '#79b39b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: '#f5f0e5',
  },
  secondaryButtonText: {
    color: '#2b3430',
    fontFamily: 'serif',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fbf7f0',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#efe5d8',
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
  },
  bottomIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bottomIconWrapActive: {
    backgroundColor: '#e8f2ed',
  },
  bottomIcon: {
    fontSize: 20,
    color: '#64594e',
  },
  bottomIconActive: {
    color: '#97bfae',
  },
  bottomLabel: {
    color: '#64594e',
    fontSize: 12,
    fontFamily: 'serif',
  },
  bottomLabelActive: {
    color: '#97bfae',
  },
});
