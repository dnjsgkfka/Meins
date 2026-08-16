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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-1">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="h-8 w-8 rounded-full border border-[var(--color-icon-inactive)] bg-[var(--color-bg)] text-[var(--color-fg)] text-sm cursor-pointer disabled:opacity-30"
          >
            ‹
          </button>
          <span className="text-xs" style={{ color: '#8B8B8B' }}>{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            className="h-8 w-8 rounded-full border border-[var(--color-icon-inactive)] bg-[var(--color-bg)] text-[var(--color-fg)] text-sm cursor-pointer disabled:opacity-30"
          >
            ›
          </button>
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
    <div className="rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] px-4 py-3 flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <QrImage tagCode={tag.tagCode} />
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="leading-[1.3em] truncate" style={{ fontSize: 15, color: '#111111' }}>
            {tag.productName}
          </span>
          <span className="text-xs" style={{ color: '#8B8B8B' }}>{tag.tagCode}</span>
          {tag.authCode ? (
            <button
              onClick={copyAuthCode}
              className="self-start mt-0.5 text-xs border-none bg-transparent cursor-pointer p-0 text-left leading-[1.4em]"
              style={{ color: copied ? 'var(--color-accent)' : '#8B8B8B' }}
            >
              {copied ? '복사됨 ✓' : tag.authCode}
            </button>
          ) : (
            <span className="text-xs" style={{ color: '#8B8B8B' }}>코드 없음</span>
          )}
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
