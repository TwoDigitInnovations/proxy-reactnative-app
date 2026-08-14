import { Platform } from 'react-native';

function platformFont(iosName: string, androidName: string): string {
  return Platform.select({ ios: iosName, android: androidName, default: 'System' }) as string;
}

export const fontFamilies = {
  roboto: {
    regular: platformFont('Roboto-Regular', 'Roboto-Regular'),
    medium: platformFont('Roboto-Medium', 'Roboto-Medium'),
    semibold: platformFont('Roboto-SemiBold', 'Roboto-SemiBold'),
    bold: platformFont('Roboto-Bold', 'Roboto-Bold'),
  },
  poppins: {
    regular: platformFont('Poppins-Regular', 'Poppins-Regular'),
    medium: platformFont('Poppins-Medium', 'Poppins-Medium'),
    semibold: platformFont('Poppins-SemiBold', 'Poppins-SemiBold'),
    bold: platformFont('Poppins-Bold', 'Poppins-Bold'),
  },
  raleway: {
    regular: platformFont('RalewayThin-Regular', 'Raleway-Regular'),
    medium: platformFont('RalewayThin-Medium', 'Raleway-Medium'),
    semibold: platformFont('RalewayThin-SemiBold', 'Raleway-SemiBold'),
    bold: platformFont('RalewayThin-Bold', 'Raleway-Bold'),
  },
  inter: {
    regular: platformFont('Inter-Regular', 'Inter-Regular'),
    medium: platformFont('Inter-Medium', 'Inter-Medium'),
    semibold: platformFont('Inter-SemiBold', 'Inter-SemiBold'),
    bold: platformFont('Inter-Bold', 'Inter-Bold'),
  },
  nunitoSans: {
    regular: platformFont('NunitoSans12ptExtraLight12pt-Regular', 'NunitoSans-Regular'),
    medium: platformFont('NunitoSans12ptExtraLight12pt-Medium', 'NunitoSans-Medium'),
    semibold: platformFont('NunitoSans12ptExtraLight12pt-SemiBold', 'NunitoSans-SemiBold'),
    bold: platformFont('NunitoSans12ptExtraLight12pt-Bold', 'NunitoSans-Bold'),
  },
  abeezee: {
    regular: platformFont('ABeeZee-Regular', 'ABeeZee-Regular'),
  },
  sfProText: {
    regular: platformFont('SFProText-Regular', 'SF-Pro-Text-Regular'),
  },
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 28,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;
