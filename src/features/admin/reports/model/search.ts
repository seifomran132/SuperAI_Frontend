import { parseDay } from '~/lib/period';

export const REQUEST_STATUSES = [
  'reconciliation_required',
  'reserved',
  'settled',
  'released',
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
/** `all` means no `status` filter; the page opens on the flagged ones. */
export type RequestsFilter = RequestStatus | 'all';

export interface RequestsSearch {
  /** Omitted = `reconciliation_required`. */
  status?: Exclude<RequestsFilter, 'reconciliation_required'>;
}

export const DEFAULT_REQUESTS_FILTER: RequestsFilter =
  'reconciliation_required';

/** URL search params of /admin/requests; anything malformed is dropped. */
export function validateRequestsSearch(
  raw: Record<string, unknown>,
): RequestsSearch {
  const status = raw.status;
  if (status === 'all' || status === 'reserved') return { status };
  if (status === 'settled' || status === 'released') return { status };
  return {};
}

export function requestsFilterOf(search: RequestsSearch): RequestsFilter {
  return search.status ?? DEFAULT_REQUESTS_FILTER;
}

export interface AuditSearch {
  action?: string;
  resourceType?: string;
  resourceId?: string;
  /** A UUID: the API refuses anything else. */
  actorId?: string;
  from?: string;
  to?: string;
}

export const AUDIT_TEXT_KEYS = [
  'action',
  'resourceType',
  'resourceId',
] as const;

// A regex, not zod: this file is on the first-screen path.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => UUID_RE.test(value);

/** URL search params of /admin/audit; invalid values are dropped, never thrown. */
export function validateAuditSearch(raw: Record<string, unknown>): AuditSearch {
  const out: AuditSearch = {};
  for (const key of AUDIT_TEXT_KEYS) {
    // The router JSON-parses values, so "123" arrives as a number.
    const value = raw[key];
    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value).trim();
      if (text) out[key] = text.slice(0, 200);
    }
  }
  if (typeof raw.actorId === 'string' && isUuid(raw.actorId))
    out.actorId = raw.actorId;
  const from = typeof raw.from === 'string' ? raw.from : undefined;
  const to = typeof raw.to === 'string' ? raw.to : undefined;
  if (from && parseDay(from) !== null) out.from = from;
  if (to && parseDay(to) !== null) out.to = to;
  if (out.from && out.to && out.from > out.to) {
    delete out.from;
    delete out.to;
  }
  return out;
}

export const hasAuditFilters = (search: AuditSearch) =>
  Object.keys(search).length > 0;

export interface AgentRunsSearch {
  /** Omitted = `reconciliation_required`, like the requests page. */
  status?: Exclude<RequestsFilter, 'reconciliation_required'>;
  /** A UUID: the API refuses anything else. */
  userId?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** URL search params of /admin/agent-runs; anything malformed is dropped. */
export function validateAgentRunsSearch(
  raw: Record<string, unknown>,
): AgentRunsSearch {
  const out: AgentRunsSearch = {};
  const status = raw.status;
  if (
    status === 'all' ||
    status === 'reserved' ||
    status === 'settled' ||
    status === 'released'
  ) {
    out.status = status;
  }
  if (typeof raw.userId === 'string' && UUID.test(raw.userId)) {
    out.userId = raw.userId;
  }
  return out;
}
