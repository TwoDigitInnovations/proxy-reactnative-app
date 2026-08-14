export const colors = {
  primary: '#F05023',
  primaryAlt: '#FF5207',
  textDark: '#363636',
  textDarker: '#1E0909',
  border: '#858080',
  backgroundLight: '#FFEEDA',
  backgroundLightAlt: '#FFE8DA',
  gray: '#797979',
  grayAlt: '#6B6B6B',
  grayLight: '#BFBFBF',
  overlayBlue: '#2048BD33',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorToken = keyof typeof colors;
