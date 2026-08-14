import { useNavigate } from 'react-router';
import PageHeader from '../components/PageHeader';

interface DemoEntry {
  label: string;
  tag: string;
  sub: string;
  tagCode: string;
}

const DEMO_ENTRIES: DemoEntry[] = [
  {
    label: '미등록 제품',
    tag: 'TAG A1B2-C3D4',
    sub: '인증 코드 F26T-59QR-9D3K',
    tagCode: 'A1B2-C3D4',
  },
  {
    label: '등록된 제품',
    tag: 'TAG B2C3-D4E5',
    sub: '조회 전용 · 코드 없음',
    tagCode: 'B2C3-D4E5',
  },
  {
    label: '유효하지 않은 태그',
    tag: 'TAG 0000-0000',
    sub: '조회 실패 화면 확인',
    tagCode: '0000-0000',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--color-tint)' }}>
      <PageHeader title="데모 진입" />

      <div
        className="flex flex-col gap-6 px-2"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 56px)',
          paddingBottom: 'max(34px, env(safe-area-inset-bottom))',
        }}
      >
        {/* 섹션 1: 태그 없이 상태 확인 */}
        <div className="flex flex-col gap-6">
          <h2
            className="m-0 font-normal leading-[1.3em]"
            style={{ fontSize: 24, color: '#111111' }}
          >
            실물 태그 없이{'\n'}각 상태를 확인할 수 있습니다
          </h2>
          <div className="flex flex-col gap-2">
            {DEMO_ENTRIES.map((entry) => (
              <DemoBox
                key={entry.tagCode}
                entry={entry}
                onClick={() => navigate(`/t/${entry.tagCode}`)}
              />
            ))}
          </div>
        </div>

        {/* 섹션 2: QR 스캔 진입 */}
        <div className="flex flex-col gap-6">
          <h2
            className="m-0 font-normal leading-[1.3em]"
            style={{ fontSize: 24, color: '#111111' }}
          >
            QR 스캔으로 진입
          </h2>
          <div className="flex flex-col gap-2">
            <div
              className="rounded-lg"
              style={{ width: 120, height: 120, backgroundColor: '#BFBFBF' }}
            />
            <p
              className="m-0 text-xs leading-[1.4em] tracking-[0.04em] whitespace-pre-line"
              style={{ color: '#8B8B8B' }}
            >
              {'심사용 데모 진입점입니다.\n실제 서비스에는 노출되지 않습니다.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoBox({ entry, onClick }: { entry: DemoEntry; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-lg bg-[var(--color-bg)] border-none cursor-pointer text-left"
      style={{
        padding: 8,
        boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex flex-col gap-2" style={{ width: 153 }}>
        <span
          className="text-xs leading-[1.4em] tracking-[0.04em]"
          style={{ color: '#8B8B8B' }}
        >
          {entry.label}
        </span>
        <div className="flex flex-col" style={{ gap: 2 }}>
          <span className="leading-[1.3em]" style={{ fontSize: 16, color: '#111111' }}>
            {entry.tag}
          </span>
          <span
            className="text-xs leading-[1.4em] tracking-[0.04em]"
            style={{ color: '#8B8B8B' }}
          >
            {entry.sub}
          </span>
        </div>
      </div>

      {/* arrow button */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 44,
          height: 44,
          borderRadius: 100,
          backgroundColor: '#2D2D2D',
          boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.08)',
        }}
      >
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true">
          <path
            d="M1 11L6 6L1 1"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
}
