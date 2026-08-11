import { apiFetch } from './client';
import type {
  TagDetailResponse,
  OwnerMeResponse,
  VerifyOwnershipRequest,
  VerifyOwnershipResponse,
  ChatHistoryResponse,
} from '../types/api';

export const fetchTagDetail = (tagCode: string) =>
  apiFetch<TagDetailResponse>(`/tags/${tagCode}`);

export const fetchOwnerMe = (tagCode: string, token: string) =>
  apiFetch<OwnerMeResponse>(`/tags/${tagCode}/ownership/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const postVerifyOwnership = (tagCode: string, body: VerifyOwnershipRequest) =>
  apiFetch<VerifyOwnershipResponse>(`/tags/${tagCode}/ownership`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const fetchChatHistory = (tagCode: string, token: string) =>
  apiFetch<ChatHistoryResponse>(`/tags/${tagCode}/chat/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// TODO: 실서버에 card.png 엔드포인트 배포 시 확인 필요
export async function fetchOwnershipCardBlob(tagCode: string, token: string): Promise<Blob> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { mockOwnershipCard } = await import('./mock/handlers');
    return mockOwnershipCard(tagCode);
  }
  const res = await fetch(`/api/tags/${tagCode}/ownership/card.png`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`card fetch failed: ${res.status}`);
  return res.blob();
}
