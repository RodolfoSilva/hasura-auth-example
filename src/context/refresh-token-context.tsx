import React from 'react';
import jwtDecode from 'jwt-decode';
import FullPageSpinner from '../components/full-page-spinner';
import { getNewAccessToken } from '../utils/get-new-access-token';

const RefreshTokenContext = React.createContext({} as any);

export function RefreshTokenProvider(props: any) {
  const [firstAttemptFinished, setFirstAttemptFinished] = React.useState(false);
  const [isPending, setIsPending] = React.useState(true);
  const [error, setError] = React.useState<any>(null);
  const [refreshToken, setRefreshToken] = React.useState<string | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedRefreshToken = window.localStorage.getItem('refresh-token');

    setRefreshToken(storedRefreshToken);
    setFirstAttemptFinished(true);
  }, []);

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
    window.sessionStorage.setItem('access-token', accessToken);
    setIsPending(false);
  }, [refreshToken]);

  React.useEffect(() => {
    if (!firstAttemptFinished) {
      return;
    }
    _updateAccessToken().catch(e => {
      setIsPending(false);
      setError(e);
      console.error(e);
    });
  }, [firstAttemptFinished]);

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

  const value = React.useMemo(
    () => ({
      accessToken,
      setAccessToken,
    }),
    [accessToken, setAccessToken],
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
