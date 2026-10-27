import { delay, http, HttpResponse } from 'msw';
import type {
  AdminModeDto,
  AvailableModelDto,
  AvailableModelsDto,
  CatalogFindingDto,
  CatalogSyncSummaryDto,
  LastSyncRunDto,
  ModelDto,
  ModelTestResultDto,
  PriceDto,
  ProviderDto,
  RunningSyncDto,
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
  supportsImages: false,
  generatesImages: false,
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
  imageSent: false,
  imageCreated: null,
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

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 3_600_000).toISOString();

export const syncSummary = (
  patch: Partial<CatalogSyncSummaryDto> = {},
): CatalogSyncSummaryDto => ({
  catalogAvailable: true,
  checked: 42,
  applied: 5,
  unchanged: 31,
  held: 2,
  ignored: 0,
  noCatalogPrice: 1,
  notInCatalog: 3,
  skipped: 0,
  failed: 1,
  providersChecked: 3,
  providersUnreachable: 0,
  retired: 1,
  retiredInUse: 1,
  ...patch,
});

export const lastRun = (
  patch: Partial<LastSyncRunDto> = {},
): LastSyncRunDto => ({
  runId: 'run-1',
  startedAt: hoursAgo(2),
  finishedAt: hoursAgo(2),
  trigger: 'schedule',
  summary: syncSummary(),
  error: null,
  ...patch,
});

const rates = (
  input: string,
  output: string,
  cached: string | null = null,
) => ({
  inputPerMtok: input,
  outputPerMtok: output,
  cachedInputPerMtok: cached,
  cacheWritePerMtok: null,
});

export const finding = (
  id: string,
  kind: CatalogFindingDto['kind'],
  patch: Partial<CatalogFindingDto> = {},
): CatalogFindingDto => ({
  id,
  kind,
  status: 'open',
  modelId: 'm1',
  providerCode: 'acme',
  providerModelId: `acme-${id}`,
  modelDisplayName: `نموذج ${id}`,
  catalogModelId: null,
  usedByEnabledModes: kind === 'model_retired' ? ['fast', 'deep'] : [],
  currentPrice:
    kind === 'large_change'
      ? rates('2.500000000', '10.000000000', '1.250000000')
      : rates('0.150000000', '0.600000000'),
  proposedPrice:
    kind === 'large_change'
      ? rates('4.062500000', '16.250000000', '2.031250000')
      : null,
  changePct: kind === 'large_change' ? '62.50' : null,
  createdAt: '2026-10-12T06:00:00.000Z',
  lastSeenAt: '2026-10-15T06:00:00.000Z',
  resolvedAt: null,
  resolvedBy: null,
  resolutionReason: null,
  ...patch,
});

export const availableModel = (
  providerModelId: string,
  patch: Partial<AvailableModelDto> = {},
): AvailableModelDto => ({
  providerModelId,
  displayName: null,
  contextWindow: null,
  maxOutputTokens: null,
  addedModelId: null,
  catalog: null,
  ...patch,
});

const defaultAvailable = (): AvailableModelsDto => ({
  providerCode: 'acme',
  catalogAvailable: true,
  models: [
    availableModel('gpt-x', {
      catalog: {
        catalogModelId: 'gpt-x',
        name: 'GPT X',
        contextWindow: 128000,
        maxOutputTokens: 16384,
        supportsImages: true,
        generatesImages: false,
        price: {
          inputPerMtok: '2.500000000',
          outputPerMtok: '10.000000000',
          cachedInputPerMtok: '1.250000000',
          cacheWritePerMtok: null,
        },
        hasContextTiers: true,
        deprecated: false,
      },
    }),
    availableModel('acme-m1', {
      displayName: 'Acme M1',
      contextWindow: 128000,
      maxOutputTokens: 8000,
      addedModelId: 'm1',
    }),
    availableModel('old-1', {
      catalog: {
        catalogModelId: 'old-1',
        name: 'Old One',
        contextWindow: 4096,
        maxOutputTokens: 4096,
        supportsImages: false,
        generatesImages: false,
        price: {
          inputPerMtok: '2.000000000',
          outputPerMtok: '1.500000000',
          cachedInputPerMtok: null,
          cacheWritePerMtok: null,
        },
        hasContextTiers: false,
        deprecated: true,
      },
    }),
    availableModel('embed-1', { contextWindow: 8191 }),
  ],
});

/** Catalog sync: status, findings and the models each provider offers. */
interface SyncMock {
  running: RunningSyncDto | null;
  lastRun: LastSyncRunDto | null;
  /** Newest first. */
  findings: CatalogFindingDto[];
  /** The findings list answers 500 (error state). */
  listFails: boolean;
  /** Milliseconds the findings list takes (loading state). */
  listDelayMs: number;
  /** Status polls that still answer "running" before the run finishes (a started run). */
  pollsUntilDone: number;
  /** Summary a finished run reports (null = the run fails). */
  nextSummary: CatalogSyncSummaryDto | null;
  /** Holds the available-models answer back, so a test can see the loading state. */
  availableDelayMs: number;
  /** Provider code → models, or the error to answer with. */
  available: Record<
    string,
    AvailableModelsDto | { status: number; code: string }
  >;
}

interface CatalogState {
  sync: SyncMock;
  providers: ProviderDto[];
  models: ModelDto[];
  prices: PriceDto[];
  modes: AdminModeDto[];
  margin: string;
  prompt: string;
}

const initial = (): CatalogState => ({
  sync: {
    running: null,
    lastRun: lastRun(),
    findings: [
      finding('f1', 'large_change'),
      finding('f2', 'catalog_price_missing'),
      finding('f3', 'model_retired'),
    ],
    listFails: false,
    listDelayMs: 0,
    pollsUntilDone: 1,
    nextSummary: syncSummary({ applied: 7 }),
    availableDelayMs: 0,
    available: { acme: defaultAvailable() },
  },
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

const syncStatus = () => {
  const { sync } = catalogMock;
  // A started run finishes after `pollsUntilDone` polls.
  if (sync.running) {
    if (sync.pollsUntilDone <= 0) {
      sync.lastRun = lastRun({
        runId: sync.running.runId,
        startedAt: sync.running.startedAt,
        finishedAt: new Date().toISOString(),
        trigger: sync.running.trigger,
        summary: sync.nextSummary,
        error: sync.nextSummary ? null : 'catalog download failed',
      });
      sync.running = null;
    } else {
      sync.pollsUntilDone -= 1;
    }
  }
  const open = sync.findings.filter((f) => f.status === 'open');
  const by = (kind: CatalogFindingDto['kind']) =>
    open.filter((f) => f.kind === kind).length;
  return {
    openFindings: open.length,
    openByKind: {
      large_change: by('large_change'),
      catalog_price_missing: by('catalog_price_missing'),
      model_retired: by('model_retired'),
    },
    running: sync.running,
    lastRun: sync.lastRun,
    nextRunAt: new Date(Date.now() + 4 * 3_600_000).toISOString(),
  };
};

/** Apply / dismiss: refused with `adminMock.fail`, or for a finding that is not open. */
async function decide(
  action: 'apply' | 'dismiss',
  request: Request,
  id: string,
) {
  const { body, failed } = await write(`sync:${action}`, request);
  if (failed) return failed;
  const found = catalogMock.sync.findings.find((f) => f.id === id);
  if (!found) return missing('CATALOG_FINDING_NOT_FOUND');
  const refuse = (status: number, code: string) =>
    HttpResponse.json(
      { statusCode: status, code, message: 'dev message' },
      { status },
    );
  if (found.status !== 'open') return refuse(409, 'CATALOG_FINDING_NOT_OPEN');
  if (action === 'apply' && found.kind !== 'large_change') {
    return refuse(409, 'CATALOG_FINDING_NOT_APPLICABLE');
  }
  found.status = action === 'apply' ? 'applied' : 'dismissed';
  found.resolvedAt = new Date().toISOString();
  found.resolvedBy = {
    id: 'aaaaaaaa-1111-4111-8111-111111111111',
    email: 'admin@test.local',
  };
  found.resolutionReason = String(body.reason);
  return HttpResponse.json(found);
}

const syncHandlers = [
  http.get(`${API}/catalog-sync/status`, () => HttpResponse.json(syncStatus())),
  http.get(`${API}/catalog-sync/findings`, async ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') ?? 'open';
    const kind = url.searchParams.get('kind');
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const start = Number(url.searchParams.get('cursor') ?? 0);
    adminMock.calls.push({
      name: 'sync:list',
      query: Object.fromEntries(url.searchParams),
    });
    if (catalogMock.sync.listDelayMs) {
      await new Promise((r) => setTimeout(r, catalogMock.sync.listDelayMs));
    }
    if (catalogMock.sync.listFails) {
      return HttpResponse.json(
        { statusCode: 500, code: 'INTERNAL_ERROR', message: 'dev message' },
        { status: 500 },
      );
    }
    const all = catalogMock.sync.findings.filter(
      (f) => f.status === status && (!kind || f.kind === kind),
    );
    const end = start + limit;
    return HttpResponse.json({
      items: all.slice(start, end),
      nextCursor: end < all.length ? String(end) : null,
    });
  }),
  http.post(`${API}/catalog-sync/run`, async ({ request }) => {
    const { failed } = await write('sync:run', request);
    if (failed) return failed;
    const { sync } = catalogMock;
    if (sync.running) {
      return HttpResponse.json(
        {
          statusCode: 409,
          code: 'CATALOG_SYNC_RUNNING',
          message: 'dev message',
        },
        { status: 409 },
      );
    }
    sync.running = {
      runId: 'run-2',
      startedAt: new Date().toISOString(),
      trigger: 'admin',
    };
    return HttpResponse.json({ runId: 'run-2' }, { status: 202 });
  }),
  http.post(`${API}/catalog-sync/findings/:id/apply`, ({ request, params }) =>
    decide('apply', request, String(params.id)),
  ),
  http.post(`${API}/catalog-sync/findings/:id/dismiss`, ({ request, params }) =>
    decide('dismiss', request, String(params.id)),
  ),
];

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

  http.get(`${API}/providers/:code/available-models`, async ({ params }) => {
    adminMock.calls.push({ name: 'providers:available', body: params });
    if (catalogMock.sync.availableDelayMs)
      await delay(catalogMock.sync.availableDelayMs);
    const found = catalogMock.sync.available[String(params.code)];
    if (!found) return missing('PROVIDER_NOT_FOUND');
    return 'models' in found
      ? HttpResponse.json(found)
      : HttpResponse.json(
          {
            statusCode: found.status,
            code: found.code,
            message: 'dev message',
          },
          { status: found.status },
        );
  }),

  ...syncHandlers,

  http.get(`${API}/models`, () => HttpResponse.json(catalogMock.models)),
  http.post(`${API}/models`, async ({ request }) => {
    const { body, failed } = await write('models:create', request);
    if (failed) return failed;
    const { price: first, ...rest } = body;
    const created = {
      ...model('created'),
      ...rest,
      ...(first
        ? { currentPrice: { ...price('price-new', null), ...first } }
        : {}),
    };
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
