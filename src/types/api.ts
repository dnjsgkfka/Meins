export interface ProductInfo {
  name: string;
  modelCode: string;
  heroImage: string;
  detailImages: string[]; // 0~3개
  material?: string | null;
  size?: { width: number; depth: number; height: number } | null;
  color?: string | null;
  productUrl?: string | null;
}

export interface OfficialInfo {
  manufacturedAt: string; // YYYY-MM
  releasedAt: string;     // YYYY-MM
}

export interface GuestOwnershipInfo {
  registered: boolean;
  registeredAt: string | null; // YYYY-MM, 미등록 null
}

export interface OwnerRecord {
  registeredAt: string;       // ISO 8601
}

export interface TagDetailResponse {
  tagCode: string;
  product: ProductInfo;
  official: OfficialInfo;
  ownership: GuestOwnershipInfo;
}

export interface OwnerMeResponse {
  record: OwnerRecord;
  product: ProductInfo;
  official: OfficialInfo;
}

export interface VerifyOwnershipRequest {
  code: string; // 하이픈 제거, 대문자 12자
}

export interface VerifyOwnershipResponse {
  token: string;
  record: OwnerRecord;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ChatCredits {
  remaining: number;
  limit: number;
  resetAt?: string; // 회복 정책 미확정
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  credits: ChatCredits;
}

export type ChatPresetType = "care" | "style" | "heritage";

// 에러 코드
// TAG_NOT_RELEASED, RATE_LIMITED 협의 필요: 방어적 구현
export type ApiErrorCode =
  | "TAG_NOT_FOUND"
  | "TAG_INVALID_FORMAT"
  | "CODE_MISMATCH"
  | "CODE_LOCKED"
  | "ALREADY_REGISTERED"
  | "TOKEN_INVALID"
  | "TAG_NOT_RELEASED"
  | "RATE_LIMITED"
  | "CREDIT_EXHAUSTED"
  | "INTERNAL_ERROR";

// retryAfter: 협의 필요
export interface ApiErrorPayload {
  code: ApiErrorCode;
  message: string;
  traceId?: string;
  remainingAttempts?: number; // CODE_MISMATCH
  lockedUntil?: string;       // CODE_LOCKED, ISO 8601
  resetAt?: string;           // CREDIT_EXHAUSTED, Credits.resetAt과는 별개 필드
}
