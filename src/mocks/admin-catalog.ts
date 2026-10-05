import { http, HttpResponse } from 'msw';
import type {
  AdminModeDto,
  ModelDto,
  ModelTestResultDto,
  PriceDto,
  ProviderDto,
} from '~/api/generated/types.gen';
import { adminMock, plan } from './admin';

// Catalog admin handlers (plans, providers, models, modes, settings). Writes
// answer with `adminMock.fail` while it is set and record into `adminMock.calls`.

const API = 'http://localhost:3000/api/v1/admin';

export const provider = (code: string, withKey = true): ProviderDto => ({
  code,
  displayName: `مزوّد ${code}`,
  kind: 'openai_compatible',
  baseUrl: `https://api.${code}.test/v1`,
  isEnabled: true,
  apiKey: {
    configured: withKey,
    last4: withKey ? '1234' : null,
    updatedAt: withKey ? '2026-10-01T00:00:00.000Z' : null,
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

export const price = (id: string, effectiveTo: string | null): PriceDto => ({
  id,
  inputPerMtok: '1.000000000',
  outputPerMtok: '4.000000000',
  cachedInputPerMtok: null,
  cacheWritePerMtok: null,
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  effectiveTo,
  createdAt: '2026-01-01T00:00:00.000Z',
});

export const model = (id: string): ModelDto => ({
  id,
  providerCode: 'acme',
  providerModelId: `acme-${id}`,
  displayName: `نموذج ${id}`,
  contextWindow: 128000,
  maxOutputTokens: 8000,
  marginOverridePct: null,
  effectiveMarginPct: '30',
  thinking: 'off',
  isEnabled: true,
  currentPrice: price(`price-${id}`, null),
  usedByModes: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

export const mode = (
  key: string,
  patch: Partial<AdminModeDto> = {},
): AdminModeDto => ({
  key,
  labelAr: `وضع ${key}`,
  labelEn: `Mode ${key}`,
  descriptionAr: 'وصف',
  descriptionEn: 'Description',
  sortOrder: 1,
  systemPrompt: null,
  isEnabled: true,
  model: {
    id: 'm1',
    displayName: 'نموذج m1',
    providerCode: 'acme',
    providerModelId: 'acme-m1',
  },
  ready: true,
  notReadyReason: 'NO_MODEL',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...patch,
});

export const testResult: ModelTestResultDto = {
  ok: true,
  reply: 'مرحبًا بك',
  finishReason: 'stop',
  error: null,
  usage: {
    inputTokens: 12,
    cachedInputTokens: 0,
    cacheWriteTokens: 0,
    outputTokens: 20,
  },
  providerCostUsd: '0.000092000',
  customerChargeUsd: '0.000120000',
  firstChunkMs: 420,
  durationMs: 1300,
};

interface CatalogState {
  providers: ProviderDto[];
  models: ModelDto[];
  prices: PriceDto[];
  modes: AdminModeDto[];
  margin: string;
  prompt: string;
}

const initial = (): CatalogState => ({
  providers: [provider('acme'), provider('nokey', false)],
  models: [model('m1')],
  prices: [price('price-m1', null)],
  modes: [
    mode('fast'),
    mode('deep', { ready: false, notReadyReason: 'NO_API_KEY' }),
  ],
  margin: '30',
  prompt: 'أنت مساعد مفيد.',
});

export const catalogMock: CatalogState = initial();
export function resetCatalogMock() {
  Object.assign(catalogMock, initial());
}

const failure = () =>
  adminMock.fail
    ? HttpResponse.json(
        {
          statusCode: adminMock.fail.status,
          code: adminMock.fail.code,
          message: 'dev message',
          ...(adminMock.fail.details
            ? { details: adminMock.fail.details }
            : {}),
        },
        { status: adminMock.fail.status },
      )
    : null;

const missing = (code: string) =>
  HttpResponse.json(
    { statusCode: 404, code, message: 'dev message' },
    { status: 404 },
  );

/** Records the call; returns the failure response when one is set. */
async function write(name: string, request: Request) {
  const body = await request.json().catch(() => undefined);
  adminMock.calls.push({ name, body });
  return { body: body as Record<string, unknown>, failed: failure() };
}

export const catalogHandlers = [
  http.get(`${API}/plans/:key`, ({ params }) => {
    const found = adminMock.plans.find((p) => p.key === params.key);
    return found ? HttpResponse.json(found) : missing('PLAN_NOT_FOUND');
  }),
  http.post(`${API}/plans`, async ({ request }) => {
    const { body, failed } = await write('plans:create', request);
    if (failed) return failed;
    const created = { ...plan(String(body.key)), ...body };
    adminMock.plans.push(created as never);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.patch(`${API}/plans/:key`, async ({ request, params }) => {
    const { body, failed } = await write('plans:update', request);
    if (failed) return failed;
    const found = adminMock.plans.find((p) => p.key === params.key);
    return found
      ? HttpResponse.json(Object.assign(found, body))
      : missing('PLAN_NOT_FOUND');
  }),
  http.put(`${API}/plans/:key/modes`, async ({ request, params }) => {
    const { body, failed } = await write('plans:modes', request);
    if (failed) return failed;
    const found = adminMock.plans.find((p) => p.key === params.key);
    if (!found) return missing('PLAN_NOT_FOUND');
    found.modeKeys = body.modeKeys as string[];
    return HttpResponse.json(found);
  }),

  http.get(`${API}/providers`, () => HttpResponse.json(catalogMock.providers)),
  http.post(`${API}/providers`, async ({ request }) => {
    const { body, failed } = await write('providers:create', request);
    if (failed) return failed;
    const created = { ...provider(String(body.code), false), ...body };
    catalogMock.providers.push(created as ProviderDto);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.patch(`${API}/providers/:code`, async ({ request, params }) => {
    const { body, failed } = await write('providers:update', request);
    if (failed) return failed;
    const found = catalogMock.providers.find((p) => p.code === params.code);
    return found
      ? HttpResponse.json(Object.assign(found, body))
      : missing('PROVIDER_NOT_FOUND');
  }),
  http.put(`${API}/providers/:code/api-key`, async ({ request, params }) => {
    const { body, failed } = await write('providers:set-key', request);
    if (failed) return failed;
    const found = catalogMock.providers.find((p) => p.code === params.code);
    if (!found) return missing('PROVIDER_NOT_FOUND');
    found.apiKey = {
      configured: true,
      last4: String(body.apiKey).slice(-4),
      updatedAt: '2026-10-05T00:00:00.000Z',
    };
    return HttpResponse.json(found);
  }),
  http.delete(`${API}/providers/:code/api-key`, async ({ request, params }) => {
    const { failed } = await write('providers:remove-key', request);
    if (failed) return failed;
    const found = catalogMock.providers.find((p) => p.code === params.code);
    if (!found) return missing('PROVIDER_NOT_FOUND');
    found.apiKey = { configured: false, last4: null, updatedAt: null };
    return HttpResponse.json(found);
  }),

  http.get(`${API}/models`, () => HttpResponse.json(catalogMock.models)),
  http.post(`${API}/models`, async ({ request }) => {
    const { body, failed } = await write('models:create', request);
    if (failed) return failed;
    const created = { ...model('new'), ...body };
    catalogMock.models.push(created as ModelDto);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.get(`${API}/models/:id`, ({ params }) => {
    const found = catalogMock.models.find((m) => m.id === params.id);
    return found ? HttpResponse.json(found) : missing('MODEL_NOT_FOUND');
  }),
  http.patch(`${API}/models/:id`, async ({ request, params }) => {
    const { body, failed } = await write('models:update', request);
    if (failed) return failed;
    const found = catalogMock.models.find((m) => m.id === params.id);
    return found
      ? HttpResponse.json(Object.assign(found, body))
      : missing('MODEL_NOT_FOUND');
  }),
  http.get(`${API}/models/:id/prices`, () =>
    HttpResponse.json(catalogMock.prices),
  ),
  http.post(`${API}/models/:id/prices`, async ({ request }) => {
    const { body, failed } = await write('models:set-price', request);
    if (failed) return failed;
    const created = { ...price('price-new', null), ...body };
    catalogMock.prices.unshift(created as PriceDto);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.post(`${API}/models/:id/test`, async ({ request }) => {
    const { failed } = await write('models:test', request);
    return failed ?? HttpResponse.json(testResult);
  }),

  http.get(`${API}/modes`, () => HttpResponse.json(catalogMock.modes)),
  http.post(`${API}/modes`, async ({ request }) => {
    const { body, failed } = await write('modes:create', request);
    if (failed) return failed;
    const created = { ...mode(String(body.key)), ...body };
    catalogMock.modes.push(created as AdminModeDto);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.get(`${API}/modes/:key`, ({ params }) => {
    const found = catalogMock.modes.find((m) => m.key === params.key);
    return found ? HttpResponse.json(found) : missing('MODE_NOT_FOUND');
  }),
  http.patch(`${API}/modes/:key`, async ({ request, params }) => {
    const { body, failed } = await write('modes:update', request);
    if (failed) return failed;
    const found = catalogMock.modes.find((m) => m.key === params.key);
    return found
      ? HttpResponse.json(Object.assign(found, body))
      : missing('MODE_NOT_FOUND');
  }),

  http.get(`${API}/pricing-settings`, () =>
    HttpResponse.json({
      defaultMarginPct: catalogMock.margin,
      updatedAt: `m-${catalogMock.margin}`,
    }),
  ),
  http.put(`${API}/pricing-settings`, async ({ request }) => {
    const { body, failed } = await write('pricing-settings', request);
    if (failed) return failed;
    catalogMock.margin = String(body.defaultMarginPct);
    return HttpResponse.json({
      defaultMarginPct: catalogMock.margin,
      updatedAt: `m-${catalogMock.margin}`,
    });
  }),
  http.get(`${API}/chat-settings`, () =>
    HttpResponse.json({
      defaultSystemPrompt: catalogMock.prompt,
      updatedAt: `p-${catalogMock.prompt.length}`,
    }),
  ),
  http.put(`${API}/chat-settings`, async ({ request }) => {
    const { body, failed } = await write('chat-settings', request);
    if (failed) return failed;
    catalogMock.prompt = String(body.defaultSystemPrompt);
    return HttpResponse.json({
      defaultSystemPrompt: catalogMock.prompt,
      updatedAt: `p-${catalogMock.prompt.length}`,
    });
  }),
];
