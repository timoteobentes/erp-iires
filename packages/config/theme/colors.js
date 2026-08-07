/**
 * Fonte única da paleta de cores do SIGETES (docs/DESIGN_SYSTEM.md §1-2).
 * Extraída por amostragem de pixel da logo oficial. Consumida pelo
 * tailwind.config.js do frontend e pelo ConfigProvider do Ant Design —
 * nunca copiar um valor hex direto no código, sempre importar daqui.
 */
export const colors = {
  primary: {
    50: '#F2F9F9',
    100: '#E3F3F1',
    200: '#BFE3E0',
    300: '#94D0CA',
    400: '#57B6AC',
    500: '#009082',
    600: '#007C70',
    700: '#00655B',
    800: '#004E46',
    900: '#003A34',
  },
  secondary: {
    50: '#F2F6FC',
    100: '#E4ECF8',
    200: '#C0D3EF',
    300: '#96B5E5',
    400: '#5A8AD5',
    500: '#054EC0',
    600: '#0443A5',
    700: '#043786',
    800: '#032A68',
    900: '#021F4D',
  },
  success: {
    50: '#F4FAF4',
    100: '#E6F4E6',
    200: '#C6E6C6',
    300: '#A0D69E',
    400: '#6ABE67',
    500: '#1D9D19',
    600: '#198716',
    700: '#146E12',
    800: '#10550E',
    900: '#0C3F0A',
  },
  dark: {
    50: '#F2F4F5',
    100: '#E3E6EA',
    200: '#BFC7CE',
    300: '#94A1AE',
    400: '#576B7F',
    500: '#001F3D',
    600: '#001B34',
    700: '#00162B',
    800: '#001121',
    900: '#000C18',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#FFC107',
    600: '#D69E06',
    700: '#B07E05',
    800: '#8A6104',
    900: '#664803',
  },
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#DC2626',
    600: '#B91C1C',
    700: '#991B1B',
    800: '#7F1D1D',
    900: '#651414',
  },
  background: '#F8F9FA',
  surface: '#FFFFFF',
};

export default colors;
