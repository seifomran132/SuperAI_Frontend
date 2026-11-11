import { http, HttpResponse } from 'msw';
import type {
  AdminAgentRunDto,
  AgentRunDetailDto,
  DesignDto,
} from '~/api/generated/types.gen';
import { chatMock } from './chat';

// Delivered designs, export and admin runs (API_CONTRACT §11.4) for unit
// tests. Reset before every test (useAuthMocks).

const API = 'http://localhost:3000/api/v1';

export const design = (
  id: string,
  patch: Partial<DesignDto> = {},
): DesignDto => ({
  id,
  attachmentId: `att-${id}`,
  width: 1024,
  height: 1024,
  version: 1,
  parentId: null,
  kind: 'create',
  format: 'instagram_post',
  aspectRatio: '1:1',
  needsReview: false,
  brandKitId: 'kit-1',
  conversationId: 'conv-1',
  createdAt: '2026-11-11T10:00:00.000Z',
  ...patch,
});

export const run = (
  id: string,
  patch: Partial<AdminAgentRunDto> = {},
): AdminAgentRunDto => ({
  id,
  createdAt: '2026-11-11T14:32:08.000Z',
  settledAt: '2026-11-11T14:33:21.000Z',
  userId: '11111111-1111-4111-8111-111111111111',
  userEmail: 'sara@example.com',
  agentKey: 'graphic_designer',
  conversationId: 'c0000000-0000-4000-8000-000000000000',
  designRequestId: 'd0000000-0000-4000-8000-000000000000',
  kind: 'create',
  variants: 2,
  status: 'settled',
  designs: 2,
  steps: 5,
  reservedUsd: '0.900000000',
  chargedUsd: '0.317600000',
  providerCostUsd: '0.254100000',
  absorbedUsd: '0.000000000',
  ...patch,
});

interface DesignsMockState {
  designs: DesignDto[];
  failList: boolean;
  failExport: boolean;
  exports: { id: string; format: string | null; size: string | null }[];
  runs: AdminAgentRunDto[];
  runCalls: Record<string, string>[];
  detail: AgentRunDetailDto | null;
}

const fresh = (): DesignsMockState => ({
  designs: [],
  failList: false,
  failExport: false,
  exports: [],
  runs: [],
  runCalls: [],
  detail: null,
});

export const designsMock: DesignsMockState = fresh();

export function resetDesignsMock() {
  Object.assign(designsMock, fresh());
}

/** Makes the designs' images downloadable from the chat mock's `/attachments/:id`. */
export function serveDesignImages(designs: { attachmentId: string }[]) {
  for (const d of designs) {
    chatMock.createdImages.set(d.attachmentId, {
      id: d.attachmentId,
      mimeType: 'image/webp',
      width: 1024,
      height: 1024,
    });
  }
}

const error = (status: number, code: string) =>
  HttpResponse.json({ statusCode: status, code, message: code }, { status });

export const designHandlers = [
  http.get(`${API}/me/designs`, ({ request }) => {
    if (designsMock.failList) return error(500, 'INTERNAL_ERROR');
    const brandKitId = new URL(request.url).searchParams.get('brandKitId');
    return HttpResponse.json({
      items: designsMock.designs.filter(
        (d) => !brandKitId || d.brandKitId === brandKitId,
      ),
      nextCursor: null,
    });
  }),

  http.get(`${API}/me/designs/:id/export`, ({ params, request }) => {
    const url = new URL(request.url);
    designsMock.exports.push({
      id: String(params.id),
      format: url.searchParams.get('format'),
      size: url.searchParams.get('size'),
    });
    if (designsMock.failExport) return error(404, 'DESIGN_NOT_FOUND');
    const format = url.searchParams.get('format') ?? 'png';
    return new HttpResponse(new Uint8Array([1, 2, 3]), {
      headers: {
        'Content-Type': `image/${format === 'jpg' ? 'jpeg' : format}`,
        'Content-Disposition': `attachment; filename="design-${String(params.id)}.${format}"`,
      },
    });
  }),

  http.get(`${API}/admin/agent-runs`, ({ request }) => {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    designsMock.runCalls.push(query);
    return HttpResponse.json({
      items: designsMock.runs.filter(
        (r) =>
          (!query.status || r.status === query.status) &&
          (!query.userId || r.userId === query.userId),
      ),
      nextCursor: null,
    });
  }),

  http.get(`${API}/admin/agent-runs/:id`, ({ params }) => {
    const detail = designsMock.detail;
    if (!detail || detail.id !== params.id) {
      return error(404, 'AGENT_RUN_NOT_FOUND');
    }
    return HttpResponse.json(detail);
  }),
];
