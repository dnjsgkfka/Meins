// 구현 예정
export default function LockedScreen({ lockedUntil }: { lockedUntil: string }) {
  return (
    <div className="px-4 py-8">
      <p className="text-[var(--color-fg)]">잠금 상태 — {lockedUntil}</p>
    </div>
  );
}
