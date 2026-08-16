import { useEffect, useState } from 'react';
import { listAdminTags, fetchQrImageBlob, deleteTag, AdminApiError } from '../../api/admin';
import type { AdminTag } from '../../api/admin';
import { useAdminKeyReset } from './AdminKeyGate';
import { useToast } from '../../lib/toast';

const ITEMS_PER_PAGE = 10;

function useQrImage(tagCode: string) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    fetchQrImageBlob(tagCode)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(null));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [tagCode]);

  return src;
}

function QrImage({ tagCode }: { tagCode: string }) {
  const src = useQrImage(tagCode);
  if (!src) {
    return <div className="w-[100px] h-[100px] rounded shrink-0 bg-[var(--color-tint)] shimmer" />;
  }
  return (
    <button
      onClick={() => window.open(`/t/${tagCode}`, '_blank')}
      className="w-[100px] h-[100px] rounded shrink-0 border-none cursor-pointer p-0 bg-transparent block"
      title="태그 페이지 열기"
    >
      <img src={src} alt={`QR ${tagCode}`} className="w-full h-full object-contain rounded" />
    </button>
  );
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
  const [page, setPage] = useState(1);

  async function load() {
    setIsLoading(true);
    setError('');
    try {
      const data = await listAdminTags();
      setTags(data);
      setPage(1);
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
          <div key={i} className="h-32 rounded-lg shimmer" />
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

  const totalPages = Math.ceil(tags.length / ITEMS_PER_PAGE);
  const paged = tags.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="m-0 text-xs" style={{ color: '#8B8B8B' }}>총 {tags.length}개</p>
        <button
          onClick={load}
          className="h-8 px-3 rounded-full text-xs border border-[var(--color-icon-inactive)] bg-[var(--color-bg)] text-[var(--color-fg)] cursor-pointer"
        >
          새로고침
        </button>
      </div>

      {paged.map((tag) => (
        <TagCard key={tag.tagCode} tag={tag} onAction={() => onNeedForceStatus(tag)} onDeleted={load} />
      ))}

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
                  <td className="px-3 py-2 border-b border-[var(--color-border)] whitespace-nowrap">{tag.tagCode}</td>
                  <td className="px-3 py-2 border-b border-[var(--color-border)] whitespace-nowrap">{tag.authCode}</td>
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
      )}
    </div>
  );
}

function TagCard({ tag, onAction, onDeleted }: { tag: AdminTag; onAction: () => void; onDeleted: () => void }) {
  const [copied, setCopied] = useState(false);

  function copyAuthCode() {
    navigator.clipboard.writeText(tag.authCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

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
          <span className="text-xs text-[var(--color-fg)] truncate">{tag.tagCode}</span>
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

      <div className="flex items-center gap-2">
        <span className="text-xs mr-auto" style={{ color: '#8B8B8B' }}>
          {tag.status === 'REGISTERED' ? '등록됨' : '미등록'}
          {tag.locked ? ' · 잠김' : ''}
        </span>
        <button
          onClick={onAction}
          className="h-8 px-3 rounded-full text-xs border border-[var(--color-icon-inactive)] bg-[var(--color-bg)] text-[var(--color-fg)] cursor-pointer"
        >
          액션
        </button>
        <DeleteButton tagCode={tag.tagCode} onDeleted={onDeleted} />
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
        className="h-8 px-3 rounded-full text-xs bg-[var(--color-danger)] text-white border-none cursor-pointer whitespace-nowrap disabled:opacity-50"
      >
        {deleting ? '삭제 중...' : '확인'}
      </button>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="h-8 px-3 rounded-full text-xs border border-[var(--color-danger)] text-[var(--color-danger)] bg-[var(--color-bg)] cursor-pointer whitespace-nowrap"
    >
      삭제
    </button>
  );
}
