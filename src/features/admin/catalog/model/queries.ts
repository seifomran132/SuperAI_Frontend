import { useTranslation } from 'react-i18next';
import { useQuery, type QueryClient } from '@tanstack/react-query';
import {
  adminModelsControllerGetOptions,
  adminModelsControllerListOptions,
  adminModelsControllerPricesOptions,
  adminModesControllerGetOptions,
  adminModesControllerListOptions,
  adminPlansControllerGetOptions,
  adminPlansControllerListOptions,
  adminProvidersControllerListOptions,
  modesControllerListQueryKey,
  publicPlansControllerListQueryKey,
} from '~/api/generated/@tanstack/react-query.gen';

export const usePlans = () => useQuery(adminPlansControllerListOptions());
export const usePlan = (key: string) =>
  useQuery(adminPlansControllerGetOptions({ path: { key } }));
export const useProviders = () =>
  useQuery(adminProvidersControllerListOptions());
export const useModels = () => useQuery(adminModelsControllerListOptions());
export const useModel = (id: string) =>
  useQuery(adminModelsControllerGetOptions({ path: { id } }));
export const useModelPrices = (id: string) =>
  useQuery(adminModelsControllerPricesOptions({ path: { id } }));
export const useModes = () => useQuery(adminModesControllerListOptions());

/** Mode key → label in the current language (the key itself until modes load). */
export function useModeLabel() {
  const { i18n } = useTranslation();
  const modes = useModes();
  const en = i18n.language === 'en';
  return (key: string) => {
    const mode = modes.data?.find((m) => m.key === key);
    return mode ? (en ? mode.labelEn : mode.labelAr) : key;
  };
}
export const useMode = (key: string) =>
  useQuery(adminModesControllerGetOptions({ path: { key } }));

/**
 * After any catalog write: every admin list/detail (plans, providers, models,
 * prices, modes) and the customer-facing `/plans` and `/modes` are stale.
 * The admin queries all share the `admin…Controller…` id prefix.
 */
export function invalidateCatalog(queryClient: QueryClient) {
  const adminCatalog = /^admin(Plans|Providers|Models|Modes)Controller/;
  return Promise.all([
    queryClient.invalidateQueries({
      predicate: (query) => {
        const first = query.queryKey[0] as { _id?: string } | undefined;
        return adminCatalog.test(first?._id ?? '');
      },
    }),
    queryClient.invalidateQueries({
      queryKey: publicPlansControllerListQueryKey(),
    }),
    queryClient.invalidateQueries({ queryKey: modesControllerListQueryKey() }),
  ]);
}
