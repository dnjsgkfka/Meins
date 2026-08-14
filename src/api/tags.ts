import { apiFetch } from './client';
import type {
  TagDetailResponse,
  OwnerMeResponse,
  VerifyOwnershipRequest,
  VerifyOwnershipResponse,
  ChatHistoryResponse,
  TransferCodeResponse,
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

export const postTransferCode = (tagCode: string, token: string) =>
  apiFetch<TransferCodeResponse>(`/tags/${tagCode}/transfer`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteTransferCode = (tagCode: string, token: string) =>
  apiFetch<void>(`/tags/${tagCode}/transfer`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
