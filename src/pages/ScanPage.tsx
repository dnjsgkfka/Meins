export default function ScanPage() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-between px-8"
      style={{
        paddingTop: 'max(64px, env(safe-area-inset-top))',
        paddingBottom: 'max(48px, env(safe-area-inset-bottom))',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* 브랜드 */}
      <span
        className="tracking-[0.2em] text-xs"
        style={{ color: 'var(--color-muted)' }}
      >
        MCM
      </span>

      {/* 중앙 */}
      <div className="flex flex-col items-center gap-8">
        <QrIcon />
        <div className="flex flex-col items-center gap-3 text-center">
          <h1
            className="m-0 font-normal leading-[1.3em]"
            style={{ fontSize: 22, color: 'var(--color-fg)' }}
          >
            QR 코드를 스캔하세요
          </h1>
          <p
            className="m-0 text-xs leading-[1.6em] tracking-[0.02em]"
            style={{ color: 'var(--color-muted)', maxWidth: 240 }}
          >
            제품에 부착된 QR 코드를 카메라로 스캔하면
            소유권 정보를 확인할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 하단 */}
      <span
        className="text-[10px] tracking-[0.08em]"
        style={{ color: 'var(--color-icon-inactive)' }}
      >
        MEINS — MCM Ownership System
      </span>
    </div>
  );
}

function QrIcon() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
    >
      {/* 외곽 코너 — 좌상 */}
      <rect x="12" y="12" width="28" height="28" rx="4" stroke="var(--color-fg)" strokeWidth="3" fill="none" />
      <rect x="19" y="19" width="14" height="14" rx="2" fill="var(--color-fg)" />

      {/* 외곽 코너 — 우상 */}
      <rect x="56" y="12" width="28" height="28" rx="4" stroke="var(--color-fg)" strokeWidth="3" fill="none" />
      <rect x="63" y="19" width="14" height="14" rx="2" fill="var(--color-fg)" />

      {/* 외곽 코너 — 좌하 */}
      <rect x="12" y="56" width="28" height="28" rx="4" stroke="var(--color-fg)" strokeWidth="3" fill="none" />
      <rect x="19" y="63" width="14" height="14" rx="2" fill="var(--color-fg)" />

      {/* 데이터 모듈 */}
      <rect x="56" y="56" width="7" height="7" rx="1" fill="var(--color-fg)" />
      <rect x="67" y="56" width="7" height="7" rx="1" fill="var(--color-fg)" />
      <rect x="56" y="67" width="7" height="7" rx="1" fill="var(--color-fg)" />
      <rect x="67" y="67" width="16" height="7" rx="1" fill="var(--color-fg)" />
      <rect x="78" y="56" width="6" height="7" rx="1" fill="var(--color-fg)" />

      {/* 스캔 라인 애니메이션 */}
      <line
        x1="12"
        y1="48"
        x2="84"
        y2="48"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      >
        <animate
          attributeName="y1"
          values="20;76;20"
          dur="2.4s"
          repeatCount="indefinite"
          calcMode="ease-in-out"
        />
        <animate
          attributeName="y2"
          values="20;76;20"
          dur="2.4s"
          repeatCount="indefinite"
          calcMode="ease-in-out"
        />
        <animate
          attributeName="opacity"
          values="0;0.7;0"
          dur="2.4s"
          repeatCount="indefinite"
          calcMode="ease-in-out"
        />
      </line>
    </svg>
  );
}
