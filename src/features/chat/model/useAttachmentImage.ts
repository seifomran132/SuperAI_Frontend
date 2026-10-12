import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { AttachmentImageResult } from './image-input';
import { attachmentOptions } from './queries';

/** A stored image as an object URL, revoked when the component lets go of it. */
export function useAttachmentImage(id: string): AttachmentImageResult {
  const query = useQuery(attachmentOptions(id));
  const blob = query.data;
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!blob) return;
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => {
      URL.revokeObjectURL(next);
      setUrl(undefined);
    };
  }, [blob]);

  return {
    url,
    isPending: query.isPending || (blob !== undefined && url === undefined),
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
