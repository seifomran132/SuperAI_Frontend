import { http, HttpResponse } from 'msw';
import type { MeResponse } from '~/api/generated/types.gen';

// Handlers for GoTrue and GET/PATCH /api/v1/me. Behaviour is switched through
// `authMock` (reset it in beforeEach) so a test states its scenario in one line.

const GOTRUE = 'http://localhost:9999';
const API = 'http://localhost:3000/api/v1';

export type Failing = 'rate_limited' | 'network_error';

export interface AuthMockState {
  signIn: 'ok' | 'invalid_credentials' | 'email_not_confirmed' | Failing;
  signUp: 'ok' | 'weak_password' | Failing;
  /** Token refresh (used after a 401 from the API). */
  refresh: 'ok' | 'fail';
  resend: 'ok' | Failing;
  recover: 'ok' | Failing;
  updateUser: 'ok' | 'same_password' | 'weak_password' | 'network_error';
  /** `GET /me`: a profile, or the error the API answers with. */
  me:
    | { kind: 'ok'; profile: MeResponse }
    | { kind: 'error'; status: number; code: string };
  /** `PATCH /me` error answer, or null to apply the update to `me`. */
  updateMe: {
    status: number;
    code: string;
    details?: { field: string; message: string }[];
  } | null;
  /** Every request the handlers saw, for assertions. */
  calls: { name: string; body: unknown }[];
}

export const defaultProfile: MeResponse = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'user@test.local',
  fullName: 'سارة',
  phoneNumber: null,
  accountStatus: 'active',
  isAdmin: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const initial = (): AuthMockState => ({
  signIn: 'ok',
  signUp: 'ok',
  refresh: 'ok',
  resend: 'ok',
  recover: 'ok',
  updateUser: 'ok',
  me: { kind: 'ok', profile: { ...defaultProfile } },
  updateMe: null,
  calls: [],
});

export const authMock: AuthMockState = initial();

export function resetAuthMock() {
  Object.assign(authMock, initial());
}

export const callsTo = (name: string) =>
  authMock.calls.filter((c) => c.name === name);

function base64url(value: object) {
  return btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** A structurally valid (unsigned) JWT: auth-js only decodes it. */
function fakeJwt() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url({
    sub: defaultProfile.id,
    exp,
    role: 'authenticated',
  })}.sig`;
}

const gotrueUser = (email: string) => ({
  id: defaultProfile.id,
  aud: 'authenticated',
  role: 'authenticated',
  email,
  email_confirmed_at: '2026-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z',
});

function session(email: string) {
  return {
    access_token: fakeJwt(),
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'refresh-token',
    user: gotrueUser(email),
  };
}

/** Real GoTrue error shape; auth-js reads `error_code`. */
function gotrueError(status: number, errorCode: string, msg: string) {
  return HttpResponse.json(
    { code: status, error_code: errorCode, msg },
    { status },
  );
}

function failure(scenario: Failing) {
  if (scenario === 'network_error') return HttpResponse.error();
  return gotrueError(429, 'over_email_send_rate_limit', 'rate limit');
}

export const authHandlers = [
  http.post(`${GOTRUE}/token`, async ({ request }) => {
    const grant = new URL(request.url).searchParams.get('grant_type');
    const body = (await request.json()) as { email?: string };
    authMock.calls.push({ name: `token:${grant}`, body });
    if (grant === 'refresh_token') {
      if (authMock.refresh === 'fail')
        return gotrueError(
          400,
          'refresh_token_not_found',
          'Invalid Refresh Token',
        );
      return HttpResponse.json(session(defaultProfile.email!));
    }
    switch (authMock.signIn) {
      case 'invalid_credentials':
        return gotrueError(
          400,
          'invalid_credentials',
          'Invalid login credentials',
        );
      case 'email_not_confirmed':
        return gotrueError(400, 'email_not_confirmed', 'Email not confirmed');
      case 'rate_limited':
        return gotrueError(429, 'over_request_rate_limit', 'Too many requests');
      case 'network_error':
        return HttpResponse.error();
      default:
        return HttpResponse.json(session(body.email ?? defaultProfile.email!));
    }
  }),

  http.post(`${GOTRUE}/signup`, async ({ request }) => {
    const body = (await request.json()) as { email: string };
    authMock.calls.push({ name: 'signup', body });
    if (authMock.signUp === 'weak_password')
      return gotrueError(422, 'weak_password', 'Password is too weak');
    if (authMock.signUp !== 'ok') return failure(authMock.signUp);
    // Same answer for new and existing addresses (no account enumeration).
    return HttpResponse.json({
      ...gotrueUser(body.email),
      email_confirmed_at: undefined,
      confirmation_sent_at: '2026-01-01T00:00:00Z',
    });
  }),

  http.post(`${GOTRUE}/resend`, async ({ request }) => {
    authMock.calls.push({ name: 'resend', body: await request.json() });
    if (authMock.resend !== 'ok') return failure(authMock.resend);
    return HttpResponse.json({});
  }),

  http.post(`${GOTRUE}/recover`, async ({ request }) => {
    authMock.calls.push({ name: 'recover', body: await request.json() });
    if (authMock.recover !== 'ok') return failure(authMock.recover);
    // Identical for unknown addresses.
    return HttpResponse.json({});
  }),

  http.get(`${GOTRUE}/user`, () =>
    HttpResponse.json(gotrueUser(defaultProfile.email!)),
  ),

  http.put(`${GOTRUE}/user`, async ({ request }) => {
    authMock.calls.push({ name: 'updateUser', body: await request.json() });
    switch (authMock.updateUser) {
      case 'same_password':
        return gotrueError(
          422,
          'same_password',
          'New password should be different',
        );
      case 'weak_password':
        return gotrueError(422, 'weak_password', 'Password is too weak');
      case 'network_error':
        return HttpResponse.error();
      default:
        return HttpResponse.json(gotrueUser(defaultProfile.email!));
    }
  }),

  http.post(`${GOTRUE}/logout`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/me`, () => {
    authMock.calls.push({ name: 'getMe', body: null });
    const me = authMock.me;
    if (me.kind === 'error')
      return HttpResponse.json(
        { statusCode: me.status, code: me.code, message: 'dev message' },
        { status: me.status },
      );
    return HttpResponse.json(me.profile);
  }),

  http.patch(`${API}/me`, async ({ request }) => {
    const body = (await request.json()) as {
      fullName?: string | null;
      phoneNumber?: string | null;
    };
    authMock.calls.push({ name: 'updateMe', body });
    if (authMock.updateMe) {
      const { status, code, details } = authMock.updateMe;
      return HttpResponse.json(
        { statusCode: status, code, message: 'dev message', details },
        { status },
      );
    }
    if (authMock.me.kind === 'ok') {
      authMock.me.profile = { ...authMock.me.profile, ...body };
      return HttpResponse.json(authMock.me.profile);
    }
    return HttpResponse.json({}, { status: 500 });
  }),
];

/** Body of the first request to `name`; fails loudly when there was none. */
export function firstCallBody(name: string): unknown {
  const call = authMock.calls.find((c) => c.name === name);
  if (!call) throw new Error(`No request recorded for ${name}`);
  return call.body;
}
