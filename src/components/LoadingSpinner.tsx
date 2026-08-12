interface Props {
  tagCode?: string;
}

export default function LoadingSpinner({ tagCode }: Props) {
  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ backgroundColor: 'var(--color-tint)', paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div
        className="flex flex-col gap-8 px-2"
        style={{ marginTop: 56 }}
      >
        {/* 텍스트 */}
        <div className="flex flex-col gap-2" style={{ width: 285 }}>
          <h1 className="m-0 text-2xl font-normal text-[var(--color-fg)]">
            제품 정보를 확인하는 중
          </h1>
          <p className="m-0 text-xs text-[var(--color-muted)] leading-relaxed tracking-[0.04em]">
            태그 유효성과 소유 등록 여부를 조회하는 중입니다.
          </p>
        </div>

        {/* 태그 코드 배지 */}
        {tagCode && (
          <div className="flex items-center justify-center w-full rounded-lg py-2 px-2 bg-[var(--color-icon-inactive)]">
            <span className="text-sm text-[var(--color-fg)] text-center tracking-[0.04em]">
              TAG {tagCode}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
