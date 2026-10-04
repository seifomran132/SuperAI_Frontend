import { auth } from '~/lib/auth/client';
import { stopAllStreams } from './active-streams';
import { useChatStore } from './chat-store';
import { clearMessageCosts } from './message-costs';

/**
 * Drops everything chat keeps outside the Query cache (which auth clears
 * itself). Sends in progress are aborted with SESSION_ENDED, so they write
 * nothing back afterwards.
 */
export function resetChatState() {
  stopAllStreams();
  useChatStore.getState().reset();
  clearMessageCosts();
}

let installed = false;
let currentUserId: string | null = null;

/**
 * One auth event: reset on sign-out, or when another tab switched to a
 * different user (same rule as features/auth session sync). Returns whether it reset.
 */
export function onChatAuthChange(
  event: string,
  userId: string | null,
): boolean {
  const reset =
    event === 'SIGNED_OUT' ||
    (currentUserId !== null && userId !== null && userId !== currentUserId);
  if (reset) resetChatState();
  currentUserId = userId;
  return reset;
}

/**
 * On sign-out, or another tab switching to a different user (same rule as
 * features/auth session sync): stop streams and forget drafts, refusals and
 * costs of the previous user.
 */
export function installChatSessionReset() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  // Never call auth methods inside this callback (auth-js would deadlock).
  auth.onAuthStateChange((event, session) => {
    onChatAuthChange(event, session?.user.id ?? null);
  });
}
