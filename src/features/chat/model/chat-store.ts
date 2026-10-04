import { create } from 'zustand';
import type { Refusal } from './refusals';

// UI-only chat state (F2_CHAT §3). Server data lives in the TanStack Query
// cache, never here. Keys are conversation ids, or NEW_CHAT for the new chat.

export const NEW_CHAT = 'new';
export type ConversationKey = string;

export interface ChatState {
  /** Selected mode per conversation; NEW_CHAT holds the new chat's choice. */
  modes: Record<ConversationKey, string>;
  /** Unsent text per conversation. Survives every refusal. */
  drafts: Record<ConversationKey, string>;
  /** Why the last send in a conversation did not start, until dismissed or the next send. */
  refusals: Record<ConversationKey, Refusal>;
  /**
   * A conversation created for the new chat whose first send was refused (or
   * is still preparing). The next send from the new chat reuses it, so the
   * conversation is created only once.
   */
  newChatConversationId: string | null;
  /** RATE_LIMITED is per user: epoch ms until sending is allowed again. */
  rateLimitedUntil: number | null;
  /** Mobile sidebar drawer. */
  drawerOpen: boolean;

  setMode: (key: ConversationKey, modeKey: string) => void;
  setDraft: (key: ConversationKey, text: string) => void;
  clearDraft: (key: ConversationKey) => void;
  /** Puts unsent text back without overwriting what the user typed meanwhile. */
  restoreDraft: (key: ConversationKey, text: string) => void;
  setRefusal: (key: ConversationKey, refusal: Refusal) => void;
  clearRefusal: (key: ConversationKey) => void;
  setNewChatConversationId: (id: string | null) => void;
  setRateLimitedUntil: (until: number | null) => void;
  setDrawerOpen: (open: boolean) => void;
  reset: () => void;
}

const initial = {
  modes: {},
  drafts: {},
  refusals: {},
  newChatConversationId: null,
  rateLimitedUntil: null,
  drawerOpen: false,
} satisfies Partial<ChatState>;

function without<T>(record: Record<string, T>, key: string) {
  if (!(key in record)) return record;
  const next = { ...record };
  delete next[key];
  return next;
}

export const useChatStore = create<ChatState>()((set) => ({
  ...initial,
  setMode: (key, modeKey) =>
    set((s) => ({ modes: { ...s.modes, [key]: modeKey } })),
  setDraft: (key, text) =>
    set((s) => ({ drafts: { ...s.drafts, [key]: text } })),
  clearDraft: (key) => set((s) => ({ drafts: without(s.drafts, key) })),
  restoreDraft: (key, text) =>
    set((s) => {
      const current = s.drafts[key] ?? '';
      if (current === text || current.startsWith(text)) return s;
      const next = current.trim() === '' ? text : `${text}\n${current}`;
      return { drafts: { ...s.drafts, [key]: next } };
    }),
  setRefusal: (key, refusal) =>
    set((s) => ({ refusals: { ...s.refusals, [key]: refusal } })),
  clearRefusal: (key) => set((s) => ({ refusals: without(s.refusals, key) })),
  setNewChatConversationId: (id) => set({ newChatConversationId: id }),
  setRateLimitedUntil: (until) => set({ rateLimitedUntil: until }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  reset: () => set({ ...initial }),
}));
