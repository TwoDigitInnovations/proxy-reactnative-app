import { Alert } from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
// Outside the React tree, so translate through the i18n instance rather than a hook.
import i18n from '../i18n';

export function pickImage(): Promise<Asset | null> {
  return new Promise(resolve => {
    Alert.alert(i18n.t('Select Photo'), i18n.t('Choose a source'), [
      {
        text: i18n.t('Camera'),
        onPress: async () => {
          const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
          resolve(result.assets?.[0] ?? null);
        },
      },
      {
        text: i18n.t('Gallery'),
        onPress: async () => {
          const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
          resolve(result.assets?.[0] ?? null);
        },
      },
      { text: i18n.t('Cancel'), style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}

export function pickMultipleImages(maxCount: number): Promise<Asset[]> {
  return new Promise(resolve => {
    Alert.alert(i18n.t('Select Photos'), i18n.t('Choose a source'), [
      {
        text: i18n.t('Camera'),
        onPress: async () => {
          const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
          resolve(result.assets ?? []);
        },
      },
      {
        text: i18n.t('Gallery'),
        onPress: async () => {
          const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: maxCount });
          resolve(result.assets ?? []);
        },
      },
      { text: i18n.t('Cancel'), style: 'cancel', onPress: () => resolve([]) },
    ]);
  });
}
