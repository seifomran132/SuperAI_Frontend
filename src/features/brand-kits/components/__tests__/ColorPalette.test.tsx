import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import '~/i18n';
import ar from '~/test/ar';
import { ColorPalette } from '../ColorPalette';

const c = ar.brandKits.colors;
const fill = (text: string, hex: string) => text.replace('{{hex}}', hex);

function Harness({
  initial,
  suggested,
  onChange,
}: {
  initial: string[];
  suggested?: string[];
  onChange?: (v: string[]) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <ColorPalette
      value={value}
      suggested={suggested}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

const typeHex = (hex: string) => {
  fireEvent.change(screen.getByLabelText(c.hexLabel), {
    target: { value: hex },
  });
  fireEvent.click(screen.getByRole('button', { name: c.add }));
};

describe('ColorPalette', () => {
  it('adds a typed colour as #RRGGBB and marks the first as main', () => {
    const onChange = vi.fn();
    render(<Harness initial={['#7A3E1D']} onChange={onChange} />);
    typeHex('abc');
    expect(onChange).toHaveBeenLastCalledWith(['#7A3E1D', '#AABBCC']);
    expect(screen.getAllByText(c.main)).toHaveLength(1);
  });

  it('refuses an invalid or repeated colour', () => {
    render(<Harness initial={['#7A3E1D']} />);
    typeHex('nope');
    expect(screen.getByRole('alert')).toHaveTextContent(c.invalid);
    typeHex('#7a3e1d');
    expect(screen.getByRole('alert')).toHaveTextContent(c.duplicate);
  });

  it('moves and removes colours', () => {
    const onChange = vi.fn();
    render(<Harness initial={['#111111', '#222222']} onChange={onChange} />);
    expect(
      screen.getByRole('button', { name: fill(c.earlier, '#111111') }),
    ).toBeDisabled();
    fireEvent.click(
      screen.getByRole('button', { name: fill(c.later, '#111111') }),
    );
    expect(onChange).toHaveBeenLastCalledWith(['#222222', '#111111']);
    fireEvent.click(
      screen.getByRole('button', { name: fill(c.remove, '#222222') }),
    );
    expect(onChange).toHaveBeenLastCalledWith(['#111111']);
  });

  it('offers suggested colours without adding them', () => {
    const onChange = vi.fn();
    render(
      <Harness
        initial={['#111111']}
        suggested={['#111111', '#e8b04b']}
        onChange={onChange}
      />,
    );
    expect(screen.getByText(c.suggestedTitle)).toBeInTheDocument();
    // Already in the palette: not offered again.
    expect(
      screen.queryByRole('button', {
        name: fill(c.addSuggestedLabel, '#111111'),
      }),
    ).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('button', {
        name: fill(c.addSuggestedLabel, '#E8B04B'),
      }),
    );
    expect(onChange).toHaveBeenLastCalledWith(['#111111', '#E8B04B']);
  });

  it('stops at 12 colours', () => {
    const twelve = Array.from(
      { length: 12 },
      (_, i) => `#0000${i.toString(16).padStart(2, '0').toUpperCase()}`,
    );
    render(<Harness initial={twelve} />);
    expect(screen.getByRole('button', { name: c.add })).toBeDisabled();
    expect(screen.getByText(c.full)).toBeInTheDocument();
  });
});
