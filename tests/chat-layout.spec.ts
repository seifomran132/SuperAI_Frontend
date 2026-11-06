import { expect, test } from '@playwright/test';
import { SKIP_MESSAGE, createImageUser, stackReachable, text } from './support';

// Regression: screen-reader-only labels (position: absolute) in each message
// had no positioned ancestor, so a long chat made the whole page scroll and
// left a big empty gap under the layout.
test('a long chat never makes the page taller than the window', async ({
  page,
}) => {
  test.skip(!(await stackReachable()), SKIP_MESSAGE);
  test.setTimeout(240_000);
  await createImageUser(page, 'e2e-layout');
  await page.goto('/chat');
  const box = page.getByRole('textbox');
  for (let i = 0; i < 5; i++) {
    await box.fill(`صورة ${i} ` + 'نص طويل '.repeat(40));
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('button', { name: text.chat.composer.stop }),
    ).toHaveCount(0, { timeout: 60_000 });
  }
  const { scroll, client } = await page.evaluate(() => ({
    scroll: document.documentElement.scrollHeight,
    client: document.documentElement.clientHeight,
  }));
  expect(scroll).toBeLessThanOrEqual(client);
});
