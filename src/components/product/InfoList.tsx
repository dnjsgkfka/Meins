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
    <dl className="m-0">
      {visible.map(({ label, value }) => (
        <div
          key={label}
          className="flex items-center justify-between py-3 border-b border-[var(--color-icon-inactive)]"
        >
          <dt className="shrink-0 text-sm text-[var(--color-muted)]" style={{ width: 82 }}>
            {label}
          </dt>
          <dd className="m-0 text-sm text-[var(--color-fg)] text-right">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
