// Stage 2 item 5에서 전체 구현 예정
export default function NetworkErrorScreen({
  onRetry,
  traceId,
}: {
  onRetry?: () => void;
  traceId?: string;
}) {
  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-2 text-[var(--color-fg)]">
        네트워크 연결 오류
      </h2>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-fg)]"
        >
          다시 시도하기
        </button>
      )}
      {traceId && (
        <p className="text-xs text-[var(--color-muted)] mt-4">{traceId}</p>
      )}
    </div>
  );
}
