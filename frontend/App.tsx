import * as React from 'react';
import { ApolloProvider } from '@apollo/client';
import { Provider as PaperProvider } from 'react-native-paper';
import RootNavigator from './src/navigation/RootNavigator';
import { apolloClient } from './src/providers/apollo';
import { theme } from './src/theme/theme';

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <PaperProvider theme={theme}>
        <RootNavigator />
      </PaperProvider>
    </ApolloProvider>
  );
}


