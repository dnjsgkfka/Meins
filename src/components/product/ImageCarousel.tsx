import { useState } from 'react';

function ArrowButton({ direction, onClick, disabled }: {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-full bg-white flex items-center justify-center border-none cursor-pointer disabled:opacity-30 shrink-0"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
      aria-label={direction === 'left' ? '이전 이미지' : '다음 이미지'}
    >
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true">
        {direction === 'left'
          ? <path d="M6 1L1 6L6 11" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M1 11L6 6L1 1" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        }
      </svg>
    </button>
  );
}

interface Props {
  images: string[];
  alt?: string;
}

export default function ImageCarousel({ images, alt }: Props) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const hasMultiple = images.length > 1;

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg bg-[var(--color-icon-inactive)]"
      style={{ aspectRatio: '3/4' }}
    >
      {/* 모든 이미지를 나란히 배치하고 translateX로 슬라이드 */}
      {images.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(${(i - index) * 100}%)` }}
        >
          <img
            src={src}
            alt={i === 0 ? (alt ?? '') : ''}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      ))}

      {hasMultiple && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 z-10">
          <ArrowButton
            direction="left"
            onClick={() => setIndex((i) => i - 1)}
            disabled={index === 0}
          />
          <ArrowButton
            direction="right"
            onClick={() => setIndex((i) => i + 1)}
            disabled={index === images.length - 1}
          />
        </div>
      )}
    </div>
  );
}
