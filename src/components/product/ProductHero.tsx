import { useState } from 'react';

type ImgState = 'loading' | 'loaded' | 'error';

export default function ProductHero({ src, alt }: { src: string; alt?: string }) {
  const [imgState, setImgState] = useState<ImgState>('loading');

  return (
    <div className="relative aspect-square w-full bg-[var(--color-border)]">
      {/* 로딩 중: shimmer 애니메이션 */}
      {imgState === 'loading' && (
        <div className="shimmer absolute inset-0" />
      )}
      {/* 실패: 정적 회색 블록 — 로딩과 의미가 다르므로 애니메이션 없음 */}
      {imgState === 'error' && (
        <div className="absolute inset-0 bg-[var(--color-border)]" />
      )}
      <img
        src={src}
        alt={alt ?? ''}
        className={`w-full h-full object-cover ${imgState === 'loaded' ? 'block' : 'hidden'}`}
        onLoad={() => setImgState('loaded')}
        onError={() => setImgState('error')}
      />
    </div>
  );
}
