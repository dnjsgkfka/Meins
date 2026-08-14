import Logo from './Logo';

interface Props {
  title: string;
  onBack?: () => void;
}

export default function PageHeader({ title, onBack }: Props) {
  return (
    <header
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-20 pointer-events-none"
      style={{
        background: 'linear-gradient(180deg, var(--color-tint) 0%, rgba(0,0,0,0) 100%)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="flex items-center gap-5 px-2 py-3 pointer-events-auto">
        {onBack ? (
          <button
            onClick={onBack}
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-bg)] shadow-card cursor-pointer border-none"
            aria-label="뒤로"
          >
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true">
              <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <div className="shrink-0 flex items-center text-[var(--color-fg)]" style={{ width: 82, height: 16 }}>
            <Logo />
          </div>
        )}
        <p className="m-0 text-base font-normal text-[var(--color-fg)]">{title}</p>
      </div>
    </header>
  );
}
