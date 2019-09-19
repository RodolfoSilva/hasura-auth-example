import React from 'react';
import { Provider } from 'urql';
import { AuthProvider } from './auth-context';
import { UserProvider } from './user-context';
import client from '../graphql-client';
import { SessionProvider } from './session-context';

function AppProviders({ children }: any) {
  return (
    <Provider value={client}>
      <SessionProvider>
        <AuthProvider>
          <UserProvider>{children}</UserProvider>
        </AuthProvider>
      </SessionProvider>
    </Provider>
  );
}

export default AppProviders;
