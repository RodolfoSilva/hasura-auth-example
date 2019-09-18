import React from 'react';
import { useAuth } from './auth-context';

const UserContext = React.createContext({} as any);

export function UserProvider(props: any) {
  const { data } = useAuth();

  return <UserContext.Provider value={data.user} {...props} />;
}

export function useUser() {
  const context = React.useContext(UserContext);

  if (typeof context === 'undefined') {
    throw new Error(`useUser must be used within a UserProvider`);
  }

  return context;
}
