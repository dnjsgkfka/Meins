import type { ChatPresetType } from '../types/api';
import { ApiError } from './client';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export interface ChatBody {
  message?: string;
  preset?: ChatPresetType;
}

// 실서버 연결 시 SSE 이벤트 파싱만 이 함수에서 교체
export async function* streamChat(
  tagCode: string,
  token: string,
  body: ChatBody,
  signal: AbortSignal,
): AsyncGenerator<string> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { mockStreamChat } = await import('./mock/handlers');
    yield* mockStreamChat(body, signal);
    return;
  }

  const res = await fetch(`${BASE_URL}/tags/${tagCode}/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({ code: 'INTERNAL_ERROR', message: 'Unknown error' }));
    throw new ApiError(payload);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;
          yield data;
        }
      }
    }
  } finally {
    reader.cancel();
  }
}
