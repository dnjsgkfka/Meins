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
          className="flex gap-4 py-2.5 border-b border-[var(--color-border)]"
        >
          <dt className="text-sm text-[var(--color-muted)] min-w-[5.5rem] shrink-0">
            {label}
          </dt>
          <dd className="m-0 text-sm text-[var(--color-fg)]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
