import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isStreaming } from './active-streams';
import { refetchBalance, refetchMessages } from './cache-updates';

/**
 * Network back / tab visible again / app resumed: the stream may have died
 * meanwhile and there is no resume, so reload the open conversation's
 * messages and the balance (API_CONTRACT §6.5). A conversation still
 * streaming in this tab is left alone: its stream is writing the cache.
 */
export function useResumeRefresh(
  openConversationId: string | null | undefined,
) {
  const qc = useQueryClient();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const refresh = () => {
      if (openConversationId && !isStreaming(openConversationId)) {
        void refetchMessages(qc, openConversationId);
      }
      void refetchBalance(qc);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', refresh);
    // Capacitor's app resume fires a page `resume` event on the document.
    document.addEventListener('resume', refresh);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', refresh);
      document.removeEventListener('resume', refresh);
    };
  }, [qc, openConversationId]);
}
