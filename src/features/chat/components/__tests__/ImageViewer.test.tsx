import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '~/i18n';
import ar from '~/i18n/ar.json';
import { ImageViewer } from '../ImageViewer';

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>open</button>
      <ImageViewer open={open} onOpenChange={setOpen} src="blob:x" />
    </>
  );
}

describe('ImageViewer', () => {
  it('has a labelled close button and the image', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('open'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:x');
    fireEvent.click(screen.getByRole('button', { name: ar.chat.image.close }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the opener', async () => {
    render(<Harness />);
    const opener = screen.getByText('open');
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: 'Escape',
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('moves focus inside when it opens', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('open'));
    expect(screen.getByRole('dialog')).toContainElement(
      document.activeElement as HTMLElement,
    );
  });
});
