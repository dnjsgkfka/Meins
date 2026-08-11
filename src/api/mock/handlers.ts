import { ApiError } from '../client';
import type {
  TagDetailResponse,
  OwnerMeResponse,
  VerifyOwnershipRequest,
  VerifyOwnershipResponse,
  ChatHistoryResponse,
} from '../../types/api';

const delay = () =>
  new Promise<void>((r) => setTimeout(r, 300 + Math.random() * 300));

const mockProduct = {
  name: 'MCM 클래식 백팩',
  modelCode: 'MUK AAVI03',
  heroImage: 'https://placehold.co/400x400?text=MCM+Bag',
  detailImages: [
    'https://placehold.co/400x400?text=Detail+1',
    'https://placehold.co/400x400?text=Detail+2',
  ],
  material: '모노그램 코팅 캔버스',
  size: { width: 30, depth: 14, height: 42 },
  color: '코냑',
  productUrl: 'https://www.mcmworldwide.com',
};

const mockOfficial = {
  manufacturedAt: '2024-03',
  releasedAt: '2024-05',
};

// Per-tagCode 실패 횟수 카운터 (올바른 코드 입력 시 초기화)
const attemptCounters = new Map<string, number>();

export async function getTagDetail(tagCode: string): Promise<TagDetailResponse> {
  await delay();
  if (tagCode.startsWith('NOTFOUND')) {
    throw new ApiError({ code: 'TAG_NOT_FOUND', message: '태그를 찾을 수 없습니다.' });
  }
  return {
    tagCode,
    product: mockProduct,
    official: mockOfficial,
    ownership: { registered: false, registeredAt: null },
  };
}

export async function postVerifyOwnership(
  tagCode: string,
  body: VerifyOwnershipRequest,
): Promise<VerifyOwnershipResponse> {
  await delay();
  if (tagCode.startsWith('NOTFOUND')) {
    throw new ApiError({ code: 'TAG_NOT_FOUND', message: '태그를 찾을 수 없습니다.' });
  }
  if (body.code === '111111111111') {
    attemptCounters.delete(tagCode);
    return {
      token: `mcm:own:${tagCode}:111111111111`,
      record: { registeredAt: new Date().toISOString() },
    };
  }
  const prev = attemptCounters.get(tagCode) ?? 0;
  const next = prev + 1;
  if (next >= 5) {
    attemptCounters.delete(tagCode);
    throw new ApiError({
      code: 'CODE_LOCKED',
      message: '인증 코드가 잠겼습니다. 잠시 후 다시 시도해 주세요.',
      lockedUntil: new Date(Date.now() + 10_000).toISOString(),
    });
  }
  attemptCounters.set(tagCode, next);
  throw new ApiError({
    code: 'CODE_MISMATCH',
    message: '인증 코드가 올바르지 않습니다.',
    remainingAttempts: 5 - next,
  });
}

export async function getOwnerMe(
  tagCode: string,
  token: string,
): Promise<OwnerMeResponse> {
  await delay();
  if (tagCode.startsWith('NOTFOUND')) {
    throw new ApiError({ code: 'TAG_NOT_FOUND', message: '태그를 찾을 수 없습니다.' });
  }
  if (!token.startsWith(`mcm:own:${tagCode}:`)) {
    throw new ApiError({ code: 'TOKEN_INVALID', message: '유효하지 않은 토큰입니다.' });
  }
  return {
    record: { registeredAt: '2024-06-01T09:00:00.000Z' },
    product: mockProduct,
    official: mockOfficial,
  };
}

export async function getChatHistory(_tagCode: string): Promise<ChatHistoryResponse> {
  await delay();
  return {
    messages: [],
    credits: { remaining: 10, limit: 30 },
  };
}

// 스트리밍 mock 구현 예정
export async function postChat(_tagCode: string, _body: unknown): Promise<void> {
  await delay();
}
