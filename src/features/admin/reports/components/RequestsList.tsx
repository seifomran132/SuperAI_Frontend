import { Link } from '@tanstack/react-router';
import {
  CircleCheck,
  Clock,
  TriangleAlert,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminChatRequestDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { formatActivityDate } from '~/lib/dates';
import { Badge, type BadgeTone } from '../../components/Badge';
import { useModeLabel } from '../../catalog/model/queries';

const th = 'text-fg-muted px-4 py-3 text-start text-sm font-medium';
const td = 'px-4 py-3 text-sm';

const STATUS: Record<
  AdminChatRequestDto['status'],
  { tone: BadgeTone; Icon: LucideIcon }
> = {
  reconciliation_required: { tone: 'warning', Icon: TriangleAlert },
  reserved: { tone: 'info', Icon: Clock },
  settled: { tone: 'success', Icon: CircleCheck },
  released: { tone: 'neutral', Icon: Undo2 },
};

function RequestStatus({ value }: { value: AdminChatRequestDto['status'] }) {
  const { t } = useTranslation();
  const { tone, Icon } = STATUS[value];
  return (
    <Badge tone={tone} Icon={Icon}>
      {t(`admin.reports.requests.status.${value}`)}
    </Badge>
  );
}

/** Money of a request: 4 decimals under 1$; null while the request is still held. */
function Amount({ value }: { value: string | null }) {
  return value === null ? <span>—</span> : <Money value={value} kind="cost" />;
}

function ModelCell({ item }: { item: AdminChatRequestDto }) {
  if (!item.modelDisplayName && !item.providerCode) return <>—</>;
  return (
    <span className="grid gap-0.5">
      <span>{item.modelDisplayName ?? '—'}</span>
      {item.providerCode && item.providerModelId ? (
        <bdi dir="ltr" className="text-fg-muted text-start text-xs">
          {item.providerCode}/{item.providerModelId}
        </bdi>
      ) : null}
    </span>
  );
}

function UserLink({ item }: { item: AdminChatRequestDto }) {
  return (
    <Link
      to="/admin/users/$userId"
      params={{ userId: item.userId }}
      search={{ tab: 'overview' }}
      className="text-fg focus-visible:outline-focus inline-flex min-h-11 items-center rounded-sm break-all underline-offset-4 outline-hidden hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <bdi dir="ltr">{item.userEmail ?? item.userId.slice(0, 8)}</bdi>
    </Link>
  );
}

const MONEY_COLUMNS = [
  ['reserved', 'reservedUsd'],
  ['charged', 'chargedUsd'],
  ['providerCost', 'providerCostUsd'],
  ['absorbed', 'absorbedUsd'],
] as const;

/**
 * Billed requests: a table from `md` up, cards on phones. `showUser` is off on a
 * user's own tab, where every row has the same user.
 */
export function RequestsList({
  items,
  showUser,
  label,
}: {
  items: readonly AdminChatRequestDto[];
  showUser: boolean;
  label: string;
}) {
  const { t, i18n } = useTranslation();
  const modeLabel = useModeLabel();
  const labels = {
    today: t('balance.activity.today'),
    yesterday: t('balance.activity.yesterday'),
  };
  const time = (item: AdminChatRequestDto) =>
    formatActivityDate(item.createdAt, i18n.language, labels);
  const source = (item: AdminChatRequestDto) =>
    t(`admin.reports.requests.source.${item.usageSource}`);
  const column = (key: string) => t(`admin.reports.requests.columns.${key}`);

  return (
    <>
      <div className="relative hidden overflow-x-auto md:block">
        <table
          aria-label={label}
          className="w-full min-w-[1000px] border-collapse"
        >
          <thead className="bg-surface-muted">
            <tr>
              <th scope="col" className={th}>
                {column('time')}
              </th>
              {showUser ? (
                <th scope="col" className={th}>
                  {column('user')}
                </th>
              ) : null}
              <th scope="col" className={th}>
                {column('mode')}
              </th>
              <th scope="col" className={th}>
                {column('model')}
              </th>
              <th scope="col" className={th}>
                {column('status')}
              </th>
              <th scope="col" className={th}>
                {column('source')}
              </th>
              {MONEY_COLUMNS.map(([key]) => (
                <th key={key} scope="col" className={th}>
                  {column(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.requestId}
                className="border-border-subtle border-t"
              >
                <td className={`${td} text-fg-muted whitespace-nowrap`}>
                  {time(item)}
                </td>
                {showUser ? (
                  <td className={td}>
                    <UserLink item={item} />
                  </td>
                ) : null}
                <td className={td}>{modeLabel(item.modeKey)}</td>
                <td className={td}>
                  <ModelCell item={item} />
                </td>
                <td className={td}>
                  <RequestStatus value={item.status} />
                </td>
                <td className={`${td} text-fg-muted`}>{source(item)}</td>
                {MONEY_COLUMNS.map(([key, field]) => (
                  <td key={key} className={td}>
                    <Amount value={item[field]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul aria-label={label} className="grid gap-3 p-3 md:hidden">
        {items.map((item) => (
          <li
            key={item.requestId}
            className="border-border-subtle bg-surface grid gap-3 rounded-md border p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <RequestStatus value={item.status} />
              <span className="text-fg-muted text-sm">{time(item)}</span>
            </div>
            {showUser ? <UserLink item={item} /> : null}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Fact term={column('mode')}>{modeLabel(item.modeKey)}</Fact>
              <Fact term={column('model')}>
                <ModelCell item={item} />
              </Fact>
              <Fact term={column('source')}>{source(item)}</Fact>
              {MONEY_COLUMNS.map(([key, field]) => (
                <Fact key={key} term={column(key)}>
                  <Amount value={item[field]} />
                </Fact>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-fg-muted">{term}</dt>
      <dd className="text-fg mt-0.5 wrap-anywhere">{children}</dd>
    </div>
  );
}
