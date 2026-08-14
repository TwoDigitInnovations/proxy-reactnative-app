import { Alert } from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';

export function pickImage(): Promise<Asset | null> {
  return new Promise(resolve => {
    Alert.alert('Select Photo', 'Choose a source', [
      {
        text: 'Camera',
        onPress: async () => {
          const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
          resolve(result.assets?.[0] ?? null);
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
          resolve(result.assets?.[0] ?? null);
        },
      },
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}

export function pickMultipleImages(maxCount: number): Promise<Asset[]> {
  return new Promise(resolve => {
    Alert.alert('Select Photos', 'Choose a source', [
      {
        text: 'Camera',
        onPress: async () => {
          const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
          resolve(result.assets ?? []);
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: maxCount });
          resolve(result.assets ?? []);
        },
      },
      { text: 'Cancel', style: 'cancel', onPress: () => resolve([]) },
    ]);
  });
}
