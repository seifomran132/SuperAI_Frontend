import { useId } from 'react';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BrandProfileOutDto } from '~/api/generated/types.gen';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import '../i18n';
import { PROFILE_MAX, RULE_MAX, RULES_MAX } from '../model/rules';
import { Counter, textareaClass } from './parts';

export type BrandProfile = BrandProfileOutDto;

export const emptyProfile: BrandProfile = {
  style: '',
  tone: '',
  fontStyle: '',
  dos: [],
  donts: [],
  notes: '',
};

/** True when every field fits its limit (API_CONTRACT §10). */
export function profileFits(profile: BrandProfile) {
  return (
    profile.style.length <= PROFILE_MAX.style &&
    profile.tone.length <= PROFILE_MAX.tone &&
    profile.fontStyle.length <= PROFILE_MAX.fontStyle &&
    profile.notes.length <= PROFILE_MAX.notes &&
    [...profile.dos, ...profile.donts].every((r) => r.length <= RULE_MAX)
  );
}

/** What is sent: rules trimmed, empty rules dropped. */
export function cleanProfile(profile: BrandProfile): BrandProfile {
  const rules = (list: string[]) =>
    list.map((r) => r.trim()).filter((r) => r.length > 0);
  return {
    style: profile.style.trim(),
    tone: profile.tone.trim(),
    fontStyle: profile.fontStyle.trim(),
    dos: rules(profile.dos),
    donts: rules(profile.donts),
    notes: profile.notes.trim(),
  };
}

function TextField({
  label,
  hint,
  value,
  max,
  multiline = false,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  max: number;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const over = value.length > max;
  const describedBy = [hint ? `${id}-hint` : null, `${id}-count`]
    .filter(Boolean)
    .join(' ');
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-fg text-sm font-semibold">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={4}
          value={value}
          aria-invalid={over || undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          className={textareaClass}
        />
      ) : (
        <Input
          id={id}
          value={value}
          aria-invalid={over || undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      <div className="flex items-start justify-between gap-3">
        {hint ? (
          <p id={`${id}-hint`} className="text-fg-muted text-sm">
            {hint}
          </p>
        ) : (
          <span />
        )}
        <Counter id={`${id}-count`} count={value.length} max={max} />
      </div>
      {over ? (
        <p role="alert" className="text-danger text-sm">
          {t('brandKits.profile.tooLong')}
        </p>
      ) : null}
    </div>
  );
}

function RuleList({
  label,
  rules,
  onChange,
}: {
  label: string;
  rules: string[];
  onChange: (rules: string[]) => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const set = (index: number, value: string) =>
    onChange(rules.map((r, i) => (i === index ? value : r)));
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="text-fg mb-2 text-sm font-semibold">{label}</legend>
      <ul className="flex flex-col gap-2">
        {rules.map((rule, index) => {
          const position = index + 1;
          const over = rule.length > RULE_MAX;
          return (
            <li key={index} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Input
                  value={rule}
                  aria-label={t('brandKits.profile.ruleLabel', {
                    list: label,
                    position,
                  })}
                  aria-invalid={over || undefined}
                  aria-describedby={over ? `${id}-${index}-error` : undefined}
                  onChange={(event) => set(index, event.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  aria-label={t('brandKits.profile.removeRule', {
                    list: label,
                    position,
                  })}
                  className="text-danger hover:text-danger"
                  onClick={() => onChange(rules.filter((_, i) => i !== index))}
                >
                  <X aria-hidden="true" />
                </Button>
              </div>
              {over ? (
                <p
                  id={`${id}-${index}-error`}
                  role="alert"
                  className="text-danger text-sm"
                >
                  {t('brandKits.profile.ruleTooLong')}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={rules.length >= RULES_MAX}
          onClick={() => onChange([...rules, ''])}
        >
          <Plus aria-hidden="true" />
          {t('brandKits.profile.addRule')}
        </Button>
        <Counter count={rules.length} max={RULES_MAX} />
      </div>
    </fieldset>
  );
}

/** Style, tone, font style, do's and don'ts, notes (S24 «الأسلوب والتعليمات»). */
export function ProfileFields({
  value,
  onChange,
}: {
  value: BrandProfile;
  onChange: (next: BrandProfile) => void;
}) {
  const { t } = useTranslation();
  const set = <K extends keyof BrandProfile>(key: K, v: BrandProfile[K]) =>
    onChange({ ...value, [key]: v });
  return (
    <div className="flex flex-col gap-5">
      <TextField
        label={t('brandKits.profile.style')}
        value={value.style}
        max={PROFILE_MAX.style}
        onChange={(v) => set('style', v)}
      />
      <TextField
        label={t('brandKits.profile.tone')}
        value={value.tone}
        max={PROFILE_MAX.tone}
        onChange={(v) => set('tone', v)}
      />
      <TextField
        label={t('brandKits.profile.fontStyle')}
        hint={t('brandKits.profile.fontStyleHint')}
        value={value.fontStyle}
        max={PROFILE_MAX.fontStyle}
        onChange={(v) => set('fontStyle', v)}
      />
      <div className="grid gap-5 md:grid-cols-2">
        <RuleList
          label={t('brandKits.profile.dos')}
          rules={value.dos}
          onChange={(v) => set('dos', v)}
        />
        <RuleList
          label={t('brandKits.profile.donts')}
          rules={value.donts}
          onChange={(v) => set('donts', v)}
        />
      </div>
      <TextField
        label={t('brandKits.profile.notes')}
        value={value.notes}
        max={PROFILE_MAX.notes}
        multiline
        onChange={(v) => set('notes', v)}
      />
    </div>
  );
}
