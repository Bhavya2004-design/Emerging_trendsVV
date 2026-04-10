import * as ImagePicker from 'expo-image-picker';

function toLegacyResponse(result) {
  if (result.canceled) {
    return { didCancel: true };
  }

  const asset = result.assets?.[0];

  if (!asset?.uri) {
    return {
      errorCode: 'unknown',
      errorMessage: 'No image was selected.',
    };
  }

  return {
    didCancel: false,
    assets: [
      {
        uri: asset.uri,
        fileName: asset.fileName || `photo-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      },
    ],
  };
}

export async function launchCamera(options = {}) {
  const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

  if (!cameraPermission.granted) {
    return {
      errorCode: 'permission',
      errorMessage: 'Camera permission denied.',
    };
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: typeof options.quality === 'number' ? options.quality : 1,
    cameraType: options.cameraType === 'front' ? 'front' : 'back',
  });

  return toLegacyResponse(result);
}

export async function launchImageLibrary(options = {}) {
  const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!mediaPermission.granted) {
    return {
      errorCode: 'permission',
      errorMessage: 'Gallery permission denied.',
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: typeof options.quality === 'number' ? options.quality : 1,
    allowsMultipleSelection: options.selectionLimit > 1,
    selectionLimit: options.selectionLimit || 1,
  });

  return toLegacyResponse(result);
}