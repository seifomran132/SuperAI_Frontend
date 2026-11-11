import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { UploadBrandAssetResultDto } from '~/api/generated/types.gen';
import { asset } from '~/mocks/brand-kits';
import { BrandUploadError, type UploadBrandAsset } from '../upload';
import { useAssetUploads } from '../useAssetUploads';

const png = (name = 'logo.png') => new File(['x'], name, { type: 'image/png' });

function setup(upload: UploadBrandAsset) {
  const onUploaded = vi.fn();
  const hook = renderHook(() =>
    useAssetUploads({ kitId: 'k1', onUploaded, upload }),
  );
  return { ...hook, onUploaded };
}

describe('useAssetUploads', () => {
  it('uploads with progress and hands back the result', async () => {
    const result: UploadBrandAssetResultDto = {
      asset: asset('a1'),
      suggestedColors: ['#E8B04B'],
    };
    let finish: (r: UploadBrandAssetResultDto) => void = () => {};
    const upload: UploadBrandAsset = vi.fn((_k, _kind, _f, onProgress) => {
      onProgress(40);
      return new Promise<UploadBrandAssetResultDto>((resolve) => {
        finish = resolve;
      });
    });
    const { result: hook, onUploaded } = setup(upload);
    act(() => hook.current.add('logo', [png()], 40));
    expect(hook.current.items[0]).toMatchObject({
      status: 'uploading',
      progress: 40,
    });
    expect(upload).toHaveBeenCalledWith(
      'k1',
      'logo',
      expect.any(File),
      expect.any(Function),
      expect.any(AbortSignal),
    );
    await act(async () => finish(result));
    expect(hook.current.items).toHaveLength(0);
    expect(onUploaded).toHaveBeenCalledWith(result, 'logo');
  });

  it('never sends a file that fails the first check, or one past 40', () => {
    const upload = vi.fn<UploadBrandAsset>(() => new Promise(() => {}));
    const { result } = setup(upload);
    act(() =>
      result.current.add(
        'logo',
        [
          new File(['x'], 'a.gif', { type: 'image/gif' }),
          png('a.png'),
          png('b.png'),
        ],
        1,
      ),
    );
    expect(result.current.items.map((i) => i.code)).toEqual([
      'BRAND_ASSET_TYPE_NOT_ALLOWED',
      null,
      'BRAND_ASSET_LIMIT_REACHED',
    ]);
    expect(upload).toHaveBeenCalledTimes(1);
  });

  it('keeps a failed upload with its code; retry sends it again', async () => {
    const upload = vi
      .fn<UploadBrandAsset>()
      .mockRejectedValueOnce(new BrandUploadError('RATE_LIMITED', true))
      .mockResolvedValueOnce({ asset: asset('a2'), suggestedColors: [] });
    const { result, onUploaded } = setup(upload);
    act(() => result.current.add('product', [png()], 40));
    await waitFor(() =>
      expect(result.current.items[0]).toMatchObject({
        status: 'failed',
        code: 'RATE_LIMITED',
        retryable: true,
      }),
    );
    await act(async () => result.current.retry(result.current.items[0]!.id));
    await waitFor(() => expect(onUploaded).toHaveBeenCalled());
    expect(result.current.items).toHaveLength(0);
  });
});
