import 'styled-components/native';

declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      header: string;
      background: string;
      card: string;

      text: string;
      placeholder: string;

      black: string;
      white: string;

      gray50: string;
      gray100: string;
      gray200: string;

      disabled: string;
    };
  }
}
