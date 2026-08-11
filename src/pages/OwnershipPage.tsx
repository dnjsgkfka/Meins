import { useRef, useState } from 'react';
import { useOutletContext, useParams } from 'react-router';
import type { OwnerMeResponse } from '../types/api';
import { fetchOwnershipCardBlob } from '../api/tags';
import { getToken } from '../lib/ownerToken';
import { formatDateTime } from '../lib/format';
import { useToast } from '../lib/toast';
import BottomTabBar from '../components/BottomTabBar';

export default function OwnershipPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const data = useOutletContext<OwnerMeResponse>();
  const { showToast } = useToast();
  const [showFallbackUrl, setShowFallbackUrl] = useState(false);
  const fallbackInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const shareUrl = `${window.location.origin}/t/${tagCode}`;

  async function handleCopyLink() {
    // iOS: clipboard API는 사용자 제스처 직후에 동기적으로 호출
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('링크가 복사되었습니다.');
    } catch {
      setShowFallbackUrl(true);
      // 다음 렌더 후 input을 전체 선택
      setTimeout(() => {
        fallbackInputRef.current?.select();
      }, 0);
    }
  }

  async function handleSaveImage() {
    if (isSaving) return;
    setIsSaving(true);

    const token = getToken(tagCode!);
    let blob: Blob;
    try {
      blob = await fetchOwnershipCardBlob(tagCode!, token ?? '');
    } catch {
      showToast('이미지 저장에 실패하였습니다.');
      setIsSaving(false);
      return;
    }

    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `MCM_Ownership_${tagCode}_${date}.png`;
    const file = new File([blob], filename, { type: 'image/png' });

    // 1. 네이티브 공유 시트 (iOS/Android)
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        setIsSaving(false);
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') { setIsSaving(false); return; }
      }
    }

    const objectUrl = URL.createObjectURL(blob);

    // 2. <a download>
    if ('download' in document.createElement('a')) {
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setIsSaving(false);
      return;
    }

    // 3. 새 탭 열기 (구형 환경 fallback)
    window.open(objectUrl, '_blank');
    showToast('이미지를 길게 눌러 저장하세요.');
    setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
    setIsSaving(false);
  }

  return (
    <div className="pb-20">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <p className="m-0 text-xs text-[var(--color-muted)] tracking-widest uppercase">{tagCode}</p>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* 소유권 카드 */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="flex flex-col gap-0.5">
            <p className="m-0 text-[10px] font-medium tracking-widest uppercase text-[var(--color-muted)]">
              MCM Ownership
            </p>
            <h2 className="m-0 text-lg font-semibold text-[var(--color-fg)] leading-snug">
              {data.product.name}
            </h2>
          </div>

          <div className="h-px bg-[var(--color-border)]" />

          <dl className="flex flex-col gap-2 m-0">
            <div className="flex justify-between items-baseline gap-2">
              <dt className="text-xs text-[var(--color-muted)] shrink-0">모델 코드</dt>
              <dd className="m-0 text-xs font-mono text-[var(--color-fg)] text-right">{data.product.modelCode}</dd>
            </div>
            <div className="flex justify-between items-baseline gap-2">
              <dt className="text-xs text-[var(--color-muted)] shrink-0">태그 코드</dt>
              <dd className="m-0 text-xs font-mono text-[var(--color-fg)] text-right">{tagCode}</dd>
            </div>
            <div className="flex justify-between items-baseline gap-2">
              <dt className="text-xs text-[var(--color-muted)] shrink-0">등록 시각</dt>
              <dd className="m-0 text-xs text-[var(--color-fg)] text-right">{formatDateTime(data.record.registeredAt)}</dd>
            </div>
          </dl>
        </div>

        {/* 클립보드 권한 거부 시 수동 복사용 fallback */}
        {showFallbackUrl && (
          <div className="flex flex-col gap-1.5">
            <p className="m-0 text-xs text-[var(--color-muted)]">아래 링크를 직접 복사해 주세요.</p>
            <input
              ref={fallbackInputRef}
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-xs font-mono text-[var(--color-fg)] bg-[var(--color-bg)]"
            />
          </div>
        )}

        {/* 공유 / 저장 버튼 */}
        <button
          onClick={handleCopyLink}
          className="w-full py-3.5 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-fg)] bg-transparent cursor-pointer"
        >
          공유 링크 복사
        </button>

        <button
          onClick={handleSaveImage}
          disabled={isSaving}
          className={[
            'w-full py-3.5 rounded-lg text-sm font-medium transition-colors',
            isSaving
              ? 'bg-[var(--color-border)] text-[var(--color-muted)] cursor-not-allowed'
              : 'bg-[var(--color-accent)] text-[var(--color-bg)] cursor-pointer',
          ].join(' ')}
        >
          {isSaving ? '저장 중...' : '이미지로 저장'}
        </button>
      </div>

      <BottomTabBar tagCode={tagCode!} />
    </div>
  );
}
