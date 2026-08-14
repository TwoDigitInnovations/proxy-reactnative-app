import type { EdgeInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fontFamilies } from '../theme/typography';

const BASE_HEIGHT = 56;

export function getTabBarStyle(insets: EdgeInsets) {
  return {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 0,
    height: BASE_HEIGHT + insets.bottom,
    paddingTop: 8,
    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
  };
}

export const tabBarLabelStyle = {
  fontSize: 12,
  fontWeight: '600' as const,
  fontFamily: fontFamilies.abeezee.regular,
};

export const tabBarActiveTintColor = colors.white;
export const tabBarInactiveTintColor = colors.backgroundLight;
