// Public API of the admin feature, light on purpose: the router imports it at
// startup, so only guards and URL validators live here. The screens are in
// ui.ts and load lazily with their routes (customers never download them).
export { requireAdmin } from './model/guards';
export {
  validateUserDetailSearch,
  validateUsersSearch,
  type UserDetailSearch,
  type UsersSearch,
} from './users/model/search';
