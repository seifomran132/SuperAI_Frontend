import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleCheck, CircleOff, Pencil, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  adminAgentsListOptions,
  adminAgentsListQueryKey,
  adminAgentsUpdateMutation,
  meAgentsListQueryKey,
} from '~/api/generated/@tanstack/react-query.gen';
import type {
  AdminAgentDto,
  ModelDto,
  UpdateAgentDto,
} from '~/api/generated/types.gen';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { formatActivityDate } from '~/lib/dates';
import { Badge } from '../../components/Badge';
import {
  CheckField,
  SelectField,
  TextAreaField,
  TextField,
  td,
  th,
} from '../../components/FormControls';
import { ReasonDialog, type FieldErrors } from '../../components/ReasonDialog';
import {
  Ltr,
  QueryState,
  TableCard,
} from '../../catalog/components/CatalogParts';
import { percentError, sortError } from '../../catalog/model/form';
import { useModels, usePlans } from '../../catalog/model/queries';

type ModelSlot = 'promptModelId' | 'imageModelId' | 'checkModelId';

const SLOTS: {
  slot: ModelSlot;
  field: 'promptModel' | 'imageModel' | 'checkModel';
  fits: (m: ModelDto) => boolean;
}[] = [
  {
    slot: 'promptModelId',
    field: 'promptModel',
    fits: (m) => !m.generatesImages,
  },
  { slot: 'imageModelId', field: 'imageModel', fits: (m) => m.generatesImages },
  {
    slot: 'checkModelId',
    field: 'checkModel',
    fits: (m) => m.supportsImages && !m.generatesImages,
  },
];

interface Values {
  isEnabled: boolean;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
  sortOrder: string;
  planKeys: string[];
  promptModelId: string;
  imageModelId: string;
  checkModelId: string;
  variants: number;
  marginOverridePct: string;
}

const valuesOf = (agent: AdminAgentDto): Values => ({
  isEnabled: agent.isEnabled,
  labelAr: agent.labelAr,
  labelEn: agent.labelEn,
  descriptionAr: agent.descriptionAr,
  descriptionEn: agent.descriptionEn,
  sortOrder: String(agent.sortOrder),
  planKeys: [...agent.planKeys],
  promptModelId: agent.promptModel?.id ?? '',
  imageModelId: agent.imageModel?.id ?? '',
  checkModelId: agent.checkModel?.id ?? '',
  variants: agent.variants,
  // "40.000" → "40": the field shows what an admin would type.
  marginOverridePct:
    agent.marginOverridePct === null
      ? ''
      : agent.marginOverridePct.replace(/\.?0+$/, ''),
});

/** S26 dialog: visibility, texts, plans, models and cost, with a reason. */
function AgentDialog({
  agent,
  onClose,
}: {
  agent: AdminAgentDto;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const a = (key: string, options?: Record<string, unknown>) =>
    t(`admin.agents.${key}`, options);
  const qc = useQueryClient();
  const plans = usePlans();
  const models = useModels();
  const update = useMutation(adminAgentsUpdateMutation());
  const [v, setV] = useState<Values>(() => valuesOf(agent));
  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setV((old) => ({ ...old, [key]: value }));
  const en = i18n.language === 'en';

  const missing = SLOTS.filter(({ slot }) => !v[slot]).map(({ field }) =>
    a(field),
  );
  // The server's `ready` also needs the models on and priced; with a model
  // missing it can't be ready either way.
  const ready = missing.length === 0 && agent.ready;

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!v.labelAr.trim()) errors.labelAr = 'agents.required';
    if (!v.labelEn.trim()) errors.labelEn = 'agents.required';
    const sort = sortError(v.sortOrder);
    if (sort) errors.sortOrder = sort;
    if (v.marginOverridePct.trim()) {
      const margin = percentError(v.marginOverridePct);
      if (margin) errors.marginOverridePct = margin;
    }
    return errors;
  };

  return (
    <ReasonDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={a('dialogTitle')}
      description={`${en ? agent.labelEn : agent.labelAr} · ${agent.key}`}
      submitLabel={a('save')}
      fieldNames={[
        'labelAr',
        'labelEn',
        'descriptionAr',
        'descriptionEn',
        'sortOrder',
        'planKeys',
        'promptModelId',
        'imageModelId',
        'checkModelId',
        'variants',
        'marginOverridePct',
      ]}
      validate={validate}
      fields={({ errors, clearError }) => {
        const err = (field: string) =>
          errors[field]
            ? t(
                errors[field].includes(':')
                  ? errors[field]
                  : `admin.${errors[field]}`,
              )
            : undefined;
        const change =
          <K extends keyof Values>(key: K) =>
          (value: Values[K]) => {
            set(key, value);
            clearError(key);
          };
        return (
          <div className="grid gap-6">
            <section className="grid gap-2">
              <h3 className="text-fg font-bold">{a('visibility')}</h3>
              <CheckField
                label={a('enabled')}
                description={a('enabledHint')}
                checked={v.isEnabled}
                onChange={change('isEnabled')}
              />
              {v.isEnabled && v.planKeys.length === 0 ? (
                <Alert variant="warning">{a('noPlansWarning')}</Alert>
              ) : null}
              {v.isEnabled && !ready ? (
                <Alert variant="warning">{a('onNotReady')}</Alert>
              ) : null}
            </section>

            <section className="grid gap-4">
              <h3 className="text-fg font-bold">{a('texts')}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label={a('labelAr')}
                  required
                  value={v.labelAr}
                  error={err('labelAr')}
                  onChange={change('labelAr')}
                />
                <TextField
                  label={a('labelEn')}
                  required
                  dir="ltr"
                  value={v.labelEn}
                  error={err('labelEn')}
                  onChange={change('labelEn')}
                />
                <TextAreaField
                  label={a('descriptionAr')}
                  value={v.descriptionAr}
                  error={err('descriptionAr')}
                  onChange={change('descriptionAr')}
                />
                <TextAreaField
                  label={a('descriptionEn')}
                  value={v.descriptionEn}
                  error={err('descriptionEn')}
                  onChange={change('descriptionEn')}
                />
              </div>
              <TextField
                label={t('admin.catalog.sortOrder')}
                hint={a('sortHint')}
                required
                dir="ltr"
                inputMode="numeric"
                value={v.sortOrder}
                error={err('sortOrder')}
                onChange={change('sortOrder')}
              />
            </section>

            <section className="grid gap-2">
              <h3 className="text-fg font-bold">{a('plansTitle')}</h3>
              <p className="text-fg text-sm font-semibold">{a('plansLabel')}</p>
              {plans.isPending ? (
                <p role="status" className="text-fg-muted text-sm">
                  {a('plansLoading')}
                </p>
              ) : plans.isError ? (
                <Alert variant="danger">{a('plansError')}</Alert>
              ) : (
                <div className="border-border-subtle divide-border-subtle divide-y rounded-md border px-3">
                  {plans.data.map((plan) => (
                    <CheckField
                      key={plan.key}
                      label={en ? plan.nameEn : plan.nameAr}
                      badge={plan.isActive ? undefined : a('planInactive')}
                      checked={v.planKeys.includes(plan.key)}
                      onChange={(on) => {
                        change('planKeys')(
                          on
                            ? [...v.planKeys, plan.key]
                            : v.planKeys.filter((k) => k !== plan.key),
                        );
                      }}
                    />
                  ))}
                </div>
              )}
              <p className="text-fg-muted text-sm">{a('plansHint')}</p>
              {err('planKeys') ? (
                <p role="alert" className="text-danger text-sm">
                  {err('planKeys')}
                </p>
              ) : null}
            </section>

            <section className="grid gap-4">
              <h3 className="text-fg font-bold">{a('models')}</h3>
              {ready ? (
                <Alert variant="success">{a('readyNotice')}</Alert>
              ) : (
                <Alert variant="warning">
                  <strong className="block">{a('notReadyTitle')}</strong>
                  {missing.length > 0
                    ? `${a('missing', { models: missing.join('، ') })} `
                    : null}
                  {a('notReadyBody')}
                </Alert>
              )}
              {SLOTS.map(({ slot, field, fits }) => {
                const options = (models.data ?? []).filter(
                  (m) => fits(m) || m.id === v[slot],
                );
                return (
                  <SelectField
                    key={slot}
                    label={a(field)}
                    hint={a(`${field}Hint`)}
                    value={v[slot]}
                    error={err(slot)}
                    disabled={models.isPending}
                    onChange={change(slot)}
                  >
                    <option value="">{a('noModel')}</option>
                    {options.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.isEnabled
                          ? m.displayName
                          : a('modelOff', { name: m.displayName })}
                      </option>
                    ))}
                  </SelectField>
                );
              })}
              <SelectField
                label={a('variants')}
                hint={a('variantsHint')}
                value={String(v.variants)}
                error={err('variants')}
                onChange={(x) => change('variants')(Number(x))}
              >
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </SelectField>
              <TextField
                label={a('margin')}
                hint={a('marginHint')}
                placeholder={a('marginPlaceholder')}
                dir="ltr"
                inputMode="decimal"
                value={v.marginOverridePct}
                error={err('marginOverridePct')}
                onChange={change('marginOverridePct')}
              />
            </section>
          </div>
        );
      }}
      onSubmit={async ({ reason }) => {
        const body: UpdateAgentDto = {
          reason,
          isEnabled: v.isEnabled,
          labelAr: v.labelAr.trim(),
          labelEn: v.labelEn.trim(),
          descriptionAr: v.descriptionAr.trim(),
          descriptionEn: v.descriptionEn.trim(),
          sortOrder: parseInt(v.sortOrder, 10),
          promptModelId: v.promptModelId || null,
          imageModelId: v.imageModelId || null,
          checkModelId: v.checkModelId || null,
          variants: v.variants,
          marginOverridePct: v.marginOverridePct.trim() || null,
        };
        // Plans are sent only once the list is there, so a failed load never clears them.
        if (plans.isSuccess) body.planKeys = v.planKeys;
        await update.mutateAsync({ path: { key: agent.key }, body });
        void qc.invalidateQueries({ queryKey: adminAgentsListQueryKey() });
        // The admin's own chat picker reads `GET /agents`.
        void qc.invalidateQueries({ queryKey: meAgentsListQueryKey() });
        toast.success(a('saved'));
        onClose();
      }}
    />
  );
}

/** `/admin/agents` (S26): agents, who sees them, and whether they can run. */
export function AgentsPage() {
  const { t, i18n } = useTranslation();
  const a = (key: string, options?: Record<string, unknown>) =>
    t(`admin.agents.${key}`, options);
  const agents = useQuery(adminAgentsListOptions());
  const plans = usePlans();
  const [editing, setEditing] = useState<AdminAgentDto | null>(null);
  const en = i18n.language === 'en';
  const planName = (key: string) => {
    const plan = plans.data?.find((p) => p.key === key);
    return plan ? (en ? plan.nameEn : plan.nameAr) : key;
  };

  return (
    <>
      <p className="text-fg-muted">{a('intro')}</p>
      <QueryState query={agents} error={a('error')}>
        <TableCard
          empty={
            agents.data?.length === 0
              ? { title: a('emptyTitle'), body: a('emptyBody') }
              : null
          }
        >
          <table
            aria-label={a('tableLabel')}
            className="w-full min-w-[900px] border-collapse"
          >
            <thead className="bg-surface-muted">
              <tr>
                {(
                  [
                    'agent',
                    'key',
                    'status',
                    'plans',
                    'sort',
                    'updated',
                    'actions',
                  ] as const
                ).map((c) => (
                  <th key={c} scope="col" className={th}>
                    {a(`columns.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-border-subtle divide-y">
              {agents.data?.map((agent) => {
                const name = en ? agent.labelEn : agent.labelAr;
                return (
                  <tr key={agent.key}>
                    <td className={td}>
                      <span className="text-fg font-semibold">{name}</span>
                      <div className="text-fg-muted text-xs">
                        {en ? agent.labelAr : agent.labelEn}
                      </div>
                    </td>
                    <td className={td}>
                      <Ltr>{agent.key}</Ltr>
                    </td>
                    <td className={td}>
                      <div className="flex flex-col items-start gap-1">
                        {agent.isEnabled ? (
                          <Badge tone="success" Icon={CircleCheck}>
                            {a('on')}
                          </Badge>
                        ) : (
                          <Badge tone="neutral" Icon={CircleOff}>
                            {a('off')}
                          </Badge>
                        )}
                        {agent.ready ? (
                          <Badge tone="info" Icon={CircleCheck}>
                            {a('ready')}
                          </Badge>
                        ) : (
                          <Badge tone="warning" Icon={TriangleAlert}>
                            {a('notReady')}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className={td}>
                      {agent.planKeys.length === 0 ? (
                        <span className="text-fg-muted">{a('noPlans')}</span>
                      ) : (
                        <ul className="flex flex-wrap gap-1">
                          {agent.planKeys.map((key) => (
                            <li
                              key={key}
                              className="bg-surface-muted border-border-subtle rounded-full border px-2 py-0.5 text-xs"
                            >
                              {planName(key)}
                            </li>
                          ))}
                        </ul>
                      )}
                      {agent.isEnabled && agent.planKeys.length === 0 ? (
                        <p className="text-warning mt-1 text-xs">
                          {a('onNoPlans')}
                        </p>
                      ) : null}
                    </td>
                    <td className={td}>
                      <Ltr>{agent.sortOrder}</Ltr>
                    </td>
                    <td className={td}>
                      {formatActivityDate(agent.updatedAt, i18n.language, {
                        today: t('balance.activity.today'),
                        yesterday: t('balance.activity.yesterday'),
                      })}
                    </td>
                    <td className={td}>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        aria-label={a('editLabel', { name })}
                        onClick={() => setEditing(agent)}
                      >
                        <Pencil aria-hidden="true" />
                        {a('edit')}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableCard>
      </QueryState>
      {editing ? (
        <AgentDialog agent={editing} onClose={() => setEditing(null)} />
      ) : null}
    </>
  );
}
