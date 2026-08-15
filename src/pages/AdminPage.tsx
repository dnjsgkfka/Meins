import { useState } from 'react';
import AdminKeyGate, { useAdminKeyReset } from '../components/admin/AdminKeyGate';
import { clearAdminKey } from '../lib/adminKey';
import BulkCreateForm from '../components/admin/BulkCreateForm';

type Tab = 'create' | 'list' | 'qr';

const TABS: { id: Tab; label: string }[] = [
  { id: 'create', label: '제품/태그 생성' },
  { id: 'list',   label: '태그 목록' },
  { id: 'qr',     label: 'QR 다운로드' },
];

export default function AdminPage() {
  return (
    <AdminKeyGate>
      <AdminPageContent />
    </AdminKeyGate>
  );
}

function AdminPageContent() {
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const resetKey = useAdminKeyReset();

  function handleLogout() {
    clearAdminKey();
    resetKey();
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: 'var(--color-tint)' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
        <h1 className="m-0 text-base font-normal text-[var(--color-fg)]">MCM 관리자</h1>
        <button
          onClick={handleLogout}
          className="text-xs text-[var(--color-muted)] bg-transparent border-none cursor-pointer px-0"
        >
          키 초기화
        </button>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={[
              'flex-1 py-3 text-sm border-none cursor-pointer transition-colors',
              activeTab === id
                ? 'text-[var(--color-fg)] border-b-2 border-[var(--color-accent)] bg-[var(--color-bg)]'
                : 'text-[var(--color-muted)] bg-[var(--color-bg)]',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {activeTab === 'create' && <BulkCreateForm />}
        {activeTab === 'list'   && <div className="text-sm text-[var(--color-muted)]">— 태그 목록 (Stage 4) —</div>}
        {activeTab === 'qr'     && <div className="text-sm text-[var(--color-muted)]">— QR 다운로드 (Stage 6) —</div>}
      </div>
    </div>
  );
}
