import { useNavigate } from 'react-router';
import PageHeader from '../PageHeader';

interface Props {
  lockedUntil: string;
  tagCode: string;
}

function formatLockedUntil(lockedUntil: string): string {
  const d = new Date(lockedUntil);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yy}-${mm}-${dd} ${hh}:${min}`;
}

export default function LockedScreen({ lockedUntil, tagCode }: Props) {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--color-tint)' }}>
      <PageHeader title="소유자 등록" onBack={() => navigate(-1)} />

      <div
        className="flex flex-col gap-2 px-2"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 68px)' }}
      >
        <h1 className="m-0 text-2xl font-normal text-[var(--color-fg)]">
          입력이 일시적으로 제한되었습니다
        </h1>
        <p className="m-0 text-xs text-[var(--color-muted)] leading-[1.4em] tracking-[0.04em]">
          {formatLockedUntil(lockedUntil)} 에 다시 시도 가능합니다.
        </p>
      </div>

      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-20 flex flex-col items-center gap-2 px-2"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, var(--color-tint) 40%)',
          backdropFilter: 'blur(1.5px)',
          WebkitBackdropFilter: 'blur(1.5px)',
          paddingTop: 16,
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}
      >
        <button
          className="text-xs text-[var(--color-fg)] underline bg-transparent border-none cursor-pointer tracking-[0.04em]"
          onClick={() => {}}
        >
          코드를 찾을 수 없나요?
        </button>
        <button
          onClick={() => navigate(`/t/${tagCode}`, { replace: true })}
          className="w-full h-11 rounded-full text-sm bg-[var(--color-accent)] text-[var(--color-bg)] border-none cursor-pointer"
        >
          게스트 화면으로 돌아가기
        </button>
      </div>
    </div>
  );
}
