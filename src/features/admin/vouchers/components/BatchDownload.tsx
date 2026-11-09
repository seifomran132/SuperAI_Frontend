import { useState } from 'react';
import { Download, TriangleAlert, X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import { Alert } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { downloadBatchCsv } from '../model/batches';

/** S23 frame 5: the live-codes warning opens before every download. */
export function BatchDownload({
  batch,
  primary = false,
}: {
  batch: { id: string; name: string };
  primary?: boolean;
}) {
  const { t } = useTranslation();
  const b = (key: string) => t(`admin.vouchers.batches.${key}`);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function download() {
    setBusy(true);
    setFailed(false);
    try {
      await downloadBatchCsv(batch);
      setOpen(false);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        setOpen(next);
        if (next) setFailed(false);
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant={primary ? 'primary' : 'secondary'}>
          <Download aria-hidden="true" className="size-5" />
          {b('download')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-fg/45 fixed inset-0 z-50" />
        <Dialog.Content className="bg-surface fixed inset-0 z-50 m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md flex-col gap-4 overflow-y-auto rounded-lg p-6">
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="text-fg text-xl leading-8 font-bold">
              {b('downloadTitle')}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('admin.common.cancel')}
              >
                <X aria-hidden="true" className="size-5" />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description asChild>
            <div className="bg-warning-container border-warning-border text-fg flex items-start gap-2 rounded-md border p-3 text-sm">
              <TriangleAlert
                aria-hidden="true"
                className="text-warning mt-0.5 size-4 shrink-0"
              />
              <span>
                <strong className="block">{b('warningTitle')}</strong>
                {b('warningBody')}
              </span>
            </div>
          </Dialog.Description>
          <p className="text-fg-muted text-sm">{b('warningNote')}</p>
          {failed ? (
            <Alert variant="danger">
              <strong className="block">{b('downloadFailed')}</strong>
              {b('downloadFailedBody')}
            </Alert>
          ) : null}
          <div className="flex flex-wrap justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="secondary" disabled={busy}>
                {t('admin.common.cancel')}
              </Button>
            </Dialog.Close>
            <Button loading={busy} onClick={() => void download()}>
              {busy ? b('downloading') : b('downloadFile')}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
