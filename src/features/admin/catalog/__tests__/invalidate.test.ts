import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import {
  adminModesListQueryKey,
  adminPlansListQueryKey,
  meGetQueryKey,
  modesListQueryKey,
  publicPlansListQueryKey,
} from '~/api/generated/@tanstack/react-query.gen';
import { invalidateCatalog } from '../model/queries';

describe('invalidateCatalog', () => {
  it('marks admin catalog queries and the customer /plans and /modes stale, nothing else', async () => {
    const client = new QueryClient();
    const keys = [
      adminPlansListQueryKey(),
      adminModesListQueryKey(),
      publicPlansListQueryKey(),
      modesListQueryKey(),
      meGetQueryKey(),
    ];
    keys.forEach((key) => client.setQueryData(key, []));
    await invalidateCatalog(client);
    const stale = keys.map((k) => client.getQueryState(k)?.isInvalidated);
    expect(stale).toEqual([true, true, true, true, false]);
  });
});
