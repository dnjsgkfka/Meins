export interface InfoSubItem {
  label?: string;
  value: string | number | null | undefined;
  href?: string;
}

export interface InfoGroup {
  section: string;
  items: InfoSubItem[];
}

export default function InfoList({ groups }: { groups: InfoGroup[] }) {
  return (
    <div className="flex flex-col">
      {groups.map((group) => {
        const visible = group.items.filter(
          ({ value }) => value !== null && value !== undefined && value !== '',
        );
        if (visible.length === 0) return null;
        return (
          <div
            key={group.section}
            className="flex flex-row gap-5 py-3 border-t border-[var(--color-icon-inactive)]"
          >
            <div
              className="shrink-0 text-sm text-[var(--color-muted)] tracking-[0.04em] leading-[1.4]"
              style={{ width: 82 }}
            >
              {group.section}
            </div>
            <div className="flex flex-col gap-2 flex-1">
              {visible.map(({ label, value, href }, idx) => (
                <div key={label ?? idx} className="flex flex-row items-center gap-5">
                  <div
                    className="shrink-0 text-xs text-[var(--color-muted)] tracking-[0.04em] leading-[1.4]"
                    style={{ width: 81 }}
                  >
                    {label}
                  </div>
                  <div className="flex-1 text-xs text-[var(--color-fg)] tracking-[0.04em] leading-[1.4]">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-[var(--color-fg)]"
                      >
                        {value}
                      </a>
                    ) : (
                      <>{value}</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
