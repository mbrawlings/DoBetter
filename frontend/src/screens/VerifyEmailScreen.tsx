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

const RESEND_COOLDOWN_SEC = 30;

export default function VerifyEmailScreen({ navigation, route }: any) {
  const email: string = route?.params?.email || '';
  const { verifyEmail, resendVerification } = useAuth();
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const onSubmit = async () => {
    if (submitting) return;
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await verifyEmail(email, code.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    if (resending || cooldown > 0) return;
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      await resendVerification(email);
      setInfo('A new code was sent');
      setCooldown(RESEND_COOLDOWN_SEC);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const canSubmit = code.trim().length === 6 && !submitting && !!email;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code we sent to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>

          <TextInput
            label="Verification code"
            value={code}
            onChangeText={(v) => setCode(v.replace(/[^\d]/g, '').slice(0, 6))}
            mode="outlined"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            style={styles.input}
            onSubmitEditing={onSubmit}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {info ? <Text style={styles.info}>{info}</Text> : null}

          <PrimaryButton
            label="Verify"
            full
            loading={submitting}
            disabled={!canSubmit}
            onPress={onSubmit}
            style={styles.button}
          />

          <Pressable
            onPress={onResend}
            style={styles.linkWrap}
            disabled={resending || cooldown > 0}
          >
            <Text
              style={[
                styles.link,
                resending || cooldown > 0 ? styles.linkDisabled : null,
              ]}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={styles.linkWrap}
            disabled={submitting}
          >
            <Text style={styles.secondaryLink}>Back to sign in</Text>
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
    lineHeight: 22,
  },
  email: {
    fontFamily: fontFamily.semibold,
    color: colorsLight.text,
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
  info: {
    color: colorsLight.primary,
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
  linkDisabled: {
    color: colorsLight.textMuted,
  },
  secondaryLink: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colorsLight.textMuted,
  },
});
