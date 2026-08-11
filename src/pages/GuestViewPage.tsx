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
    <div style={{ paddingBottom: '5rem' }}>
      {/* TagCode */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted)', letterSpacing: '0.1em' }}>
          {tagCode}
        </p>
      </div>

      {/* ProductHero */}
      <ProductHero src={product.heroImage} alt={product.name} />

      {/* 공식 태그 뱃지 */}
      <div style={{ padding: '0.75rem 1rem 0' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '0.25rem 0.625rem',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            border: '1px solid var(--color-fg)',
            borderRadius: '999px',
          }}
        >
          OFFICIAL TAG
        </span>
      </div>

      {/* ProductTitle */}
      <div style={{ padding: '0.5rem 1rem 0.75rem' }}>
        <ProductTitle name={product.name} />
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--color-muted)' }}>
          {product.modelCode}
        </p>
      </div>

      {/* StatusCard */}
      <div style={{ padding: '0 1rem 1rem' }}>
        <StatusCard
          registered={ownership.registered}
          registeredAt={ownership.registeredAt}
        />
      </div>

      {/* InfoList — 공식 출처 */}
      <div style={{ padding: '0 1rem 1rem' }}>
        <InfoList
          items={[
            { label: '제조연월', value: official.manufacturedAt },
            { label: '판매 등록', value: official.releasedAt },
          ]}
        />
      </div>

      {/* ProductLinkButton */}
      <div style={{ padding: '0 1rem 1.5rem' }}>
        <ProductLinkButton url={product.productUrl} />
      </div>

      {/* InfoList — 제품 정보 */}
      <div style={{ padding: '0 1rem 1rem' }}>
        <InfoList
          items={[
            { label: '소재', value: product.material },
            { label: '사이즈', value: formatSize(product.size) },
            { label: '색상', value: product.color },
          ]}
        />
      </div>

      {/* DetailImages */}
      <div style={{ padding: '0 1rem 1.5rem' }}>
        <DetailImages images={product.detailImages} />
      </div>

      {/* 하단 안내문구 */}
      <div style={{ padding: '0 1rem 1.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
          본 태그는 MCM 공식 제품에만 부착됩니다. 태그 정보에 의문이 있으시면 고객센터로 문의해 주세요.
        </p>
      </div>

      {/* 하단 CTA — 하단 고정 */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          padding: '0.75rem 1rem',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
          background: 'var(--color-bg)',
          borderTop: '1px solid var(--color-border)',
          boxSizing: 'border-box',
        }}
      >
        {ownership.registered ? (
          <button
            disabled
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'var(--color-border)',
              color: 'var(--color-muted)',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: 'not-allowed',
            }}
          >
            이미 등록된 제품입니다
          </button>
        ) : (
          <button
            onClick={() => navigate(`/t/${tagCode}/verify`)}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'var(--color-accent)',
              color: 'var(--color-bg)',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            소유자 등록하기
          </button>
        )}
      </div>
    </div>
  );
}
