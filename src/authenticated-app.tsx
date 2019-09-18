import React from 'react';
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import logo from './logo.svg';
import NotFoundPage from './pages/not-found';
import HomePage from './pages/home';
import LogoutPage from './pages/logout';
import ChangePasswordPage from './pages/change-password';

function UnauthenticatedApp() {
  return (
    <Router>
      <div>
        <h1>
          <img src={logo} className="App-logo" alt="logo" />
          My App
        </h1>

        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/change-password">Change password</Link>
          </li>
          <li>
            <Link to="/logout">Logout</Link>
          </li>
        </ul>
        <main>
          <Switch>
            <Route path="/" exact component={HomePage} />
            <Route
              path="/change-password"
              exact
              component={ChangePasswordPage}
            />
            <Route path="/logout" component={LogoutPage} />
            <Route path="/login" exact>
              {() => <Redirect to="/" />}
            </Route>
            <Route component={NotFoundPage} />
          </Switch>
        </main>
        <footer>
          <p>© 2019</p>
        </footer>
      </div>
    </Router>
  );
}

export default UnauthenticatedApp;
