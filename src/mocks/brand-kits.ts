import { http, HttpResponse } from 'msw';
import type {
  AgentDto,
  BrandAssetDto,
  BrandKitDetailDto,
  CreateBrandKitDto,
  UpdateBrandKitDto,
} from '~/api/generated/types.gen';

// Brand kits (§10) and the agents list (§11) for unit tests. State resets
// before every test (useAuthMocks). `GET /agents` answers [] unless a test
// turns the graphic designer on, as the backend does until stage 4.

const API = 'http://localhost:3000/api/v1';

export const graphicDesigner: AgentDto = {
  key: 'graphic_designer',
  labelAr: 'مصمم جرافيك',
  labelEn: 'Graphic designer',
  descriptionAr: 'تصاميم بهوية علامتك',
  descriptionEn: 'Designs in your brand',
};

export const asset = (
  id: string,
  patch: Partial<BrandAssetDto> = {},
): BrandAssetDto => ({
  id,
  kind: 'logo',
  mimeType: 'image/png',
  bytes: 120_000,
  width: 512,
  height: 512,
  hasPreview: true,
  createdAt: '2026-11-10T10:00:00.000Z',
  ...patch,
});

export const kit = (
  id: string,
  patch: Partial<BrandKitDetailDto> = {},
): BrandKitDetailDto => {
  const assets = patch.assets ?? [];
  return {
    id,
    name: `هوية ${id}`,
    colors: ['#7A3E1D', '#F2E3CF'],
    profile: {
      style: '',
      tone: '',
      fontStyle: '',
      dos: [],
      donts: [],
      notes: '',
    },
    version: 1,
    status: 'ready',
    assetCount: assets.length,
    logoAssetId: assets.find((a) => a.kind === 'logo')?.id ?? null,
    createdAt: '2026-11-10T10:00:00.000Z',
    updatedAt: '2026-11-10T10:00:00.000Z',
    assets,
    ...patch,
  };
};

interface BrandKitsMockState {
  kits: BrandKitDetailDto[];
  limit: number;
  agents: AgentDto[];
  suggestedColors: string[];
  /** Next upload answers with this error instead. */
  uploadError: { status: number; code: string } | null;
  failList: boolean;
  calls: { name: string; body?: unknown }[];
}

const fresh = (): BrandKitsMockState => ({
  kits: [],
  limit: 5,
  agents: [],
  suggestedColors: ['#E8B04B', '#3B2A20'],
  uploadError: null,
  failList: false,
  calls: [],
});

export const brandKitsMock: BrandKitsMockState = fresh();

export function resetBrandKitsMock() {
  Object.assign(brandKitsMock, fresh());
}

const notFound = (code = 'BRAND_KIT_NOT_FOUND') =>
  HttpResponse.json(
    { statusCode: 404, code, message: 'Not found' },
    { status: 404 },
  );

const find = (id: string) => brandKitsMock.kits.find((k) => k.id === id);
const summary = (k: BrandKitDetailDto) => {
  const { assets, ...rest } = k;
  return {
    ...rest,
    assetCount: assets.length,
    logoAssetId: assets.find((a) => a.kind === 'logo')?.id ?? null,
  };
};

let created = 0;

export const brandKitHandlers = [
  http.get(`${API}/agents`, () => HttpResponse.json(brandKitsMock.agents)),

  http.get(`${API}/me/brand-kits`, () => {
    if (brandKitsMock.failList) {
      return HttpResponse.json(
        { statusCode: 500, code: 'INTERNAL_ERROR', message: 'x' },
        { status: 500 },
      );
    }
    return HttpResponse.json({
      items: brandKitsMock.kits.map(summary),
      nextCursor: null,
      limit: brandKitsMock.limit,
    });
  }),

  http.post(`${API}/me/brand-kits`, async ({ request }) => {
    const body = (await request.json()) as CreateBrandKitDto;
    brandKitsMock.calls.push({ name: 'create', body });
    if (brandKitsMock.kits.length >= brandKitsMock.limit) {
      return HttpResponse.json(
        {
          statusCode: 409,
          code: 'BRAND_KIT_LIMIT_REACHED',
          message: 'Limit',
          data: { limit: brandKitsMock.limit },
        },
        { status: 409 },
      );
    }
    const next = kit(`new-${++created}`, {
      name: body.name,
      colors: body.colors ?? [],
    });
    brandKitsMock.kits.unshift(next);
    return HttpResponse.json(summary(next), { status: 201 });
  }),

  http.get(`${API}/me/brand-kits/:id`, ({ params }) => {
    const found = find(String(params.id));
    return found ? HttpResponse.json(found) : notFound();
  }),

  http.patch(`${API}/me/brand-kits/:id`, async ({ params, request }) => {
    const found = find(String(params.id));
    if (!found) return notFound();
    const body = (await request.json()) as UpdateBrandKitDto;
    brandKitsMock.calls.push({ name: 'update', body });
    if (body.name !== undefined) found.name = body.name;
    if (body.colors) found.colors = body.colors;
    if (body.profile) found.profile = { ...found.profile, ...body.profile };
    if (body.colors || body.profile) found.version += 1;
    return HttpResponse.json(found);
  }),

  http.delete(`${API}/me/brand-kits/:id`, ({ params }) => {
    const id = String(params.id);
    if (!find(id)) return notFound();
    brandKitsMock.calls.push({ name: 'delete', body: id });
    brandKitsMock.kits = brandKitsMock.kits.filter((k) => k.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/me/brand-kits/:id/assets/:assetId/file`, () =>
    HttpResponse.arrayBuffer(new Uint8Array([137, 80, 78, 71]).buffer, {
      headers: { 'Content-Type': 'image/png' },
    }),
  ),

  http.delete(`${API}/me/brand-kits/:id/assets/:assetId`, ({ params }) => {
    const found = find(String(params.id));
    if (!found) return notFound();
    brandKitsMock.calls.push({ name: 'deleteAsset', body: params.assetId });
    found.assets = found.assets.filter((a) => a.id !== params.assetId);
    return new HttpResponse(null, { status: 204 });
  }),
];
