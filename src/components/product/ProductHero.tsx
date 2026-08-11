import { useState } from 'react';

type ImgState = 'loading' | 'loaded' | 'error';

export default function ProductHero({ src, alt }: { src: string; alt?: string }) {
  const [imgState, setImgState] = useState<ImgState>('loading');

  return (
    <div style={{ position: 'relative', aspectRatio: '1', width: '100%', background: 'var(--color-border)' }}>
      {/* 로딩 중: shimmer 애니메이션 */}
      {imgState === 'loading' && (
        <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />
      )}
      {/* 실패: 정적 회색 블록 */}
      {imgState === 'error' && (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--color-border)' }} />
      )}
      <img
        src={src}
        alt={alt ?? ''}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: imgState === 'loaded' ? 'block' : 'none',
        }}
        onLoad={() => setImgState('loaded')}
        onError={() => setImgState('error')}
      />
    </div>
  );
}
