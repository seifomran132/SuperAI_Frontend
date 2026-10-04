/** What an email link (confirm, recovery) left in the URL: either tokens or an error. */
export interface LinkParams {
  error: string | null;
  errorCode: string | null;
  /** GoTrue's `type` on success links (`signup`, `recovery`, …). */
  type: string | null;
}

export const emptyLinkParams: LinkParams = {
  error: null,
  errorCode: null,
  type: null,
};

/**
 * GoTrue reports link results in the hash (implicit flow) or, for some errors,
 * in the query string. Read both; the hash wins.
 */
export function parseLinkParams(url: string): LinkParams {
  let parsed: URL;
  try {
    parsed = new URL(url, 'http://localhost');
  } catch {
    return emptyLinkParams;
  }
  const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
  const query = parsed.searchParams;
  // `type` only counts from the hash: a query string is user-editable.
  const read = (key: string) => hash.get(key) ?? query.get(key);
  return {
    error: read('error'),
    errorCode: read('error_code'),
    type: hash.get('type'),
  };
}

export function hasLinkError(params: LinkParams): boolean {
  return params.error !== null || params.errorCode !== null;
}
