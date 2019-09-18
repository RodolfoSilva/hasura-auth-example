import React, { useCallback, useMemo, useState } from 'react';
import { Formik, FormikActions, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/auth-context';

type ChangePasswordValues = {
  password: string;
  password_confirm: string;
};

const validationSchema = Yup.object({
  password: Yup.string()
    .min(6, 'Password has to be longer than 6 characters!')
    .required('Password is required'),
  password_confirm: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords do not match')
    .required('Password confirm is required'),
});

function ChangePasswordPage() {
  const auth = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const handleChangePasswordFormSubmit = useCallback(
    async (
      values: ChangePasswordValues,
      formikActions: FormikActions<ChangePasswordValues>,
    ) => {
      formikActions.setSubmitting(true);
      setServerError(null);

      try {
        await auth.changePassword(values.password);
        setSuccessMessage('Password changed with success');
        formikActions.resetForm();
      } catch (e) {
        setServerError(e.message);
      } finally {
        formikActions.setSubmitting(false);
      }
    },
    [],
  );

  const initialValues = useMemo<ChangePasswordValues>(
    () => ({
      password: '',
      password_confirm: '',
    }),
    [],
  );

  return (
    <div style={{ margin: '0 auto', padding: 16, width: 250 }}>
      <Formik
        validationSchema={validationSchema}
        initialValues={initialValues}
        onSubmit={handleChangePasswordFormSubmit}
      >
        {formikBag => (
          <form
            onSubmit={formikBag.handleSubmit}
            onReset={formikBag.handleReset}
          >
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

            {serverError && (
              <div>
                <p
                  style={{ color: 'red', fontSize: '80%', fontStyle: 'italic' }}
                >
                  {serverError}
                </p>
              </div>
            )}
            {successMessage && (
              <div>
                <p
                  style={{
                    color: 'green',
                    fontSize: '80%',
                    fontStyle: 'italic',
                  }}
                >
                  {successMessage}
                </p>
              </div>
            )}

            <div>
              <button type="reset" disabled={formikBag.isSubmitting}>
                Cancel
              </button>
              <button type="submit" disabled={formikBag.isSubmitting}>
                Change password
              </button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
}

export default ChangePasswordPage;
