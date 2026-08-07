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

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async () => {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Login failed';
      if (message === 'Email not verified') {
        navigation.navigate('VerifyEmail', { email: email.trim().toLowerCase() });
        return;
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>DoBetter</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

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
            onSubmitEditing={onSubmit}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            textContentType="password"
            style={styles.input}
            onSubmitEditing={onSubmit}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword((prev) => !prev)}
                forceTextInputFocus={false}
              />
            }
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label="Sign In"
            full
            loading={submitting}
            disabled={!canSubmit}
            onPress={onSubmit}
            style={styles.button}
          />

          <Pressable
            onPress={() => navigation.navigate('Signup')}
            style={styles.linkWrap}
            disabled={submitting}
          >
            <Text style={styles.link}>Create account</Text>
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
