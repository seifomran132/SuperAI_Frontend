import { describe, expect, it } from 'vitest';
import { closeUnfinished } from '../close-unfinished';

describe('closeUnfinished (streaming Markdown)', () => {
  it('leaves finished text alone', () => {
    const text = 'نص **غامق** و `code`\n\n```py\nx = 1\n```\n';
    expect(closeUnfinished(text)).toBe(text);
  });

  it('closes an open code fence', () => {
    expect(closeUnfinished('```python\nprint(1)')).toBe(
      '```python\nprint(1)\n```',
    );
    expect(closeUnfinished('```js\nlet a;\n')).toBe('```js\nlet a;\n```');
  });

  it('closes a tilde fence with the same marker', () => {
    expect(closeUnfinished('~~~\ntext')).toBe('~~~\ntext\n~~~');
  });

  it('does not touch ** inside an open code block', () => {
    expect(closeUnfinished('```\na ** b')).toBe('```\na ** b\n```');
  });

  it('closes an unfinished bold span', () => {
    expect(closeUnfinished('هذا **مهم')).toBe('هذا **مهم**');
  });

  it('drops a lone trailing ** instead of closing it', () => {
    expect(closeUnfinished('هذا **')).toBe('هذا ');
  });

  it('closes an open inline code span', () => {
    expect(closeUnfinished('استخدم `print')).toBe('استخدم `print`');
  });

  it('ignores ** inside inline code', () => {
    expect(closeUnfinished('الرمز `**` مثال')).toBe('الرمز `**` مثال');
  });

  it('a closed fence followed by open bold still closes the bold', () => {
    expect(closeUnfinished('```\nx\n```\nنهاية **جزئية')).toBe(
      '```\nx\n```\nنهاية **جزئية**',
    );
  });
});
