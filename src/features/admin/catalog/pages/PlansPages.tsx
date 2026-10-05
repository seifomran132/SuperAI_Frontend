import { useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { errorMessageKey, isApiError } from '~/api/errors';
import { adminPlansControllerSetModesMutation } from '~/api/generated/@tanstack/react-query.gen';
import type { PlanDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { Button } from '~/components/ui/button';
import { Badge } from '../../components/Badge';
import { ReasonDialog } from '../../components/ReasonDialog';
import { Section } from '../../components/Section';
import { Star } from 'lucide-react';
import {
  BackLink,
  FlagBadge,
  Ltr,
  NewLink,
  NotFoundCard,
  QueryState,
  TableCard,
} from '../components/CatalogParts';
import { ModeChecklist } from '../components/ModeChecklist';
import { PlanForm } from '../components/PlanForm';
import { th, td } from '../../components/FormControls';
import {
  invalidateCatalog,
  useModeLabel,
  usePlan,
  usePlans,
} from '../model/queries';

/** A3: plans list. */
export function PlansPage() {
  const { t, i18n } = useTranslation();
  const plans = usePlans();
  const modeLabel = useModeLabel();
  const en = i18n.language === 'en';
  return (
    <>
      <NewLink to="/admin/plans/new" label={t('admin.plans.new')} />
      <QueryState query={plans} error={t('admin.plans.error')}>
        <TableCard
          empty={
            plans.data?.length === 0
              ? {
                  title: t('admin.plans.emptyTitle'),
                  body: t('admin.plans.emptyBody'),
                }
              : null
          }
        >
          <table
            aria-label={t('admin.plans.tableLabel')}
            className="w-full min-w-[960px] border-collapse"
          >
            <thead className="bg-surface-muted">
              <tr>
                <th scope="col" className={th}>
                  {t('admin.plans.columns.name')}
                </th>
                <th scope="col" className={th}>
                  {t('admin.plans.columns.price')}
                </th>
                <th scope="col" className={th}>
                  {t('admin.plans.columns.included')}
                </th>
                <th scope="col" className={th}>
                  {t('admin.plans.columns.modes')}
                </th>
                <th scope="col" className={th}>
                  {t('admin.plans.columns.status')}
                </th>
                <th scope="col" className={th}>
                  {t('admin.plans.columns.subscribers')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-border-subtle divide-y">
              {plans.data?.map((plan) => (
                <tr key={plan.key}>
                  <td className={td}>
                    <Link
                      to="/admin/plans/$key"
                      params={{ key: plan.key }}
                      className="text-brand focus-visible:outline-focus font-semibold underline-offset-4 outline-hidden hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {en ? plan.nameEn : plan.nameAr}
                    </Link>
                    <div className="text-fg-muted text-xs">
                      <Ltr>{plan.key}</Ltr>
                    </div>
                  </td>
                  <td className={td}>
                    <Money value={plan.monthlyPriceUsd} />
                  </td>
                  <td className={td}>
                    <Money value={plan.includedBalanceUsd} />
                  </td>
                  <td className={td}>
                    {plan.modeKeys.length === 0
                      ? t('admin.common.none')
                      : plan.modeKeys.map(modeLabel).join('، ')}
                  </td>
                  <td className={td}>
                    <div className="flex flex-wrap gap-1.5">
                      <FlagBadge
                        on={plan.isActive}
                        onLabel={t('admin.catalog.active')}
                        offLabel={t('admin.catalog.inactive')}
                      />
                      <FlagBadge
                        on={plan.isPublic}
                        onLabel={t('admin.plans.public')}
                        offLabel={t('admin.plans.hidden')}
                      />
                      {plan.isDefault ? (
                        <Badge tone="info" Icon={Star}>
                          {t('admin.plans.default')}
                        </Badge>
                      ) : null}
                    </div>
                  </td>
                  <td className={`${td} tabular-nums`}>
                    {plan.activeSubscriptions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      </QueryState>
    </>
  );
}

/** Create form. */
export function PlanNewPage() {
  const { t } = useTranslation();
  return (
    <>
      <BackLink to="/admin/plans" label={t('admin.plans.backToList')} />
      <PlanForm />
    </>
  );
}

function PlanModesSection({ plan }: { plan: PlanDto }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mutation = useMutation(adminPlansControllerSetModesMutation());
  const [selected, setSelected] = useState(plan.modeKeys);
  const [confirming, setConfirming] = useState(false);
  return (
    <Section
      title={t('admin.plans.modesTitle')}
      actions={
        <Button onClick={() => setConfirming(true)}>
          {t('admin.plans.modesSave')}
        </Button>
      }
    >
      <ModeChecklist selected={selected} onChange={setSelected} />
      {confirming ? (
        <ReasonDialog
          open
          onOpenChange={setConfirming}
          title={t('admin.plans.modesSave')}
          description={plan.key}
          submitLabel={t('admin.plans.modesSave')}
          onSubmit={async ({ reason }) => {
            await mutation.mutateAsync({
              path: { key: plan.key },
              body: { reason, modeKeys: selected },
            });
            await invalidateCatalog(queryClient);
            toast.success(t('admin.plans.modesSaved'));
          }}
        />
      ) : null}
    </Section>
  );
}

/** Edit form and the plan's modes. */
export function PlanDetailPage() {
  const { t, i18n } = useTranslation();
  const { key } = useParams({ strict: false }) as { key: string };
  const query = usePlan(key);
  const notFound =
    query.isError &&
    isApiError(query.error) &&
    query.error.code === 'PLAN_NOT_FOUND';
  if (notFound) {
    return (
      <NotFoundCard
        title={t('admin.plans.notFoundTitle')}
        body={t(errorMessageKey(query.error))}
        to="/admin/plans"
        back={t('admin.plans.backToList')}
      />
    );
  }
  const plan = query.data;
  return (
    <>
      <BackLink to="/admin/plans" label={t('admin.plans.backToList')} />
      <QueryState query={query} error={t('admin.plans.detailError')}>
        {plan ? (
          <>
            <h2 className="text-fg text-xl font-bold">
              {i18n.language === 'en' ? plan.nameEn : plan.nameAr}
            </h2>
            {/* Remount on a fresh server copy so the forms never show stale values. */}
            <PlanForm key={`${plan.key}-${plan.updatedAt}`} plan={plan} />
            <PlanModesSection
              key={`modes-${plan.key}-${plan.updatedAt}`}
              plan={plan}
            />
          </>
        ) : null}
      </QueryState>
    </>
  );
}
