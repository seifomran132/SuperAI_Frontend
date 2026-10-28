// Image creation options for a send in an image mode (API_CONTRACT §9).
// The chat send is excluded from code generation, so this mirrors the
// backend's ImageOptionsDto by hand.

export const ASPECT_RATIOS = ['1:1', '3:4', '4:3', '9:16', '16:9'] as const;

export type AspectRatio = (typeof ASPECT_RATIOS)[number];

/** Omitted (or no aspectRatio) means automatic: the model follows an attached image, otherwise square. */
export interface ImageOptions {
  aspectRatio?: AspectRatio;
}
