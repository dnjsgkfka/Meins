import { useOutletContext, useParams } from 'react-router';
import type { OwnerMeResponse } from '../types/api';
import BottomTabBar from '../components/BottomTabBar';
import ProductHero from '../components/product/ProductHero';
import ProductTitle from '../components/product/ProductTitle';
import InfoList from '../components/product/InfoList';
import DetailImages from '../components/product/DetailImages';
import ProductLinkButton from '../components/product/ProductLinkButton';
import { formatSize, formatDateTime } from '../lib/format';

export default function OwnerHomePage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const { record, product, official } = useOutletContext<OwnerMeResponse>();

  return (
    <div className="pb-20">
      {/* TagCode */}
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <p className="m-0 text-xs text-[var(--color-muted)] tracking-widest">{tagCode}</p>
      </div>

      {/* ProductHero */}
      <ProductHero src={product.heroImage} alt={product.name} />

      {/* 공식 태그 뱃지 */}
      <div className="px-4 pt-3">
        <span className="inline-block px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide border border-[var(--color-fg)] rounded-full text-[var(--color-fg)]">
          OFFICIAL TAG
        </span>
      </div>

      {/* ProductTitle */}
      <div className="px-4 pt-2 pb-3">
        <ProductTitle name={product.name} />
        <p className="m-0 mt-1 text-xs text-[var(--color-muted)]">{product.modelCode}</p>
      </div>

      {/* 등록 정보 카드 — 등록 시각만 (구매처 제외) */}
      <div className="px-4 pb-4">
        <div className="p-4 bg-[var(--color-border)] rounded-lg">
          <InfoList
            items={[
              { label: '등록 일시', value: formatDateTime(record.registeredAt) },
            ]}
          />
        </div>
      </div>

      {/* InfoList — 공식 출처 */}
      <div className="px-4 pb-4">
        <InfoList
          items={[
            { label: '제조연월', value: official.manufacturedAt },
            { label: '판매 등록', value: official.releasedAt },
          ]}
        />
      </div>

      {/* ProductLinkButton */}
      <div className="px-4 pb-6">
        <ProductLinkButton url={product.productUrl} />
      </div>

      {/* InfoList — 제품 정보 */}
      <div className="px-4 pb-4">
        <InfoList
          items={[
            { label: '소재', value: product.material },
            { label: '사이즈', value: formatSize(product.size) },
            { label: '색상', value: product.color },
          ]}
        />
      </div>

      {/* DetailImages */}
      <div className="px-4 pb-6">
        <DetailImages images={product.detailImages} />
      </div>

      <BottomTabBar tagCode={tagCode!} />
    </div>
  );
}
