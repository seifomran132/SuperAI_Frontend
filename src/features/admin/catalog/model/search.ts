export interface ModelNewSearch {
  provider?: string;
  /** Provider model id chosen in step 1 (step 2 shows when set). */
  model?: string;
  /** Step 2 with an empty form (model the provider does not list). */
  manual?: boolean;
}

/** URL search params of /admin/models/new; anything malformed is dropped. */
export function validateModelNewSearch(
  raw: Record<string, unknown>,
): ModelNewSearch {
  const result: ModelNewSearch = {};
  // The router JSON-parses values, so "123" arrives as a number.
  const read = (value: unknown) =>
    (typeof value === 'string' || typeof value === 'number') &&
    String(value).trim() !== ''
      ? String(value).trim()
      : undefined;
  const provider = read(raw.provider);
  if (provider) result.provider = provider;
  const model = read(raw.model);
  if (provider && model) result.model = model;
  if (raw.manual === true) result.manual = true;
  return result;
}

export const FINDING_STATUSES = [
  'open',
  'applied',
  'dismissed',
  'superseded',
] as const;
export type FindingStatus = (typeof FINDING_STATUSES)[number];

export const FINDING_KINDS = [
  'large_change',
  'catalog_price_missing',
  'model_retired',
] as const;
export type FindingKind = (typeof FINDING_KINDS)[number];

export interface PriceUpdatesSearch {
  /** `open` when missing. */
  status?: FindingStatus;
  /** All kinds when missing. */
  kind?: FindingKind;
}

/** URL search params of /admin/price-updates; anything malformed is dropped. */
export function validatePriceUpdatesSearch(
  raw: Record<string, unknown>,
): PriceUpdatesSearch {
  const result: PriceUpdatesSearch = {};
  if (FINDING_STATUSES.includes(raw.status as FindingStatus)) {
    result.status = raw.status as FindingStatus;
  }
  if (FINDING_KINDS.includes(raw.kind as FindingKind)) {
    result.kind = raw.kind as FindingKind;
  }
  return result;
}
