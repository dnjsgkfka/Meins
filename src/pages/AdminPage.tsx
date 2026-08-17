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

type Tab = 'list' | 'create' | 'qr';

const TABS: { id: Tab; label: string }[] = [
  { id: 'list',   label: '태그 목록' },
  { id: 'create', label: '태그 생성' },
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
  const [activeTab, setActiveTab] = useState<Tab>('list');
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
    <div className="flex min-h-dvh" style={{ backgroundColor: 'var(--color-tint)' }}>
      {/* 사이드바 */}
      <aside
        className="fixed left-0 top-0 bottom-0 w-52 flex flex-col z-20 border-r border-[var(--color-border)]"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {/* 로고 */}
        <div className="flex items-center gap-2 px-5 h-16 border-b border-[var(--color-border)]">
          <Logo />
          <span className="text-xs text-[var(--color-muted)]">관리자</span>
        </div>

        {/* 네비게이션 */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={[
                'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors border-none cursor-pointer',
                activeTab === id
                  ? 'bg-[var(--color-tint)] text-[var(--color-fg)]'
                  : 'bg-transparent text-[var(--color-muted)]',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* 하단 */}
        <div className="flex flex-col gap-2 px-5 py-5 border-t border-[var(--color-border)]">
          <button
            onClick={handleSaveDemo}
            disabled={isSavingDemo}
            className="text-xs text-[var(--color-muted)] bg-transparent border-none cursor-pointer text-left p-0 disabled:opacity-40"
          >
            {isSavingDemo ? '저장 중...' : '데모 설정'}
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-[var(--color-muted)] bg-transparent border-none cursor-pointer text-left p-0"
          >
            키 초기화
          </button>
        </div>
      </aside>

      {/* 메인 */}
      <main className="flex flex-col flex-1 min-h-dvh" style={{ marginLeft: 208 }}>
        {/* 콘텐츠 헤더 */}
        <div
          className="sticky top-0 z-10 flex items-center px-8 h-16 border-b border-[var(--color-border)]"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          <h1 className="m-0 text-base font-medium text-[var(--color-fg)]">
            {TABS.find((t) => t.id === activeTab)?.label}
          </h1>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 p-8">
          {activeTab === 'create' && <BulkCreateForm onCreated={() => setListRefreshTrigger((n) => n + 1)} />}
          {activeTab === 'list'   && <TagListTable onNeedForceStatus={setActionTag} refreshTrigger={listRefreshTrigger} />}
          {activeTab === 'qr'     && <QrExportTab />}
        </div>
      </main>

      <ForceStatusModal
        tag={actionTag}
        onClose={() => setActionTag(null)}
        onDone={() => setListRefreshTrigger((n) => n + 1)}
      />
    </div>
  );
}
