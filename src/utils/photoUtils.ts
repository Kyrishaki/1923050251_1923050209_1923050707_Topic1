import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface ImageResult {
  uri: string | null;
  cancelled: boolean;
  error?: string;
}

/**
 * Pick an image from device gallery with permission refusal handling
 */
export async function pickImageFromGallery(): Promise<ImageResult> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return {
        uri: null,
        cancelled: true,
        error: 'Quyền truy cập thư viện ảnh bị từ chối. Bạn vẫn có thể tiếp tục tạo bài tập bằng ghi chú văn bản.',
      };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: Platform.OS === 'web',
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { uri: null, cancelled: true };
    }

    return { uri: result.assets[0].uri, cancelled: false };
  } catch (err: any) {
    return { uri: null, cancelled: true, error: err?.message || 'Không thể chọn ảnh' };
  }
}

/**
 * Capture a photo from device camera with permission refusal handling
 */
export async function capturePhotoFromCamera(): Promise<ImageResult> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return {
        uri: null,
        cancelled: true,
        error: 'Quyền máy ảnh bị từ chối. Bạn vẫn có thể nhập ghi chú bài học mà không cần chụp ảnh.',
      };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: Platform.OS === 'web',
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { uri: null, cancelled: true };
    }

    return { uri: result.assets[0].uri, cancelled: false };
  } catch (err: any) {
    return { uri: null, cancelled: true, error: err?.message || 'Không thể chụp ảnh' };
  }
}
