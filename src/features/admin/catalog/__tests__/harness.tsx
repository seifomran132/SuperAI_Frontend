import { fireEvent, screen } from '@testing-library/react';
import { beforeEach } from 'vitest';
import { resetCatalogMock } from '~/mocks/admin-catalog';
import { useAdminSession } from '../../users/__tests__/harness';

export { a, click, reasonField } from '../../users/__tests__/harness';

/** Admin session plus a fresh catalog mock; call once at the top of a test file. */
export function useCatalogSession() {
  useAdminSession();
  beforeEach(() => resetCatalogMock());
}

/** Types into the first field whose label starts with `prefix`. */
export function type(prefix: string, value: string) {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const [field] = screen.getAllByLabelText(new RegExp(`^${escaped}`));
  fireEvent.change(field!, { target: { value } });
}
