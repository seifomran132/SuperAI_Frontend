// Admin screens, kept out of index.ts so they stay in lazily loaded route
// chunks. Only route files import from here.
export { AdminShell } from './components/AdminShell';
export { UsersPage } from './users/pages/UsersPage';
export { UserDetailPage } from './users/pages/UserDetailPage';
export {
  PlansPage,
  PlanNewPage,
  PlanDetailPage,
} from './catalog/pages/PlansPages';
export { ProvidersPage } from './catalog/pages/ProvidersPage';
export {
  ModelsPage,
  ModelNewPage,
  ModelDetailPage,
} from './catalog/pages/ModelsPages';
export {
  ModesPage,
  ModeNewPage,
  ModeDetailPage,
} from './catalog/pages/ModesPages';
export { SettingsPage } from './settings/pages/SettingsPage';
