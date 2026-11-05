import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '~/i18n';
import ar from '~/i18n/ar.json';
import { message } from '~/mocks/chat';
import type {
  AttachmentImageResult,
  MessageAttachment,
} from '../../model/image-input';
import { UserMessage } from '../MessageCard';
import { MessageImage } from '../MessageImage';

const att: MessageAttachment = {
  id: 'a1',
  mimeType: 'image/png',
  width: 400,
  height: 300,
};
const result = (r: Partial<AttachmentImageResult>) => () => ({
  url: undefined,
  isPending: false,
  isError: false,
  refetch: vi.fn(),
  ...r,
});

describe('MessageImage', () => {
  it('shows a labelled placeholder at the stored ratio while loading', () => {
    render(
      <MessageImage attachment={att} useImage={result({ isPending: true })} />,
    );
    const box = screen.getByRole('status', { name: ar.chat.image.loading });
    expect(box.style.aspectRatio).toBe('400 / 300');
    expect(box.style.maxHeight).toBe('240px');
  });

  it('shows the image, capped at 240px, and opens the viewer', async () => {
    render(
      <MessageImage attachment={att} useImage={result({ url: 'blob:1' })} />,
    );
    expect(screen.getByRole('img')).toHaveStyle({ maxHeight: '240px' });
    const opener = screen.getByRole('button', { name: ar.chat.image.view });
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: 'Escape',
    });
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('shows the failure with a working retry', () => {
    const refetch = vi.fn();
    render(
      <MessageImage
        attachment={att}
        useImage={result({ isError: true, refetch })}
      />,
    );
    expect(screen.getByText(ar.chat.image.loadFailed)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    expect(refetch).toHaveBeenCalled();
  });

  it('an image-only user message renders without a text bubble', () => {
    const m = message({ sequence: 1, role: 'user', content: '' });
    render(
      <UserMessage
        message={m}
        attachments={[att]}
        useImage={result({ url: 'blob:1' })}
      />,
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('shows three images in order, smaller, each opening the viewer', () => {
    const m = message({ sequence: 1, role: 'user', content: 'نص' });
    const atts: MessageAttachment[] = ['a1', 'a2', 'a3'].map((id) => ({
      ...att,
      id,
    }));
    const requested: string[] = [];
    const useImage = (id: string) => {
      requested.push(id);
      return {
        url: `blob:${id}`,
        isPending: false,
        isError: false,
        refetch: vi.fn(),
      };
    };
    render(<UserMessage message={m} attachments={atts} useImage={useImage} />);
    expect(Array.from(new Set(requested))).toEqual(['a1', 'a2', 'a3']);
    const imgs = screen.getAllByRole('img');
    expect(imgs.map((i) => i.getAttribute('src'))).toEqual([
      'blob:a1',
      'blob:a2',
      'blob:a3',
    ]);
    expect(imgs[0]).toHaveStyle({ maxHeight: '140px' });
    const openers = screen.getAllByRole('button', { name: ar.chat.image.view });
    expect(openers).toHaveLength(3);
    openers.forEach((opener, i) => {
      fireEvent.click(opener);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByRole('img').getAttribute('src')).toBe(
        `blob:a${i + 1}`,
      );
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: 'Escape',
      });
    });
  });

  it('without attachments the message renders as before', () => {
    const m = message({ sequence: 1, role: 'user', content: 'نص' });
    render(<UserMessage message={m} />);
    expect(screen.getByText('نص')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
