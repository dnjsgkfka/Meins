import { clearAdminKey, getAdminKey } from '../lib/adminKey';

const BASE_URL =
  import.meta.env.VITE_ADMIN_API_BASE_URL ??
  'https://meinsbackend-production.up.railway.app';

const TIMEOUT_MS = 20_000;

export class AdminApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'AdminApiError';
    this.code = code;
    this.status = status;
  }
}

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const key = getAdminKey();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': key ?? '',
        ...options.headers,
      },
    });
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
  clearTimeout(timer);

  if (response.status === 401) {
    clearAdminKey();
    throw new AdminApiError('ADMIN_KEY_INVALID', '관리자 키가 올바르지 않습니다.', 401);
  }

  if (!response.ok) {
    let code = 'INTERNAL_ERROR';
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      code = body.code ?? code;
      message = body.message ?? message;
    } catch { /* ignore */ }
    throw new AdminApiError(code, message, response.status);
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function adminFetchBlob(path: string): Promise<Blob> {
  const key = getAdminKey();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
      headers: { 'X-Admin-Key': key ?? '' },
    });
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
  clearTimeout(timer);

  if (response.status === 401) {
    clearAdminKey();
    throw new AdminApiError('ADMIN_KEY_INVALID', '관리자 키가 올바르지 않습니다.', 401);
  }

  if (!response.ok) {
    throw new AdminApiError('INTERNAL_ERROR', `HTTP ${response.status}`, response.status);
  }

  return response.blob();
}

// ─── 타입 ───────────────────────────────────────────────────────────────────

export interface BulkCreateBody {
  productName: string;
  modelCode?: string;
  manufacturedYm?: string;
  material?: string;
  color?: string;
  saleRegisteredYm?: string;
  widthCm?: number;
  depthCm?: number;
  heightCm?: number;
  imageUrl?: string;
  thumbnailImageUrl1?: string;
  thumbnailImageUrl2?: string;
  thumbnailImageUrl3?: string;
  productPageUrl?: string;
  quantity?: number;
}

export interface BulkCreateResult {
  productId: number;
  tags: { tagCode: string; authCode: string }[];
}

export type TagStatus = 'UNREGISTERED' | 'REGISTERED';
export type ForceStatusAction = 'UNLOCK' | 'UNLOCK_RECOVERY' | 'REGISTERED' | 'UNREGISTERED';

export interface AdminTag {
  tagCode: string;
  authCode: string;
  status: TagStatus;
  locked: boolean;
  productName: string;
  qrImageUrl: string;
}

// ─── API 함수 ────────────────────────────────────────────────────────────────

export function bulkCreateTags(body: BulkCreateBody): Promise<BulkCreateResult> {
  return adminFetch('/admin/tags/bulk-create', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function listAdminTags(): Promise<AdminTag[]> {
  return adminFetch('/admin/tags');
}

export function forceStatus(tagCode: string, action: ForceStatusAction): Promise<void> {
  return adminFetch(`/admin/tags/${tagCode}/force-status`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
}

export function deleteTag(tagCode: string): Promise<void> {
  return adminFetch(`/admin/tags/${tagCode}`, { method: 'DELETE' });
}

export function fetchQrImageBlob(tagCode: string): Promise<Blob> {
  return adminFetchBlob(`/admin/qr/${tagCode}`);
}

export function fetchQrExportZipBlob(): Promise<Blob> {
  return adminFetchBlob('/admin/tags/qr-export');
}
