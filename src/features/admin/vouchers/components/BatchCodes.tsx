import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, CircleOff, Clock, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { adminVouchersUpdateMutation } from '~/api/generated/@tanstack/react-query.gen';
import type {
  VoucherBatchCodeDto,
  VoucherBatchDto,
} from '~/api/generated/types.gen';
import { RetryAlert } from '~/components/RetryAlert';
import { Button } from '~/components/ui/button';
import { formatDate } from '~/lib/dates';
import { cn } from '~/lib/utils';
import { Badge } from '../../components/Badge';
import { selectClass, td, th } from '../../components/FormControls';
import { ReasonDialog } from '../../components/ReasonDialog';
import { Section } from '../../components/Section';
import { batchCodeStatus, useBatchCodes } from '../model/batches';
import { invalidateVouchers } from '../model/queries';

function CopyButton({ code }: { code: string }) {
  const { t } = useTranslation();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    let next: 'copied' | 'failed' = 'copied';
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      next = 'failed';
    }
    setState(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  }
  return (
    <span className="inline-flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`${t('admin.vouchers.copyCode')} ${code}`}
        onClick={() => void copy()}
      >
        {state === 'copied' ? (
          <Check aria-hidden="true" className="text-success size-5" />
        ) : (
          <Copy aria-hidden="true" className="size-5" />
        )}
      </Button>
      <span role="status" className="text-fg-muted text-xs">
        {state === 'copied'
          ? t('admin.vouchers.copied')
          : state === 'failed'
            ? t('admin.vouchers.copyFailed')
            : ''}
      </span>
    </span>
  );
}

function CodeBadge({
  code,
  batchOn,
}: {
  code: VoucherBatchCodeDto;
  batchOn: boolean;
}) {
  const { t } = useTranslation();
  const status = batchCodeStatus(code);
  const label = t(`admin.vouchers.batches.codeStatus.${status}`);
  if (status === 'used') {
    return (
      <Badge tone="success" Icon={Check}>
        {label}
      </Badge>
    );
  }
  if (status === 'off') {
    return (
      <Badge tone="neutral" Icon={CircleOff}>
        {label}
      </Badge>
    );
  }
  return (
    <Badge tone={batchOn ? 'info' : 'neutral'} Icon={Clock}>
      {label}
    </Badge>
  );
}

function ToggleCode({ code }: { code: VoucherBatchCodeDto }) {
  const { t } = useTranslation();
  const b = (key: string) => t(`admin.vouchers.batches.${key}`);
  const queryClient = useQueryClient();
  const update = useMutation(adminVouchersUpdateMutation());
  const [open, setOpen] = useState(false);
  const stopping = code.isActive;
  const label = t(
    stopping ? 'admin.vouchers.deactivate' : 'admin.vouchers.activate',
  );
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={stopping ? 'text-danger' : undefined}
        aria-label={`${label} ${code.code}`}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      {open ? (
        <ReasonDialog
          open
          onOpenChange={setOpen}
          title={label}
          description={code.code}
          submitLabel={label}
          danger={stopping}
          notice={
            <p className="text-fg-muted text-sm">
              {b(stopping ? 'deactivateCodeBody' : 'activateCodeBody')}
            </p>
          }
          onSubmit={async ({ reason }) => {
            await update.mutateAsync({
              path: { id: code.id },
              body: { reason, isActive: !stopping },
            });
            await invalidateVouchers(queryClient);
            toast.success(
              t(
                stopping
                  ? 'admin.vouchers.deactivated'
                  : 'admin.vouchers.activated',
              ),
            );
          }}
        />
      ) : null}
    </>
  );
}

function RedeemedBy({ code }: { code: VoucherBatchCodeDto }) {
  if (!code.redeemedByUserId) return <>-</>;
  return (
    <Link
      to="/admin/users/$userId"
      params={{ userId: code.redeemedByUserId }}
      className="text-brand inline-flex min-h-11 items-center underline-offset-4 hover:underline"
    >
      <bdi dir="ltr">
        {code.redeemedByEmail ?? code.redeemedByUserId.slice(0, 8)}
      </bdi>
    </Link>
  );
}

const CodeText = ({ code }: { code: string }) => (
  <bdi dir="ltr" className="font-mono text-sm">
    {code}
  </bdi>
);

/** S23 frame 4: codes of a batch, with copy and turning one code off or on. */
export function BatchCodes({ batch }: { batch: VoucherBatchDto }) {
  const { t, i18n } = useTranslation();
  const b = (key: string, options?: Record<string, unknown>) =>
    t(`admin.vouchers.batches.${key}`, options ?? {});
  const [status, setStatus] = useState<'used' | 'unused' | undefined>();
  const codes = useBatchCodes(batch.id, status);
  // A used code cannot be stopped, and an off batch already stops its codes.
  const canToggle = (code: VoucherBatchCodeDto) =>
    batch.isActive && !code.redeemedAt;
  const date = (iso: string | null) =>
    iso ? formatDate(iso, i18n.language) : '-';
  const columns = ['code', 'status', 'redeemedAt', 'user'] as const;

  return (
    <Section
      title={b('codesTitle', {
        used: batch.redeemedCount,
        total: batch.quantity,
      })}
      actions={
        <select
          aria-label={b('codesFilter')}
          value={status ?? ''}
          onChange={(event) =>
            setStatus(
              (event.target.value || undefined) as
                'used' | 'unused' | undefined,
            )
          }
          className={cn(selectClass, 'w-auto min-w-40')}
        >
          <option value="">
            {t('admin.vouchers.filter.label')}: {t('admin.vouchers.filter.all')}
          </option>
          <option value="used">{b('codeStatus.used')}</option>
          <option value="unused">{b('codeStatus.unused')}</option>
        </select>
      }
    >
      {codes.isPending ? (
        <p role="status" className="text-fg-muted p-6 text-center">
          {t('admin.common.loading')}
        </p>
      ) : !codes.data ? (
        <RetryAlert onRetry={() => void codes.refetch()}>
          {b('codesError')}
        </RetryAlert>
      ) : codes.items.length === 0 ? (
        <div className="grid justify-items-center gap-1 p-6 text-center">
          <p className="text-fg font-semibold">
            {b(status === 'used' ? 'noUsedTitle' : 'noCodesTitle')}
          </p>
          <p className="text-fg-muted text-sm">
            {b(status === 'used' ? 'noUsedBody' : 'noCodesBody')}
          </p>
        </div>
      ) : (
        <>
          <div className="-mx-5 hidden overflow-x-auto md:block">
            <table
              aria-label={b('codesLabel')}
              className="w-full min-w-[760px] border-collapse"
            >
              <thead className="bg-surface-muted">
                <tr>
                  {columns.map((c) => (
                    <th key={c} scope="col" className={th}>
                      {b(`codeColumns.${c}`)}
                    </th>
                  ))}
                  <th scope="col" className={th}>
                    <span className="sr-only">{b('codeColumns.actions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border-subtle divide-y">
                {codes.items.map((code) => (
                  <tr key={code.id}>
                    <td className={td}>
                      <span className="flex items-center gap-1">
                        <CodeText code={code.code} />
                        <CopyButton code={code.code} />
                      </span>
                    </td>
                    <td className={td}>
                      <CodeBadge code={code} batchOn={batch.isActive} />
                    </td>
                    <td className={td}>{date(code.redeemedAt)}</td>
                    <td className={td}>
                      <RedeemedBy code={code} />
                    </td>
                    <td className={td}>
                      {canToggle(code) ? <ToggleCode code={code} /> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul
            aria-label={b('codesLabel')}
            className="divide-border-subtle -mx-5 divide-y md:hidden"
          >
            {codes.items.map((code) => (
              <li key={code.id} className="grid gap-1 px-5 py-3">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <CodeText code={code.code} />
                  <CopyButton code={code.code} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CodeBadge code={code} batchOn={batch.isActive} />
                  {canToggle(code) ? <ToggleCode code={code} /> : null}
                </div>
                {code.redeemedAt ? (
                  <p className="text-fg-muted text-sm">
                    {date(code.redeemedAt)} · <RedeemedBy code={code} />
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
          {codes.isError ? (
            <RetryAlert onRetry={() => void codes.fetchNextPage()}>
              {t('admin.vouchers.loadMoreError')}
            </RetryAlert>
          ) : null}
          {codes.hasNextPage ? (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                loading={codes.isFetchingNextPage}
                onClick={() => void codes.fetchNextPage()}
              >
                {t('admin.vouchers.loadMore')}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </Section>
  );
}
