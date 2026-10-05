// Screens and form parts of the auth feature, kept out of ./index so the guards
// and session code that load on every page don't pull in zod and react-hook-form.
// Imported by route files and by other features' screens (account forms).

export { AccountUnavailablePage } from './pages/AccountUnavailablePage';
export { CallbackPage } from './pages/CallbackPage';
export { CheckEmailPage, type CheckEmailReason } from './pages/CheckEmailPage';
export { CompleteProfilePage } from './pages/CompleteProfilePage';
export { ForgotPasswordPage } from './pages/ForgotPasswordPage';
export { ResetPasswordPage } from './pages/ResetPasswordPage';
export { SignInPage } from './pages/SignInPage';
export { SignUpPage } from './pages/SignUpPage';

export { AuthLayout } from './components/AuthLayout';
export { PasswordField } from './components/fields';
export { FormAlert } from './components/FormAlert';
export {
  completeProfileSchema,
  fieldErrorsFromDetails,
  resetPasswordSchema,
  toProfilePayload,
  type CompleteProfileValues,
  type ResetPasswordValues,
} from './model/schemas';
