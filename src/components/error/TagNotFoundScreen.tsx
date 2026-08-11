export default function TagNotFoundScreen({ traceId }: { traceId?: string }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>태그를 확인할 수 없습니다</h2>
      {traceId && (
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{traceId}</p>
      )}
    </div>
  );
}
