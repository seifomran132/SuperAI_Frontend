import type { CSSProperties } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTranslation } from 'react-i18next';

/** Styled through sonner's CSS variables mapped to our tokens; one light theme only. */
export function Toaster(props: ToasterProps) {
  const { t, i18n } = useTranslation();
  return (
    <Sonner
      theme="light"
      position="top-center"
      dir={i18n.dir()}
      richColors
      closeButton
      containerAriaLabel={t('common.notifications')}
      toastOptions={{ closeButtonAriaLabel: t('common.closeNotification') }}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--color-surface)',
          '--normal-text': 'var(--color-fg)',
          '--normal-border': 'var(--color-border-subtle)',
          '--success-bg': 'var(--color-success-container)',
          '--success-text': 'var(--color-success)',
          '--success-border': 'var(--color-success)',
          '--error-bg': 'var(--color-danger-container)',
          '--error-text': 'var(--color-danger)',
          '--error-border': 'var(--color-danger-border)',
          '--warning-bg': 'var(--color-warning-container)',
          '--warning-text': 'var(--color-warning)',
          '--warning-border': 'var(--color-warning-border)',
          '--border-radius': 'var(--radius-md)',
          fontFamily: 'var(--font-sans)',
        } as CSSProperties
      }
      {...props}
    />
  );
}
