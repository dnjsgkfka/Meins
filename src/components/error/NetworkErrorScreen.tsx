interface Props {
  onRetry?: () => void;
  traceId?: string;
}

export default function NetworkErrorScreen({ onRetry, traceId }: Props) {
  return (
    <div className="flex flex-col px-8 py-12 gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="m-0 text-xl font-semibold text-[var(--color-fg)]">
          네트워크 연결 오류
        </h2>
        <p className="m-0 text-sm text-[var(--color-muted)] leading-relaxed">
          인터넷 연결을 확인한 후 다시 시도해 주세요.
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-fg)]"
        >
          다시 시도하기
        </button>
      )}

      {traceId && (
        <p className="m-0 text-[0.65rem] text-[var(--color-muted)] text-center">
          {traceId}
        </p>
      )}
    </div>
  );
}
