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
export {
  validateModelNewSearch,
  validatePriceUpdatesSearch,
  type ModelNewSearch,
  type PriceUpdatesSearch,
} from './catalog/model/search';
export {
  validateBatchSearch,
  validateVouchersSearch,
  type VouchersSearch,
} from './vouchers/model/search';
export {
  validateAuditSearch,
  validateRequestsSearch,
  validateAgentRunsSearch,
  type AuditSearch,
  type RequestsSearch,
} from './reports/model/search';
