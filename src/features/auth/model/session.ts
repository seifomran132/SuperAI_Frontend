import { useSyncExternalStore } from 'react';
import type { Session } from '@supabase/auth-js';
import type { QueryClient } from '@tanstack/react-query';
import { auth } from '~/lib/auth/client';

// auth-js owns the session; this only mirrors it for React (no second store).
export type SessionState =
  | { status: 'loading'; session: null }
  | { status: 'signed-out'; session: null }
  | { status: 'signed-in'; session: Session };

const loading: SessionState = { status: 'loading', session: null };
const signedOut: SessionState = { status: 'signed-out', session: null };

let snapshot: SessionState = loading;
const listeners = new Set<() => void>();

// PASSWORD_RECOVERY fires once, while auth-js reads the recovery link. The
// reset page asks whether it happened, so it is remembered until used.
let recovery = false;
export const hasRecoverySession = () => recovery;
export const clearRecoverySession = () => {
  recovery = false;
};

let installed = false;
let currentUserId: string | null = null;

/**
 * Subscribes once at startup (browser only): keeps `useSession` current, notes
 * password recovery, and drops all cached user data on sign-out.
 */
export function installSessionSync(queryClient: QueryClient) {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  // Never call auth methods inside this callback (auth-js would deadlock).
  auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') recovery = true;
    const userId = session?.user.id ?? null;
    if (event === 'SIGNED_OUT') recovery = false;
    // Sign-out, or another tab switching to a different user: nothing cached
    // for the previous user may survive.
    if (
      event === 'SIGNED_OUT' ||
      (currentUserId !== null && userId !== null && userId !== currentUserId)
    ) {
      queryClient.clear();
    }
    currentUserId = userId;
    snapshot = session ? { status: 'signed-in', session } : signedOut;
    listeners.forEach((l) => l());
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSession(): SessionState {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => loading,
  );
}
