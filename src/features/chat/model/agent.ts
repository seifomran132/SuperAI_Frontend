import { useCallback, useRef, useState } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { i18n } from '~/i18n';
import { isApiError, type ApiError } from '~/api/errors';
import { conversationsCreate, meAgentsAnswer } from '~/api/generated/sdk.gen';
import type {
  AgentAnswerDto,
  ConversationDto,
  MessageDto,
} from '~/api/generated/types.gen';
import {
  insertNewestMessages,
  markConversationListStale,
  refetchMessages,
  upsertConversationAtTop,
} from './cache-updates';
import { agentsOptions, conversationKey } from './queries';

// The graphic designer's guided steps (API_CONTRACT §11). The server runs the
// steps: each agent message says which input to show, and the answer call
// returns the reply and the next question. No AI and no charge here.

export type AgentStep = AgentAnswerDto['step'];
export type AgentValue = AgentAnswerDto['value'];

interface Bilingual {
  ar: string;
  en: string;
}
export interface AgentOption {
  value: string;
  labelAr: string;
  labelEn: string;
}
interface Base {
  step: AgentStep;
  prompt?: Bilingual;
}
export type AgentUi = Base &
  (
    | { type: 'text'; maxLength: number; optional: boolean }
    | {
        type: 'choices';
        options: AgentOption[];
        allowText: boolean;
        maxLength: number;
      }
    | {
        type: 'upload';
        brandKitId: string;
        kinds: string[];
        maxFiles: number;
        optional: boolean;
      }
    | { type: 'colors'; suggested: string[]; current: string[]; max: number }
    | {
        type: 'brand_picker';
        kits: {
          id: string;
          name: string;
          status: 'draft' | 'ready';
          logoAssetId: string | null;
        }[];
        canCreate: boolean;
      }
    | {
        type: 'fields';
        fields: {
          key: string;
          labelAr: string;
          labelEn: string;
          maxLength: number;
        }[];
      }
    | {
        type: 'summary';
        items: {
          field: string;
          labelAr: string;
          labelEn: string;
          value: string;
        }[];
        editable: string[];
        /** Request summary only; null while designs can't be priced (§11.3). */
        estimate?: { variants: number; fitsVariants: number } | null;
      }
    | { type: 'none' }
  );

const TYPES = new Set([
  'text',
  'choices',
  'upload',
  'colors',
  'brand_picker',
  'fields',
  'summary',
  'none',
]);

/** The message's input, or null when it has none we know how to show. */
export function agentUi(message: Pick<MessageDto, 'ui'>): AgentUi | null {
  const ui = message.ui;
  if (!ui || typeof ui.type !== 'string' || !TYPES.has(ui.type)) return null;
  if (typeof ui.step !== 'string') return null;
  return ui as unknown as AgentUi;
}

/** The newest agent message: the only one that can be answered. */
export function activeAgentMessage(messages: MessageDto[]) {
  // Messages are oldest first here (as rendered).
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]!;
    if (m.role === 'assistant') return agentUi(m) ? m : null;
  }
  return null;
}

/**
 * `POST /conversations { agentKey }`. The first question arrives with
 * `GET …/messages`, which the conversation page loads.
 */
export async function startAgentConversation(
  qc: QueryClient,
  agentKey: string,
): Promise<ConversationDto> {
  const { data } = await conversationsCreate({
    body: { agentKey },
    throwOnError: true,
  });
  upsertConversationAtTop(qc, data);
  return data;
}

export type AnswerFailure =
  | { kind: 'validation'; error: ApiError }
  | { kind: 'mismatch' }
  | { kind: 'notAvailable' }
  | { kind: 'kitLimit'; error: ApiError }
  | { kind: 'network' }
  | { kind: 'other'; error: ApiError };

function classify(error: unknown): AnswerFailure {
  if (!isApiError(error)) return { kind: 'network' };
  switch (error.code) {
    case 'VALIDATION_FAILED':
      return { kind: 'validation', error };
    case 'AGENT_STEP_MISMATCH':
    case 'CONVERSATION_IS_AGENT':
      return { kind: 'mismatch' };
    case 'AGENT_NOT_AVAILABLE':
      return { kind: 'notAvailable' };
    case 'BRAND_KIT_LIMIT_REACHED':
      return { kind: 'kitLimit', error };
    default:
      return error.statusCode >= 500
        ? { kind: 'network' }
        : { kind: 'other', error };
  }
}

/**
 * Answers the newest question. One `clientRequestId` per answer, kept while
 * the same answer is retried after a network error (the server then returns
 * the same messages and applies nothing twice), new for any other answer.
 * Never retried on its own.
 */
export function useAgentAnswer(conversationId: string) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<AnswerFailure | null>(null);
  const [moved, setMoved] = useState(false);
  const last = useRef<{
    step: AgentStep;
    value: AgentValue;
    id: string;
  } | null>(null);

  const send = useCallback(
    async (step: AgentStep, value: AgentValue, { retry = false } = {}) => {
      const same =
        retry &&
        last.current?.step === step &&
        JSON.stringify(last.current.value) === JSON.stringify(value);
      const clientRequestId = same ? last.current!.id : crypto.randomUUID();
      last.current = { step, value, id: clientRequestId };
      setBusy(true);
      setFailure(null);
      setMoved(false);
      try {
        const { data } = await meAgentsAnswer({
          path: { id: conversationId },
          body: { step, value, clientRequestId },
          throwOnError: true,
        });
        // The API returns [reply, next question], oldest first; the cache is newest first.
        insertNewestMessages(qc, conversationId, [...data.messages].reverse());
        last.current = null;
        // The title gains the brand name after a brand is chosen.
        void qc.invalidateQueries({
          queryKey: conversationKey(conversationId),
        });
        void markConversationListStale(qc);
        return true;
      } catch (error) {
        const found = classify(error);
        if (found.kind === 'mismatch') {
          // The client is behind: show the latest question instead.
          last.current = null;
          setMoved(true);
          await refetchMessages(qc, conversationId);
        } else {
          if (found.kind === 'notAvailable') {
            void qc.invalidateQueries({ queryKey: agentsOptions().queryKey });
          }
          setFailure(found);
        }
        return false;
      } finally {
        setBusy(false);
      }
    },
    [qc, conversationId],
  );

  const retry = useCallback(() => {
    const current = last.current;
    if (current) void send(current.step, current.value, { retry: true });
  }, [send]);

  return {
    busy,
    failure,
    moved,
    send,
    retry,
    clearFailure: () => setFailure(null),
  };
}

/** Starts an agent conversation and opens it; errors come back for a toast. */
export function useStartAgent() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [pending, setPending] = useState<string | null>(null);
  const start = useCallback(
    async (agentKey: string) => {
      if (pending) return;
      setPending(agentKey);
      try {
        const conversation = await startAgentConversation(qc, agentKey);
        await navigate({
          to: '/chat/$conversationId',
          params: { conversationId: conversation.id },
        });
      } catch (error) {
        if (isApiError(error) && error.code === 'AGENT_NOT_AVAILABLE') {
          void qc.invalidateQueries({ queryKey: agentsOptions().queryKey });
        }
        toast.error(
          isApiError(error)
            ? i18n.t(`errors:${error.code}`, {
                defaultValue: i18n.t('chat.agent.startError'),
              })
            : i18n.t('chat.agent.startError'),
        );
      } finally {
        setPending(null);
      }
    },
    [pending, qc, navigate],
  );
  return { start, pending };
}
