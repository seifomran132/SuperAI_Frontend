import { useId, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Dialog } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import { isApiError } from '~/api/errors';
import { meBrandKitsCreateMutation } from '~/api/generated/@tanstack/react-query.gen';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import '../i18n';
import { refreshKits } from '../model/queries';
import { NAME_MAX } from '../model/rules';
import { Counter } from './parts';

/** S24 frame 2: the name only; the kit page opens after it is created. */
export function NewKitDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [missing, setMissing] = useState(false);
  const create = useMutation({
    ...meBrandKitsCreateMutation(),
    onSuccess: (kit) => {
      refreshKits(qc);
      onOpenChange(false);
      void navigate({
        to: '/brands/$brandKitId',
        params: { brandKitId: kit.id },
      });
    },
  });
  const error = create.error;
  const over = name.length > NAME_MAX;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (create.isPending) return;
        onOpenChange(next);
        if (!next) {
          setName('');
          setMissing(false);
          create.reset();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="bg-fg/45 fixed inset-0 z-50" />
        <Dialog.Content className="bg-surface fixed inset-x-0 bottom-0 z-50 flex max-h-[calc(100dvh-2rem)] flex-col gap-4 overflow-y-auto rounded-t-lg p-6 sm:inset-0 sm:m-auto sm:h-fit sm:w-[calc(100%-2rem)] sm:max-w-md sm:rounded-lg">
          <Dialog.Title className="text-fg text-xl font-bold">
            {t('brandKits.newDialog.title')}
          </Dialog.Title>
          <Dialog.Description className="text-fg-muted text-sm">
            {t('brandKits.newDialog.body')}
          </Dialog.Description>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const value = name.trim();
              if (!value) return setMissing(true);
              if (over) return;
              create.mutate({ body: { name: value } });
            }}
          >
            <div className="flex flex-col gap-2">
              <label htmlFor={id} className="text-fg text-sm font-semibold">
                {t('brandKits.identity.label')}
              </label>
              <Input
                id={id}
                dir="auto"
                value={name}
                autoFocus
                aria-invalid={missing || over || undefined}
                aria-describedby={`${id}-count${missing ? ` ${id}-error` : ''}`}
                onChange={(event) => {
                  setName(event.target.value);
                  setMissing(false);
                }}
              />
              <Counter
                id={`${id}-count`}
                count={name.length}
                max={NAME_MAX}
                className="self-end"
              />
              {missing ? (
                <p
                  id={`${id}-error`}
                  role="alert"
                  className="text-danger text-sm"
                >
                  {t('brandKits.identity.required')}
                </p>
              ) : null}
            </div>
            {error ? (
              <Alert variant="danger">
                {isApiError(error)
                  ? t(`errors:${error.code}`, {
                      defaultValue: t('brandKits.saveError'),
                    })
                  : t('brandKits.saveError')}
              </Alert>
            ) : null}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary">
                  {t('brandKits.newDialog.cancel')}
                </Button>
              </Dialog.Close>
              <Button type="submit" loading={create.isPending}>
                {t('brandKits.newDialog.create')}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
