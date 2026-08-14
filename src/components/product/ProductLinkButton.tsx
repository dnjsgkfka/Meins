export default function ProductLinkButton({ url }: { url?: string | null }) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full py-2.5 text-center text-sm border border-[var(--color-border)] rounded-full text-[var(--color-fg)] no-underline"
    >
      제품 공식 페이지 →
    </a>
  );
}
