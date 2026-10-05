import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '~/i18n';
import ar from '~/i18n/ar.json';
import { ReasonDialog } from '../ReasonDialog';
import { Section } from '../Section';

function Harness({ removeOpener }: { removeOpener?: boolean }) {
  const [open, setOpen] = useState(false);
  const [gone, setGone] = useState(false);
  return (
    <main>
      <Section title="العنوان">
        {gone ? null : (
          <button type="button" onClick={() => setOpen(true)}>
            فتح
          </button>
        )}
      </Section>
      <ReasonDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next && removeOpener) setGone(true);
        }}
        title="تأكيد"
        description="وصف"
        submitLabel="تنفيذ"
        onSubmit={() => Promise.resolve()}
      />
    </main>
  );
}

describe('ReasonDialog focus', () => {
  it('returns focus to the button that opened it', async () => {
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'فتح' });
    opener.focus();
    fireEvent.click(opener);
    fireEvent.click(
      await screen.findByRole('button', { name: ar.admin.common.cancel }),
    );
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('falls back to the section heading when the opener is gone', async () => {
    render(<Harness removeOpener />);
    const opener = screen.getByRole('button', { name: 'فتح' });
    opener.focus();
    fireEvent.click(opener);
    fireEvent.click(
      await screen.findByRole('button', { name: ar.admin.common.cancel }),
    );
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'العنوان' })).toHaveFocus(),
    );
  });
});
