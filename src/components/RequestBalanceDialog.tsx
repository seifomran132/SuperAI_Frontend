import { X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import { ContactChannels } from '~/components/ContactChannels';
import { Button } from '~/components/ui/button';

/**
 * «طلب رصيد»: balance and plans are added by the team, so this only explains
 * that and lists the contact channels from the brand config (a channel with
 * no value is not rendered). The composer draft is untouched.
 */
export function RequestBalanceDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  onCloseAutoFocus?: (event: Event) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-fg/45 fixed inset-0 z-50" />
        <Dialog.Content
          onCloseAutoFocus={onCloseAutoFocus}
          className="bg-surface fixed inset-0 m-auto h-fit z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[480px] flex-col gap-4 overflow-y-auto rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="text-fg text-xl leading-8 font-bold">
              {t('chat.requestBalance.title')}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('chat.requestBalance.close')}
                className="-mt-2 -me-2"
              >
                <X aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-fg-muted text-base leading-7">
            {t('chat.requestBalance.body')}
          </Dialog.Description>
          <ContactChannels />
          <Dialog.Close asChild>
            <Button variant="secondary" className="w-full">
              {t('chat.requestBalance.close')}
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
