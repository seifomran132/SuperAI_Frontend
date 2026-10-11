import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '~/i18n';
import ar from '~/i18n/ar.json';
import type { AttachmentDraft } from '../../model/attachment-draft';
import { AttachmentTile } from '../AttachmentTile';

const file = new File(['x'], 'a.png', { type: 'image/png' });

function tile(draft: AttachmentDraft) {
  const onRemove = vi.fn();
  const onRetry = vi.fn();
  render(
    <AttachmentTile draft={draft} onRemove={onRemove} onRetry={onRetry} />,
  );
  return { onRemove, onRetry };
}

describe('AttachmentTile', () => {
  it('renders nothing when empty', () => {
    const { container } = render(
      <AttachmentTile
        draft={{ status: 'empty' }}
        onRemove={vi.fn()}
        onRetry={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('uploading shows a progress ring with its value', () => {
    tile({ status: 'uploading', file, previewUrl: 'blob:1', progress: 42 });
    const bar = screen.getByRole('progressbar', {
      name: ar.chat.image.uploading,
    });
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(
      screen.getByRole('button', { name: ar.chat.image.remove }),
    ).toBeInTheDocument();
  });

  it('ready shows the thumbnail, the status and remove', () => {
    const { onRemove } = tile({
      status: 'ready',
      file,
      previewUrl: 'blob:1',
      uploadId: 'u',
    });
    expect(screen.getByText(ar.chat.image.uploaded)).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: ar.chat.image.remove }));
    expect(onRemove).toHaveBeenCalled();
  });

  it.each([
    ['ATTACHMENT_TOO_LARGE', ar.chat.image.errors.ATTACHMENT_TOO_LARGE],
    [
      'ATTACHMENT_TYPE_NOT_ALLOWED',
      ar.chat.image.errors.ATTACHMENT_TYPE_NOT_ALLOWED,
    ],
  ] as const)('%s: message and remove, no retry', (code, text) => {
    tile({ status: 'error', code, retryable: false });
    expect(screen.getByRole('alert')).toHaveTextContent(text);
    expect(
      screen.getByRole('button', { name: ar.chat.image.remove }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: ar.common.retry }),
    ).not.toBeInTheDocument();
  });

  it('a retryable error offers retry and remove', () => {
    const { onRetry } = tile({
      status: 'error',
      code: 'UPLOAD_FAILED',
      retryable: true,
      file,
      previewUrl: 'blob:1',
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      ar.chat.image.errors.UPLOAD_FAILED,
    );
    fireEvent.click(screen.getByRole('button', { name: ar.common.retry }));
    expect(onRetry).toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: ar.chat.image.remove }),
    ).toBeInTheDocument();
  });
});
