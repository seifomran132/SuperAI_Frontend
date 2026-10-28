import type {
  ConversationDto,
  MessageDto,
  ModeDto,
} from '~/api/generated/types.gen';

export const modeFast: ModeDto = {
  key: 'fast',
  labelAr: 'سريع',
  labelEn: 'Fast',
  descriptionAr: 'إجابات سريعة للمهام اليومية',
  descriptionEn: 'Quick answers for everyday tasks',
  pricing: {
    currency: 'USD',
    inputPerMtok: '0.150000000',
    outputPerMtok: '0.600000000',
  },
  supportsImages: false,
  generatesImages: false,
};

export const modeProfessional: ModeDto = {
  key: 'professional',
  labelAr: 'احترافي',
  labelEn: 'Professional',
  descriptionAr: 'إجابات أعمق للمهام المعقدة',
  descriptionEn: 'Deeper answers for complex work',
  pricing: {
    currency: 'USD',
    inputPerMtok: '3.000000000',
    outputPerMtok: '15.000000000',
  },
  supportsImages: true,
  generatesImages: false,
};
/** An image mode (§9.1); in GET /modes only when `chatMock.imageModes` is on. */
/** An image mode (§9.1); only in GET /modes when  is on. */
export const modeImage: ModeDto = {
  key: 'image',
  labelAr: 'تصميم',
  labelEn: 'Design',
  descriptionAr: 'صور من وصفك',
  descriptionEn: 'Images from your description',
  pricing: {
    currency: 'USD',
    inputPerMtok: '0.300000000',
    outputPerMtok: '30.000000000',
  },
  supportsImages: true,
  generatesImages: true,
};

let counter = 0;

/** Deterministic, time-ordered-looking UUIDs for mock rows. */
export function mockId(): string {
  counter += 1;
  const hex = counter.toString(16).padStart(12, '0');
  return `01a0edbf-bd40-744a-9593-${hex}`;
}

export function conversation(
  overrides: Partial<ConversationDto> = {},
): ConversationDto {
  const now = new Date().toISOString();
  return {
    id: mockId(),
    title: null,
    modeKey: 'fast',
    lastMessageAt: now,
    createdAt: now,
    ...overrides,
  };
}

export function message(
  overrides: Partial<MessageDto> & Pick<MessageDto, 'sequence' | 'role'>,
): MessageDto {
  const now = new Date().toISOString();
  return {
    id: mockId(),
    content: '',
    status: 'complete',
    modeKey: 'fast',
    finishReason: 'stop',
    errorCode: null,
    createdAt: now,
    completedAt: now,
    attachments: [],
    costUsd: null,
    usage: null,
    ...overrides,
  };
}
