import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppScreenHeader from '../components/AppScreenHeader';
import OutfitScanCamera from '../components/OutfitScanCamera';
import BottomTabBar from '../components/BottomTabBar';
import { vaultTabs } from '../data/vaultMockData';
import {
  AI_DEV_SERVER_PORT,
  aiApiBaseUrl,
  aiScanUrlBlockedByExpoTunnel,
  isLikelyIphoneHotspotClientDevUrl,
} from '../config/aiConfig';
import {
  analyzeOutfitImage,
  processOutfitImage,
} from '../services/aiOutfitAnalyzer';

const assignableTabs = vaultTabs.filter(
  tab => tab.key !== 'all' && tab.key !== 'favorites',
);

const subtitleByCategory = {
  travel: 'Travel, Captured via Scan',
  work: 'Work, Captured via Scan',
};

function createEmptyAiDetails() {
  return {
    itemType: '',
    color: '',
    material: '',
    style: '',
    features: [],
    occasion: '',
    confidence: null,
    pattern: '',
    reasoning: '',
    warnings: [],
  };
}

export default function ScanPage({
  onNavigate,
  onGoBack,
  onSaveOutfit,
  selectedBottomTab = 'scan',
}) {
  const [capturedImageUri, setCapturedImageUri] = useState('');
  const [processedImageUri, setProcessedImageUri] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('travel');
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [aiDetails, setAiDetails] = useState(createEmptyAiDetails);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);

  const selectedTabLabel = useMemo(
    () =>
      assignableTabs.find(tab => tab.key === selectedCategory)?.label ||
      'Travel Outfit',
    [selectedCategory],
  );

  function handleOpenCamera() {
    setCameraModalVisible(true);
  }

  function handleScanPhotoCaptured(uri) {
    if (!uri) {
      return;
    }
    setCapturedImageUri(uri);
    setProcessedImageUri('');
    setAiDetails(createEmptyAiDetails());
  }

  function handleDiscard() {
    if (!capturedImageUri) {
      return;
    }

    setCapturedImageUri('');
    setProcessedImageUri('');
    setAiDetails(createEmptyAiDetails());
  }

  function updateAiTextField(field, value) {
    setAiDetails(current => ({
      ...current,
      [field]: value,
    }));
  }

  function updateFeaturesCsv(value) {
    const parsed = value
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);

    setAiDetails(current => ({
      ...current,
      features: parsed,
    }));
  }

  async function handleRunAiDetection() {
    if (!capturedImageUri) {
      Alert.alert(
        'No outfit image',
        'Scan an outfit first before AI detection.',
      );
      return;
    }

    setIsProcessingImage(true);

    try {
      const processingResult = await processOutfitImage(capturedImageUri);
      const resolvedImageUri =
        processingResult.processedImageUri || capturedImageUri;
      setProcessedImageUri(resolvedImageUri);

      setIsAnalyzing(true);

      const analysis = await analyzeOutfitImage({
        imageUri: resolvedImageUri,
        category: selectedCategory,
      });

      setAiDetails(analysis);

      if (analysis.provider === 'offline') {
        let extraNote = '';
        const rootCause = String(
          Array.isArray(analysis.warnings) && analysis.warnings.length > 0
            ? analysis.warnings[0]
            : '',
        ).trim();
        if (aiScanUrlBlockedByExpoTunnel) {
          extraNote = `\n\nYou are using Expo tunnel (Metro shows a *.exp.direct address). That tunnel does NOT forward port ${AI_DEV_SERVER_PORT} to your laptop.\n\nFix: in EmergingTrendsVVExpo/.env add:\nEXPO_PUBLIC_AI_API_BASE_URL=http://YOUR_PC_LAN_IP:${AI_DEV_SERVER_PORT}\n(Get YOUR_PC_LAN_IP from Windows ipconfig on your Wi‑Fi adapter.) Then restart Expo: npx expo start -c`;
        } else if (
          Platform.OS === 'ios' &&
          isLikelyIphoneHotspotClientDevUrl(aiApiBaseUrl)
        ) {
          extraNote = `\n\nYou are on iPhone Personal Hotspot (${aiApiBaseUrl}). iOS usually blocks the hosting phone from calling back to a tethered laptop on 172.20.10.x.\n\nBetter setup: turn on Mobile Hotspot on your Windows laptop, join that Wi‑Fi from the iPhone, run ipconfig, then set EXPO_PUBLIC_AI_API_BASE_URL to http://YOUR_HOTSPOT_IPV4:${AI_DEV_SERVER_PORT} (often 192.168.137.1 on the “Local Area Connection*” adapter). Restart Expo after changing .env.`;
        }

        Alert.alert(
          'AI server not reached',
          `Your phone could not reach the scan server at:\n${aiApiBaseUrl}${rootCause ? `\n\nDetected issue:\n${rootCause}` : ''}\n\nFix: run "npm run dev" in EmergingTrendsVVExpo/server, allow Windows Firewall port ${AI_DEV_SERVER_PORT}, and use a URL the phone can route to (same Wi‑Fi, laptop-hosted hotspot, or a tunnel like ngrok).${extraNote}`,
        );
      }
    } catch (error) {
      Alert.alert(
        'AI detection failed',
        error instanceof Error ? error.message : 'Try again. You can still add manually to vault.',
      );
    } finally {
      setIsProcessingImage(false);
      setIsAnalyzing(false);
    }
  }

  async function handleSaveOutfit() {
    if (!capturedImageUri) {
      Alert.alert(
        'No outfit image',
        'Scan an outfit first before adding it to Vault.',
      );
      return;
    }

    setIsSaving(true);

    try {
      const detailsReady = Boolean(aiDetails.itemType.trim());
      const normalizedItemType = detailsReady
        ? aiDetails.itemType.charAt(0).toUpperCase() +
          aiDetails.itemType.slice(1)
        : selectedTabLabel;
      const composedSubtitle = detailsReady
        ? `${aiDetails.color}, ${aiDetails.material}, ${aiDetails.style}`
        : subtitleByCategory[selectedCategory] || 'Captured via Scan';

      await onSaveOutfit({
        imageUri: processedImageUri || capturedImageUri,
        category: selectedCategory,
        title: `Scanned ${normalizedItemType}`,
        subtitle: composedSubtitle,
        itemType: aiDetails.itemType,
        color: aiDetails.color,
        material: aiDetails.material,
        style: aiDetails.style,
        features: aiDetails.features,
        occasion: aiDetails.occasion,
        pattern: aiDetails.pattern,
        confidence: aiDetails.confidence,
        reasoning: aiDetails.reasoning,
        warnings: aiDetails.warnings,
      });
      setCapturedImageUri('');
      setProcessedImageUri('');
      setAiDetails(createEmptyAiDetails());
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AppScreenHeader
            onBack={onGoBack}
            title="Scan Outfit"
            subtitle="Tap to scan clothes and add to VogueVault"
          />

          <View style={styles.previewWrap}>
            {capturedImageUri ? (
              <Image
                source={{ uri: processedImageUri || capturedImageUri }}
                style={styles.previewImage}
              />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Text style={styles.previewPlaceholderText}>
                  No outfit scanned yet
                </Text>
                <Text style={styles.previewHintText}>
                  Tap SCAN ITEM to capture an outfit
                </Text>
              </View>
            )}
            <View style={styles.cropCornerTopLeft} />
            <View style={styles.cropCornerTopRight} />
            <View style={styles.cropCornerBottomLeft} />
            <View style={styles.cropCornerBottomRight} />
          </View>

          <Text style={styles.helperText}>Use the camera to scan an item</Text>

          <View style={styles.quickActionsRow}>
            <Pressable
              style={styles.quickActionButton}
              onPress={() => onNavigate('vault')}
            >
              <Text style={styles.quickActionIcon}>⌕</Text>
              <Text style={styles.quickActionText}>Search clothing</Text>
            </Pressable>
          </View>

          <Text style={styles.assignTitle}>Add to section</Text>
          <View style={styles.assignChipsWrap}>
            {assignableTabs.map(tab => {
              const isActive = tab.key === selectedCategory;

              return (
                <Pressable
                  key={tab.key}
                  style={[
                    styles.assignChip,
                    isActive && styles.assignChipActive,
                  ]}
                  onPress={() => setSelectedCategory(tab.key)}
                >
                  <Text
                    style={[
                      styles.assignChipText,
                      isActive && styles.assignChipTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {!capturedImageUri ? (
            <Pressable style={styles.scanButton} onPress={handleOpenCamera}>
              <Text style={styles.scanButtonText}>SCAN ITEM</Text>
            </Pressable>
          ) : null}

          {capturedImageUri && !aiDetails.itemType ? (
            <Pressable
              style={[styles.scanButton, styles.aiButton]}
              onPress={handleRunAiDetection}
              disabled={isAnalyzing || isProcessingImage}
            >
              <Text style={styles.scanButtonText}>
                {isProcessingImage
                  ? 'PROCESSING IMAGE...'
                  : isAnalyzing
                  ? 'ANALYZING OUTFIT...'
                  : 'Detect'}
              </Text>
            </Pressable>
          ) : null}

          {aiDetails.itemType ? (
            <View style={styles.detailsCardWrap}>
              <Text style={styles.reviewTitle}>Review AI detection</Text>

              <View style={styles.editFieldWrap}>
                <Text style={styles.detailLabel}>ITEM TYPE</Text>
                <TextInput
                  style={styles.editInput}
                  value={aiDetails.itemType}
                  onChangeText={value => updateAiTextField('itemType', value)}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.editFieldWrap}>
                <Text style={styles.detailLabel}>COLOR</Text>
                <TextInput
                  style={styles.editInput}
                  value={aiDetails.color}
                  onChangeText={value => updateAiTextField('color', value)}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.editFieldWrap}>
                <Text style={styles.detailLabel}>MATERIAL</Text>
                <TextInput
                  style={styles.editInput}
                  value={aiDetails.material}
                  onChangeText={value => updateAiTextField('material', value)}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.editFieldWrap}>
                <Text style={styles.detailLabel}>FEATURES (comma separated)</Text>
                <TextInput
                  style={styles.editInput}
                  value={aiDetails.features.join(', ')}
                  onChangeText={updateFeaturesCsv}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  Confidence: {Number.isFinite(aiDetails.confidence) ? `${Math.round(aiDetails.confidence * 100)}%` : 'N/A'}
                </Text>
                <Text style={styles.metaText}>Pattern: {aiDetails.pattern || 'N/A'}</Text>
              </View>

              {aiDetails.reasoning ? (
                <Text style={styles.reasoningText}>Reasoning: {aiDetails.reasoning}</Text>
              ) : null}

              {Array.isArray(aiDetails.warnings) && aiDetails.warnings.length > 0 ? (
                <Text style={styles.warningText}>Warnings: {aiDetails.warnings.join(' | ')}</Text>
              ) : null}

              <Pressable
                style={[styles.scanButton, styles.confirmButton]}
                onPress={handleSaveOutfit}
                disabled={isSaving}
              >
                <Text style={styles.confirmButtonText}>
                  {isSaving ? 'ADDING...' : 'CONFIRM AND ADD TO VAULT'}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {capturedImageUri && !aiDetails.itemType ? (
            <View style={styles.secondaryActionsRow}>
              <Pressable
                style={styles.secondaryButton}
                onPress={handleOpenCamera}
              >
                <Text style={styles.secondaryButtonText}>Rescan</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={handleDiscard}>
                <Text style={styles.secondaryButtonText}>Discard</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>

        <BottomTabBar selectedTab={selectedBottomTab} onNavigate={onNavigate} />
      </View>

      <OutfitScanCamera
        visible={cameraModalVisible}
        onClose={() => setCameraModalVisible(false)}
        onPhotoCaptured={handleScanPhotoCaptured}
      />
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
    paddingTop: 18,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 170,
  },
  previewWrap: {
    backgroundColor: '#fdfaf5',
    borderRadius: 18,
    padding: 10,
    marginBottom: 14,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e8ddd0',
  },
  previewImage: {
    width: '100%',
    height: 256,
    borderRadius: 14,
  },
  previewPlaceholder: {
    width: '100%',
    height: 256,
    borderRadius: 14,
    backgroundColor: '#e3eee7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  previewPlaceholderText: {
    fontSize: 16,
    color: '#5f534a',
    fontFamily: 'serif',
    marginBottom: 4,
    textAlign: 'center',
  },
  previewHintText: {
    fontSize: 13,
    color: '#6c6057',
    textAlign: 'center',
    fontFamily: 'serif',
  },
  cropCornerTopLeft: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 22,
    height: 22,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#6f645c',
  },
  cropCornerTopRight: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 22,
    height: 22,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#6f645c',
  },
  cropCornerBottomLeft: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 22,
    height: 22,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#6f645c',
  },
  cropCornerBottomRight: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 22,
    height: 22,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#6f645c',
  },
  helperText: {
    textAlign: 'center',
    color: '#5f534a',
    fontFamily: 'serif',
    fontSize: 15,
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    marginBottom: 14,
    justifyContent: 'center',
  },
  quickActionButton: {
    flexGrow: 1,
    maxWidth: 360,
    backgroundColor: '#fbf7f0',
    borderRadius: 14,
    minHeight: 62,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e8ddd0',
  },
  quickActionIcon: {
    color: '#7fae9a',
    marginRight: 8,
    fontSize: 15,
  },
  quickActionText: {
    color: '#4f443c',
    fontFamily: 'serif',
    fontSize: 12,
  },
  assignTitle: {
    fontSize: 16,
    color: '#5a4f46',
    marginBottom: 8,
    fontFamily: 'serif',
  },
  assignChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  assignChip: {
    backgroundColor: '#f9f3ea',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2d7ca',
  },
  assignChipActive: {
    backgroundColor: '#9cc8b8',
    borderColor: '#9cc8b8',
  },
  assignChipText: {
    color: '#5d5148',
    fontFamily: 'serif',
  },
  assignChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  scanButton: {
    backgroundColor: '#7faf9b',
    height: 52,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scanButtonText: {
    color: '#36433b',
    fontSize: 16,
    fontFamily: 'serif',
    letterSpacing: 0.6,
    fontWeight: '700',
  },
  aiButton: {
    marginBottom: 12,
  },
  detailsCardWrap: {
    marginBottom: 12,
    backgroundColor: '#f8f5ef',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8ddd0',
  },
  reviewTitle: {
    color: '#5a4f46',
    fontFamily: 'serif',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '700',
  },
  editFieldWrap: {
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd0c2',
    color: '#2d2925',
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontFamily: 'serif',
    fontSize: 15,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 2,
  },
  metaText: {
    color: '#5a4f46',
    fontFamily: 'serif',
    fontSize: 12,
  },
  reasoningText: {
    color: '#5a4f46',
    fontFamily: 'serif',
    fontSize: 12,
    marginBottom: 4,
  },
  warningText: {
    color: '#8b4f46',
    fontFamily: 'serif',
    fontSize: 12,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailCard: {
    width: '49%',
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#5a4f46',
    fontFamily: 'serif',
  },
  detailValue: {
    marginTop: 2,
    color: '#2d2925',
    fontSize: 16,
    fontFamily: 'serif',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  confirmButton: {
    height: 48,
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#2f4338',
    fontSize: 16,
    fontFamily: 'serif',
    letterSpacing: 0.4,
    fontWeight: '700',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fbf7f0',
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#5a4f46',
    fontFamily: 'serif',
    fontSize: 14,
  },
});
