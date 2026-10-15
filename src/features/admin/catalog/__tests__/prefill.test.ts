import { describe, expect, it } from 'vitest';
import { availableModel } from '~/mocks/admin-catalog';
import { getNextFindingsPage, isSyncStale } from '../model/catalog-sync';
import { emptyInitial, prefillFromAvailable, rowFacts } from '../model/prefill';
import {
  validateModelNewSearch,
  validatePriceUpdatesSearch,
} from '../model/search';

const catalog = {
  catalogModelId: 'gpt-x',
  name: 'GPT X',
  contextWindow: 128000,
  maxOutputTokens: 16384,
  supportsImages: true,
  price: {
    inputPerMtok: '2.500000000',
    outputPerMtok: '10.000000000',
    cachedInputPerMtok: '1.250000000',
    cacheWritePerMtok: null,
  },
  hasContextTiers: true,
  deprecated: true,
};

describe('prefillFromAvailable', () => {
  it('takes the catalog first and copies prices as the strings they are', () => {
    const initial = prefillFromAvailable(
      'acme',
      availableModel('gpt-x', {
        displayName: 'Provider name',
        contextWindow: 1000,
        maxOutputTokens: 500,
        catalog,
      }),
    );
    expect(initial).toMatchObject({
      providerCode: 'acme',
      providerModelId: 'gpt-x',
      displayName: 'GPT X',
      contextWindow: '128000',
      maxOutputTokens: '16384',
      supportsImages: true,
      deprecated: true,
      hasContextTiers: true,
      price: {
        inputPerMtok: '2.500000000',
        outputPerMtok: '10.000000000',
        cachedInputPerMtok: '1.250000000',
        cacheWritePerMtok: '',
      },
    });
    expect(initial.fromCatalog).toEqual(
      expect.arrayContaining([
        'displayName',
        'contextWindow',
        'maxOutputTokens',
        'supportsImages',
        'inputPerMtok',
        'outputPerMtok',
        'cachedInputPerMtok',
      ]),
    );
    expect(initial.fromCatalog).not.toContain('cacheWritePerMtok');
  });

  it('falls back to the provider values, then the id, with nothing from the catalog', () => {
    const withProvider = prefillFromAvailable(
      'acme',
      availableModel('m-1', {
        displayName: 'Provider name',
        contextWindow: 1000,
        maxOutputTokens: 500,
      }),
    );
    expect(withProvider).toMatchObject({
      displayName: 'Provider name',
      contextWindow: '1000',
      maxOutputTokens: '500',
      supportsImages: false,
      fromCatalog: [],
    });
    const bare = prefillFromAvailable('acme', availableModel('m-2'));
    expect(bare).toMatchObject({
      displayName: 'm-2',
      contextWindow: '',
      maxOutputTokens: '',
      price: emptyInitial().price,
    });
  });

  it('does not mark a catalog that does not say (null supportsImages)', () => {
    const initial = prefillFromAvailable(
      'acme',
      availableModel('m', {
        catalog: { ...catalog, supportsImages: null, price: null },
      }),
    );
    expect(initial.supportsImages).toBe(false);
    expect(initial.fromCatalog).not.toContain('supportsImages');
    expect(initial.price).toEqual(emptyInitial().price);
  });
});

describe('rowFacts', () => {
  it('shows catalog values first and nulls when there are none', () => {
    expect(rowFacts(availableModel('a', { catalog }))).toMatchObject({
      name: 'GPT X',
      inputPerMtok: '2.500000000',
    });
    expect(rowFacts(availableModel('b'))).toEqual({
      name: null,
      contextWindow: null,
      maxOutputTokens: null,
      inputPerMtok: null,
      outputPerMtok: null,
    });
  });
});

describe('search params', () => {
  it('keeps provider and model, drops what is malformed', () => {
    expect(
      validateModelNewSearch({ provider: 'acme', model: 'gpt-x' }),
    ).toEqual({ provider: 'acme', model: 'gpt-x' });
    // A model without its provider means nothing.
    expect(validateModelNewSearch({ model: 'gpt-x' })).toEqual({});
    expect(validateModelNewSearch({ provider: 'acme', manual: true })).toEqual({
      provider: 'acme',
      manual: true,
    });
    expect(validateModelNewSearch({ provider: {}, manual: 'yes' })).toEqual({});
  });

  it('accepts only known status and kind', () => {
    expect(
      validatePriceUpdatesSearch({ status: 'applied', kind: 'model_retired' }),
    ).toEqual({ status: 'applied', kind: 'model_retired' });
    expect(validatePriceUpdatesSearch({ status: 'x', kind: 7 })).toEqual({});
  });
});

describe('getNextFindingsPage', () => {
  it('maps nextCursor to the next page param, and ends on null', () => {
    expect(getNextFindingsPage({ items: [], nextCursor: 'abc' })).toBe('abc');
    expect(
      getNextFindingsPage({ items: [], nextCursor: null }),
    ).toBeUndefined();
  });
});

describe('isSyncStale', () => {
  const now = Date.parse('2026-10-15T12:00:00.000Z');
  const run = (finishedAt: string) =>
    ({ lastRun: { finishedAt } }) as Parameters<typeof isSyncStale>[0];
  it('is stale with no run, or a run that ended more than 12 hours ago', () => {
    expect(isSyncStale({ lastRun: null }, now)).toBe(true);
    expect(isSyncStale(run('2026-10-15T00:00:00.000Z'), now)).toBe(false);
    expect(isSyncStale(run('2026-10-14T23:59:00.000Z'), now)).toBe(true);
  });
});
