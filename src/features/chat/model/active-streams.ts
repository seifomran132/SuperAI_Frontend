import { useSyncExternalStore } from 'react';

// Sends in progress, keyed by conversation id ('new' while a new chat's
// conversation is being created). Module-level on purpose: a stream outlives
// the component that started it (switching conversations does not stop it),
// Stop works from anywhere, and the sidebar can show «يكتب…».

export type StreamStatus =
  /** Creating the conversation of a new chat. */
  | 'creating'
  /** Request sent, waiting for `started`. */
  | 'preparing'
  /** `started` received; deltas are arriving. */
  | 'streaming';

export interface ActiveStream {
  readonly status: StreamStatus;
  readonly abortController: AbortController;
  readonly clientRequestId: string;
  readonly content: string;
  readonly modeKey: string;
}

let streams: ReadonlyMap<string, ActiveStream> = new Map();
const listeners = new Set<() => void>();

function commit(next: Map<string, ActiveStream>) {
  // A new map on every change keeps useSyncExternalStore snapshots immutable.
  streams = next;
  listeners.forEach((l) => l());
}

export function registerStream(key: string, stream: ActiveStream) {
  const next = new Map(streams);
  next.set(key, stream);
  commit(next);
}

/** Updates the entry only while it still belongs to the same send. */
export function updateStream(
  key: string,
  controller: AbortController,
  patch: Partial<Pick<ActiveStream, 'status'>>,
) {
  const current = streams.get(key);
  if (!current || current.abortController !== controller) return;
  const next = new Map(streams);
  next.set(key, { ...current, ...patch });
  commit(next);
}

/** Moves a new chat's send from 'new' to its conversation id once created. */
export function moveStream(
  from: string,
  to: string,
  controller: AbortController,
) {
  const current = streams.get(from);
  if (!current || current.abortController !== controller) return;
  const next = new Map(streams);
  next.delete(from);
  next.set(to, current);
  commit(next);
}

export function unregisterStream(key: string, controller: AbortController) {
  const current = streams.get(key);
  if (!current || current.abortController !== controller) return;
  const next = new Map(streams);
  next.delete(key);
  commit(next);
}

export const getStream = (key: string): ActiveStream | undefined =>
  streams.get(key);

export const isStreaming = (key: string): boolean => streams.has(key);

/** Stop button: aborts the request. The server keeps a `partial` answer. */
export function stopStream(key: string): boolean {
  const current = streams.get(key);
  if (!current) return false;
  current.abortController.abort();
  return true;
}

/**
 * Abort reason for the end of a session. A send aborted with it writes
 * nothing more (see send-message.ts), unlike Stop, which reloads the answer.
 */
export const SESSION_ENDED: unknown = Object.freeze({
  name: 'SessionEnded',
  message: 'The session ended.',
});

/** Sign-out or user change: aborts every send with SESSION_ENDED and forgets them. */
export function stopAllStreams() {
  const all = streams;
  // Forget first: the sends' own cleanup runs later and must not matter.
  commit(new Map());
  all.forEach((s) => s.abortController.abort(SESSION_ENDED));
}

export function subscribeStreams(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getStreamsSnapshot = () => streams;

/** The send in progress for a conversation (or 'new'), re-rendering on change. */
export function useActiveStream(key: string | null | undefined) {
  const all = useSyncExternalStore(
    subscribeStreams,
    getStreamsSnapshot,
    getStreamsSnapshot,
  );
  return key ? all.get(key) : undefined;
}

/** Whether a conversation has an answer being written in this tab (sidebar «يكتب…»). */
export function useIsStreaming(key: string | null | undefined): boolean {
  return useActiveStream(key) !== undefined;
}
