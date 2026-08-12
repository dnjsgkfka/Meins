import { useOutletContext, useParams } from 'react-router';
import type { OwnerMeResponse } from '../types/api';
import PageHeader from '../components/PageHeader';
import BottomTabBar from '../components/BottomTabBar';
import ProductHero from '../components/product/ProductHero';
import InfoList from '../components/product/InfoList';
import { formatSize, formatDateTime } from '../lib/format';

export default function OwnerHomePage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const { record, product, official } = useOutletContext<OwnerMeResponse>();

  return (
    <div
      className="min-h-dvh"
      style={{ backgroundColor: 'var(--color-tint)' }}
    >
      <PageHeader title="내 제품" />

      {/* 스크롤 콘텐츠 */}
      <div
        className="flex flex-col gap-6 px-2"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 56px)',
          paddingBottom: 'calc(max(16px, env(safe-area-inset-bottom)) + 87px)',
        }}
      >
        {/* 제품명 + 모델 코드 */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-0.5" style={{ width: 231 }}>
            <div className="self-stretch justify-start text-neutral-900 text-2xl font-normal font-['Pretendard'] leading-8">{product.name}</div>
            <div className="self-stretch justify-start text-zinc-500 text-xs font-normal font-['Pretendard'] leading-4 tracking-wide"># {product.modelCode}</div>
          </div>

          {/* 제품 이미지 */}
          <ProductHero src={product.heroImage} alt={product.name} />
        </div>

        {/* 정보 목록 */}
        <div>
          <InfoList
            items={[
              { label: '등록 코드', value: tagCode },
              { label: '등록 시각', value: formatDateTime(record.registeredAt) },
              { label: '제조연월', value: official.manufacturedAt },
              { label: '판매 등록', value: official.releasedAt },
              { label: '소재', value: product.material },
              { label: '사이즈', value: formatSize(product.size) },
              { label: '색상', value: product.color },
            ]}
          />
          <p className="m-0 mt-3 text-xs text-[var(--color-muted)] tracking-[0.04em]">
            브랜드에서 제공하는 공식 데이터입니다.
          </p>
        </div>
      </div>

      <BottomTabBar tagCode={tagCode!} />
    </div>
  );
}
