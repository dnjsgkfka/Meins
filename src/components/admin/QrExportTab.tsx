import { useState } from 'react';
import { fetchQrExportZipBlob } from '../../api/admin';
import { useAdminErrorHandler } from './AdminKeyGate';
import { useToast } from '../../lib/toast';

export default function QrExportTab() {
  const handleAdminError = useAdminErrorHandler();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    setIsLoading(true);
    setError('');
    try {
      const blob = await fetchQrExportZipBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mcm-qr-export-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('다운로드가 시작되었습니다.');
    } catch (err) {
      if (!handleAdminError(err)) setError(err instanceof Error ? err.message : '다운로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="m-0 text-sm text-[var(--color-fg)] font-medium">전체 QR 코드 내보내기</p>
        <p className="m-0 text-xs text-[var(--color-muted)]">
          모든 태그의 QR 이미지를 ZIP 파일로 다운로드합니다.
        </p>
      </div>

      {error && <p className="m-0 text-xs text-[var(--color-danger)]">{error}</p>}

      <button
        onClick={handleDownload}
        disabled={isLoading}
        className={[
          'h-12 rounded-full text-sm border-none transition-colors',
          isLoading
            ? 'bg-[var(--color-icon-inactive)] text-[var(--color-bg)] cursor-not-allowed'
            : 'bg-[var(--color-accent)] text-[var(--color-bg)] cursor-pointer',
        ].join(' ')}
      >
        {isLoading ? '준비 중...' : 'ZIP 다운로드'}
      </button>
    </div>
  );
}
