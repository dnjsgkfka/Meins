import { useState } from 'react';
import AdminKeyGate, { useAdminKeyReset } from '../components/admin/AdminKeyGate';
import { clearAdminKey } from '../lib/adminKey';
import { listAdminTags } from '../api/admin';
import { setDemoConfig } from '../lib/demoConfig';
import { useToast } from '../lib/toast';
import BulkCreateForm from '../components/admin/BulkCreateForm';
import TagListTable from '../components/admin/TagListTable';
import ForceStatusModal from '../components/admin/ForceStatusModal';
import QrExportTab from '../components/admin/QrExportTab';
import Logo from '../components/Logo';
import type { AdminTag } from '../api/admin';

type Tab = 'create' | 'list' | 'qr';

const TABS: { id: Tab; label: string }[] = [
  { id: 'create', label: '태그 생성' },
  { id: 'list',   label: '태그 목록' },
  { id: 'qr',     label: 'QR 내보내기' },
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
  const [listRefreshTrigger, setListRefreshTrigger] = useState(0);
  const [actionTag, setActionTag] = useState<AdminTag | null>(null);
  const [isSavingDemo, setIsSavingDemo] = useState(false);
  const resetKey = useAdminKeyReset();
  const { showToast } = useToast();

  function handleLogout() {
    clearAdminKey();
    resetKey();
  }

  async function handleSaveDemo() {
    setIsSavingDemo(true);
    try {
      const tags = await listAdminTags();
      const unregistered = tags.find((t) => t.status === 'UNREGISTERED' && !t.locked);
      const registered = tags.find((t) => t.status === 'REGISTERED' && !t.locked);
      const entries = [
        unregistered && { tagCode: unregistered.tagCode, authCode: unregistered.authCode, status: 'UNREGISTERED' as const, productName: unregistered.productName },
        registered && { tagCode: registered.tagCode, authCode: registered.authCode, status: 'REGISTERED' as const, productName: registered.productName },
      ].filter(Boolean) as Parameters<typeof setDemoConfig>[0];

      if (entries.length === 0) {
        showToast('설정할 태그가 없습니다.');
        return;
      }
      setDemoConfig(entries);
      showToast(`데모 설정 저장됨 (${entries.length}개 태그)`);
    } catch {
      showToast('저장에 실패했습니다.');
    } finally {
      setIsSavingDemo(false);
    }
  }

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--color-tint)' }}>
      {/* 헤더 */}
      <header
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-20"
        style={{
          backgroundColor: 'var(--color-tint)',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div className="flex items-center justify-between px-2 h-14">
          <div className="flex items-center gap-2 text-[var(--color-fg)]">
            <Logo />
            <span className="text-xs text-[var(--color-muted)]">관리자</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveDemo}
              disabled={isSavingDemo}
              className="text-xs text-[var(--color-muted)] bg-transparent border-none cursor-pointer px-0 disabled:opacity-40"
            >
              {isSavingDemo ? '저장 중...' : '데모 설정'}
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-[var(--color-muted)] bg-transparent border-none cursor-pointer px-0"
            >
              키 초기화
            </button>
          </div>
        </div>

        {/* 탭 바 */}
        <div className="flex border-b border-[var(--color-border)]">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={[
                'flex-1 py-3 text-xs border-none cursor-pointer transition-colors bg-transparent',
                activeTab === id
                  ? 'text-[var(--color-fg)] border-b-2 border-[var(--color-fg)]'
                  : 'text-[var(--color-muted)]',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <ForceStatusModal
        tag={actionTag}
        onClose={() => setActionTag(null)}
        onDone={() => setListRefreshTrigger((n) => n + 1)}
      />

      {/* 콘텐츠 */}
      <div
        className="flex flex-col gap-6 px-2"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 108px)',
          paddingBottom: 'max(34px, env(safe-area-inset-bottom))',
        }}
      >
        {activeTab === 'create' && <BulkCreateForm onCreated={() => setListRefreshTrigger((n) => n + 1)} />}
        {activeTab === 'list'   && <TagListTable onNeedForceStatus={setActionTag} refreshTrigger={listRefreshTrigger} />}
        {activeTab === 'qr'     && <QrExportTab />}
      </div>
    </div>
  );
}
