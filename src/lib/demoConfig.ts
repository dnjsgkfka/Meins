const STORAGE_KEY = 'mcm:demo:config';

export interface DemoEntry {
  tagCode: string;
  authCode: string;
  status: 'REGISTERED' | 'UNREGISTERED';
  productName: string;
}

export function getDemoConfig(): DemoEntry[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setDemoConfig(entries: DemoEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
