import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Check, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { VoucherDto } from '~/api/generated/types.gen';
import { Button, buttonVariants } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { KindBadge } from './Badges';
import { VoucherValue } from './VoucherValue';

type CopyState = 'idle' | 'copied' | 'failed';

/** S22 frame 3: the new code, large, with a copy button. */
export function CodeResult({
  voucher,
  onAnother,
}: {
  voucher: VoucherDto;
  onAnother: () => void;
}) {
  const { t } = useTranslation();
  const [state, setState] = useState<CopyState>('idle');
  const codeRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    let next: CopyState = 'copied';
    try {
      await navigator.clipboard.writeText(voucher.code);
    } catch {
      // Clipboard blocked: select the text so Ctrl+C works.
      next = 'failed';
      const node = codeRef.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
    setState(next);
    if (timer.current) clearTimeout(timer.current);
    if (next === 'copied') {
      timer.current = setTimeout(() => setState('idle'), 2000);
    }
  }

  return (
    <section
      aria-labelledby="voucher-created"
      className="bg-surface border-border-subtle grid justify-items-center gap-5 rounded-lg border p-6 text-center sm:p-10"
    >
      <span
        aria-hidden="true"
        className="bg-success-container text-success flex size-12 items-center justify-center rounded-full"
      >
        <Check className="size-6" />
      </span>
      <div className="grid gap-1">
        <h2 id="voucher-created" className="text-fg text-xl font-bold">
          {t('admin.vouchers.createdTitle')}
        </h2>
        <p className="text-fg-muted">{t('admin.vouchers.createdBody')}</p>
      </div>
      <div className="border-border-control w-full max-w-md rounded-lg border-2 border-dashed px-4 py-6">
        <bdi
          dir="ltr"
          ref={codeRef}
          data-testid="voucher-code"
          className="text-fg block text-2xl font-bold break-all select-all sm:text-3xl"
        >
          {voucher.code}
        </bdi>
      </div>
      <div className="text-fg-muted flex flex-wrap items-center justify-center gap-2 text-sm">
        <KindBadge kind={voucher.kind} />
        <VoucherValue voucher={voucher} />
      </div>
      <Button type="button" onClick={() => void copy()}>
        {state === 'copied' ? (
          <Check aria-hidden="true" className="size-5" />
        ) : (
          <Copy aria-hidden="true" className="size-5" />
        )}
        {t('admin.vouchers.copyCode')}
      </Button>
      <p role="status" className="text-fg-muted min-h-6 text-sm">
        {state === 'copied'
          ? t('admin.vouchers.copied')
          : state === 'failed'
            ? t('admin.vouchers.copyFailed')
            : ''}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/admin/vouchers/$voucherId"
          params={{ voucherId: voucher.id }}
          className={cn(buttonVariants({ variant: 'secondary' }))}
        >
          {t('admin.vouchers.openCode')}
        </Link>
        <Button type="button" variant="secondary" onClick={onAnother}>
          {t('admin.vouchers.createAnother')}
        </Button>
        <Link
          to="/admin/vouchers"
          className={cn(buttonVariants({ variant: 'ghost' }))}
        >
          {t('admin.vouchers.backToList')}
        </Link>
      </div>
    </section>
  );
}
