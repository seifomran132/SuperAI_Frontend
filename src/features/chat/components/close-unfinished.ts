// While an answer streams, its Markdown is cut at an arbitrary character.
// Closing what is still open before rendering keeps a half-written code block
// or bold span from flashing as raw characters. The stored text is never
// changed; this only feeds the renderer.

const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/;

/** Walks the lines once; calls `prose` for lines outside fences, returns the fence left open. */
function scan(text: string, prose?: (line: string) => void): string | null {
  let open: string | null = null;
  for (const line of text.split('\n')) {
    const match = FENCE.exec(line);
    if (match) {
      const marker = match[1]!;
      if (open === null) {
        open = marker;
      } else if (
        marker[0] === open[0] &&
        marker.length >= open.length &&
        match[2]!.trim() === ''
      ) {
        open = null;
      }
      continue;
    }
    if (open === null) prose?.(line);
  }
  return open;
}

export function closeUnfinished(text: string): string {
  const lines: string[] = [];
  const fence = scan(text, (line) => lines.push(line));
  if (fence) return `${text}${text.endsWith('\n') ? '' : '\n'}${fence}`;

  // Inline code spans are literal: their markers do not count.
  const prose = lines.join('\n').replace(/`[^`\n]*`/g, '');
  let result = text;
  // An odd number of single backticks: an inline code span is still open.
  const openCode = (prose.match(/`/g)?.length ?? 0) % 2 === 1;
  if (openCode) result += '`';

  const bold = prose.replace(/`[^`]*$/, '').match(/\*\*/g)?.length ?? 0;
  if (bold % 2 === 1) {
    // A lone trailing "**" has no content yet: drop it instead of closing it.
    result = result.endsWith('**') ? result.slice(0, -2) : `${result}**`;
  }
  return result;
}
