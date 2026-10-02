import { auth, getAccessToken } from '~/auth/client';
import { client } from './generated/client.gen';

let installed = false;

/** Attaches auth and session handling to the generated client. Call once at startup. */
export function setupApiClient() {
  if (installed) return;
  installed = true;

  client.setConfig({ auth: () => getAccessToken() });

  client.interceptors.response.use(async (response) => {
    if (response.status === 401) {
      // The token expired between auto-refreshes. Refresh now; the query layer
      // retries once (see queryClient). If refresh fails, the session is gone.
      const { data } = await auth.refreshSession();
      if (!data.session) await auth.signOut({ scope: 'local' });
    } else if (response.status === 403) {
      const body = (await response.clone().json().catch(() => null)) as { code?: string } | null;
      if (body?.code === 'ACCOUNT_SUSPENDED' || body?.code === 'ACCOUNT_DELETED') {
        await auth.signOut({ scope: 'local' });
      }
    }
    return response;
  });
}
