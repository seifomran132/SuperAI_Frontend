import { http, HttpResponse } from 'msw';
import type {
  AdminAgentDto,
  AgentAnswerDto,
  UpdateAgentDto,
} from '~/api/generated/types.gen';
import { chatMock, conversation, message } from './chat';

// The graphic designer's steps (§11) for unit tests: a scripted list of
// questions, served one per answer. Registered before the chat handlers, so
// `POST /conversations` with `agentKey` lands here. Reset with the chat mock.

const API = 'http://localhost:3000/api/v1';

type Ui = Record<string, unknown> & { type: string; step: string };

export const agentPrompts: Record<string, string> = {
  brand_pick: 'لأي علامة تجارية نصمم اليوم؟',
  brand_name: 'ما اسم العلامة التجارية؟',
  brand_logo: 'ارفع شعار العلامة.',
  brand_colors: 'هذه ألوان علامتك؟',
  brand_style: 'ما الطابع الذي يناسب علامتك؟',
  design_format: 'ماذا نصمم؟',
  design_text: 'ما النص الذي يظهر على التصميم؟',
  design_summary: 'هذا طلبك. هل نبدأ؟',
  design_running: 'أعمل على تصاميمك الآن.',
  design_results: 'هذه تصاميمك.',
  edit_summary: 'راجع التعديل قبل أن ننفّذه.',
  edit_changes: 'ماذا نغيّر في التصميم؟',
  edit_logo_region: 'حدّد مكان الشعار في التصميم',
  edit_product_region: 'حدّد مكان المنتج في التصميم',
  blocked: 'باقتك الحالية لا تتيح هويات العلامة التجارية.',
};

export const steps = {
  brandName: (): Ui => ({
    type: 'text',
    step: 'brand_name',
    maxLength: 80,
    optional: false,
  }),
  colors: (current: string[] = [], suggested: string[] = []): Ui => ({
    type: 'colors',
    step: 'brand_colors',
    current,
    suggested,
    max: 12,
  }),
  style: (): Ui => ({
    type: 'choices',
    step: 'brand_style',
    options: [
      { value: 'minimal', labelAr: 'بسيط وهادئ', labelEn: 'Minimal' },
      { value: 'bold', labelAr: 'جريء وملفت', labelEn: 'Bold' },
    ],
    allowText: true,
    maxLength: 300,
  }),
  logo: (brandKitId = 'kit-1'): Ui => ({
    type: 'upload',
    step: 'brand_logo',
    brandKitId,
    kinds: ['logo'],
    maxFiles: 10,
    optional: true,
  }),
  picker: (canCreate = true): Ui => ({
    type: 'brand_picker',
    step: 'brand_pick',
    kits: [
      { id: 'kit-1', name: 'مقهى الندى', status: 'ready', logoAssetId: null },
      { id: 'kit-2', name: 'متجر زهرة', status: 'draft', logoAssetId: null },
    ],
    canCreate,
  }),
  text: (): Ui => ({
    type: 'fields',
    step: 'design_text',
    fields: [
      {
        key: 'headline',
        labelAr: 'العنوان',
        labelEn: 'Headline',
        maxLength: 60,
      },
      {
        key: 'subtext',
        labelAr: 'سطر إضافي',
        labelEn: 'Second line',
        maxLength: 120,
      },
    ],
  }),
  summary: (
    estimate: { variants: number; fitsVariants: number } | null = null,
  ): Ui => ({
    type: 'summary',
    step: 'design_summary',
    items: [
      {
        field: 'format',
        labelAr: 'النوع',
        labelEn: 'Format',
        value: 'منشور إنستغرام',
      },
      { field: 'text', labelAr: 'النص', labelEn: 'Text', value: '' },
      { field: 'media', labelAr: 'الصور', labelEn: 'Images', value: '2' },
    ],
    editable: ['format', 'text', 'media'],
    estimate: estimate && {
      ...estimate,
      aboutUsd: '0.060000000',
      atMostUsd: '0.120000000',
      balanceUsd: '0.050000000',
    },
  }),
  editSummary: (): Ui => ({
    type: 'summary',
    step: 'edit_summary',
    items: [
      {
        field: 'change',
        labelAr: 'التعديل',
        labelEn: 'Change',
        value: 'غيّر اللون إلى الأزرق',
      },
    ],
    editable: [],
    estimate: null,
  }),
  changes: (): Ui => ({
    type: 'choices',
    step: 'edit_changes',
    multiple: true,
    options: [
      {
        value: 'replace_logo',
        labelAr: 'استبدال الشعار',
        labelEn: 'Replace the logo',
      },
      {
        value: 'replace_product',
        labelAr: 'استبدال المنتج',
        labelEn: 'Replace the product',
      },
      {
        value: 'change_text',
        labelAr: 'تغيير النص',
        labelEn: 'Change the text',
      },
    ],
    allowText: true,
    maxLength: 500,
  }),
  progress: (done = 1, total = 2): Ui => ({
    type: 'progress',
    step: 'design_running',
    done,
    total,
  }),
  results: (
    designs: {
      outputId: string;
      attachmentId: string;
      version?: number;
      needsReview?: boolean;
      width?: number;
      height?: number;
    }[] = [],
  ): Ui => ({
    type: 'results',
    step: 'design_results',
    designs: designs.map((d, i) => ({
      variant: i + 1,
      width: 1024,
      height: 1024,
      version: 1,
      needsReview: false,
      editable: true,
      ...d,
    })),
    options:
      designs.length > 0
        ? [
            {
              value: 'new_design',
              labelAr: 'تصميم جديد',
              labelEn: 'A new design',
            },
            {
              value: 'change_brand',
              labelAr: 'علامة أخرى',
              labelEn: 'Another brand',
            },
          ]
        : [
            {
              value: 'try_again',
              labelAr: 'حاول مرة أخرى',
              labelEn: 'Try again',
            },
            {
              value: 'change_brand',
              labelAr: 'علامة أخرى',
              labelEn: 'Another brand',
            },
          ],
  }),
  region: (
    target: 'product' | 'logo' = 'product',
    current: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null = null,
  ): Ui => ({
    type: 'region',
    step: target === 'logo' ? 'edit_logo_region' : 'edit_product_region',
    brandKitId: 'kit-1',
    assetId: 'design-1',
    width: 1200,
    height: 900,
    target,
    optional: target === 'logo',
    current,
  }),
  blocked: (): Ui => ({ type: 'none', step: 'blocked' }),
};

interface AgentMockState {
  /** First question of a new agent conversation. */
  first: Ui;
  /** Questions served after each answer, in order. */
  next: Ui[];
  /** The next answer call fails like this (once). */
  fail: { status: number; code: string; data?: unknown } | 'network' | null;
  answers: AgentAnswerDto[];
  admin: AdminAgentDto[];
  adminCalls: UpdateAgentDto[];
}

export const adminAgent = (
  patch: Partial<AdminAgentDto> = {},
): AdminAgentDto => ({
  key: 'graphic_designer',
  labelAr: 'مصمم جرافيك',
  labelEn: 'Graphic designer',
  descriptionAr: 'تصاميم بهوية علامتك',
  descriptionEn: 'Designs in your brand',
  isEnabled: false,
  sortOrder: 10,
  planKeys: [],
  updatedAt: '2026-11-10T09:15:00.000Z',
  promptModel: null,
  imageModel: null,
  checkModel: null,
  variants: 2,
  marginOverridePct: null,
  ready: false,
  promptInstructions: null,
  checkInstructions: null,
  ...patch,
});

const fresh = (): AgentMockState => ({
  first: steps.brandName(),
  next: [],
  fail: null,
  answers: [],
  admin: [adminAgent()],
  adminCalls: [],
});

export const agentMock: AgentMockState = fresh();

export function resetAgentMock() {
  Object.assign(agentMock, fresh());
}

const question = (conversationId: string, ui: Ui, sequence: number) =>
  message({
    sequence,
    role: 'assistant',
    content: agentPrompts[ui.step] ?? ui.step,
    modeKey: null,
    ui: {
      ...ui,
      prompt: { ar: agentPrompts[ui.step] ?? ui.step, en: ui.step },
    },
  });

const replyText = (value: Record<string, unknown>): string => {
  if (typeof value.text === 'string') return value.text || 'تخطي';
  if (typeof value.choice === 'string') return value.choice;
  if (Array.isArray(value.colors)) return value.colors.join(' ');
  if (Array.isArray(value.assetIds))
    return value.assetIds.length
      ? `أرسلت ${value.assetIds.length} ملف`
      : 'تخطي';
  if (value.new === true) return 'علامة تجارية جديدة';
  if (typeof value.brandKitId === 'string') return 'هذه العلامة';
  if (typeof value.action === 'string') return value.action;
  return 'تمام';
};

const apiError = (status: number, code: string, data?: unknown) =>
  HttpResponse.json(
    { statusCode: status, code, message: code, ...(data ? { data } : {}) },
    { status },
  );

export const agentHandlers = [
  // Only agent conversations; a normal one falls through to the chat handlers.
  http.post(`${API}/conversations`, async ({ request }) => {
    const body = (await request.clone().json()) as { agentKey?: string };
    if (!body.agentKey) return undefined;
    chatMock.calls.push({ name: 'createConversation', body });
    const created = conversation({
      modeKey: null,
      agentKey: body.agentKey,
      title: 'مصمم جرافيك',
    });
    chatMock.conversations.push(created);
    chatMock.messages[created.id] = [question(created.id, agentMock.first, 1)];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post(
    `${API}/conversations/:id/agent/answer`,
    async ({ params, request }) => {
      const id = String(params.id);
      const body = (await request.json()) as AgentAnswerDto;
      agentMock.answers.push(body);
      const fail = agentMock.fail;
      agentMock.fail = null;
      if (fail === 'network') return HttpResponse.error();
      if (fail) return apiError(fail.status, fail.code, fail.data);
      const list = chatMock.messages[id] ?? [];
      const active = [...list].reverse().find((m) => m.role === 'assistant');
      const step = (active?.ui as Ui | null)?.step;
      if (step !== body.step) {
        return apiError(409, 'AGENT_STEP_MISMATCH', { step });
      }
      const sequence = (list.at(-1)?.sequence ?? 0) + 1;
      const reply = message({
        sequence,
        role: 'user',
        content: replyText(body.value),
        modeKey: null,
        answer: { step: body.step, value: body.value },
      });
      const nextUi = agentMock.next.shift() ?? steps.results();
      const next = question(id, nextUi, sequence + 1);
      list.push(reply, next);
      chatMock.messages[id] = list;
      return HttpResponse.json({ messages: [reply, next], step: nextUi.step });
    },
  ),

  http.get(`${API}/admin/agents`, () => HttpResponse.json(agentMock.admin)),

  http.patch(`${API}/admin/agents/:key`, async ({ params, request }) => {
    const body = (await request.json()) as UpdateAgentDto;
    agentMock.adminCalls.push(body);
    const found = agentMock.admin.find((a) => a.key === params.key);
    if (!found) return apiError(404, 'AGENT_NOT_FOUND');
    Object.assign(found, {
      ...body,
      planKeys: body.planKeys ?? found.planKeys,
    });
    return HttpResponse.json(found);
  }),
];
