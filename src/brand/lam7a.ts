import type { BrandConfig } from './types';

export const lam7a: BrandConfig = {
  key: 'lam7a',
  name: { ar: 'لمحة AI', en: 'Lam7a AI' },
  tagline: {
    ar: 'مساعدك الذكي بالعربية، لكل مهمة وضعها المناسب',
    en: 'Your AI assistant in Arabic, with the right mode for every task',
  },
  monogram: 'ل',
  colors: {
    brand: '#1e293b',
    brandHover: '#0f172a',
    onBrand: '#ffffff',
    accent: '#99f6e4',
  },
  // Logo A (design/brand/logo, chosen 2026-11-12): the letter lam with a dot.
  mark: {
    d: 'M43 10V37C43 46 37 51 29 51C21 51 16 47 14 41',
    strokeWidth: 7,
    dot: { cx: 28, cy: 35, r: 5.5 },
  },
  // WhatsApp and phone removed 2026-10-15; new numbers come later.
  contact: {
    email: 'contact@lam7ai.com',
  },
  // Interim privacy notice; terms wait for the company registration and a lawyer.
  legal: { privacyUrl: '/privacy' },
};
