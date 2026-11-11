import type { ReactNode } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { ArrowRight, CircleAlert, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type {
  AdminAgentRunDto,
  AgentRunStepDto,
} from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { RetryAlert } from '~/components/RetryAlert';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { formatCount } from '~/lib/numbers';
import { cn } from '~/lib/utils';
import { td, th } from '../../components/FormControls';
import { useAgentRun, useAgentRuns } from '../model/agentRuns';
import { validateAgentRunsSearch, type RequestsFilter } from '../model/search';

const R = 'admin.reports.runs';
const CHIPS: RequestsFilter[] = [
  'all',
  'reconciliation_required',
  'reserved',
  'settled',
  'released',
];

const STATUS_TONE: Record<AdminAgentRunDto['status'], string> = {
  reconciliation_required:
    'bg-warning-container text-warning border-warning-border',
  reserved: 'bg-mode-1-container text-mode-1 border-mode-1-border',
  settled: 'bg-success-container text-success border-success/30',
  released: 'bg-surface-muted text-fg-muted border-border-subtle',
};

function RunStatus({ value }: { value: AdminAgentRunDto['status'] }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        STATUS_TONE[value],
      )}
    >
      {t(`${R}.status.${value}`)}
    </span>
  );
}

const dateTime = (iso: string) => iso.replace('T', ' ').slice(0, 19);

/** `/admin/agent-runs` (S29): design runs, filtered by status and user in the URL. */
export function AgentRunsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = validateAgentRunsSearch(useSearch({ strict: false }));
  const filter: RequestsFilter = search.status ?? 'reconciliation_required';
  const list = useAgentRuns({ status: filter, userId: search.userId });
  const go = (next: { status?: RequestsFilter; userId?: string | null }) =>
    void navigate({
      to: '/admin/agent-runs',
      search: validateAgentRunsSearch({
        status: next.status ?? filter,
        userId:
          next.userId === null ? undefined : (next.userId ?? search.userId),
      }),
      replace: true,
    });

  let body;
  if (list.status === 'pending') {
    body = (
      <p role="status" className="text-fg-muted p-10 text-center">
        {t(`${R}.loading`)}
      </p>
    );
  } else if (list.status === 'error') {
    body = (
      <RetryAlert onRetry={() => void list.refetch()}>
        {t(`${R}.error`)}
      </RetryAlert>
    );
  } else if (list.runs.length === 0) {
    body = (
      <p className="text-fg-muted p-10 text-center">
        {filter === 'all' && !search.userId
          ? t(`${R}.empty`)
          : t(`${R}.emptyFiltered`)}
      </p>
    );
  } else {
    body = (
      <>
        <div className="bg-surface border-border-subtle overflow-x-auto rounded-lg border">
          <table
            aria-label={t(`${R}.tableLabel`)}
            className="w-full min-w-[860px] border-collapse"
          >
            <thead className="bg-surface-muted">
              <tr>
                {(
                  [
                    'date',
                    'user',
                    'kind',
                    'status',
                    'designs',
                    'charged',
                    'cost',
                  ] as const
                ).map((c) => (
                  <th key={c} scope="col" className={th}>
                    {t(`${R}.columns.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-border-subtle divide-y">
              {list.runs.map((run) => (
                <tr key={run.id}>
                  <td className={td}>
                    <Link
                      to="/admin/agent-runs/$runId"
                      params={{ runId: run.id }}
                      aria-label={`${t(`${R}.open`)} ${dateTime(run.createdAt)}`}
                      className="text-brand focus-visible:outline-focus font-semibold underline-offset-4 outline-hidden hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
                    >
                      <bdi dir="ltr">{dateTime(run.createdAt)}</bdi>
                    </Link>
                  </td>
                  <td className={td}>
                    <Link
                      to="/admin/users/$userId"
                      params={{ userId: run.userId }}
                      className="text-fg underline-offset-4 hover:underline"
                    >
                      <bdi dir="ltr">
                        {run.userEmail ?? run.userId.slice(0, 8)}
                      </bdi>
                    </Link>
                  </td>
                  <td className={td}>{t(`${R}.kind.${run.kind}`)}</td>
                  <td className={td}>
                    <RunStatus value={run.status} />
                  </td>
                  <td className={td}>
                    {t(`${R}.designsOf`, {
                      designs: run.designs,
                      variants: run.variants,
                    })}
                  </td>
                  <td className={td}>
                    {run.chargedUsd === null ? (
                      '—'
                    ) : (
                      <Money value={run.chargedUsd} kind="cost" />
                    )}
                  </td>
                  <td className={td}>
                    {run.providerCostUsd === null ? (
                      '—'
                    ) : (
                      <Money value={run.providerCostUsd} kind="cost" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.hasNextPage ? (
          <Button
            type="button"
            variant="secondary"
            className="self-center"
            loading={list.isFetchingNextPage}
            onClick={() => void list.fetchNextPage()}
          >
            {t(`${R}.loadMore`)}
          </Button>
        ) : null}
      </>
    );
  }

  return (
    <>
      {search.userId ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-fg text-sm">
            {t(`${R}.forUser`, {
              email: list.runs[0]?.userEmail ?? search.userId.slice(0, 8),
            })}
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => go({ userId: null })}
          >
            {t(`${R}.clearUser`)}
          </Button>
        </div>
      ) : null}
      <div
        role="group"
        aria-label={t(`${R}.filterLabel`)}
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            aria-pressed={filter === chip}
            onClick={() => go({ status: chip })}
            className={cn(
              'min-h-11 shrink-0 rounded-md border px-4 text-sm',
              filter === chip
                ? 'border-brand bg-brand text-on-brand'
                : 'border-border-control text-fg bg-surface',
            )}
          >
            {t(`${R}.chips.${chip}`)}
          </button>
        ))}
      </div>
      {body}
    </>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-border-subtle flex items-center justify-between gap-3 border-b py-2.5 last:border-b-0">
      <dt className="text-fg-muted text-sm">{label}</dt>
      <dd className="text-fg text-sm">{children}</dd>
    </div>
  );
}

function CopyId({ value, label }: { value: string; label: string }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1">
      <bdi dir="ltr" className="font-mono">
        {value.slice(0, 8)}
      </bdi>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t(`${R}.copy`, { label })}
        onClick={() =>
          void navigator.clipboard
            ?.writeText(value)
            .then(() => toast.success(t(`${R}.copied`)))
        }
      >
        <Copy aria-hidden="true" className="size-4" />
      </Button>
    </span>
  );
}

/** A repeated `image` step for the same design is the one fix (§11.2). */
function isRetry(step: AgentRunStepDto, steps: AgentRunStepDto[]) {
  if (step.kind !== 'image') return false;
  return steps.some(
    (s) =>
      s.kind === 'image' &&
      s.variant === step.variant &&
      s.sequence < step.sequence,
  );
}

/** `/admin/agent-runs/$runId` (S29): money, facts and every model call. */
export function AgentRunPage({ runId }: { runId: string }) {
  const { t } = useTranslation();
  const run = useAgentRun(runId);
  const back = (
    <Link
      to="/admin/agent-runs"
      className="text-brand inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold"
    >
      <ArrowRight aria-hidden="true" className="size-4 ltr:rotate-180" />
      {t(`${R}.back`)}
    </Link>
  );
  if (run.notFound) {
    return (
      <>
        {back}
        <Alert variant="warning">{t(`${R}.notFound`)}</Alert>
      </>
    );
  }
  if (run.isPending) {
    return (
      <p role="status" className="text-fg-muted p-10 text-center">
        {t(`${R}.loading`)}
      </p>
    );
  }
  if (run.isError || !run.data) {
    return (
      <RetryAlert onRetry={() => void run.refetch()}>
        {t(`${R}.error`)}
      </RetryAlert>
    );
  }
  const data = run.data;
  const money = (value: string | null) =>
    value === null ? '—' : <Money value={value} kind="cost" />;
  const tile = (label: string, value: ReactNode, help?: string) => (
    <div className="bg-surface border-border-subtle rounded-lg border p-4">
      <p className="text-fg-muted text-sm">{label}</p>
      <p className="text-fg mt-1.5 text-2xl font-bold tabular-nums">{value}</p>
      {help ? <p className="text-fg-subtle mt-1 text-xs">{help}</p> : null}
    </div>
  );

  return (
    <>
      {back}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-fg text-2xl font-bold">
          <bdi dir="ltr">{data.id.slice(0, 8)}</bdi>
        </h1>
        <RunStatus value={data.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tile(
          t(`${R}.reserved`),
          money(data.reservedUsd),
          t(`${R}.reservedHelp`),
        )}
        {tile(t(`${R}.charged`), money(data.chargedUsd), t(`${R}.chargedHelp`))}
        {tile(t(`${R}.cost`), money(data.providerCostUsd))}
        {tile(
          t(`${R}.absorbed`),
          money(data.absorbedUsd),
          t(`${R}.absorbedHelp`),
        )}
      </div>
      <section className="bg-surface border-border-subtle rounded-lg border p-4">
        <h2 className="text-fg mb-2 font-bold">{t(`${R}.facts`)}</h2>
        <dl className="grid gap-x-8 md:grid-cols-2">
          <Fact label={t(`${R}.user`)}>
            <Link
              to="/admin/users/$userId"
              params={{ userId: data.userId }}
              className="text-brand underline underline-offset-4"
            >
              <bdi dir="ltr">{data.userEmail ?? data.userId.slice(0, 8)}</bdi>
            </Link>
          </Fact>
          <Fact label={t(`${R}.columns.kind`)}>
            {t(`${R}.kind.${data.kind}`)}
          </Fact>
          <Fact label={t(`${R}.conversation`)}>
            <CopyId
              value={data.conversationId}
              label={t(`${R}.conversation`)}
            />
          </Fact>
          <Fact label={t(`${R}.columns.designs`)}>
            {t(`${R}.designsOf`, {
              designs: data.designs,
              variants: data.variants,
            })}
          </Fact>
          <Fact label={t(`${R}.request`)}>
            <CopyId value={data.designRequestId} label={t(`${R}.request`)} />
          </Fact>
          <Fact label={t(`${R}.startedAt`)}>
            <bdi dir="ltr">{dateTime(data.createdAt)}</bdi>
          </Fact>
          {data.settledAt ? (
            <Fact label={t(`${R}.settledAt`)}>
              <bdi dir="ltr">{dateTime(data.settledAt)}</bdi>
            </Fact>
          ) : null}
        </dl>
      </section>
      <section className="grid gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-fg text-lg font-bold">{t(`${R}.steps`)}</h2>
          <p className="text-fg-subtle text-sm">{t(`${R}.stepsHelp`)}</p>
        </div>
        <div className="bg-surface border-border-subtle overflow-x-auto rounded-lg border">
          <table
            aria-label={t(`${R}.steps`)}
            className="w-full min-w-[900px] border-collapse"
          >
            <thead className="bg-surface-muted">
              <tr>
                <th scope="col" className={th}>
                  #
                </th>
                {(
                  [
                    'step',
                    'model',
                    'status',
                    'usage',
                    'cost',
                    'charge',
                    'error',
                  ] as const
                ).map((c) => (
                  <th key={c} scope="col" className={th}>
                    {t(`${R}.stepColumns.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-border-subtle divide-y">
              {data.stepList.map((step) => (
                <tr key={step.sequence}>
                  <td className={td}>
                    <bdi dir="ltr">{step.sequence}</bdi>
                  </td>
                  <td className={td}>
                    <span className="text-fg block font-medium">
                      {t(`${R}.stepKind.${step.kind}`)}
                    </span>
                    {step.variant !== null ? (
                      <span className="text-fg-muted text-xs">
                        {t(`${R}.stepVariant`, { n: step.variant })}
                        {isRetry(step, data.stepList)
                          ? ` · ${t(`${R}.retry`)}`
                          : null}
                      </span>
                    ) : null}
                  </td>
                  <td className={td}>
                    <span className="block">{step.modelDisplayName}</span>
                    <bdi dir="ltr" className="text-fg-muted text-xs">
                      {step.providerCode}
                    </bdi>
                  </td>
                  <td className={td}>{t(`${R}.stepStatus.${step.status}`)}</td>
                  <td className={td}>
                    {step.inputTokens !== null ? (
                      <span className="block text-xs">
                        {t(`${R}.tokensIn`, {
                          n: formatCount(step.inputTokens),
                        })}
                      </span>
                    ) : null}
                    {step.outputTokens !== null ? (
                      <span className="block text-xs">
                        {t(`${R}.tokensOut`, {
                          n: formatCount(step.outputTokens),
                        })}
                      </span>
                    ) : null}
                    {step.usageSource && step.usageSource !== 'provider' ? (
                      <span className="text-warning block text-xs">
                        {t(`${R}.estimated`)}
                      </span>
                    ) : null}
                  </td>
                  <td className={td}>{money(step.providerCostUsd)}</td>
                  <td className={td}>{money(step.chargeUsd)}</td>
                  <td className={td}>
                    {step.errorCode ? (
                      <span className="text-danger flex items-start gap-1 text-xs">
                        <CircleAlert
                          aria-hidden="true"
                          className="size-3.5 shrink-0"
                        />
                        <span>
                          <bdi dir="ltr" className="block">
                            {step.errorCode}
                          </bdi>
                          {t(`errors:${step.errorCode}`, { defaultValue: '' })}
                        </span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
