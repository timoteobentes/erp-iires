export interface ColorRamp {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface SigetesColors {
  primary: ColorRamp;
  secondary: ColorRamp;
  success: ColorRamp;
  dark: ColorRamp;
  warning: ColorRamp;
  danger: ColorRamp;
  background: string;
  surface: string;
}

export declare const colors: SigetesColors;
export default colors;
