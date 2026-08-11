// 구현 예정
export default function TagNotFoundScreen({ traceId }: { traceId?: string }) {
  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-2 text-[var(--color-fg)]">
        태그를 확인할 수 없습니다
      </h2>
      {traceId && (
        <p className="text-xs text-[var(--color-muted)] mt-4">{traceId}</p>
      )}
    </div>
  );
}
