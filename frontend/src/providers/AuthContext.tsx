import * as React from 'react';
import { apolloClient, setUnauthorizedHandler } from './apollo';
import { getToken, setToken, clearToken } from './tokenStorage';
import { LOGIN_MUTATION } from '../graphql/operations';

type AuthContextValue = {
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

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

  const login = React.useCallback(async (email: string, password: string) => {
    const { data } = await apolloClient.mutate({
      mutation: LOGIN_MUTATION,
      variables: { email, password },
    });
    const newToken = data?.login?.token as string | undefined;
    if (!newToken) {
      throw new Error('Login failed');
    }
    await setToken(newToken);
    await apolloClient.resetStore();
    setTokenState(newToken);
  }, []);

  const value = React.useMemo(
    () => ({ token, loading, login, logout }),
    [token, loading, login, logout]
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
