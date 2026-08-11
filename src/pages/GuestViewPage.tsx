import type { TagDetailResponse } from '../types/api';

interface Props {
  tagCode: string;
  data: TagDetailResponse;
}

// 구현 예정
export default function GuestViewPage({ tagCode, data }: Props) {
  return (
    <div style={{ padding: '2rem' }}>
      <p style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>{tagCode}</p>
      <h2>{data.product.name}</h2>
      <p>등록 여부: {data.ownership.registered ? '등록됨' : '미등록'}</p>
    </div>
  );
}
