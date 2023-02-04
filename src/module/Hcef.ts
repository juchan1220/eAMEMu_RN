import { NativeModules } from 'react-native';

const { Hcef } = NativeModules;

interface HcefModule {
  support: boolean;
  enabled: boolean;

  setSID: (sid: string) => Promise<true>;
  enableService: () => Promise<true>;
  disableService: () => Promise<true>;
}

export default Hcef as HcefModule;
