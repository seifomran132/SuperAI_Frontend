function required(name: string, value: string | undefined): string {
  if (!value)
    throw new Error(`Missing environment variable ${name}. See .env.example.`);
  return value.replace(/\/+$/, '');
}

export const env = {
  apiOrigin: required('VITE_API_ORIGIN', import.meta.env.VITE_API_ORIGIN),
  gotrueUrl: required('VITE_GOTRUE_URL', import.meta.env.VITE_GOTRUE_URL),
  brand: import.meta.env.VITE_BRAND ?? 'lam7a',
};
