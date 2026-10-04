import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// RTL rule (CLAUDE.md): only logical utilities (ms-/me-/ps-/pe-/start-/end-).
const roots = ['src/features', 'src/components', 'src/routes'];
const physical =
  /(?<![\w-])(?:-?(?:ml|mr|pl|pr)-(?:\d|\[|px|auto)|(?:left|right)-(?:\d|\[|px|auto|full|1\/2)|text-(?:left|right)\b|border-[lr]\b|border-[lr]-|rounded-[lr]\b|rounded-[lr]-)/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

describe('logical (RTL-safe) classes', () => {
  it('no component uses physical left/right utilities', () => {
    const offenders: string[] = [];
    for (const file of roots.flatMap(sourceFiles)) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (physical.test(line))
            offenders.push(`${file}:${i + 1}: ${line.trim()}`);
        });
    }
    expect(offenders).toEqual([]);
  });
});
