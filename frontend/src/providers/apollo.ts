import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

export function resolveGraphqlUri(): string {
  if (process.env.EXPO_PUBLIC_GRAPHQL_URL) {
    return process.env.EXPO_PUBLIC_GRAPHQL_URL;
  }
  const extraUrl = (Constants.expoConfig as any)?.extra?.EXPO_PUBLIC_GRAPHQL_URL as string | undefined;
  if (extraUrl) {
    return extraUrl;
  }
  if (Platform.OS === 'web') {
    return 'http://localhost:4000/graphql';
  }
  const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
  if (scriptURL) {
    try {
      const match = scriptURL.match(/^\w+:\/\/(.*?):\d+\//);
      const host = match?.[1] ?? 'localhost';
      const isIPv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
      const isLocal = host === 'localhost' || host === '127.0.0.1';
      if (isIPv4 || isLocal) {
        return `http://${host}:4000/graphql`;
      }
    } catch {}
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:4000/graphql' : 'http://localhost:4000/graphql';
}

const graphqlUri = resolveGraphqlUri();
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('Using GraphQL endpoint:', graphqlUri);
}

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: graphqlUri }),
  cache: new InMemoryCache(),
});


