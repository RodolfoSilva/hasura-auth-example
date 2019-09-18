import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoginPage from './pages/login';
import NotFoundPage from './pages/not-found';
import RegisterPage from './pages/register';

function UnauthenticatedApp() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={LoginPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </Router>
  );
}

export default UnauthenticatedApp;
