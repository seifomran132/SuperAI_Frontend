// The address shown on "check your email". Kept in module memory only: the
// URL must not carry it (privacy), and a reload deliberately forgets it.
let pending: string | null = null;

export function setPendingEmail(email: string) {
  pending = email;
}

export function getPendingEmail(): string | null {
  return pending;
}

export function clearPendingEmail() {
  pending = null;
}
