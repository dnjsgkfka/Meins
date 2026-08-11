import { useLocation, useNavigate } from 'react-router';

interface Props {
  tagCode: string;
}

const TABS = [
  { label: '홈', segment: 'home' },
  { label: '소유권', segment: 'ownership' },
  { label: '챗', segment: 'chat' },
] as const;

export default function BottomTabBar({ tagCode }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] flex border-t border-[var(--color-border)] bg-[var(--color-bg)] pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ label, segment }) => {
        const path = `/t/${tagCode}/${segment}`;
        const isActive = location.pathname === path;
        return (
          <button
            key={segment}
            onClick={() => navigate(path)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-muted)]'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
