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
import type { AdminTag } from '../api/admin';

type Tab = 'create' | 'list' | 'qr';

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
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: 'var(--color-tint)' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
        <h1 className="m-0 text-base font-normal text-[var(--color-fg)]">MCM 관리자</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDemo}
            disabled={isSavingDemo}
            className="text-xs text-[var(--color-accent)] bg-transparent border-none cursor-pointer px-0 disabled:opacity-40"
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

      <ForceStatusModal
        tag={actionTag}
        onClose={() => setActionTag(null)}
        onDone={() => setListRefreshTrigger((n) => n + 1)}
      />

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {activeTab === 'create' && <BulkCreateForm onCreated={() => setListRefreshTrigger((n) => n + 1)} />}
        {activeTab === 'list'   && <TagListTable onNeedForceStatus={setActionTag} refreshTrigger={listRefreshTrigger} />}
        {activeTab === 'qr'     && <QrExportTab />}
      </div>
    </div>
  );
}
