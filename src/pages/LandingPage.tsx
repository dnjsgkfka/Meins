export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-8 text-center gap-3">
      <h1 className="text-2xl font-semibold text-[var(--color-fg)] m-0">제품을 스캔해주세요</h1>
      <p className="text-sm text-[var(--color-muted)] m-0">
        QR 코드가 포함된 제품 태그를 스캔하면 제품 정보를 확인할 수 있습니다.
      </p>
    </div>
  );
}
