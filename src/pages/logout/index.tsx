import React, { useEffect } from 'react';
import { Redirect } from 'react-router';
import { useAuth } from '../../context/auth-context';

const LogoutPage = () => {
  const auth = useAuth();
  useEffect(() => {
    auth.logout();
  });

  return <Redirect to="/login" />;
};

export default LogoutPage;
