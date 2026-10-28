import { createRef } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '~/i18n';
import { createQueryClient } from '~/api/query-client';
import type { ModeDto } from '~/api/generated/types.gen';
import ar from '~/i18n/ar.json';
import { message, modeFast, modeProfessional } from '~/mocks/chat';
import { NEW_CHAT, useChatStore } from '../../model/chat-store';
import { modesKey } from '../../model/queries';
import type { useSendMessage } from '../../model/useSendMessage';
import { Composer } from '../Composer';
import { EmptyState } from '../EmptyState';
import { GeneratedImage } from '../GeneratedImage';
import { AssistantMessage } from '../MessageCard';
import { ModeSelector } from '../ModeSelector';

const download = vi.hoisted(() => vi.fn());
vi.mock('../../model/attachment-download', () => ({
  downloadAttachment: download,
}));
const toastError = vi.hoisted(() => vi.fn());
vi.mock('sonner', () => ({ toast: { error: toastError } }));

const modeImage: ModeDto = {
  ...modeProfessional,
  key: 'design',
  labelAr: 'تصميم',
  labelEn: 'Design',
  generatesImages: true,
};
const modes = [modeFast, modeProfessional, modeImage];
const att = { id: 'a1', mimeType: 'image/webp', width: 400, height: 300 };

const send = {
  send: vi.fn(),
  retry: vi.fn(),
  stop: vi.fn(),
  isBusy: false,
  canSend: true,
  status: 'idle',
} as unknown as ReturnType<typeof useSendMessage>;

function setupComposer(modeKey: string, busy = false) {
  const qc = createQueryClient();
  qc.setQueryData(modesKey(), modes);
  useChatStore.getState().setMode(NEW_CHAT, modeKey);
  render(
    <QueryClientProvider client={qc}>
      <Composer
        storeKey={NEW_CHAT}
        send={{ ...send, isBusy: busy } as typeof send}
        noPlan={false}
        textareaRef={createRef<HTMLTextAreaElement>()}
      />
    </QueryClientProvider>,
  );
}

/** Radix menus open on pointerdown, everything else on click. */
function click(el: HTMLElement) {
  if (el.getAttribute('aria-haspopup') === 'menu') {
    fireEvent.pointerDown(el, { button: 0, pointerType: 'mouse' });
  } else {
    fireEvent.click(el);
  }
}

const ratioButton = () =>
  screen.getByRole('button', { name: new RegExp(ar.chat.image.ratio) });
const sendButton = () =>
  screen.getByRole('button', { name: ar.chat.composer.send });

beforeEach(() => {
  useChatStore.getState().reset();
  vi.clearAllMocks();
});

describe('mode picker image badge', () => {
  it('marks only image modes with the image badge', async () => {
    render(<ModeSelector modes={modes} modeKey="fast" onSelect={vi.fn()} />);
    click(screen.getByRole('button', { name: /سريع/ }));
    const items = screen.getAllByRole('menuitemradio');
    expect(within(items[2]!).getByText(ar.chat.image.imageBadge)).toBeVisible();
    expect(within(items[0]!).queryByText(ar.chat.image.imageBadge)).toBeNull();
  });
});

describe('ratio menu', () => {
  it('is absent in a text mode', () => {
    setupComposer('fast');
    expect(
      screen.queryByRole('button', { name: new RegExp(ar.chat.image.ratio) }),
    ).toBeNull();
  });

  it('sends no imageOptions while automatic', async () => {
    setupComposer('design');
    expect(screen.getByText(ar.chat.image.ratioAuto)).toBeVisible();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'قطة' } });
    click(sendButton());
    expect(send.send).toHaveBeenCalledWith('قطة', 'design');
  });

  it('sends the chosen ratio and shows it on the chip', async () => {
    setupComposer('design');
    click(ratioButton());
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(6);
    click(screen.getByRole('menuitemradio', { name: /16:9/ }));
    expect(useChatStore.getState().aspectRatios[NEW_CHAT]).toBe('16:9');
    expect(ratioButton()).toHaveTextContent('16:9');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'قطة' } });
    click(sendButton());
    expect(send.send).toHaveBeenCalledWith('قطة', 'design', {
      imageOptions: { aspectRatio: '16:9' },
    });
  });

  it('is disabled while an answer streams', () => {
    setupComposer('design', true);
    expect(ratioButton()).toBeDisabled();
  });
});

describe('GeneratedImage', () => {
  const ready = () => ({
    url: 'blob:x',
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  });

  it('shows the placeholder, then the image', () => {
    const { rerender } = render(
      <GeneratedImage
        attachment={att}
        useImage={() => ({ ...ready(), url: undefined, isPending: true })}
      />,
    );
    expect(screen.getByRole('status')).toHaveStyle({
      aspectRatio: '400 / 300',
    });
    rerender(<GeneratedImage attachment={att} useImage={ready} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:x');
  });

  it('opens the viewer at full size', async () => {
    render(<GeneratedImage attachment={att} useImage={ready} />);
    click(screen.getByRole('button', { name: ar.chat.image.openFull }));
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('downloads from the button and from the viewer', async () => {
    download.mockResolvedValue(undefined);
    render(<GeneratedImage attachment={att} useImage={ready} />);
    const cardButton = () =>
      screen.getByRole('button', { name: ar.chat.image.download });
    click(cardButton());
    expect(download).toHaveBeenCalledWith('a1');
    // One click saves one copy: the next download waits for this one.
    await vi.waitFor(() => expect(cardButton()).toBeEnabled());
    click(screen.getByRole('button', { name: ar.chat.image.openFull }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(
      within(dialog).getByRole('button', { name: ar.chat.image.download }),
    );
    expect(download).toHaveBeenCalledTimes(2);
  });

  it('ignores a second download click while one is running', async () => {
    let finish: () => void = () => undefined;
    download.mockImplementation(
      () => new Promise<void>((resolve) => (finish = resolve)),
    );
    render(<GeneratedImage attachment={att} useImage={ready} />);
    click(screen.getByRole('button', { name: ar.chat.image.openFull }));
    const viewerDownload = within(screen.getByRole('dialog')).getByRole(
      'button',
      { name: ar.chat.image.download },
    );
    fireEvent.click(viewerDownload);
    await vi.waitFor(() => expect(viewerDownload).toBeDisabled());
    fireEvent.click(viewerDownload);
    expect(download).toHaveBeenCalledTimes(1);
    finish();
    await vi.waitFor(() => expect(viewerDownload).toBeEnabled());
  });

  it('toasts when the download fails', async () => {
    download.mockRejectedValue(new Error('x'));
    render(<GeneratedImage attachment={att} useImage={ready} />);
    click(screen.getByRole('button', { name: ar.chat.image.download }));
    await vi.waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(ar.chat.image.downloadFailed),
    );
  });
});

describe('creating placeholder', () => {
  const answer = (extra = {}) =>
    message({
      sequence: 2,
      role: 'assistant',
      status: 'streaming',
      modeKey: 'design',
      completedAt: null,
      ...extra,
    });
  const creating = () =>
    screen.queryByRole('status', { name: ar.chat.image.creating });

  it('shows the creating line at the chosen ratio', () => {
    render(
      <AssistantMessage
        message={answer({ content: 'حسنًا' })}
        modes={modes}
        local
        creatingRatio="16:9"
      />,
    );
    expect(creating()).toHaveStyle({ aspectRatio: '16 / 9' });
  });

  it('is square for automatic and absent in text modes', () => {
    const { rerender } = render(
      <AssistantMessage message={answer()} modes={modes} local />,
    );
    expect(creating()).toHaveStyle({ aspectRatio: '1 / 1' });
    rerender(
      <AssistantMessage
        message={answer({ modeKey: 'fast' })}
        modes={modes}
        local
      />,
    );
    expect(creating()).toBeNull();
  });

  it('disappears when the answer ends without an image', () => {
    render(
      <AssistantMessage
        message={answer({ status: 'complete', content: 'نص فقط' })}
        modes={modes}
        local={false}
      />,
    );
    expect(creating()).toBeNull();
  });
});

describe('empty state', () => {
  it('in an image mode shows the image headline, hint and chips that only fill', async () => {
    const onPick = vi.fn();
    render(<EmptyState imageMode onPick={onPick} />);
    expect(
      screen.getByRole('heading', { name: ar.chat.emptyImage.title }),
    ).toBeVisible();
    expect(screen.getByText(ar.chat.emptyImage.hint)).toBeVisible();
    click(screen.getByRole('button', { name: ar.chat.emptyImage.chip1 }));
    expect(onPick).toHaveBeenCalledWith(ar.chat.emptyImage.chip1);
  });

  it('keeps the text headline otherwise', () => {
    render(<EmptyState onPick={vi.fn()} />);
    expect(
      screen.getByRole('heading', { name: ar.chat.empty.title }),
    ).toBeVisible();
  });
});
