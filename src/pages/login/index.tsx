import React, { useCallback, useMemo, useState } from 'react';
import { Formik, FormikActions, Field } from 'formik';
import { useAuth } from '../../context/auth-context';
import { Link } from 'react-router-dom';

type LoginValues = {
  email: string;
  password: string;
};

function LoginPage() {
  const auth = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const handleLoginFormSubmit = useCallback(
    async (values: LoginValues, formikActions: FormikActions<LoginValues>) => {
      formikActions.setSubmitting(true);
      setLoginError(null);

      try {
        await auth.login(values);
        formikActions.setSubmitting(false);
      } catch (e) {
        setLoginError(e.message);
        formikActions.setSubmitting(false);
      }
    },
    [],
  );

  const initialValues = useMemo<LoginValues>(
    () => ({
      email: '',
      password: '',
    }),
    [],
  );

  return (
    <div style={{ margin: '0 auto', padding: 16, width: 250 }}>
      <Formik initialValues={initialValues} onSubmit={handleLoginFormSubmit}>
        {formikBag => (
          <form
            onSubmit={formikBag.handleSubmit}
            onReset={formikBag.handleReset}
          >
            <div>
              <div>
                <label htmlFor="login-email">Email</label>
              </div>
              <Field
                id="login-email"
                name="email"
                type="email"
                disabled={formikBag.isSubmitting}
              />
            </div>
            <div>
              <div>
                <label htmlFor="login-password">Password</label>
              </div>
              <Field
                id="login-password"
                name="password"
                type="password"
                disabled={formikBag.isSubmitting}
              />
            </div>

            {loginError && (
              <div>
                <p
                  style={{ color: 'red', fontSize: '80%', fontStyle: 'italic' }}
                >
                  {loginError}
                </p>
              </div>
            )}

            <div>
              <button type="reset" disabled={formikBag.isSubmitting}>
                Cancel
              </button>
              <button type="submit" disabled={formikBag.isSubmitting}>
                Login
              </button>
            </div>

            <div>
              <Link to="/register">Register</Link>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
}

export default LoginPage;
