import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '~/i18n';
import { modeFast, modeProfessional } from '~/mocks/chat';
import { ModeChip, modeTone } from '../mode';

const modes = [modeFast, modeProfessional];

describe('mode colours by position', () => {
  it('maps positions to the mode palette and wraps past it', () => {
    expect(modeTone(1).chip).toContain('mode-1');
    expect(modeTone(2).chip).toContain('mode-2');
    expect(modeTone(3).chip).toContain('mode-1');
  });

  it('colours a chip by where the mode sits in the list, not by its key', () => {
    const { rerender } = render(<ModeChip modeKey="fast" modes={modes} />);
    expect(screen.getByText(modeFast.labelAr).closest('span')).toHaveClass(
      'bg-mode-1-container',
    );
    rerender(<ModeChip modeKey="professional" modes={modes} />);
    expect(
      screen.getByText(modeProfessional.labelAr).closest('span'),
    ).toHaveClass('bg-mode-2-container');
    // Same key, other position: the colour follows the position.
    rerender(<ModeChip modeKey="fast" modes={[modeProfessional, modeFast]} />);
    expect(screen.getByText(modeFast.labelAr).closest('span')).toHaveClass(
      'bg-mode-2-container',
    );
  });

  it('shows nothing for a mode the plan no longer lists', () => {
    const { container } = render(<ModeChip modeKey="gone" modes={modes} />);
    expect(container).toBeEmptyDOMElement();
  });
});
