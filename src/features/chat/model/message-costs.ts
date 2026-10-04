import { useSyncExternalStore } from 'react';

// `MessageDto` has no cost (F2_CHAT §6 gap 1, deferred), so the charge from a
// `done`/`error` event is remembered for this session only: messageId →
// chargeUsd (a decimal string, never a number).

let costs: ReadonlyMap<string, string> = new Map();
const listeners = new Set<() => void>();

export function recordMessageCost(messageId: string, chargeUsd: string) {
  const next = new Map(costs);
  next.set(messageId, chargeUsd);
  costs = next;
  listeners.forEach((l) => l());
}

export const getMessageCost = (messageId: string): string | undefined =>
  costs.get(messageId);

export function clearMessageCosts() {
  costs = new Map();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The charge of an answer sent in this session, or undefined when unknown. */
export function useMessageCost(messageId: string): string | undefined {
  return useSyncExternalStore(
    subscribe,
    () => costs.get(messageId),
    () => undefined,
  );
}
