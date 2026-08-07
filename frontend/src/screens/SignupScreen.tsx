import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../components/ui/PrimaryButton';
import { useAuth } from '../providers/AuthContext';
import { colorsLight, fontFamily } from '../theme/theme';

export default function SignupScreen({ navigation }: any) {
  const { signup } = useAuth();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async () => {
    if (submitting) return;
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const signedUpEmail = await signup(
        email.trim(),
        password,
        name.trim() || undefined
      );
      navigation.replace('VerifyEmail', { email: signedUpEmail });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    email.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    !submitting;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <TextInput
            label="Name (optional)"
            value={name}
            onChangeText={setName}
            mode="outlined"
            autoCapitalize="words"
            textContentType="name"
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            style={styles.input}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
            style={styles.input}
          />
          <TextInput
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
            style={styles.input}
            onSubmitEditing={onSubmit}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label="Create account"
            full
            loading={submitting}
            disabled={!canSubmit}
            onPress={onSubmit}
            style={styles.button}
          />

          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={styles.linkWrap}
            disabled={submitting}
          >
            <Text style={styles.link}>Already have an account? Sign in</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colorsLight.bg,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    letterSpacing: -0.8,
    color: colorsLight.text,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colorsLight.textMuted,
    marginTop: 4,
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
    backgroundColor: colorsLight.surface,
  },
  error: {
    color: colorsLight.danger,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  linkWrap: {
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colorsLight.primary,
  },
});
