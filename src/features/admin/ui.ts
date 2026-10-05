// Admin screens, kept out of index.ts so they stay in lazily loaded route
// chunks. Only route files import from here.
export { AdminShell } from './components/AdminShell';
export { UsersPage } from './users/pages/UsersPage';
export { UserDetailPage } from './users/pages/UserDetailPage';
