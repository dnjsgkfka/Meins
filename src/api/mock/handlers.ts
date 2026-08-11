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

// dispatch용 stub — 실제 스트리밍은 mockStreamChat을 직접 사용
export async function postChat(_tagCode: string, _body: unknown): Promise<void> {
  await delay();
}

type MockChatBody = { message?: string; preset?: string };

const MOCK_RESPONSES: Record<string, string> = {
  care: '이 제품은 부드러운 천으로 가볍게 닦아 주세요. 방수 스프레이를 사용하면 오염 예방에 도움이 됩니다. 직사광선을 피해 통풍이 잘 되는 곳에 보관하는 것이 좋습니다.',
  style: '이 클래식 백팩은 캐주얼한 데일리 룩부터 스마트 캐주얼까지 두루 잘 어울립니다. 모노그램 패턴이 포인트가 되어 심플한 착장을 돋보이게 해줍니다.',
  heritage: 'MCM은 1976년 독일 뮌헨에서 탄생한 브랜드로, 이 모노그램 패턴은 브랜드의 오랜 헤리티지를 담고 있습니다. 장인의 손길로 만들어진 제품 하나하나에 그 이야기가 새겨져 있습니다.',
};

export async function* mockStreamChat(
  body: MockChatBody,
  signal: AbortSignal,
): AsyncGenerator<string> {
  // 초기 지연 (생각 중)
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, 400 + Math.random() * 300);
    signal.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
  });

  const text = body.preset
    ? (MOCK_RESPONSES[body.preset] ?? MOCK_RESPONSES.care)
    : '안녕하세요! MCM 제품에 대해 궁금하신 점이 있으시면 편하게 물어봐 주세요.';

  let i = 0;
  while (i < text.length) {
    if (signal.aborted) return;
    const size = 2 + Math.floor(Math.random() * 2); // 2~3자씩
    yield text.slice(i, i + size);
    i += size;
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, 80);
      signal.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
    });
  }
}

// TODO: 실서버에 card.png 엔드포인트 배포 시 확인 필요
export function mockOwnershipCard(tagCode: string): Promise<Blob> {
  return new Promise<void>((r) => setTimeout(r, 300 + Math.random() * 300)).then(
    () =>
      new Promise<Blob>((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('canvas unavailable')); return; }
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, 400, 240);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('MCM Ownership', 24, 56);
        ctx.font = '14px monospace';
        ctx.fillText(tagCode, 24, 90);
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
      }),
  );
}
