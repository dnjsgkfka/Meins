import { useNavigate } from 'react-router';
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { getDemoConfig } from '../lib/demoConfig';
import type { DemoEntry } from '../lib/demoConfig';
import PageHeader from '../components/PageHeader';

const FALLBACK_ENTRIES: DemoEntry[] = [
  { tagCode: 'A1B2-C3D4', authCode: 'F26T-59QR-9D3K', status: 'UNREGISTERED', productName: '미등록 제품' },
  { tagCode: 'B2C3-D4E5', authCode: '', status: 'REGISTERED',   productName: '등록된 제품' },
  { tagCode: '0000-0000', authCode: '', status: 'UNREGISTERED', productName: '유효하지 않은 태그' },
];

function toDisplayEntry(entry: DemoEntry) {
  return {
    label: entry.status === 'REGISTERED' ? '등록된 제품' : '미등록 제품',
    tag: `TAG ${entry.tagCode}`,
    sub: entry.status === 'UNREGISTERED' && entry.authCode
      ? `인증 코드 ${entry.authCode}`
      : '조회 전용 · 코드 없음',
    tagCode: entry.tagCode,
  };
}

export default function LandingPage() {
  const navigate = useNavigate();
  const saved = getDemoConfig();
  const raw = saved && saved.length > 0 ? saved : FALLBACK_ENTRIES;
  const entries = raw.map(toDisplayEntry);

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
        <div className="flex flex-col gap-6">
          <h2 className="m-0 font-normal leading-[1.3em]" style={{ fontSize: 24, color: '#111111' }}>
            실물 태그 없이{'\n'}각 상태를 확인할 수 있습니다
          </h2>
          <div className="flex flex-col gap-2">
            {entries.map((e) => (
              <DemoBox key={e.tagCode} entry={e} onClick={() => navigate(`/t/${e.tagCode}`)} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="m-0 font-normal leading-[1.3em]" style={{ fontSize: 24, color: '#111111' }}>
            QR 스캔으로 진입
          </h2>
          <div className="flex flex-col gap-3">
            {entries.map((e) => <QrRow key={e.tagCode} entry={e} />)}
          </div>
          <p className="m-0 text-xs leading-[1.4em] tracking-[0.04em] whitespace-pre-line" style={{ color: '#8B8B8B' }}>
            {'심사용 데모 진입점입니다.\n실제 서비스에는 노출되지 않습니다.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function QrRow({ entry }: { entry: ReturnType<typeof toDisplayEntry> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, `${window.location.origin}/t/${entry.tagCode}`, {
      width: 100,
      margin: 1,
      color: { dark: '#111111', light: '#F5F5F5' },
    });
  }, [entry.tagCode]);

  return (
    <div className="flex items-center gap-4 rounded-lg bg-[var(--color-bg)] px-4 py-3" style={{ boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.08)' }}>
      <canvas ref={canvasRef} width={100} height={100} className="shrink-0 rounded" />
      <div className="flex flex-col gap-1">
        <span className="text-xs" style={{ color: '#8B8B8B' }}>{entry.label}</span>
        <span className="leading-[1.3em]" style={{ fontSize: 15, color: '#111111' }}>{entry.tag}</span>
        <span className="text-xs" style={{ color: '#8B8B8B' }}>{entry.sub}</span>
      </div>
    </div>
  );
}

function DemoBox({ entry, onClick }: { entry: ReturnType<typeof toDisplayEntry>; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-lg bg-[var(--color-bg)] border-none cursor-pointer text-left"
      style={{ padding: 8, boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.08)' }}
    >
      <div className="flex flex-col gap-2" style={{ width: 153 }}>
        <span className="text-xs leading-[1.4em] tracking-[0.04em]" style={{ color: '#8B8B8B' }}>{entry.label}</span>
        <div className="flex flex-col" style={{ gap: 2 }}>
          <span className="leading-[1.3em]" style={{ fontSize: 16, color: '#111111' }}>{entry.tag}</span>
          <span className="text-xs leading-[1.4em] tracking-[0.04em]" style={{ color: '#8B8B8B' }}>{entry.sub}</span>
        </div>
      </div>
      <div className="flex items-center justify-center shrink-0" style={{ width: 44, height: 44, borderRadius: 100, backgroundColor: '#2D2D2D' }}>
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true">
          <path d="M1 11L6 6L1 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}
