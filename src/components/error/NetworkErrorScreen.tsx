// Stage 2 item 5에서 전체 구현 예정
export default function NetworkErrorScreen({
  onRetry,
  traceId,
}: {
  onRetry?: () => void;
  traceId?: string;
}) {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>네트워크 연결 오류</h2>
      {onRetry && <button onClick={onRetry}>다시 시도하기</button>}
      {traceId && (
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{traceId}</p>
      )}
    </div>
  );
}
