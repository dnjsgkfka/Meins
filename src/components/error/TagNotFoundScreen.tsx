interface Props {
  onRetry?: () => void;
}

const REASONS = [
  'QR 코드의 손상이나 읽기 오류',
  '브랜드에서 발급하지 않은 코드',
  '아직 판매 등록되지 않은 코드',
];

export default function TagNotFoundScreen({ onRetry }: Props) {
  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ backgroundColor: 'var(--color-tint)', paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* 본문 */}
      <div className="flex flex-col gap-2 px-2" style={{ marginTop: 56 }}>
        <h1 className="m-0 text-2xl font-normal text-[var(--color-fg)]">
          태그를 확인할 수 없습니다
        </h1>
        <p className="m-0 text-xs text-[var(--color-muted)] leading-relaxed tracking-[0.04em]">
          다음 중 하나에 해당할 수 있습니다.
        </p>
        <div className="flex flex-col gap-1 pl-3 mt-1">
          {REASONS.map((r) => (
            <p key={r} className="m-0 text-xs text-[var(--color-muted)] tracking-[0.04em]">
              -{r}
            </p>
          ))}
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-20 flex flex-col gap-2 px-2"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, var(--color-tint) 40%)',
          backdropFilter: 'blur(1.5px)',
          WebkitBackdropFilter: 'blur(1.5px)',
          paddingTop: 16,
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}
      >
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full h-11 rounded-full text-sm text-[var(--color-bg)] bg-[var(--color-accent)] cursor-pointer border-none"
          >
            다시 시도하기
          </button>
        )}
        <a
          href="#"
          className="flex items-center justify-center w-full h-11 rounded-full text-sm text-[var(--color-bg)] bg-[var(--color-icon-inactive)] no-underline"
        >
          브랜드 고객센터 문의
        </a>
      </div>
    </div>
  );
}
