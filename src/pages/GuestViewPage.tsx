import { useNavigate } from 'react-router';
import type { TagDetailResponse } from '../types/api';
import ProductHero from '../components/product/ProductHero';
import ProductTitle from '../components/product/ProductTitle';
import InfoList from '../components/product/InfoList';
import DetailImages from '../components/product/DetailImages';
import ProductLinkButton from '../components/product/ProductLinkButton';
import StatusCard from '../components/product/StatusCard';

interface Props {
  tagCode: string;
  data: TagDetailResponse;
}

function formatSize(
  size: { width: number; depth: number; height: number } | null | undefined,
): string | undefined {
  if (!size) return undefined;
  return `${size.width} × ${size.depth} × ${size.height} cm`;
}

export default function GuestViewPage({ tagCode, data }: Props) {
  const navigate = useNavigate();
  const { product, official, ownership } = data;

  return (
    <div className="pb-24">
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

      {/* ProductTitle + 모델 코드 */}
      <div className="px-4 pt-2 pb-3">
        <ProductTitle name={product.name} />
        <p className="m-0 mt-1 text-xs text-[var(--color-muted)]">{product.modelCode}</p>
      </div>

      {/* StatusCard */}
      <div className="px-4 pb-4">
        <StatusCard registered={ownership.registered} registeredAt={ownership.registeredAt} />
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

      {/* 하단 안내문구 */}
      <div className="px-4 pb-6">
        <p className="m-0 text-xs text-[var(--color-muted)] leading-relaxed">
          본 태그는 MCM 공식 제품에만 부착됩니다. 태그 정보에 의문이 있으시면 고객센터로 문의해 주세요.
        </p>
      </div>

      {/* 하단 CTA — 고정 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-[var(--color-bg)] border-t border-[var(--color-border)] box-border">
        {ownership.registered ? (
          <button
            disabled
            className="w-full py-3.5 rounded-lg text-sm font-medium bg-[var(--color-border)] text-[var(--color-muted)] cursor-not-allowed"
          >
            이미 등록된 제품입니다
          </button>
        ) : (
          <button
            onClick={() => navigate(`/t/${tagCode}/verify`)}
            className="w-full py-3.5 rounded-lg text-sm font-medium bg-[var(--color-accent)] text-[var(--color-bg)] cursor-pointer"
          >
            소유자 등록하기
          </button>
        )}
      </div>
    </div>
  );
}
