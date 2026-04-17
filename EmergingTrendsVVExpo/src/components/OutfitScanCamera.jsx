import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const FLASH_SEQUENCE = ['off', 'auto', 'on'];

/**
 * Full-screen camera for outfit photos: live preview, flash, flip camera,
 * max JPEG quality on capture for the vision pipeline.
 */
export default function OutfitScanCamera({ visible, onClose, onPhotoCaptured }) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setCameraReady(false);
    setFacing('back');
    setFlash('off');
    setIsCapturing(false);
  }, [visible]);

  useEffect(() => {
    if (!visible || permission?.granted) {
      return;
    }
    requestPermission();
  }, [visible, permission?.granted, requestPermission]);

  const cycleFlash = useCallback(() => {
    setFlash(current => {
      const i = FLASH_SEQUENCE.indexOf(current);
      return FLASH_SEQUENCE[(i + 1) % FLASH_SEQUENCE.length];
    });
  }, []);

  const toggleFacing = useCallback(() => {
    setFacing(f => (f === 'back' ? 'front' : 'back'));
  }, []);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !cameraReady || isCapturing) {
      return;
    }
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
        shutterSound: true,
      });
      if (photo?.uri) {
        onPhotoCaptured(photo.uri);
        onClose();
      } else {
        Alert.alert('Capture failed', 'No image was returned from the camera.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Capture failed', msg);
    } finally {
      setIsCapturing(false);
    }
  }, [cameraReady, isCapturing, onClose, onPhotoCaptured]);

  if (!visible) {
    return null;
  }

  const denied = permission && !permission.granted;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar style="light" />
      <View style={styles.root}>
        {permission == null ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#fff" size="large" />
            <Text style={styles.hint}>Checking camera...</Text>
          </View>
        ) : denied ? (
          <View style={[styles.centered, { paddingHorizontal: 24 }]}>
            <Text style={styles.title}>Camera access needed</Text>
            <Text style={styles.hint}>
              Allow camera access to photograph outfits for detection.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={requestPermission}>
              <Text style={styles.primaryBtnText}>Allow camera</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={onClose}>
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
              flash={flash}
              mode="picture"
              mirror={facing === 'front'}
              ratio={Platform.OS === 'android' ? '4:3' : undefined}
              onCameraReady={() => setCameraReady(true)}
              onMountError={event =>
                Alert.alert('Camera error', event.message || 'Could not start camera.')
              }
            />

            <View
              pointerEvents="box-none"
              style={[
                styles.topBar,
                { paddingTop: Math.max(insets.top, 12) + 8 },
              ]}
            >
              <Pressable style={styles.iconBtn} onPress={onClose} hitSlop={12}>
                <Text style={styles.iconBtnText}>Close</Text>
              </Pressable>
              <Text style={styles.topTitle}>Frame the clothing</Text>
              <View style={styles.topBarRight}>
                <Pressable style={styles.pillBtn} onPress={cycleFlash} hitSlop={8}>
                  <Text style={styles.pillBtnText}>
                    Flash: {flash.toUpperCase()}
                  </Text>
                </Pressable>
                <Pressable style={styles.pillBtn} onPress={toggleFacing} hitSlop={8}>
                  <Text style={styles.pillBtnText}>Flip</Text>
                </Pressable>
              </View>
            </View>

            <View
              pointerEvents="none"
              style={[
                styles.frameHintWrap,
                { bottom: 120 + Math.max(insets.bottom, 16) },
              ]}
            >
              <Text style={styles.frameHint}>
                Fill the frame - good lighting helps fabric and color detection
              </Text>
            </View>

            <View
              style={[
                styles.bottomBar,
                { paddingBottom: Math.max(insets.bottom, 20) },
              ]}
            >
              <Pressable
                style={[
                  styles.shutter,
                  (!cameraReady || isCapturing) && styles.shutterDisabled,
                ]}
                onPress={handleCapture}
                disabled={!cameraReady || isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator color="#1a1814" />
                ) : (
                  <View style={styles.shutterInner} />
                )}
              </Pressable>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  hint: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  topTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 88,
    justifyContent: 'flex-end',
  },
  iconBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  iconBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  pillBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  pillBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  frameHintWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  frameHint: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#1a1814',
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: '#7fb09b',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    marginTop: 8,
    paddingVertical: 12,
  },
  secondaryBtnText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
  },
});
