const REASONS = [
  'QR 코드가 손상되었거나 정확히 스캔되지 않았습니다.',
  '태그 코드 형식이 올바르지 않습니다.',
  '해당 제품 정보가 아직 등록되지 않았을 수 있습니다.',
];

interface Props {
  onRetry?: () => void;
  traceId?: string;
}

export default function TagNotFoundScreen({ onRetry, traceId }: Props) {
  return (
    <div className="flex flex-col px-8 py-12 gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="m-0 text-xl font-semibold text-[var(--color-fg)]">
          태그를 확인할 수 없습니다
        </h2>
        <ul className="m-0 pl-5 flex flex-col gap-1.5">
          {REASONS.map((reason) => (
            <li key={reason} className="text-sm text-[var(--color-muted)] leading-relaxed">
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full py-3 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-fg)]"
          >
            다시 시도하기
          </button>
        )}
        <a
          href="#"
          className="block w-full py-3 rounded-lg text-sm font-medium text-center text-[var(--color-muted)] border border-[var(--color-border)] no-underline"
        >
          브랜드 고객센터 문의
        </a>
      </div>

      {traceId && (
        <p className="m-0 text-[0.65rem] text-[var(--color-muted)] text-center">
          {traceId}
        </p>
      )}
    </div>
  );
}
