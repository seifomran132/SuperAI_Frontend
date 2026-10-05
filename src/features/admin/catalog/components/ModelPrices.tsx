import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { adminModelsControllerSetPriceMutation } from '~/api/generated/@tanstack/react-query.gen';
import type { ModelDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { Button } from '~/components/ui/button';
import { formatActivityDate } from '~/lib/dates';
import { td, th, TextField } from '../../components/FormControls';
import { ReasonDialog } from '../../components/ReasonDialog';
import { Section } from '../../components/Section';
import { QueryState } from './CatalogParts';
import {
  collect,
  decimalError,
  serverFieldErrors,
  type Errors,
} from '../model/form';
import { invalidateCatalog, useModelPrices } from '../model/queries';

const optionalDecimal = (v: string) =>
  v.trim() === '' ? null : decimalError(v);

/** Local date-time text («2026-10-06T09:00») to an ISO instant; null when invalid or past. */
export function futureIso(value: string, now = new Date()): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date < now) return null;
  return date.toISOString();
}

function SchedulePriceDialog({
  model,
  onClose,
}: {
  model: ModelDto;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mutation = useMutation(adminModelsControllerSetPriceMutation());
  const [v, setV] = useState({
    inputPerMtok: '',
    outputPerMtok: '',
    cachedInputPerMtok: '',
    cacheWritePerMtok: '',
    effectiveFrom: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const set = (field: keyof typeof v, value: string) => {
    setV((c) => ({ ...c, [field]: value }));
    setErrors((c) => {
      const rest = { ...c };
      delete rest[field];
      return rest;
    });
  };
  const err = (f: string) => (errors[f] ? t(`admin.${errors[f]}`) : undefined);
  return (
    <ReasonDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('admin.models.priceTitle')}
      description={model.displayName}
      submitLabel={t('admin.models.priceSubmit')}
      validate={() => {
        const found = collect({
          inputPerMtok: decimalError(v.inputPerMtok),
          outputPerMtok: decimalError(v.outputPerMtok),
          cachedInputPerMtok: optionalDecimal(v.cachedInputPerMtok),
          cacheWritePerMtok: optionalDecimal(v.cacheWritePerMtok),
          effectiveFrom:
            v.effectiveFrom && !futureIso(v.effectiveFrom)
              ? 'models.effectivePast'
              : null,
        });
        setErrors(found);
        return found;
      }}
      fields={() => (
        <>
          <TextField
            label={t('admin.models.inputPrice')}
            hint={t('admin.models.perMillion')}
            required
            dir="ltr"
            inputMode="decimal"
            value={v.inputPerMtok}
            error={err('inputPerMtok')}
            onChange={(x) => set('inputPerMtok', x)}
          />
          <TextField
            label={t('admin.models.outputPrice')}
            hint={t('admin.models.perMillion')}
            required
            dir="ltr"
            inputMode="decimal"
            value={v.outputPerMtok}
            error={err('outputPerMtok')}
            onChange={(x) => set('outputPerMtok', x)}
          />
          <TextField
            label={t('admin.models.cachedPrice')}
            hint={t('admin.models.cachedHint')}
            dir="ltr"
            inputMode="decimal"
            value={v.cachedInputPerMtok}
            error={err('cachedInputPerMtok')}
            onChange={(x) => set('cachedInputPerMtok', x)}
          />
          <TextField
            label={t('admin.models.cacheWritePrice')}
            hint={t('admin.models.cachedHint')}
            dir="ltr"
            inputMode="decimal"
            value={v.cacheWritePerMtok}
            error={err('cacheWritePerMtok')}
            onChange={(x) => set('cacheWritePerMtok', x)}
          />
          <TextField
            label={t('admin.models.effectiveFrom')}
            hint={t('admin.models.effectiveFromHint')}
            type="datetime-local"
            dir="ltr"
            value={v.effectiveFrom}
            error={err('effectiveFrom')}
            onChange={(x) => set('effectiveFrom', x)}
          />
        </>
      )}
      onSubmit={async ({ reason }) => {
        try {
          await mutation.mutateAsync({
            path: { id: model.id },
            body: {
              reason,
              inputPerMtok: v.inputPerMtok.trim(),
              outputPerMtok: v.outputPerMtok.trim(),
              cachedInputPerMtok: v.cachedInputPerMtok.trim() || null,
              cacheWritePerMtok: v.cacheWritePerMtok.trim() || null,
              ...(v.effectiveFrom
                ? { effectiveFrom: futureIso(v.effectiveFrom) ?? undefined }
                : {}),
            },
          });
        } catch (error) {
          const fields = serverFieldErrors(error);
          if (fields) setErrors(fields);
          throw error;
        }
        await invalidateCatalog(queryClient);
        toast.success(t('admin.models.priceSaved'));
      }}
    />
  );
}

/** Current price, history (newest first as the API returns it) and scheduling of a new price. */
export function ModelPrices({ model }: { model: ModelDto }) {
  const { t, i18n } = useTranslation();
  const prices = useModelPrices(model.id);
  const [scheduling, setScheduling] = useState(false);
  const none = t('admin.common.none');
  const dayLabels = {
    today: t('balance.activity.today'),
    yesterday: t('balance.activity.yesterday'),
  };
  return (
    <Section
      title={t('admin.models.pricesTitle')}
      actions={
        <Button variant="secondary" onClick={() => setScheduling(true)}>
          <CalendarPlus aria-hidden="true" className="size-5" />
          {t('admin.models.priceSchedule')}
        </Button>
      }
    >
      {model.currentPrice ? null : (
        <p className="text-warning text-sm">{t('admin.models.noPrice')}</p>
      )}
      <QueryState query={prices} error={t('admin.models.pricesError')}>
        {prices.data?.length === 0 ? (
          <p className="text-fg-muted py-4 text-center">
            {t('admin.models.pricesEmpty')}
          </p>
        ) : (
          <div className="relative overflow-x-auto">
            <table
              aria-label={t('admin.models.pricesTitle')}
              className="w-full min-w-[800px] border-collapse"
            >
              <thead className="bg-surface-muted">
                <tr>
                  {(
                    [
                      'from',
                      'to',
                      'input',
                      'output',
                      'cached',
                      'cacheWrite',
                    ] as const
                  ).map((c) => (
                    <th key={c} scope="col" className={th}>
                      {t(`admin.models.priceColumns.${c}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-border-subtle divide-y">
                {prices.data?.map((p) => (
                  <tr key={p.id}>
                    <td className={td}>
                      {formatActivityDate(
                        p.effectiveFrom,
                        i18n.language,
                        dayLabels,
                      )}
                      {p.id === model.currentPrice?.id ? (
                        <span className="text-success ms-2 text-xs font-medium">
                          {t('admin.models.currentPrice')}
                        </span>
                      ) : null}
                    </td>
                    <td className={td}>
                      {p.effectiveTo
                        ? formatActivityDate(
                            p.effectiveTo,
                            i18n.language,
                            dayLabels,
                          )
                        : none}
                    </td>
                    <td className={td}>
                      <Money value={p.inputPerMtok} kind="exact" />
                    </td>
                    <td className={td}>
                      <Money value={p.outputPerMtok} kind="exact" />
                    </td>
                    <td className={td}>
                      {p.cachedInputPerMtok ? (
                        <Money value={p.cachedInputPerMtok} kind="exact" />
                      ) : (
                        none
                      )}
                    </td>
                    <td className={td}>
                      {p.cacheWritePerMtok ? (
                        <Money value={p.cacheWritePerMtok} kind="exact" />
                      ) : (
                        none
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </QueryState>
      {scheduling ? (
        <SchedulePriceDialog
          model={model}
          onClose={() => setScheduling(false)}
        />
      ) : null}
    </Section>
  );
}
