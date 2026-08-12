import {
  getTagDetail,
  postVerifyOwnership,
  getOwnerMe,
  getChatHistory,
  postChat,
  postTransferCode,
  deleteTransferCode,
} from './handlers';

export async function mockDispatch<T>(path: string, options: RequestInit): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : undefined;
  const headers = (options.headers ?? {}) as Record<string, string>;
  const auth = headers['Authorization'] ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  let m: RegExpMatchArray | null;

  // GET /tags/{tagCode}
  m = path.match(/^\/tags\/([^/]+)$/);
  if (method === 'GET' && m) return getTagDetail(m[1]) as Promise<T>;

  // POST /tags/{tagCode}/ownership
  m = path.match(/^\/tags\/([^/]+)\/ownership$/);
  if (method === 'POST' && m) return postVerifyOwnership(m[1], body) as Promise<T>;

  // GET /tags/{tagCode}/ownership/me
  m = path.match(/^\/tags\/([^/]+)\/ownership\/me$/);
  if (method === 'GET' && m) return getOwnerMe(m[1], token) as Promise<T>;

  // GET /tags/{tagCode}/chat/history
  m = path.match(/^\/tags\/([^/]+)\/chat\/history$/);
  if (method === 'GET' && m) return getChatHistory(m[1]) as Promise<T>;

  // POST /tags/{tagCode}/chat
  m = path.match(/^\/tags\/([^/]+)\/chat$/);
  if (method === 'POST' && m) return postChat(m[1], body) as Promise<T>;

  // POST /tags/{tagCode}/transfer
  m = path.match(/^\/tags\/([^/]+)\/transfer$/);
  if (method === 'POST' && m) return postTransferCode(m[1]) as Promise<T>;

  // DELETE /tags/{tagCode}/transfer
  m = path.match(/^\/tags\/([^/]+)\/transfer$/);
  if (method === 'DELETE' && m) return deleteTransferCode(m[1]) as Promise<T>;

  throw new Error(`[Mock] Unhandled: ${method} ${path}`);
}
