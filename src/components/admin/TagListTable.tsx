import { useEffect, useState } from 'react';
import { listAdminTags, fetchQrImageBlob, deleteTag } from '../../api/admin';
import type { AdminTag } from '../../api/admin';
import { useAdminErrorHandler } from './AdminKeyGate';
import { useToast } from '../../lib/toast';

const ITEMS_PER_PAGE = 24;

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
    return <div className="w-20 h-20 rounded-lg shrink-0 bg-[var(--color-tint)] shimmer" />;
  }
  return (
    <button
      onClick={() => window.open(`/t/${tagCode}`, '_blank')}
      className="w-20 h-20 rounded-lg shrink-0 border-none cursor-pointer p-0 bg-transparent block"
      title="태그 페이지 열기"
    >
      <img src={src} alt={`QR ${tagCode}`} className="w-full h-full object-contain rounded-lg" />
    </button>
  );
}

interface Props {
  onNeedForceStatus: (tag: AdminTag) => void;
  refreshTrigger: number;
}

export default function TagListTable({ onNeedForceStatus, refreshTrigger }: Props) {
  const handleAdminError = useAdminErrorHandler();
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
      if (!handleAdminError(err)) setError('목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-36 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <p className="m-0 text-sm text-[var(--color-danger)]">{error}</p>
        <button
          onClick={load}
          className="self-start h-9 px-4 rounded-full text-xs bg-[var(--color-accent)] text-[var(--color-bg)] border-none cursor-pointer"
        >
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
    <div className="flex flex-col gap-6 w-full">
      {/* 툴바 */}
      <div className="flex items-center justify-between">
        <p className="m-0 text-xs text-[var(--color-muted)]">총 {tags.length}개</p>
        <button
          onClick={load}
          className="h-8 px-3 rounded-full text-xs border border-[var(--color-icon-inactive)] bg-[var(--color-bg)] text-[var(--color-fg)] cursor-pointer"
        >
          새로고침
        </button>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {paged.map((tag) => (
          <TagCard key={tag.tagCode} tag={tag} onAction={() => onNeedForceStatus(tag)} onDeleted={load} />
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="h-8 w-8 rounded-full border border-[var(--color-icon-inactive)] bg-[var(--color-bg)] text-[var(--color-fg)] text-sm cursor-pointer disabled:opacity-30"
          >
            ‹
          </button>
          <span className="text-xs text-[var(--color-muted)]">{page} / {totalPages}</span>
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

  const isRegistered = tag.status === 'REGISTERED';

  return (
    <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
      {/* 카드 본문 */}
      <div className="flex gap-3 p-4">
        <QrImage tagCode={tag.tagCode} />

        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          {/* 제품명 */}
          <p className="m-0 text-sm font-medium text-[var(--color-fg)] leading-tight line-clamp-2">
            {tag.productName}
          </p>

          {/* 태그 코드 */}
          <p className="m-0 text-xs text-[var(--color-muted)] tracking-wide">
            {tag.tagCode}
          </p>

          {/* 상태 + 이전 횟수 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: isRegistered ? 'rgba(34,197,94,0.12)' : 'var(--color-tint)',
                color: isRegistered ? 'rgb(22,163,74)' : 'var(--color-muted)',
              }}
            >
              {isRegistered ? '등록됨' : '미등록'}
            </span>
            {tag.locked && (
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: 'rgb(220,38,38)' }}>
                잠김
              </span>
            )}
            <span className="text-xs text-[var(--color-muted)]">이전 {tag.transferCount ?? 0}회</span>
          </div>

          {/* 인증 코드 */}
          {tag.authCode ? (
            <button
              onClick={copyAuthCode}
              className="self-start text-xs border-none bg-transparent cursor-pointer p-0 text-left"
              style={{ color: copied ? 'var(--color-accent)' : 'var(--color-muted)' }}
            >
              {copied ? '복사됨 ✓' : tag.authCode}
            </button>
          ) : (
            <span className="text-xs text-[var(--color-muted)]">인증 코드 없음</span>
          )}
        </div>
      </div>

      {/* 액션 */}
      <div className="flex items-center justify-between px-4 pb-4 gap-2">
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
      <div className="flex items-center gap-2">
        <button
          onClick={() => setConfirm(false)}
          className="h-8 px-3 rounded-full text-xs border border-[var(--color-icon-inactive)] bg-[var(--color-bg)] text-[var(--color-fg)] cursor-pointer"
        >
          취소
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="h-8 px-3 rounded-full text-xs bg-[var(--color-danger)] text-white border-none cursor-pointer disabled:opacity-50"
        >
          {deleting ? '삭제 중...' : '확인'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="h-8 px-3 rounded-full text-xs border border-[var(--color-danger)] text-[var(--color-danger)] bg-[var(--color-bg)] cursor-pointer"
    >
      삭제
    </button>
  );
}
