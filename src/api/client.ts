import type { ApiErrorCode, ApiErrorPayload } from '../types/api';

export class ApiError extends Error {
  code: ApiErrorCode;
  payload: ApiErrorPayload;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.code = payload.code;
    this.payload = payload;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const TIMEOUT_MS = 15_000;

// 동일 키로 동시에 여러 번 호출 시 첫 요청 Promise 재사용
const inFlight = new Map<string, Promise<unknown>>();

export function withInflightGuard<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fn().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch (err) {
    clearTimeout(timer);
    // AbortController timeout 또는 네트워크 단절
    throw err;
  }
  clearTimeout(timer);

  if (!response.ok) {
    let payload: ApiErrorPayload;
    try {
      payload = await response.json();
    } catch {
      payload = { code: 'INTERNAL_ERROR', message: `HTTP ${response.status}` };
    }
    if (payload.traceId) {
      console.error('[API] traceId:', payload.traceId);
    }
    throw new ApiError(payload);
  }

  return response.json() as Promise<T>;
}
