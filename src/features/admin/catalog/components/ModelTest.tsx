import type { ReactNode } from 'react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FlaskConical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminModelsControllerTestMutation } from '~/api/generated/@tanstack/react-query.gen';
import type { ModelDto, ModelTestResultDto } from '~/api/generated/types.gen';
import { Money } from '~/components/Money';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { TextAreaField, TextField } from '../../components/FormControls';
import { ReasonDialog } from '../../components/ReasonDialog';
import { Section } from '../../components/Section';
import { integerError } from '../model/form';

const MAX_PROMPT = 500;
const MAX_OUTPUT = 256;

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-fg-muted text-sm">{label}</dt>
      <dd className="text-fg tabular-nums">{children}</dd>
    </div>
  );
}

const ms = (value: number | null) =>
  value === null ? null : `${value.toLocaleString('en')} ms`;

function TestResult({ result }: { result: ModelTestResultDto }) {
  const { t } = useTranslation();
  const none = t('admin.common.none');
  return (
    <div className="grid gap-4" aria-live="polite">
      <Alert variant={result.ok ? 'success' : 'danger'}>
        {t(result.ok ? 'admin.models.test.ok' : 'admin.models.test.failed')}
        {result.error ? (
          <>
            {' '}
            {t(`errors:${result.error.code}`)}{' '}
            <bdi dir="ltr" className="break-all">
              {result.error.detail}
            </bdi>
          </>
        ) : null}
      </Alert>
      <div className="grid gap-1">
        <h4 className="text-fg text-sm font-medium">
          {t('admin.models.test.reply')}
        </h4>
        <p
          dir="auto"
          className="bg-surface-muted border-border-subtle max-h-72 overflow-y-auto rounded-md border p-3 text-base whitespace-pre-wrap"
        >
          {result.reply || none}
        </p>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t('admin.models.test.finishReason')}>
          <bdi dir="ltr">{result.finishReason}</bdi>
        </Stat>
        <Stat label={t('admin.models.test.providerCost')}>
          {result.providerCostUsd ? (
            <Money value={result.providerCostUsd} kind="exact" />
          ) : (
            none
          )}
        </Stat>
        <Stat label={t('admin.models.test.customerCharge')}>
          {result.customerChargeUsd ? (
            <Money value={result.customerChargeUsd} kind="exact" />
          ) : (
            none
          )}
        </Stat>
        <Stat label={t('admin.models.test.firstChunk')}>
          <bdi dir="ltr">{ms(result.firstChunkMs) ?? none}</bdi>
        </Stat>
        <Stat label={t('admin.models.test.duration')}>
          <bdi dir="ltr">{ms(result.durationMs)}</bdi>
        </Stat>
        {result.usage ? (
          <>
            <Stat label={t('admin.models.test.inputTokens')}>
              {result.usage.inputTokens}
            </Stat>
            <Stat label={t('admin.models.test.cachedTokens')}>
              {result.usage.cachedInputTokens}
            </Stat>
            <Stat label={t('admin.models.test.cacheWriteTokens')}>
              {result.usage.cacheWriteTokens}
            </Stat>
            <Stat label={t('admin.models.test.outputTokens')}>
              {result.usage.outputTokens}
            </Stat>
          </>
        ) : null}
      </dl>
    </div>
  );
}

function TestDialog({
  model,
  onClose,
  onResult,
}: {
  model: ModelDto;
  onClose: () => void;
  onResult: (result: ModelTestResultDto) => void;
}) {
  const { t } = useTranslation();
  const mutation = useMutation(adminModelsControllerTestMutation());
  const [prompt, setPrompt] = useState('');
  const [maxOutput, setMaxOutput] = useState('64');
  const [error, setError] = useState<string | undefined>();
  const [promptError, setPromptError] = useState<string | undefined>();
  return (
    <ReasonDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('admin.models.test.confirmTitle')}
      description={model.displayName}
      submitLabel={t('admin.models.test.confirmSubmit')}
      notice={
        <Alert variant="warning">
          <strong className="block">
            {t('admin.models.test.paidWarning')}
          </strong>
          {t('admin.models.test.paidWarningBody')}
        </Alert>
      }
      validate={() => {
        const problem = integerError(maxOutput, MAX_OUTPUT);
        const promptProblem =
          prompt.length > MAX_PROMPT ? 'models.test.promptTooLong' : null;
        setError(problem ? t('admin.models.test.maxOutputInvalid') : undefined);
        setPromptError(promptProblem ? t(`admin.${promptProblem}`) : undefined);
        return {
          ...(problem ? { maxOutputTokens: problem } : {}),
          ...(promptProblem ? { prompt: promptProblem } : {}),
        } as Record<string, string>;
      }}
      fields={() => (
        <>
          <TextAreaField
            label={t('admin.models.test.prompt')}
            hint={t('admin.models.test.promptHint')}
            value={prompt}
            error={promptError}
            counter={`${prompt.length} / ${MAX_PROMPT}`}
            onChange={(x) => {
              setPrompt(x);
              setPromptError(undefined);
            }}
          />
          <TextField
            label={t('admin.models.test.maxOutput')}
            hint={t('admin.models.test.maxOutputHint')}
            dir="ltr"
            inputMode="numeric"
            value={maxOutput}
            error={error}
            onChange={(x) => {
              setMaxOutput(x);
              setError(undefined);
            }}
          />
        </>
      )}
      onSubmit={async ({ reason }) => {
        const result = await mutation.mutateAsync({
          path: { id: model.id },
          body: {
            reason,
            ...(prompt.trim() ? { prompt: prompt.trim() } : {}),
            maxOutputTokens: parseInt(maxOutput, 10),
          },
        });
        onResult(result);
      }}
    />
  );
}

/** Paid test request: only sent after the confirmation dialog. */
export function ModelTest({ model }: { model: ModelDto }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ModelTestResultDto | null>(null);
  return (
    <Section
      title={t('admin.models.test.title')}
      actions={
        <Button variant="secondary" onClick={() => setOpen(true)}>
          <FlaskConical aria-hidden="true" className="size-5" />
          {t('admin.models.test.open')}
        </Button>
      }
    >
      <p className="text-fg-muted text-sm">{t('admin.models.test.intro')}</p>
      {result ? <TestResult result={result} /> : null}
      {open ? (
        <TestDialog
          model={model}
          onClose={() => setOpen(false)}
          onResult={setResult}
        />
      ) : null}
    </Section>
  );
}
