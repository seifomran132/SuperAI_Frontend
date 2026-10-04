import { useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';

/**
 * Password field with a show/hide toggle on the end side. The value is LTR by
 * default; the padding goes on the side the toggle occupies so text never
 * runs under it.
 */
export function PasswordInput({
  className,
  dir = 'ltr',
  ...props
}: Omit<ComponentProps<'input'>, 'type'>) {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  // The toggle sits at the page's end edge. An input whose direction matches
  // the page has its text end there; an opposite one has its text start there.
  const padding = dir === i18n.dir() ? 'pe-14' : 'ps-14';
  return (
    <div className="relative">
      <Input
        {...props}
        dir={dir}
        type={visible ? 'text' : 'password'}
        className={cn(padding, className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={
          visible ? t('common.hidePassword') : t('common.showPassword')
        }
        aria-pressed={visible}
        disabled={props.disabled}
        className="text-fg-muted hover:text-fg focus-visible:outline-focus absolute inset-y-0 end-0 flex w-12 items-center justify-center rounded-e-md outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 disabled:opacity-60"
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="size-5" />
        ) : (
          <Eye aria-hidden="true" className="size-5" />
        )}
      </button>
    </div>
  );
}
