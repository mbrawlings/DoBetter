import * as React from 'react';
import { apolloClient, setUnauthorizedHandler } from './apollo';
import { getToken, setToken, clearToken } from './tokenStorage';
import {
  CHANGE_PASSWORD_MUTATION,
  LOGIN_MUTATION,
  RESEND_VERIFICATION_MUTATION,
  SIGNUP_MUTATION,
  UPDATE_ME_MUTATION,
  VERIFY_EMAIL_MUTATION,
} from '../graphql/operations';

type AuthContextValue = {
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<string>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  updateMe: (name: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function graphQLErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'graphQLErrors' in error) {
    const gqlErrors = (error as { graphQLErrors?: { message?: string }[] }).graphQLErrors;
    const message = gqlErrors?.[0]?.message;
    if (message) return message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const logout = React.useCallback(async () => {
    await clearToken();
    setTokenState(null);
    await apolloClient.clearStore();
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await getToken();
      if (mounted) {
        setTokenState(stored);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    setUnauthorizedHandler(() => {
      setTokenState(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const persistToken = React.useCallback(async (newToken: string) => {
    await setToken(newToken);
    await apolloClient.resetStore();
    setTokenState(newToken);
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    try {
      const { data } = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: { email, password },
      });
      const newToken = data?.login?.token as string | undefined;
      if (!newToken) {
        throw new Error('Login failed');
      }
      await persistToken(newToken);
    } catch (error) {
      throw new Error(graphQLErrorMessage(error, 'Login failed'));
    }
  }, [persistToken]);

  const signup = React.useCallback(async (email: string, password: string, name?: string) => {
    try {
      const { data } = await apolloClient.mutate({
        mutation: SIGNUP_MUTATION,
        variables: { email, password, name: name || null },
      });
      const signedUpEmail = data?.signup?.email as string | undefined;
      if (!signedUpEmail) {
        throw new Error('Signup failed');
      }
      return signedUpEmail;
    } catch (error) {
      throw new Error(graphQLErrorMessage(error, 'Signup failed'));
    }
  }, []);

  const verifyEmail = React.useCallback(async (email: string, code: string) => {
    try {
      const { data } = await apolloClient.mutate({
        mutation: VERIFY_EMAIL_MUTATION,
        variables: { email, code },
      });
      const newToken = data?.verifyEmail?.token as string | undefined;
      if (!newToken) {
        throw new Error('Verification failed');
      }
      await persistToken(newToken);
    } catch (error) {
      throw new Error(graphQLErrorMessage(error, 'Verification failed'));
    }
  }, [persistToken]);

  const resendVerification = React.useCallback(async (email: string) => {
    try {
      await apolloClient.mutate({
        mutation: RESEND_VERIFICATION_MUTATION,
        variables: { email },
      });
    } catch (error) {
      throw new Error(graphQLErrorMessage(error, 'Failed to resend code'));
    }
  }, []);

  const updateMe = React.useCallback(async (name: string) => {
    try {
      await apolloClient.mutate({
        mutation: UPDATE_ME_MUTATION,
        variables: { name },
      });
      await apolloClient.refetchQueries({ include: ['Me'] });
    } catch (error) {
      throw new Error(graphQLErrorMessage(error, 'Failed to update profile'));
    }
  }, []);

  const changePassword = React.useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await apolloClient.mutate({
        mutation: CHANGE_PASSWORD_MUTATION,
        variables: { currentPassword, newPassword },
      });
    } catch (error) {
      throw new Error(graphQLErrorMessage(error, 'Failed to change password'));
    }
  }, []);

  const value = React.useMemo(
    () => ({
      token,
      loading,
      login,
      signup,
      verifyEmail,
      resendVerification,
      updateMe,
      changePassword,
      logout,
    }),
    [
      token,
      loading,
      login,
      signup,
      verifyEmail,
      resendVerification,
      updateMe,
      changePassword,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
