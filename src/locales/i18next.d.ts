// import the original type declarations
import 'i18next';
// import all namespaces (for the default language, only)
import { default as ko } from './ko.json';

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    defaultNS: 'translation';
    // custom resources type
    resources: {
      translation: typeof ko;
    };
    // other
  }
}
