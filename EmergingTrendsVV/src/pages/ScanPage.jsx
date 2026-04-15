import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera } from 'react-native-image-picker';
import AppScreenHeader from '../components/AppScreenHeader';
import BottomTabBar from '../components/BottomTabBar';
import { vaultTabs } from '../data/vaultMockData';
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
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [aiDetails, setAiDetails] = useState({
    itemType: '',
    color: '',
    material: '',
    style: '',
    features: [],
    occasion: '',
  });

  const selectedTabLabel = useMemo(
    () =>
      assignableTabs.find(tab => tab.key === selectedCategory)?.label ||
      'Travel Outfit',
    [selectedCategory],
  );

  async function ensureCameraPermission() {
    if (Platform.OS !== 'android') {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'VogueVault needs camera access to scan your outfit.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  async function handleOpenCamera() {
    const permissionGranted = await ensureCameraPermission();

    if (!permissionGranted) {
      Alert.alert(
        'Permission needed',
        'Please allow camera access to scan outfits.',
      );
      return;
    }

    const result = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      quality: 0.9,
      saveToPhotos: true,
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorCode) {
      Alert.alert(
        'Camera error',
        result.errorMessage || 'Could not open camera.',
      );
      return;
    }

    const uri = result.assets?.[0]?.uri;

    if (!uri) {
      Alert.alert('Scan failed', 'No image captured. Try again.');
      return;
    }

    setCapturedImageUri(uri);
    setProcessedImageUri('');
    setAiDetails({
      itemType: '',
      color: '',
      material: '',
      style: '',
      features: [],
      occasion: '',
    });
    setIsEditingDetails(false);
  }

  function handleDiscard() {
    if (!capturedImageUri) {
      return;
    }

    setCapturedImageUri('');
    setProcessedImageUri('');
    setAiDetails({
      itemType: '',
      color: '',
      material: '',
      style: '',
      features: [],
      occasion: '',
    });
    setIsEditingDetails(false);
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
    } finally {
      setIsProcessingImage(false);
    }

    setIsAnalyzing(true);

    try {
      const analysis = await analyzeOutfitImage({
        imageUri: processedImageUri || capturedImageUri,
        category: selectedCategory,
      });

      setAiDetails(analysis);
      setIsEditingDetails(false);
    } catch (error) {
      Alert.alert(
        'AI detection failed',
        'Try again. You can still add manually to vault.',
      );
    } finally {
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
      const detailsReady = Boolean(aiDetails.itemType);
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
      });
      setCapturedImageUri('');
      setProcessedImageUri('');
      setAiDetails({
        itemType: '',
        color: '',
        material: '',
        style: '',
        features: [],
        occasion: '',
      });
      setIsEditingDetails(false);
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
              <View style={styles.detailsRow}>
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>CATEGORY</Text>
                  {isEditingDetails ? (
                    <TextInput
                      style={styles.detailInput}
                      value={aiDetails.itemType}
                      onChangeText={value =>
                        setAiDetails(prev => ({ ...prev, itemType: value }))
                      }
                    />
                  ) : (
                    <Text style={styles.detailValue}>{aiDetails.itemType}</Text>
                  )}
                </View>
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>COLOR</Text>
                  {isEditingDetails ? (
                    <TextInput
                      style={styles.detailInput}
                      value={aiDetails.color}
                      onChangeText={value =>
                        setAiDetails(prev => ({ ...prev, color: value }))
                      }
                    />
                  ) : (
                    <Text style={styles.detailValue}>{aiDetails.color}</Text>
                  )}
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>MATERIAL</Text>
                  {isEditingDetails ? (
                    <TextInput
                      style={styles.detailInput}
                      value={aiDetails.material}
                      onChangeText={value =>
                        setAiDetails(prev => ({ ...prev, material: value }))
                      }
                    />
                  ) : (
                    <Text style={styles.detailValue}>{aiDetails.material}</Text>
                  )}
                </View>
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>STYLE</Text>
                  {isEditingDetails ? (
                    <TextInput
                      style={styles.detailInput}
                      value={aiDetails.style}
                      onChangeText={value =>
                        setAiDetails(prev => ({ ...prev, style: value }))
                      }
                    />
                  ) : (
                    <Text style={styles.detailValue}>{aiDetails.style}</Text>
                  )}
                </View>
              </View>

              {aiDetails.occasion ? (
                <Text style={styles.occasionText}>
                  Best use: {aiDetails.occasion}
                </Text>
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

              <Pressable
                style={[styles.scanButton, styles.editDetailsButton]}
                onPress={() => setIsEditingDetails(current => !current)}
              >
                <Text style={styles.editDetailsButtonText}>
                  {isEditingDetails ? 'SAVE DETAILS' : 'EDIT DETAILS'}
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
  detailInput: {
    marginTop: 2,
    color: '#2d2925',
    fontSize: 16,
    fontFamily: 'serif',
    fontWeight: '700',
    paddingVertical: 0,
  },
  occasionText: {
    marginTop: 4,
    marginBottom: 10,
    fontFamily: 'serif',
    color: '#564a42',
    fontSize: 14,
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
  editDetailsButton: {
    height: 48,
    backgroundColor: '#e8e4da',
    borderWidth: 3,
    borderColor: '#7faf9b',
    marginBottom: 4,
  },
  editDetailsButtonText: {
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
