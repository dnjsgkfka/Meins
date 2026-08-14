export function IconHome({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M2.5 10.5L11 3L19.5 10.5V19C19.5 19.28 19.28 19.5 19 19.5H14V14H8V19.5H3C2.72 19.5 2.5 19.28 2.5 19V10.5Z"
        stroke={active ? 'var(--color-fg)' : 'var(--color-icon-inactive)'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconOwnership({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect
        x="4" y="2" width="14" height="18" rx="2"
        stroke={active ? 'var(--color-fg)' : 'var(--color-icon-inactive)'}
        strokeWidth="1.5"
      />
      <path
        d="M7.5 8H14.5M7.5 12H12"
        stroke={active ? 'var(--color-fg)' : 'var(--color-icon-inactive)'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconChat({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M18.5 11C18.5 15.14 15.14 18.5 11 18.5C9.63 18.5 8.35 18.13 7.25 17.49L3.5 18.5L4.51 14.75C3.87 13.65 3.5 12.37 3.5 11C3.5 6.86 6.86 3.5 11 3.5C15.14 3.5 18.5 6.86 18.5 11Z"
        stroke={active ? 'var(--color-fg)' : 'var(--color-icon-inactive)'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconArrowRight() {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true">
      <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
