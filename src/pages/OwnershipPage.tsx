import { useOutletContext, useParams } from 'react-router';
import type { OwnerMeResponse } from '../types/api';
import { formatDateTime } from '../lib/format';
import BottomTabBar from '../components/BottomTabBar';

export default function OwnershipPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const data = useOutletContext<OwnerMeResponse>();

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

        {/* 공유 / 저장 버튼 */}
        <button
          onClick={() => {}}
          className="w-full py-3.5 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-fg)] bg-transparent cursor-pointer"
        >
          공유 링크 복사
        </button>

        <button
          onClick={() => {}}
          className="w-full py-3.5 rounded-lg text-sm font-medium bg-[var(--color-accent)] text-[var(--color-bg)] cursor-pointer"
        >
          이미지로 저장
        </button>
      </div>

      <BottomTabBar tagCode={tagCode!} />
    </div>
  );
}
