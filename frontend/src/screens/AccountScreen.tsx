import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '../graphql/operations';
import { Avatar, BackButton, NavBar, PrimaryButton, SummaryRow } from '../components/ui';
import ConfirmSheet from '../components/modals/ConfirmSheet';
import FormModal from '../components/modals/FormModal';
import { useAuth } from '../providers/AuthContext';
import { colorsLight, fontFamily } from '../theme/theme';

type MeUser = {
  id: string;
  email: string;
  name?: string | null;
  emailVerified?: boolean;
};

export default function AccountScreen({ navigation }: any) {
  const { logout, updateMe, changePassword } = useAuth();
  const { data } = useQuery(ME_QUERY);
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  const [editNameVisible, setEditNameVisible] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState('');
  const [nameError, setNameError] = React.useState<string | null>(null);

  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  const me: MeUser | undefined = data?.me;
  const displayName = me?.name?.trim() || me?.email || '';
  const [firstName = '', lastName = ''] = displayName.split(' ');

  const openEditName = () => {
    setNameDraft(me?.name?.trim() || '');
    setNameError(null);
    setEditNameVisible(true);
  };

  const openChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordError(null);
    setPasswordVisible(true);
  };

  const onSaveName = async () => {
    setNameError(null);
    try {
      await updateMe(nameDraft.trim());
      setEditNameVisible(false);
    } catch (e) {
      setNameError(e instanceof Error ? e.message : 'Failed to update name');
      throw e;
    }
  };

  const onSavePassword = async () => {
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      throw new Error('validation');
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match');
      throw new Error('validation');
    }
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordVisible(false);
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : 'Failed to change password');
      throw e;
    }
  };

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
          {me?.emailVerified ? (
            <Text style={styles.verified}>Email verified</Text>
          ) : me ? (
            <Text style={styles.unverified}>Email not verified</Text>
          ) : null}
        </View>

        <View style={styles.settings}>
          <Text style={styles.settingsLabel}>SETTINGS</Text>
          <SummaryRow
            icon="account-outline"
            iconBg={colorsLight.primarySoft}
            iconColor={colorsLight.primary}
            title="Edit name"
            preview={me?.name?.trim() || 'Add a display name'}
            onPress={openEditName}
          />
          <View style={styles.rowGap} />
          <SummaryRow
            icon="lock-outline"
            iconBg={colorsLight.primarySoft}
            iconColor={colorsLight.primary}
            title="Change password"
            preview="Update your sign-in password"
            onPress={openChangePassword}
          />
          <View style={styles.rowGap} />
          <SummaryRow
            icon="bell-outline"
            iconBg={colorsLight.primarySoft}
            iconColor={colorsLight.primary}
            title="Notifications"
            preview="Birthday and event reminders"
            onPress={() => navigation.navigate('Notifications')}
          />
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

      <FormModal
        visible={editNameVisible}
        title="Edit name"
        onDismiss={() => setEditNameVisible(false)}
        onSave={onSaveName}
      >
        <TextInput
          label="Name"
          value={nameDraft}
          onChangeText={setNameDraft}
          mode="outlined"
          autoCapitalize="words"
          textContentType="name"
          style={styles.modalInput}
        />
        {nameError ? <Text style={styles.modalError}>{nameError}</Text> : null}
      </FormModal>

      <FormModal
        visible={passwordVisible}
        title="Change password"
        onDismiss={() => setPasswordVisible(false)}
        onSave={onSavePassword}
        saveDisabled={
          !currentPassword || !newPassword || !confirmNewPassword
        }
        saveLabel="Update"
      >
        <TextInput
          label="Current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          mode="outlined"
          secureTextEntry
          autoCapitalize="none"
          textContentType="password"
          style={styles.modalInput}
        />
        <TextInput
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          mode="outlined"
          secureTextEntry
          autoCapitalize="none"
          textContentType="newPassword"
          style={styles.modalInput}
        />
        <TextInput
          label="Confirm new password"
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          mode="outlined"
          secureTextEntry
          autoCapitalize="none"
          textContentType="newPassword"
          style={styles.modalInput}
        />
        {passwordError ? <Text style={styles.modalError}>{passwordError}</Text> : null}
      </FormModal>

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
  verified: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colorsLight.success,
    marginTop: 8,
    includeFontPadding: false,
  },
  unverified: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colorsLight.danger,
    marginTop: 8,
    includeFontPadding: false,
  },
  settings: {
    marginTop: 32,
  },
  settingsLabel: {
    fontFamily: fontFamily.semibold,
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 1.2,
    color: colorsLight.textMuted,
    marginBottom: 8,
    marginLeft: 4,
    includeFontPadding: false,
  },
  rowGap: {
    height: 10,
  },
  footer: {
    paddingBottom: 32,
    gap: 10,
  },
  modalInput: {
    marginBottom: 12,
    backgroundColor: colorsLight.surface,
  },
  modalError: {
    color: colorsLight.danger,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    marginBottom: 4,
  },
});
