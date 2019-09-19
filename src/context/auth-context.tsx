import React, { useCallback } from 'react';
import { useMutation } from 'urql';
import { useRefreshToken } from './refresh-token-context';

const AuthContext = React.createContext({} as any);

const LOGIN_MUTATION = `
  mutation login($email: String!, $password: String!) {
    auth_login(email: $email, password: $password) {
      access_token
      organization_id
      refresh_token
      user_id
    }
  }
`;

const CHANGE_PASSWORD_MUTATION = `
  mutation change_password($user_id: ID!, $new_password: String!) {
    auth_change_password(new_password: $new_password, user_id: $user_id) {
      affected_rows
    }
  }
`;

const REGISTER_MUTATION = `
  mutation register($email: String!, $password: String!) {
    auth_register(email: $email, password: $password) {
      affected_rows
    }
  }
`;

function AuthProvider(props: any) {
  const session = useRefreshToken();
  const loginMutation = useMutation(LOGIN_MUTATION)[1];
  const registerMutation = useMutation(REGISTER_MUTATION)[1];
  const changePasswordMutation = useMutation(CHANGE_PASSWORD_MUTATION)[1];

  const user = session.currentUser;

  const data = { user };

  const logout = useCallback(() => {
    session.setAccessToken(null);
    session.setRefreshToken(null);
  }, [session.setAccessToken, session.setRefreshToken]);

  const login = useCallback(
    async (values: any) => {
      try {
        const { data, error } = await loginMutation(values);
        if (error) {
          return Promise.reject(new Error(error.graphQLErrors[0].message));
        }

        session.setRefreshToken(data.auth_login.refresh_token);
        session.setAccessToken(data.auth_login.access_token);
      } catch (e) {
        console.log(e);
      }
    },
    [loginMutation, session.setAccessToken],
  );

  const register = useCallback(
    async (values: any) => {
      try {
        const { data, error } = await registerMutation(values);
        if (error) {
          return Promise.reject(
            new Error(
              error.graphQLErrors[0].message === 'Forbidden'
                ? 'Registration is disabled to do by guest user'
                : error.graphQLErrors[0].message,
            ),
          );
        }

        if (data.auth_change_password.affected_row) {
          return Promise.reject(
            new Error('Register account failed, try again'),
          );
        }

        return true;
      } catch (e) {
        console.log(e);
      }
    },
    [registerMutation],
  );

  const changePassword = useCallback(
    async (newPassword: string) => {
      const { data, error } = await changePasswordMutation({
        new_password: newPassword,
        user_id: session.currentUser!.userId,
      });

      if (error) {
        return Promise.reject(
          new Error(
            error.graphQLErrors[0].message
              ? error.graphQLErrors[0].message
              : 'Change password failed, try again',
          ),
        );
      }

      if (data.auth_change_password.affected_row) {
        return Promise.reject(new Error('Change password failed, try again'));
      }

      return true;
    },
    [changePasswordMutation, session.currentUser],
  );

  const value = React.useMemo(
    () => ({
      data,
      login,
      logout,
      register,
      changePassword,
    }),
    [data, login, logout, register, changePassword],
  );

  return <AuthContext.Provider value={value} {...props} />;
}

function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error(`useAuth must be used within a AuthProvider`);
  }
  return context;
}

export { AuthProvider, useAuth };
