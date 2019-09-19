import React, { useCallback } from 'react';
import { useMutation } from 'urql';
import jwtDecode from 'jwt-decode';
import FullPageSpinner from '../components/full-page-spinner';
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

const clearStorage = () => {
  const keys = ['access-token', 'refresh-token', 'organization-id', 'user-id'];

  for (let key of keys) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
};

function AuthProvider(props: any) {
  const [
    weAreStillWaitingToGetTheUserData,
    setWeAreStillWaitingToGetTheUserData,
  ] = React.useState(true);
  const refreshTokenActions = useRefreshToken();
  const [user, setUser] = React.useState<any>(null);
  const loginMutation = useMutation(LOGIN_MUTATION)[1];
  const registerMutation = useMutation(REGISTER_MUTATION)[1];
  const changePasswordMutation = useMutation(CHANGE_PASSWORD_MUTATION)[1];

  React.useEffect(() => {
    const accessToken = window.sessionStorage.getItem('access-token');

    if (typeof accessToken !== 'string') {
      clearStorage();
      console.log(refreshTokenActions);
      refreshTokenActions.setAccessToken(null);
      setWeAreStillWaitingToGetTheUserData(false);
      return;
    }

    const decoded: any = jwtDecode(accessToken);

    if (decoded.exp < Date.now() / 1000) {
      refreshTokenActions.setAccessToken(null);
      clearStorage();
      setWeAreStillWaitingToGetTheUserData(false);
      return;
    }

    const payload = decoded['https://hasura.io/jwt/claims'];
    const allowedRoles = payload['x-hasura-allowed-roles'];
    const defaultRole = payload['x-hasura-default-role'];
    const organizationId = payload['x-hasura-organization-id'];
    const sessionId = payload['x-hasura-session-id'];
    const userId = payload['x-hasura-user-id'];

    if (accessToken) {
      setUser({
        allowedRoles,
        defaultRole,
        userId,
        sessionId,
        organizationId,
      });
    }

    setWeAreStillWaitingToGetTheUserData(false);
  }, []);

  const data = { user };

  const login = useCallback(
    async (values: any) => {
      try {
        const { data, error } = await loginMutation(values);
        if (error) {
          return Promise.reject(new Error(error.graphQLErrors[0].message));
        }

        refreshTokenActions.setRefreshToken(data.auth_login.access_token);
        refreshTokenActions.setAccessToken(data.auth_login.access_token);

        setUser({
          accessToken: data.auth_login.access_token,
          refreshToken: data.auth_login.refresh_roken,
          userId: data.auth_login.user_id,
          organizationId: data.auth_login.organization_id,
        });
      } catch (e) {
        console.log(e);
      }
    },
    [loginMutation, setUser, refreshTokenActions.setAccessToken],
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

  const logout = useCallback(() => {
    clearStorage();
    refreshTokenActions.setAccessToken(null);
    setUser(null);
  }, [setUser, refreshTokenActions.setAccessToken]);

  const changePassword = useCallback(
    async (newPassword: string) => {
      const { data, error } = await changePasswordMutation({
        new_password: newPassword,
        user_id: user.userId,
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
    [changePasswordMutation],
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

  if (weAreStillWaitingToGetTheUserData) {
    return <FullPageSpinner />;
  }

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
