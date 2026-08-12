import { useNavigate } from 'react-router';
import type { TagDetailResponse } from '../types/api';
import PageHeader from '../components/PageHeader';
import ProductHero from '../components/product/ProductHero';
import InfoList from '../components/product/InfoList';
import { formatSize, formatDateTime } from '../lib/format';

interface Props {
  tagCode: string;
  data: TagDetailResponse;
}

export default function GuestViewPage({ tagCode, data }: Props) {
  const navigate = useNavigate();
  const { product, official, ownership } = data;

  return (
    <div
      className="min-h-dvh"
      style={{ backgroundColor: 'var(--color-tint)' }}
    >
      <PageHeader title="소유자 확인" />

      {/* 스크롤 콘텐츠 */}
      <div
        className="flex flex-col gap-6 px-2"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 56px)',
          paddingBottom: 'calc(max(16px, env(safe-area-inset-bottom)) + 76px)',
        }}
      >
        {/* 제품명 + 모델 코드 */}
        <div className="flex flex-col gap-0.5" style={{ width: 231 }}>
          <h1 className="m-0 text-2xl font-normal text-[var(--color-fg)] leading-tight">
            {product.name}
          </h1>
          <p className="m-0 text-xs text-[var(--color-muted)] tracking-[0.04em]">
            # {product.modelCode}
          </p>
        </div>

        {/* 제품 이미지 */}
        <ProductHero src={product.heroImage} alt={product.name} />

        {/* 정보 목록 */}
        <div>
          <InfoList
            items={[
              { label: '소유 등록', value: ownership.registered ? formatDateTime(ownership.registeredAt!) : '미등록' },
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

      {/* 하단 CTA */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-20 flex flex-col items-center gap-2 px-2"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, var(--color-tint) 40%)',
          backdropFilter: 'blur(1.5px)',
          WebkitBackdropFilter: 'blur(1.5px)',
          paddingTop: 16,
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}
      >
        {ownership.registered ? (
          <>
            <button
              onClick={() => navigate(`/t/${tagCode}/verify`)}
              className="text-xs text-[var(--color-fg)] underline bg-transparent border-none cursor-pointer tracking-[0.04em]"
            >
              이 제품을 양도받으셨나요?
            </button>
            <button
              disabled
              className="w-full h-11 rounded-full text-sm bg-[var(--color-icon-inactive)] text-[var(--color-bg)] border-none cursor-not-allowed"
            >
              이미 등록된 제품입니다
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate(`/t/${tagCode}/verify`)}
            className="w-full h-11 rounded-full text-sm bg-[var(--color-accent)] text-[var(--color-bg)] border-none cursor-pointer"
          >
            소유자 등록하기
          </button>
        )}
      </div>
    </div>
  );
}
