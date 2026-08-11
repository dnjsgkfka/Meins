export default function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <p style={{ color: 'var(--color-muted)' }}>로딩 중...</p>
    </div>
  );
}
