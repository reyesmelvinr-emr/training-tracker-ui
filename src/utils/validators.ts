export function isValidEmail(email: string): boolean {
  if (!email) return false;
  // Simple RFC-ish pattern (improvable later)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function extractDomain(email: string): string | null {
  const at = email.indexOf('@');
  return at === -1 ? null : email.slice(at + 1).toLowerCase();
}
