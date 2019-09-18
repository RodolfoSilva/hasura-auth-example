import React, { useCallback, useMemo, useState } from 'react';
import { Formik, FormikActions, Field, ErrorMessage } from 'formik';
import { useAuth } from '../../context/auth-context';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

type RegisterValues = {
  email: string;
  password: string;
};

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Email must be a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password has to be longer than 6 characters!')
    .required('Password is required'),
  password_confirm: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords do not match')
    .required('Password confirm is required'),
});

function RegisterPage() {
  const auth = useAuth();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const handleRegisterFormSubmit = useCallback(
    async (
      values: RegisterValues,
      formikActions: FormikActions<RegisterValues>,
    ) => {
      formikActions.setSubmitting(true);
      setRegisterError(null);

      try {
        await auth.register(values);
        formikActions.setSubmitting(false);
      } catch (e) {
        setRegisterError(e.message);
        formikActions.setSubmitting(false);
      }
    },
    [],
  );

  const initialValues = useMemo<RegisterValues>(
    () => ({
      email: '',
      password: '',
      password_confirm: '',
    }),
    [],
  );

  return (
    <div style={{ margin: '0 auto', padding: 16, width: 250 }}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleRegisterFormSubmit}
      >
        {formikBag => (
          <form
            onSubmit={formikBag.handleSubmit}
            onReset={formikBag.handleReset}
          >
            <div>
              <div>
                <label htmlFor="register-email">Email</label>
              </div>
              <Field
                id="register-email"
                name="email"
                type="email"
                disabled={formikBag.isSubmitting}
              />
              <div
                style={{ color: 'red', fontSize: '75%', fontStyle: 'italic' }}
              >
                <ErrorMessage name="email" />
              </div>
            </div>
            <div>
              <div>
                <label htmlFor="register-password">Password</label>
              </div>
              <Field
                id="register-password"
                name="password"
                type="password"
                disabled={formikBag.isSubmitting}
              />
              <div
                style={{ color: 'red', fontSize: '75%', fontStyle: 'italic' }}
              >
                <ErrorMessage name="password" />
              </div>
            </div>

            <div>
              <div>
                <label htmlFor="login-password-confirm">Password confirm</label>
              </div>
              <Field
                id="login-password-confirm"
                name="password_confirm"
                type="password"
                disabled={formikBag.isSubmitting}
              />
              <div
                style={{ color: 'red', fontSize: '75%', fontStyle: 'italic' }}
              >
                <ErrorMessage name="password_confirm" />
              </div>
            </div>

            {registerError && (
              <div>
                <p
                  style={{ color: 'red', fontSize: '80%', fontStyle: 'italic' }}
                >
                  {registerError}
                </p>
              </div>
            )}

            <div>
              <button type="reset" disabled={formikBag.isSubmitting}>
                Cancel
              </button>
              <button type="submit" disabled={formikBag.isSubmitting}>
                Register
              </button>
            </div>

            <div>
              <Link to="/login">Login</Link>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
}

export default RegisterPage;
