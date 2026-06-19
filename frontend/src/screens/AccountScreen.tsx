import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '../graphql/operations';
import { Avatar, BackButton, NavBar, PrimaryButton } from '../components/ui';
import ConfirmSheet from '../components/modals/ConfirmSheet';
import { useAuth } from '../providers/AuthContext';
import { colorsLight, fontFamily } from '../theme/theme';

type MeUser = { id: string; email: string; name?: string | null };

export default function AccountScreen({ navigation }: any) {
  const { logout } = useAuth();
  const { data } = useQuery(ME_QUERY);
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  const me: MeUser | undefined = data?.me;
  const displayName = me?.name?.trim() || me?.email || '';
  const [firstName = '', lastName = ''] = displayName.split(' ');

  const onConfirmSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
      setConfirmVisible(false);
    }
  };

  return (
    <View style={styles.root}>
      <NavBar title="Account" leading={<BackButton onPress={() => navigation.goBack()} />} />

      <View style={styles.body}>
        <View style={styles.profile}>
          <Avatar firstName={firstName} lastName={lastName} size={72} />
          {me?.name ? <Text style={styles.name}>{me.name}</Text> : null}
          {me?.email ? <Text style={styles.email}>{me.email}</Text> : null}
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label="Sign out"
            tone="danger"
            full
            onPress={() => setConfirmVisible(true)}
          />
        </View>
      </View>

      <ConfirmSheet
        visible={confirmVisible}
        title="Sign out?"
        message="You will need to log in again to access your data."
        confirmLabel="Sign out"
        destructive
        loading={signingOut}
        onConfirm={onConfirmSignOut}
        onDismiss={() => setConfirmVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colorsLight.bg,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  profile: {
    alignItems: 'center',
    marginTop: 32,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 22,
    letterSpacing: -0.5,
    color: colorsLight.text,
    marginTop: 16,
    includeFontPadding: false,
  },
  email: {
    fontFamily: fontFamily.regular,
    fontWeight: '400',
    fontSize: 15,
    color: colorsLight.textMuted,
    marginTop: 4,
    includeFontPadding: false,
  },
  footer: {
    paddingBottom: 32,
    gap: 10,
  },
});
