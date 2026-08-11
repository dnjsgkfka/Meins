import ProductHero from './ProductHero';

export default function DetailImages({ images }: { images: string[] }) {
  const capped = images.slice(0, 3);
  if (capped.length === 0) return null;

  // 3-column 그리드 유지, 빈 셀 없이 있는 개수만큼만 렌더
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {capped.map((src, i) => (
        <ProductHero key={i} src={src} />
      ))}
    </div>
  );
}
