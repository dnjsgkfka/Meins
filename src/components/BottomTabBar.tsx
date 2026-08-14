import { useLocation, useNavigate } from 'react-router';
import { IconHome, IconOwnership, IconChat } from './Icons';

interface Props {
  tagCode: string;
}

const TABS = [
  { label: '홈', segment: 'home', Icon: IconHome },
  { label: '소유권', segment: 'ownership', Icon: IconOwnership },
  { label: '챗', segment: 'chat', Icon: IconChat },
] as const;

export default function BottomTabBar({ tagCode }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 flex flex-col items-center"
      style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, var(--color-tint) 40%)',
        backdropFilter: 'blur(1.5px)',
        WebkitBackdropFilter: 'blur(1.5px)',
        paddingTop: 16,
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex items-center gap-2 p-1 rounded-full bg-[var(--color-bg)] shadow-tapbar">
        {TABS.map(({ label, segment, Icon }) => {
          const isActive = location.pathname === `/t/${tagCode}/${segment}`;
          return (
            <button
              key={segment}
              onClick={() => navigate(`/t/${tagCode}/${segment}`)}
              aria-label={label}
              className={[
                'flex items-center justify-center w-[70px] h-[47px] rounded-full transition-colors cursor-pointer border-none bg-transparent',
                isActive ? 'bg-[var(--color-tint)]' : '',
              ].join(' ')}
            >
              <Icon active={isActive} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
