import { z } from 'zod';
import { periodError } from '~/lib/period';

// Kept apart from lib/period.ts: only the picker needs zod, and the period helpers
// are imported by routes on the first screen.

/** Form schema for the custom range; issue messages are i18n keys. */
export function customRangeSchema(today: Date = new Date()) {
  return z
    .object({ from: z.string(), to: z.string() })
    .superRefine((value, ctx) => {
      const error = periodError(value.from, value.to, today);
      if (error)
        ctx.addIssue({
          code: 'custom',
          path: [error.field],
          message: `reports.period.errors.${error.key}`,
        });
    });
}
