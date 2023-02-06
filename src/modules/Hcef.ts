import { NativeModules } from 'react-native';

const { Hcef } = NativeModules;

interface HcefModule {
  support: boolean;
  enabled: boolean;

  enableService: (sid: string) => Promise<true>;
  disableService: () => Promise<true>;
}

export default Hcef as HcefModule;
