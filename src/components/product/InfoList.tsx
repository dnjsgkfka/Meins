export interface InfoItem {
  label: string;
  value: string | number | null | undefined;
}

export default function InfoList({ items }: { items: InfoItem[] }) {
  const visible = items.filter(
    ({ value }) => value !== null && value !== undefined && value !== '',
  );

  if (visible.length === 0) return null;

  return (
    <dl style={{ margin: 0 }}>
      {visible.map(({ label, value }) => (
        <div
          key={label}
          style={{
            display: 'flex',
            gap: '1rem',
            padding: '0.625rem 0',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <dt style={{ color: 'var(--color-muted)', minWidth: '5.5rem', flexShrink: 0, fontSize: '0.875rem' }}>
            {label}
          </dt>
          <dd style={{ margin: 0, fontSize: '0.875rem' }}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
