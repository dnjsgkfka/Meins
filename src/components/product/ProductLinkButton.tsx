export default function ProductLinkButton({ url }: { url?: string | null }) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        padding: '0.75rem',
        textAlign: 'center',
        border: '1px solid var(--color-border)',
        borderRadius: '0.5rem',
        textDecoration: 'none',
        color: 'var(--color-fg)',
        fontSize: '0.875rem',
      }}
    >
      제품 공식 페이지 &rarr;
    </a>
  );
}
