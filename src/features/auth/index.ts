// Public API of the auth feature. Code outside src/features/auth imports from
// here only; pages, components and model files are internal.

export { AccountUnavailablePage } from './pages/AccountUnavailablePage';
export { CallbackPage } from './pages/CallbackPage';
export { CheckEmailPage, type CheckEmailReason } from './pages/CheckEmailPage';
export { CompleteProfilePage } from './pages/CompleteProfilePage';
export { ForgotPasswordPage } from './pages/ForgotPasswordPage';
export { ResetPasswordPage } from './pages/ResetPasswordPage';
export { SignInPage } from './pages/SignInPage';
export { SignUpPage } from './pages/SignUpPage';

export { AuthLayout } from './components/AuthLayout';

export { redirectIfSignedIn, requireProfile } from './model/guards';
export { hasName, type UnavailableReason } from './model/me';
export { isInternalPath, safeRedirect } from './model/redirect';
export { installSessionSync } from './model/session';
export { signOut } from './model/actions';
export { updatePassword } from './model/actions';
export {
  completeProfileSchema,
  fieldErrorsFromDetails,
  resetPasswordSchema,
  toProfilePayload,
  type CompleteProfileValues,
  type ResetPasswordValues,
} from './model/schemas';
export { PasswordField } from './components/fields';
export { FormAlert } from './components/FormAlert';
