import { useEffect, useState } from 'react';
import { listAdminTags, fetchQrImageBlob, deleteTag, AdminApiError } from '../../api/admin';
import type { AdminTag } from '../../api/admin';
import { useAdminKeyReset } from './AdminKeyGate';
import { useToast } from '../../lib/toast';

function useQrImage(tagCode: string, enabled: boolean) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let objectUrl: string | null = null;
    fetchQrImageBlob(tagCode)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(null));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [tagCode, enabled]);

  return src;
}

function QrThumb({ tagCode }: { tagCode: string }) {
  const src = useQrImage(tagCode, true);
  if (!src) return <div className="w-12 h-12 rounded bg-[var(--color-tint)] shimmer shrink-0" />;
  return <img src={src} alt={`QR ${tagCode}`} className="w-12 h-12 rounded object-contain shrink-0" />;
}

interface Props {
  onNeedForceStatus: (tag: AdminTag) => void;
  refreshTrigger: number;
}

export default function TagListTable({ onNeedForceStatus, refreshTrigger }: Props) {
  const resetKey = useAdminKeyReset();
  const { showToast } = useToast();

  const [tags, setTags] = useState<AdminTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setIsLoading(true);
    setError('');
    try {
      const data = await listAdminTags();
      setTags(data);
    } catch (err) {
      if (err instanceof AdminApiError && err.code === 'ADMIN_KEY_INVALID') {
        showToast('관리자 키가 유효하지 않습니다. 다시 입력해주세요.');
        resetKey();
      } else {
        setError('목록을 불러올 수 없습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg shimmer" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <p className="m-0 text-sm text-[var(--color-danger)]">{error}</p>
        <button onClick={load} className="self-start h-9 px-4 rounded-full text-xs bg-[var(--color-accent)] text-[var(--color-bg)] border-none cursor-pointer">
          다시 시도
        </button>
      </div>
    );
  }

  if (tags.length === 0) {
    return <p className="m-0 text-sm text-[var(--color-muted)]">태그가 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="m-0 text-xs text-[var(--color-muted)]">총 {tags.length}개</p>
        <button
          onClick={load}
          className="h-8 px-3 rounded-full text-xs border border-[var(--color-icon-inactive)] bg-[var(--color-bg)] text-[var(--color-fg)] cursor-pointer"
        >
          새로고침
        </button>
      </div>

      {/* 모바일: 카드, md 이상: 테이블 */}
      <>
        {/* 카드 (md 미만) */}
        <div className="flex flex-col gap-3 md:hidden">
          {tags.map((tag) => (
            <TagCard key={tag.tagCode} tag={tag} onAction={() => onNeedForceStatus(tag)} onDeleted={load} />
          ))}
        </div>

        {/* 테이블 (md 이상) */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--color-tint)]">
                {['QR', '태그 코드', '인증 코드', '상태', '잠금', '제품명', '액션'].map((h) => (
                  <th key={h} className="text-left px-3 py-2 font-normal text-[var(--color-muted)] border-b border-[var(--color-border)] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr
                  key={tag.tagCode}
                  className={tag.locked ? 'bg-red-50 dark:bg-red-950/20' : 'bg-[var(--color-bg)]'}
                >
                  <td className="px-3 py-2 border-b border-[var(--color-border)]">
                    <QrThumb tagCode={tag.tagCode} />
                  </td>
                  <td className="px-3 py-2 font-mono border-b border-[var(--color-border)] whitespace-nowrap">{tag.tagCode}</td>
                  <td className="px-3 py-2 font-mono border-b border-[var(--color-border)] whitespace-nowrap">{tag.authCode}</td>
                  <td className="px-3 py-2 border-b border-[var(--color-border)]">
                    <StatusBadge status={tag.status} />
                  </td>
                  <td className="px-3 py-2 border-b border-[var(--color-border)]">
                    {tag.locked && <span className="text-red-500 font-medium">잠김</span>}
                  </td>
                  <td className="px-3 py-2 border-b border-[var(--color-border)] max-w-[160px] truncate">{tag.productName}</td>
                  <td className="px-3 py-2 border-b border-[var(--color-border)]">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onNeedForceStatus(tag)}
                        className="h-8 px-3 rounded-full text-xs border border-[var(--color-icon-inactive)] bg-[var(--color-bg)] text-[var(--color-fg)] cursor-pointer whitespace-nowrap"
                      >
                        액션
                      </button>
                      <DeleteButton tagCode={tag.tagCode} onDeleted={load} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    </div>
  );
}

function TagCard({ tag, onAction, onDeleted }: { tag: AdminTag; onAction: () => void; onDeleted: () => void }) {
  return (
    <div className={[
      'rounded-lg border p-3 flex gap-3',
      tag.locked
        ? 'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800'
        : 'border-[var(--color-border)] bg-[var(--color-bg)]',
    ].join(' ')}>
      <QrThumb tagCode={tag.tagCode} />
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-[var(--color-fg)] truncate">{tag.tagCode}</span>
          <StatusBadge status={tag.status} />
          {tag.locked && <span className="text-xs text-red-500 font-medium">잠김</span>}
        </div>
        <span className="text-xs text-[var(--color-muted)] font-mono">{tag.authCode}</span>
        <span className="text-xs text-[var(--color-muted)] truncate">{tag.productName}</span>
        <div className="mt-1 flex gap-2">
          <button
            onClick={onAction}
            className="self-start h-8 px-3 rounded-full text-xs border border-[var(--color-icon-inactive)] bg-[var(--color-bg)] text-[var(--color-fg)] cursor-pointer"
          >
            액션
          </button>
          <DeleteButton tagCode={tag.tagCode} onDeleted={onDeleted} />
        </div>
      </div>
    </div>
  );
}

function DeleteButton({ tagCode, onDeleted }: { tagCode: string; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTag(tagCode);
      showToast('삭제되었습니다.');
      onDeleted();
    } catch {
      showToast('삭제에 실패했습니다.');
      setConfirm(false);
    } finally {
      setDeleting(false);
    }
  }

  if (confirm) {
    return (
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="self-start h-8 px-3 rounded-full text-xs bg-[var(--color-danger)] text-white border-none cursor-pointer whitespace-nowrap disabled:opacity-50"
      >
        {deleting ? '삭제 중...' : '확인'}
      </button>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="self-start h-8 px-3 rounded-full text-xs border border-[var(--color-danger)] text-[var(--color-danger)] bg-[var(--color-bg)] cursor-pointer whitespace-nowrap"
    >
      삭제
    </button>
  );
}

function StatusBadge({ status }: { status: AdminTag['status'] }) {
  const isReg = status === 'REGISTERED';
  return (
    <span className={[
      'inline-block px-2 py-0.5 rounded-full text-[10px]',
      isReg ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-[var(--color-tint)] text-[var(--color-muted)]',
    ].join(' ')}>
      {isReg ? '등록됨' : '미등록'}
    </span>
  );
}
