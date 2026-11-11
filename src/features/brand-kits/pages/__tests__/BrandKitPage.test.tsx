import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetChatMock } from '~/mocks/chat';
import { asset, brandKitsMock, kit } from '~/mocks/brand-kits';
import ar from '~/test/ar';
import { renderApp, signInDirectly, useAuthMocks } from '~/test/render-app';

const uploadFile = vi.hoisted(() => vi.fn());
vi.mock('~/platform/upload', () => ({ uploadFile }));

useAuthMocks();
beforeEach(async () => {
  resetChatMock();
  uploadFile.mockReset();
  await signInDirectly();
});

const b = ar.brandKits;
const sectionOf = (title: string) =>
  screen.getByRole('region', { name: title });

async function openKit(patch: Parameters<typeof kit>[1] = {}) {
  brandKitsMock.kits = [kit('k1', { name: 'مقهى الندى', ...patch })];
  const app = await renderApp('/brands/k1');
  await screen.findByRole('heading', { level: 1, name: 'مقهى الندى' });
  return app;
}

describe('BrandKitPage', () => {
  it('saves a colour change as its own PATCH', async () => {
    await openKit({ colors: ['#7A3E1D', '#F2E3CF'] });
    const colors = sectionOf(b.colors.title);
    fireEvent.click(
      within(colors).getByRole('button', {
        name: b.colors.later.replace('{{hex}}', '#7A3E1D'),
      }),
    );
    expect(screen.getByText(b.unsaved.bar)).toBeInTheDocument();
    fireEvent.click(
      within(colors).getByRole('button', { name: b.colors.save }),
    );
    await waitFor(() =>
      expect(brandKitsMock.calls).toContainEqual({
        name: 'update',
        body: { colors: ['#F2E3CF', '#7A3E1D'] },
      }),
    );
    await waitFor(() => expect(screen.queryByText(b.unsaved.bar)).toBeNull());
  });

  it('saves the whole profile at once, rules trimmed and empty ones dropped', async () => {
    await openKit();
    const profile = sectionOf(b.profile.title);
    fireEvent.change(within(profile).getByLabelText(b.profile.tone), {
      target: { value: 'ودّية' },
    });
    const dos = within(profile).getByRole('group', { name: b.profile.dos });
    fireEvent.click(
      within(dos).getByRole('button', { name: b.profile.addRule }),
    );
    fireEvent.click(
      within(dos).getByRole('button', { name: b.profile.addRule }),
    );
    const rules = within(dos).getAllByRole('textbox');
    fireEvent.change(rules[0]!, { target: { value: '  اترك مساحة  ' } });
    fireEvent.click(
      within(profile).getByRole('button', { name: b.profile.save }),
    );
    await waitFor(() =>
      expect(brandKitsMock.calls).toContainEqual({
        name: 'update',
        body: {
          profile: {
            style: '',
            tone: 'ودّية',
            fontStyle: '',
            dos: ['اترك مساحة'],
            donts: [],
            notes: '',
          },
        },
      }),
    );
  });

  it('blocks a rule over 200 characters', async () => {
    await openKit();
    const profile = sectionOf(b.profile.title);
    const dos = within(profile).getByRole('group', { name: b.profile.dos });
    fireEvent.click(
      within(dos).getByRole('button', { name: b.profile.addRule }),
    );
    fireEvent.change(within(dos).getByRole('textbox'), {
      target: { value: 'x'.repeat(201) },
    });
    expect(within(dos).getByRole('alert')).toHaveTextContent(
      b.profile.ruleTooLong,
    );
    expect(
      within(profile).getByRole('button', { name: b.profile.save }),
    ).toBeDisabled();
  });

  it('uploads a logo with progress and offers its colours without adding them', async () => {
    uploadFile.mockImplementation(async ({ onProgress }) => {
      onProgress(50);
      const added = asset('a9', { kind: 'logo' });
      brandKitsMock.kits[0]!.assets.unshift(added);
      return {
        status: 201,
        body: { asset: added, suggestedColors: ['#E8B04B'] },
      };
    });
    await openKit({ colors: ['#7A3E1D'] });
    const logos = screen.getByRole('region', {
      name: b.assets.kinds.logo.title,
    });
    const input = logos.querySelector<HTMLInputElement>(
      'input[type=file]:not([capture])',
    )!;
    fireEvent.change(input, {
      target: { files: [new File(['x'], 'logo.png', { type: 'image/png' })] },
    });
    await waitFor(() =>
      expect(uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'http://localhost:3000/api/v1/me/brand-kits/k1/assets?kind=logo',
          field: 'file',
        }),
      ),
    );
    expect(
      await screen.findByText(b.colors.suggestedTitle),
    ).toBeInTheDocument();
    expect(brandKitsMock.calls.some((c) => c.name === 'update')).toBe(false);
    await screen.findByRole('button', {
      name: b.assets.removeLabel
        .replace('{{position}}', '1')
        .replace('{{group}}', b.assets.kinds.logo.title),
    });
  });

  it('shows the server refusal under the files and never retries it', async () => {
    uploadFile.mockResolvedValue({
      status: 415,
      body: {
        statusCode: 415,
        code: 'BRAND_ASSET_TYPE_NOT_ALLOWED',
        message: 'x',
      },
    });
    await openKit();
    const products = screen.getByRole('region', {
      name: b.assets.kinds.product.title,
    });
    fireEvent.change(
      products.querySelector<HTMLInputElement>(
        'input[type=file]:not([capture])',
      )!,
      { target: { files: [new File(['x'], 'p.png', { type: 'image/png' })] } },
    );
    expect(await within(products).findByRole('alert')).toHaveTextContent(
      ar.brandKits.assets.failed.replace('{{name}}', 'p.png'),
    );
    expect(
      within(products).queryByRole('button', { name: b.assets.retry }),
    ).toBeNull();
  });

  it('disables every drop zone at 40 files', async () => {
    await openKit({
      assets: Array.from({ length: 40 }, (_, i) =>
        asset(`a${i}`, { kind: 'reference' }),
      ),
    });
    expect(screen.getByText(b.assets.limitReached)).toBeInTheDocument();
    for (const button of screen.getAllByRole('button', {
      name: b.assets.drop,
    })) {
      expect(button).toBeDisabled();
    }
  });

  it('deletes a file', async () => {
    await openKit({
      assets: [asset('a1', { kind: 'product', mimeType: 'image/jpeg' })],
    });
    fireEvent.click(
      screen.getByRole('button', {
        name: b.assets.removeLabel
          .replace('{{position}}', '1')
          .replace('{{group}}', b.assets.kinds.product.title),
      }),
    );
    await waitFor(() =>
      expect(brandKitsMock.calls).toContainEqual({
        name: 'deleteAsset',
        body: 'a1',
      }),
    );
  });

  it('shows the draft note only for a draft, linking to the chat', async () => {
    await openKit({ status: 'draft' });
    expect(screen.getByText(b.draftNote.title)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: b.draftNote.action }),
    ).toHaveAttribute('href', '/chat');
  });

  it('has no draft note for a ready kit', async () => {
    await openKit();
    expect(screen.queryByText(b.draftNote.title)).toBeNull();
  });

  it('shows a way back for an unknown kit', async () => {
    await renderApp('/brands/missing');
    expect(await screen.findByText(b.notFound.title)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: b.notFound.action }),
    ).toHaveAttribute('href', '/brands');
  });
});
