import React from 'react';
import { Provider } from 'urql';
import { AuthProvider } from './auth-context';
import { UserProvider } from './user-context';
import client from '../graphql-client';
import { RefreshTokenProvider } from './refresh-token-context';

function AppProviders({ children }: any) {
  return (
    <Provider value={client}>
      <RefreshTokenProvider>
        <AuthProvider>
          <UserProvider>{children}</UserProvider>
        </AuthProvider>
      </RefreshTokenProvider>
    </Provider>
  );
}

export default AppProviders;
