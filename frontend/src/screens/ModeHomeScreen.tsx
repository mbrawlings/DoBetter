import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import ModeSwitch, { APP_MODES, AppMode } from '../components/ModeSwitch';
import { usePersistedState } from '../hooks/usePersistedState';
import { colorsLight } from '../theme/theme';
import CabinetScreen from './CabinetScreen';
import HomeScreen from './HomeScreen';

const MODE_PREF_KEY = 'dobetter.pref.mode';

export default function ModeHomeScreen() {
  const [mode, setMode, ready] = usePersistedState<AppMode>(MODE_PREF_KEY, 'people', APP_MODES);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colorsLight.bg }}>
        <ActivityIndicator color={colorsLight.primary} />
      </View>
    );
  }

  switch (mode) {
    case 'maintenance':
      return <CabinetScreen onModeChange={setMode} />;
    case 'people':
      return <HomeScreen onModeChange={setMode} />;
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}
