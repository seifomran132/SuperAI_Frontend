import { Fragment, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AuditEntryDto } from '~/api/generated/types.gen';
import { formatActivityDate } from '~/lib/dates';
import { cn } from '~/lib/utils';
import { ShortId } from '../../components/ShortId';

const th = 'text-fg-muted px-4 py-3 text-start text-sm font-medium';
const td = 'px-4 py-3 text-sm align-top';

function Actor({ entry }: { entry: AuditEntryDto }) {
  const { t } = useTranslation();
  const name = entry.actorLabel ?? entry.actorEmail;
  return (
    <span className="grid gap-0.5">
      {name ? (
        <bdi dir="ltr" className="text-start break-all">
          {name}
        </bdi>
      ) : (
        <span>{t(`admin.reports.audit.actorType.${entry.actorType}`)}</span>
      )}
      <span className="text-fg-muted flex flex-wrap items-center gap-x-2 text-xs">
        {name ? (
          <span>{t(`admin.reports.audit.actorType.${entry.actorType}`)}</span>
        ) : null}
        {entry.actorId ? <ShortId value={entry.actorId} /> : null}
      </span>
    </span>
  );
}

function Resource({ entry }: { entry: AuditEntryDto }) {
  return (
    <span className="grid gap-0.5">
      <bdi dir="ltr" className="text-start">
        {entry.resourceType}
      </bdi>
      <ShortId value={entry.resourceId} />
    </span>
  );
}

function JsonBlock({
  title,
  value,
  emptyText,
}: {
  title: string;
  value: AuditEntryDto['oldValue'];
  emptyText: string;
}) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <h4 className="text-fg text-sm font-medium">{title}</h4>
      {value === null ? (
        <p className="text-fg-muted border-border-subtle rounded-md border border-dashed p-3 text-sm">
          {emptyText}
        </p>
      ) : (
        <pre
          dir="ltr"
          tabIndex={0}
          aria-label={title}
          className="bg-code-bg text-code-fg border-code-border focus-visible:outline-focus overflow-x-auto rounded-md border p-3 text-start font-mono text-xs leading-5 outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2"
        >
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
}

/** Old value on the right (first in the DOM), new on the left; stacked on phones. */
function Details({ entry }: { entry: AuditEntryDto }) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <JsonBlock
          title={t('admin.reports.audit.oldValue')}
          value={entry.oldValue}
          emptyText={t('admin.reports.audit.noOldValue')}
        />
        <JsonBlock
          title={t('admin.reports.audit.newValue')}
          value={entry.newValue}
          emptyText={t('admin.reports.audit.noNewValue')}
        />
      </div>
      <p className="text-sm">
        <span className="text-fg-muted">
          {t('admin.reports.audit.columns.reason')}:{' '}
        </span>
        {entry.reason ?? '—'}
      </p>
    </div>
  );
}

function Toggle({
  entry,
  open,
  onToggle,
  controls,
}: {
  entry: AuditEntryDto;
  open: boolean;
  onToggle: () => void;
  controls: string;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={`${t(open ? 'admin.reports.audit.collapse' : 'admin.reports.audit.expand')}: ${entry.action}`}
      onClick={onToggle}
      className="text-fg-muted hover:text-fg focus-visible:outline-focus inline-flex size-11 items-center justify-center rounded-md outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2"
    >
      <ChevronDown
        aria-hidden="true"
        className={cn('size-5 transition-transform', open && 'rotate-180')}
      />
    </button>
  );
}

/** Audit rows: a table from `md` up, cards on phones; a row expands to old and new values. */
export function AuditList({
  entries,
  label,
}: {
  entries: readonly AuditEntryDto[];
  label: string;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const labels = {
    today: t('balance.activity.today'),
    yesterday: t('balance.activity.yesterday'),
  };
  const time = (entry: AuditEntryDto) =>
    formatActivityDate(entry.occurredAt, i18n.language, labels);
  const c = (key: string) => t(`admin.reports.audit.columns.${key}`);

  return (
    <>
      <div className="relative hidden overflow-x-auto md:block">
        <table
          aria-label={label}
          className="w-full min-w-[860px] border-collapse"
        >
          <thead className="bg-surface-muted">
            <tr>
              <th scope="col" className={th}>
                {c('time')}
              </th>
              <th scope="col" className={th}>
                {c('actor')}
              </th>
              <th scope="col" className={th}>
                {c('action')}
              </th>
              <th scope="col" className={th}>
                {c('resource')}
              </th>
              <th scope="col" className={th}>
                {c('reason')}
              </th>
              <th scope="col" className={th}>
                <span className="sr-only">{c('details')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isOpen = open.has(entry.id);
              const panel = `audit-row-${entry.id}`;
              return (
                <Fragment key={entry.id}>
                  <tr className="border-border-subtle border-t">
                    <td className={`${td} text-fg-muted whitespace-nowrap`}>
                      {time(entry)}
                    </td>
                    <td className={td}>
                      <Actor entry={entry} />
                    </td>
                    <td className={td}>
                      <bdi dir="ltr" className="break-all">
                        {entry.action}
                      </bdi>
                    </td>
                    <td className={td}>
                      <Resource entry={entry} />
                    </td>
                    <td className={`${td} text-fg-muted max-w-64`}>
                      {entry.reason ?? '—'}
                    </td>
                    <td className="px-2 py-1 align-top">
                      <Toggle
                        entry={entry}
                        open={isOpen}
                        controls={panel}
                        onToggle={() => toggle(entry.id)}
                      />
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr id={panel} className="bg-surface-muted">
                      <td colSpan={6} className="p-4">
                        <Details entry={entry} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul aria-label={label} className="grid gap-3 p-3 md:hidden">
        {entries.map((entry) => {
          const isOpen = open.has(entry.id);
          const panel = `audit-card-${entry.id}`;
          return (
            <li
              key={entry.id}
              className="border-border-subtle bg-surface grid gap-3 rounded-md border p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="grid min-w-0 gap-1">
                  <bdi dir="ltr" className="text-fg font-medium break-all">
                    {entry.action}
                  </bdi>
                  <span className="text-fg-muted text-sm">{time(entry)}</span>
                </div>
                <Toggle
                  entry={entry}
                  open={isOpen}
                  controls={panel}
                  onToggle={() => toggle(entry.id)}
                />
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="min-w-0">
                  <dt className="text-fg-muted">{c('actor')}</dt>
                  <dd>
                    <Actor entry={entry} />
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-fg-muted">{c('resource')}</dt>
                  <dd>
                    <Resource entry={entry} />
                  </dd>
                </div>
              </dl>
              <p className="text-fg-muted text-sm">
                {c('reason')}: {entry.reason ?? '—'}
              </p>
              {isOpen ? (
                <div id={panel}>
                  <Details entry={entry} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
