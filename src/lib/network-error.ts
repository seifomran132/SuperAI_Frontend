/** fetch() rejections: a TypeError whose text varies by browser. */
export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false;
  return /failed to fetch|networkerror|load failed|network request failed/i.test(
    error.message,
  );
}
