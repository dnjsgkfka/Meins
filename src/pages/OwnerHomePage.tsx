import { useOutletContext, useParams } from 'react-router';
import type { OwnerMeResponse } from '../types/api';
import PageHeader from '../components/PageHeader';
import BottomTabBar from '../components/BottomTabBar';
import ImageCarousel from '../components/product/ImageCarousel';
import InfoList from '../components/product/InfoList';
import type { InfoGroup } from '../components/product/InfoList';
import { formatSize, formatDateTime } from '../lib/format';

function ownerInfoGroups(
  tagCode: string,
  record: OwnerMeResponse['record'],
  official: OwnerMeResponse['official'],
  product: OwnerMeResponse['product'],
): InfoGroup[] {
  return [
    { section: '등록 코드', items: [{ value: tagCode }] },
    { section: '등록 시각', items: [{ value: formatDateTime(record.registeredAt) }] },
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

export default function OwnerHomePage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const { record, product, official } = useOutletContext<OwnerMeResponse>();

  return (
    <div
      className="min-h-dvh"
      style={{ backgroundColor: 'var(--color-tint)' }}
    >
      <PageHeader title="내 제품" />

      <div
        className="flex flex-col gap-6 px-2"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 56px)',
          paddingBottom: 'calc(max(16px, env(safe-area-inset-bottom)) + 87px)',
        }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="m-0 text-2xl font-normal leading-8 text-[var(--color-fg)]">{product.name}</h1>
            <p className="m-0 text-xs leading-4 tracking-wide text-[var(--color-muted)]"># {product.modelCode}</p>
          </div>
          <ImageCarousel
            images={[product.heroImage, ...(product.detailImages ?? [])].filter(Boolean)}
            alt={product.name}
          />
        </div>

        <div>
          <InfoList
            groups={ownerInfoGroups(tagCode!, record, official, product)}
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
