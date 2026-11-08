import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { maskDate, parseDay, periodError } from '~/lib/period';
import { TextField } from '../../components/FormControls';

import { isUuid, type AuditSearch } from '../model/search';

type Errors = Partial<Record<'actorId' | 'from' | 'to', string>>;

/** Free-text filters until the backend offers facets (F9 §7); applied with the button. */
export function AuditFilters({
  value,
  onApply,
  onClear,
  canClear,
}: {
  value: AuditSearch;
  onApply: (next: AuditSearch) => void;
  onClear: () => void;
  canClear: boolean;
}) {
  const { t } = useTranslation();
  const [action, setAction] = useState(value.action ?? '');
  const [resourceType, setResourceType] = useState(value.resourceType ?? '');
  const [resourceId, setResourceId] = useState(value.resourceId ?? '');
  const [actorId, setActorId] = useState(value.actorId ?? '');
  const [from, setFrom] = useState(value.from ?? '');
  const [to, setTo] = useState(value.to ?? '');
  const [errors, setErrors] = useState<Errors>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    const admin = actorId.trim();
    if (admin && !isUuid(admin))
      next.actorId = t('admin.reports.audit.errors.actorId');
    if (from && parseDay(from) === null)
      next.from = t('reports.period.errors.invalid');
    if (to && parseDay(to) === null)
      next.to = t('reports.period.errors.invalid');
    if (!next.from && !next.to && from && to) {
      const range = periodError(from, to);
      if (range) next[range.field] = t(`reports.period.errors.${range.key}`);
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onApply({
      action: action.trim() || undefined,
      resourceType: resourceType.trim() || undefined,
      resourceId: resourceId.trim() || undefined,
      actorId: admin || undefined,
      from: from || undefined,
      to: to || undefined,
    });
  };

  return (
    <form
      noValidate
      onSubmit={submit}
      aria-label={t('admin.reports.audit.filters.label')}
      className="bg-surface border-border-subtle grid gap-4 rounded-lg border p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TextField
          label={t('admin.reports.audit.filters.action')}
          dir="ltr"
          autoComplete="off"
          value={action}
          onChange={setAction}
        />
        <TextField
          label={t('admin.reports.audit.filters.resourceType')}
          dir="ltr"
          autoComplete="off"
          value={resourceType}
          onChange={setResourceType}
        />
        <TextField
          label={t('admin.reports.audit.filters.resourceId')}
          dir="ltr"
          autoComplete="off"
          value={resourceId}
          onChange={setResourceId}
        />
        <TextField
          label={t('admin.reports.audit.filters.actorId')}
          hint={t('admin.reports.audit.filters.actorIdHint')}
          error={errors.actorId}
          dir="ltr"
          autoComplete="off"
          value={actorId}
          onChange={(v) => setActorId(v.trim())}
        />
        <TextField
          label={t('reports.period.from')}
          error={errors.from}
          dir="ltr"
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          placeholder={t('reports.period.datePlaceholder')}
          value={from}
          onChange={(v) => setFrom(maskDate(v))}
        />
        <TextField
          label={t('reports.period.to')}
          error={errors.to}
          dir="ltr"
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          placeholder={t('reports.period.datePlaceholder')}
          value={to}
          onChange={(v) => setTo(maskDate(v))}
        />
      </div>
      <p className="text-fg-subtle text-sm">
        {t('admin.reports.audit.filters.datesHint')}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="submit">{t('admin.reports.audit.filters.apply')}</Button>
        {canClear ? (
          <Button type="button" variant="secondary" onClick={onClear}>
            {t('admin.reports.audit.filters.clear')}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
