import { useState } from 'react';
import { useOutletContext, useParams } from 'react-router';
import type { OwnerMeResponse } from '../types/api';
import { postTransferCode, deleteTransferCode } from '../api/tags';
import { getToken } from '../lib/ownerToken';
import { formatDateTime } from '../lib/format';
import { useToast } from '../lib/toast';
import PageHeader from '../components/PageHeader';
import BottomTabBar from '../components/BottomTabBar';
import ProductHero from '../components/product/ProductHero';
import InfoList from '../components/product/InfoList';

function formatCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
}

function formatExpiresAt(iso: string): string {
  const d = new Date(iso);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yy}-${mm}-${dd} ${hh}:${min}까지 유효`;
}

export default function OwnershipPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const data = useOutletContext<OwnerMeResponse>();
  const { showToast } = useToast();

  const [transferCode, setTransferCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  async function handleOpenTransfer() {
    if (isGenerating) return;
    setIsGenerating(true);
    const token = getToken(tagCode!) ?? '';
    try {
      const res = await postTransferCode(tagCode!, token);
      setTransferCode(res.code);
      setExpiresAt(res.expiresAt);
    } catch {
      showToast('양도 코드 발급에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyCode() {
    if (!transferCode) return;
    try {
      await navigator.clipboard.writeText(formatCode(transferCode));
      showToast('코드가 복사되었습니다.');
    } catch {
      showToast('복사에 실패했습니다. 코드를 직접 선택해 주세요.');
    }
  }

  async function handleCancelTransfer() {
    if (isCanceling) return;
    setIsCanceling(true);
    const token = getToken(tagCode!) ?? '';
    try {
      await deleteTransferCode(tagCode!, token);
      setTransferCode(null);
      setExpiresAt(null);
    } catch {
      showToast('양도 취소에 실패했습니다.');
    } finally {
      setIsCanceling(false);
    }
  }

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--color-tint)' }}>
      <PageHeader title="소유권" />

      {/* 스크롤 콘텐츠 */}
      <div
        className="flex flex-col gap-3 px-2"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 56px)',
          paddingBottom: 'calc(max(16px, env(safe-area-inset-bottom)) + 87px)',
        }}
      >
        {/* 소유권 카드 */}
        <div className="flex flex-col gap-3 rounded-lg shadow-ownership p-6 bg-[var(--color-tint)]">
          <div className="flex flex-col gap-0.5">
            <h2 className="m-0 text-2xl font-normal text-[var(--color-fg)] leading-tight">
              {data.product.name}
            </h2>
            <p className="m-0 text-xs text-[var(--color-muted)] tracking-[0.04em]">
              # {data.product.modelCode}
            </p>
          </div>

          <ProductHero src={data.product.heroImage} alt={data.product.name} />

          <InfoList
            items={[
              { label: '모델 코드', value: data.product.modelCode },
              { label: '태그 코드', value: tagCode },
              { label: '등록 시각', value: formatDateTime(data.record.registeredAt) },
            ]}
          />
        </div>

        {/* 안내 문구 */}
        <p className="m-0 text-xs text-[var(--color-muted)] leading-[1.4em] tracking-[0.04em] whitespace-pre-line">
          {'링크를 받은 사람은 제품 정보와 등록 여부만 볼 수 있습니다.\n소유자 정보와 오너 권한은 포함되지 않습니다.'}
        </p>

        {/* 소유권 이전하기 버튼 */}
        <button
          onClick={handleOpenTransfer}
          disabled={isGenerating}
          className={[
            'w-full h-11 rounded-full text-sm border-none transition-colors',
            isGenerating
              ? 'bg-[var(--color-icon-inactive)] text-[var(--color-bg)] cursor-not-allowed'
              : 'bg-[var(--color-accent)] text-[var(--color-bg)] cursor-pointer',
          ].join(' ')}
        >
          {isGenerating ? '코드 발급 중...' : '소유권 이전하기'}
        </button>
      </div>

      <BottomTabBar tagCode={tagCode!} />

      {/* 양도 코드 모달 */}
      {transferCode && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.24)' }}
            onClick={() => !isCanceling && setTransferCode(null)}
            aria-hidden="true"
          />
          {/* 바텀시트 카드 */}
          <div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 px-2"
            style={{ paddingBottom: 'max(34px, env(safe-area-inset-bottom))' }}
          >
            <div className="w-full bg-[var(--color-bg)] rounded-lg shadow-card flex flex-col gap-3 px-2 pt-2 pb-4">
              {/* 그래버 */}
              <div className="flex justify-center pt-1">
                <div className="w-10 h-1 rounded-full bg-[var(--color-icon-inactive)]" />
              </div>

              {/* 양도 코드 섹션 */}
              <div className="flex flex-col gap-9 px-2">
                <div className="flex flex-col gap-2">
                  <p className="m-0 text-base text-[var(--color-fg)]">양도 코드</p>
                  <div className="flex flex-col gap-1">
                    <p className="m-0 text-2xl text-[var(--color-fg)] leading-tight">
                      {formatCode(transferCode)}
                    </p>
                    {expiresAt && (
                      <p className="m-0 text-xs text-[var(--color-muted)] leading-[1.4em] tracking-[0.04em]">
                        {formatExpiresAt(expiresAt)}
                      </p>
                    )}
                  </div>
                </div>

                {/* 버튼 섹션 */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="w-full h-11 rounded-full text-sm bg-[var(--color-accent)] text-[var(--color-bg)] border-none cursor-pointer"
                  >
                    코드 복사
                  </button>
                  <button
                    onClick={handleCancelTransfer}
                    disabled={isCanceling}
                    className={[
                      'w-full h-11 rounded-full text-sm border-none transition-colors',
                      isCanceling
                        ? 'bg-[var(--color-icon-inactive)] text-[var(--color-bg)] cursor-not-allowed'
                        : 'bg-[var(--color-icon-inactive)] text-[var(--color-bg)] cursor-pointer',
                    ].join(' ')}
                  >
                    {isCanceling ? '취소 중...' : '발급 취소'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
