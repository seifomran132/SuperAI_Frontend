// Public API of the chat feature. Code outside src/features/chat imports from
// here only. B1 is the data and streaming layer; pages and components follow.

export {
  NEW_CHAT,
  useChatStore,
  type ConversationKey,
} from './model/chat-store';
export {
  useActiveStream,
  useIsStreaming,
  stopStream,
  type StreamStatus,
} from './model/active-streams';
export {
  useSendMessage,
  useSecondsUntil,
  type SendStatus,
} from './model/useSendMessage';
export type { SendOutcome } from './model/send-message';
export type { Refusal, RefusalCode, ModeAlternative } from './model/refusals';
export {
  useBalance,
  useConversation,
  useConversations,
  useMessages,
  useModes,
  useSelectedMode,
  modePosition,
} from './model/useChatQueries';
export { useMessageCost } from './model/message-costs';
export { useResumeRefresh } from './model/useResumeRefresh';
export { messageState, type MessageState } from './model/message-state';
export { installChatSessionReset } from './model/session-reset';
