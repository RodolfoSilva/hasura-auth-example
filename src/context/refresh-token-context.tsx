import React from 'react';
import jwtDecode from 'jwt-decode';
import FullPageSpinner from '../components/full-page-spinner';
import { getNewAccessToken } from '../helpers/get-new-access-token';

const RefreshTokenContext = React.createContext({} as any);

export function RefreshTokenProvider(props: any) {
  const [firstAttemptFinished, setFirstAttemptFinished] = React.useState(false);
  const [refreshToken, setRefreshToken] = React.useState<string | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(true);
  const [error, setError] = React.useState<any>(null);

  // Initialize
  React.useEffect(() => {
    const storedRefreshToken = window.localStorage.getItem('refresh-token');

    setRefreshToken(storedRefreshToken);
    setFirstAttemptFinished(true);
  }, [setRefreshToken, setFirstAttemptFinished]);

  // Update sessionStorage with accessToken
  React.useEffect(() => {
    if (!accessToken) {
      window.sessionStorage.removeItem('access-token');
      return;
    }

    window.sessionStorage.setItem('access-token', accessToken);
  }, [accessToken]);

  // Update localStorage with accessToken
  React.useEffect(() => {
    if (!firstAttemptFinished) {
      return;
    }

    if (!refreshToken) {
      window.sessionStorage.removeItem('access-token');
      setAccessToken(null);
      return;
    }

    window.localStorage.setItem('refresh-token', refreshToken);
  }, [refreshToken]);

  const _updateAccessToken = React.useCallback(async () => {
    if (!refreshToken) {
      setIsPending(false);
      return;
    }

    const decoded: any = jwtDecode(refreshToken);

    if (decoded.exp < Date.now() / 1000) {
      console.log('Session expired');
      setIsPending(false);
      return;
    }

    const accessToken = await getNewAccessToken(refreshToken);
    setAccessToken(accessToken);
    setIsPending(false);
  }, [refreshToken]);

  // Get access-token
  React.useEffect(() => {
    if (!firstAttemptFinished) {
      return;
    }
    _updateAccessToken().catch(e => {
      setIsPending(false);

      if (e.message === "Invalid 'refresh_token' or 'user_id'") {
        setRefreshToken(null);
        return;
      }
      setError(e);
      console.error(e);
    });
  }, [firstAttemptFinished]);

  // Auto update access-token
  React.useEffect(() => {
    if (!accessToken) {
      return;
    }

    const decoded: any = jwtDecode(accessToken);

    const renewBefore = 60;

    const expireIn = decoded.exp - renewBefore - Date.now() / 1000;

    if (expireIn <= 0) {
      _updateAccessToken().catch(e => console.error(e));
    } else {
      const timeoutId = setTimeout(() => {
        _updateAccessToken().catch(e => console.error(e));
      }, expireIn * 1000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [accessToken]);

  const currentUser = React.useMemo(() => {
    if (!accessToken) {
      return null;
    }

    const decoded: any = jwtDecode(accessToken);

    const payload = decoded['https://hasura.io/jwt/claims'];
    const allowedRoles = payload['x-hasura-allowed-roles'];
    const defaultRole = payload['x-hasura-default-role'];
    const organizationId = payload['x-hasura-organization-id'];
    const sessionId = payload['x-hasura-session-id'];
    const userId = payload['x-hasura-user-id'];

    return {
      expireAt: new Date(decoded.exp * 1000),
      allowedRoles,
      defaultRole,
      userId,
      sessionId,
      organizationId,
    };
  }, [accessToken]);

  const value = React.useMemo(
    () => ({
      currentUser,
      accessToken,
      setRefreshToken,
      setAccessToken,
    }),
    [currentUser, accessToken, setRefreshToken, setAccessToken],
  );

  if (isPending) {
    return <FullPageSpinner />;
  }

  if (error) {
    return (
      <div style={{ color: 'red', textAlign: 'center' }}>
        <p>Uh oh... There's a problem. Try refreshing the app.</p>
        <pre>{error.message}</pre>
      </div>
    );
  }

  return <RefreshTokenContext.Provider value={value} {...props} />;
}

export function useRefreshToken() {
  const context = React.useContext(RefreshTokenContext);

  if (typeof context === 'undefined') {
    throw new Error(
      `useRefreshToken must be used within a RefreshTokenProvider`,
    );
  }

  return context;
}
