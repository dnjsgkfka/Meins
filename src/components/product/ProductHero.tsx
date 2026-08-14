import { useState } from 'react';

type ImgState = 'loading' | 'loaded' | 'error';

export default function ProductHero({ src, alt }: { src: string; alt?: string }) {
  const [imgState, setImgState] = useState<ImgState>('loading');

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-[var(--color-icon-inactive)]" style={{ aspectRatio: '3/4' }}>
      {imgState === 'loading' && (
        <div className="shimmer absolute inset-0" />
      )}
      {imgState === 'error' && (
        <div className="absolute inset-0 bg-[var(--color-icon-inactive)]" />
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
