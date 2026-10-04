import type { MessageDto } from '~/api/generated/types.gen';
import { isPendingMessage } from './cache-updates';

/**
 * How the UI should present a message:
 * - `pending`: the user's message before the server accepted it
 * - `streaming`: being written (here, or left over from an earlier visit)
 * - `cut`: partial because of the length limit («توقف الرد قبل اكتماله»)
 * - `stopped`: partial because the user stopped it
 * - `partial`: an error kept some text (`errorCode` says why)
 * - `failed`: no usable answer (`errorCode` says why)
 */
export type MessageState =
  | 'pending'
  | 'streaming'
  | 'complete'
  | 'cut'
  | 'stopped'
  | 'partial'
  | 'failed';

export function messageState(message: MessageDto): MessageState {
  if (isPendingMessage(message)) return 'pending';
  switch (message.status) {
    case 'streaming':
      return 'streaming';
    case 'failed':
      return 'failed';
    case 'partial':
      if (message.finishReason === 'length') return 'cut';
      if (message.finishReason === 'aborted') return 'stopped';
      return 'partial';
    default:
      return 'complete';
  }
}
