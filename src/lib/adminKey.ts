const SESSION_KEY = 'mcm:admin:key';

export function getAdminKey(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

export function setAdminKey(key: string): void {
  sessionStorage.setItem(SESSION_KEY, key);
}

export function clearAdminKey(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
