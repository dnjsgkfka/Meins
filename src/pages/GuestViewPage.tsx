import { useNavigate } from 'react-router';
import type { TagDetailResponse } from '../types/api';
import PageHeader from '../components/PageHeader';
import StickyBottomBar from '../components/StickyBottomBar';
import ImageCarousel from '../components/product/ImageCarousel';
import InfoList from '../components/product/InfoList';
import type { InfoGroup } from '../components/product/InfoList';
import { formatSize, formatDateTime } from '../lib/format';

interface Props {
  tagCode: string;
  data: TagDetailResponse;
}

function infoGroups(
  ownership: TagDetailResponse['ownership'],
  official: TagDetailResponse['official'],
  product: TagDetailResponse['product'],
): InfoGroup[] {
  const ownershipItems = ownership.registered
    ? [
        { label: '등록 상태', value: '등록된 제품' },
        ...(ownership.registeredAt
          ? [{ label: '등록 일자', value: formatDateTime(ownership.registeredAt) }]
          : []),
      ]
    : [{ value: '등록된 소유자 없음' }];

  return [
    { section: '소유 등록', items: ownershipItems },
    {
      section: '공식 출처',
      items: [
        { label: '제조연월', value: official.manufacturedAt },
        { label: '판매 등록', value: official.releasedAt },
        ...(product.productUrl
          ? [{ label: '제품 링크', value: '제품 상세 페이지', href: product.productUrl }]
          : []),
      ],
    },
    {
      section: '제품 정보',
      items: [
        { label: '소재', value: product.material },
        { label: '사이즈', value: formatSize(product.size) },
        { label: '색상', value: product.color },
      ],
    },
  ];
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
          paddingBottom: ownership.registered
            ? 'calc(max(16px, env(safe-area-inset-bottom)) + 101px)'
            : 'calc(max(16px, env(safe-area-inset-bottom)) + 76px)',
        }}
      >
        {/* 제품명 + 이미지 묶음 */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="m-0 text-2xl font-normal text-[var(--color-fg)] leading-tight">
              {product.name}
            </h1>
            <p className="m-0 text-xs text-[var(--color-muted)] tracking-[0.04em]">
              # {product.modelCode}
            </p>
          </div>
          <ImageCarousel
            images={[product.heroImage, ...(product.detailImages ?? [])].filter(Boolean)}
            alt={product.name}
          />
        </div>

        {/* 정보 목록 */}
        <div>
          <InfoList
            groups={infoGroups(ownership, official, product)}
          />
          <p className="m-0 mt-3 text-xs text-[var(--color-muted)] tracking-[0.04em]">
            브랜드에서 제공하는 공식 데이터입니다.
          </p>
        </div>
      </div>

      {/* 하단 CTA */}
      <StickyBottomBar>
        {ownership.registered ? (
          <>
            <button
              onClick={() => navigate(`/t/${tagCode}/transfer`)}
              className="text-left text-xs text-[var(--color-fg)] underline bg-transparent border-none cursor-pointer tracking-[0.04em]"
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
      </StickyBottomBar>
    </div>
  );
}
