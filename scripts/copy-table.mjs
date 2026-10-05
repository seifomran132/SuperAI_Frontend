// Writes docs/copy/AR_COPY_REVIEW.md: every Arabic UI string next to its English
// version, grouped by screen area, with an empty column for review notes.
// Regenerate with `npm run copy:table` after copy changes.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const sources = [
  ['src/i18n/ar.json', 'src/i18n/en.json'],
  ['src/i18n/errors.ar.json', 'src/i18n/errors.en.json', 'errors'],
];

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flatten(v, key, out);
    else out[key] = String(v);
  }
  return out;
}

const cell = (s = '') =>
  s.replace(/\|/g, '\\|').replace(/\n/g, '<br>').trim() || '—';

const groups = new Map();
let total = 0;
for (const [arPath, enPath, ns] of sources) {
  const ar = flatten(read(arPath), ns);
  const en = flatten(read(enPath), ns);
  for (const [key, value] of Object.entries(ar)) {
    // Group by parent key, at most two levels: "common", "chat.composer".
    const group = key.split('.').slice(0, -1).slice(0, 2).join('.') || key;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push([key, value, en[key]]);
    total++;
  }
}

const lines = [
  '# Arabic copy review',
  '',
  `Generated from \`src/i18n\` by \`npm run copy:table\` — ${total} strings. Do not edit the Arabic here: write the correction in **Notes**, and the frontend team applies it to \`ar.json\`.`,
  '',
  '- `{{name}}` parts are filled in by the app (brand name, amounts, dates); keep them as they are.',
  '- `errors.*` strings are shown when the API returns that error code.',
  '- Keys ending in `_one`, `_two`, `_few`, `_many`, `_other`, `_zero` are Arabic plural forms of one message.',
  '',
  '## Contents',
  '',
  ...[...groups.keys()].map(
    (g) => `- [${g}](#${g.replace(/\./g, '').toLowerCase()})`,
  ),
];
for (const [group, rows] of groups) {
  lines.push(
    '',
    `## ${group}`,
    '',
    '| Key | العربية | English | Notes |',
    '|---|---|---|---|',
  );
  for (const [key, ar, en] of rows) {
    lines.push(
      `| \`${key.slice(group.length + 1) || key}\` | ${cell(ar)} | ${cell(en)} | |`,
    );
  }
}

mkdirSync('docs/copy', { recursive: true });
writeFileSync('docs/copy/AR_COPY_REVIEW.md', lines.join('\n') + '\n');
console.log(
  `docs/copy/AR_COPY_REVIEW.md: ${total} strings in ${groups.size} groups`,
);
