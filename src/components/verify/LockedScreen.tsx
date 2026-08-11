import { useEffect, useState } from 'react';
import CodeInputField from './CodeInputField';

interface Props {
  lockedUntil: string;
}

function getRemainingMs(lockedUntil: string): number {
  return Math.max(0, new Date(lockedUntil).getTime() - Date.now());
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return '잠금이 해제되었습니다. 페이지를 새로고침해 주세요.';

  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (h > 0) return `${h}시간 ${m}분 후 다시 시도할 수 있습니다`;
  if (m > 0) return `${m}분 ${s}초 후 다시 시도할 수 있습니다`;
  return `${s}초 후 다시 시도할 수 있습니다`;
}

export default function LockedScreen({ lockedUntil }: Props) {
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(lockedUntil));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(getRemainingMs(lockedUntil));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  return (
    <div className="flex flex-col gap-6 px-4 pt-8 pb-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-2xl font-semibold text-[var(--color-fg)]">소유자 등록</h1>
        <p className="m-0 text-sm text-[var(--color-muted)] leading-relaxed">
          제품에 동봉된 인증 카드의 코드를 입력해 주세요.
        </p>
      </div>

      {/* 비활성 코드 입력 블록 */}
      <CodeInputField
        value=""
        onChange={() => {}}
        onComplete={() => {}}
        disabled
      />

      {/* 잠금 안내 */}
      <div className="flex flex-col gap-1 p-4 bg-[var(--color-danger)]/10 rounded-lg border border-[var(--color-danger)]/30">
        <p className="m-0 text-sm font-medium text-[var(--color-danger)]">
          인증 코드가 잠겼습니다
        </p>
        <p className="m-0 text-sm text-[var(--color-muted)]">
          {formatRemaining(remainingMs)}
        </p>
      </div>

      {/* 비활성 제출 버튼 */}
      <button
        disabled
        className="w-full py-3.5 rounded-lg text-sm font-medium bg-[var(--color-border)] text-[var(--color-muted)] cursor-not-allowed"
      >
        확인
      </button>

      {/* 고객센터 문의 */}
      <a
        href="#"
        className="block w-full py-3.5 rounded-lg text-sm font-medium text-center border border-[var(--color-border)] text-[var(--color-fg)] no-underline"
      >
        고객센터 문의하기
      </a>
    </div>
  );
}
