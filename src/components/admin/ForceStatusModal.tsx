import { useState } from 'react';
import { forceStatus, AdminApiError } from '../../api/admin';
import type { AdminTag, ForceStatusAction } from '../../api/admin';
import { useAdminKeyReset } from './AdminKeyGate';
import { useToast } from '../../lib/toast';

interface ActionDef {
  action: ForceStatusAction;
  label: string;
  desc: string;
  confirmLabel: string;
  danger: boolean;
}

const ACTIONS: ActionDef[] = [
  {
    action: 'UNLOCK',
    label: '잠금 해제',
    desc: '인증 실패로 잠긴 태그를 해제합니다.',
    confirmLabel: '잠금 해제',
    danger: false,
  },
  {
    action: 'UNLOCK_RECOVERY',
    label: '복구 잠금 해제',
    desc: '복구 코드 초과로 잠긴 태그를 해제합니다.',
    confirmLabel: '복구 잠금 해제',
    danger: false,
  },
  {
    action: 'REGISTERED',
    label: '강제 등록',
    desc: '태그를 등록 상태로 강제 변경합니다.',
    confirmLabel: '강제 등록',
    danger: true,
  },
  {
    action: 'UNREGISTERED',
    label: '강제 미등록',
    desc: '소유자 정보를 삭제하고 미등록 상태로 초기화합니다.',
    confirmLabel: '초기화 실행',
    danger: true,
  },
];

interface Props {
  tag: AdminTag | null;
  onClose: () => void;
  onDone: () => void;
}

export default function ForceStatusModal({ tag, onClose, onDone }: Props) {
  const resetKey = useAdminKeyReset();
  const { showToast } = useToast();

  const [pending, setPending] = useState<ActionDef | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!tag) return null;

  function handleActionClick(def: ActionDef) {
    setError('');
    setPending(def);
  }

  function handleCancel() {
    if (isLoading) return;
    setPending(null);
    setError('');
  }

  async function handleConfirm() {
    if (!pending) return;
    setIsLoading(true);
    setError('');
    try {
      await forceStatus(tag!.tagCode, pending.action);
      showToast(`${pending.label} 완료`);
      onDone();
      onClose();
    } catch (err) {
      if (err instanceof AdminApiError && err.code === 'ADMIN_KEY_INVALID') {
        showToast('관리자 키가 유효하지 않습니다. 다시 입력해주세요.');
        resetKey();
        onClose();
      } else {
        setError(err instanceof Error ? err.message : '요청에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isLoading) { setPending(null); onClose(); } }}
    >
      <div className="w-full max-w-lg bg-[var(--color-bg)] rounded-t-2xl pb-safe px-4 pt-5 flex flex-col gap-4"
           style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>

        {/* 핸들 */}
        <div className="w-10 h-1 rounded-full bg-[var(--color-icon-inactive)] self-center mb-1" />

        {/* 태그 정보 */}
        <div className="flex flex-col gap-0.5">
          <p className="m-0 text-xs text-[var(--color-muted)]">액션 선택</p>
          <p className="m-0 text-base text-[var(--color-fg)]">{tag.tagCode}</p>
          <p className="m-0 text-xs text-[var(--color-muted)]">
            {tag.status === 'REGISTERED' ? '등록됨' : '미등록'}
            {tag.locked ? ' · 잠김' : ''}
          </p>
        </div>

        {/* 확인 레이어 */}
        {pending ? (
          <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] p-4">
            <div className="flex flex-col gap-1">
              <p className="m-0 text-sm font-medium text-[var(--color-fg)]">{pending.label}</p>
              <p className="m-0 text-xs text-[var(--color-muted)]">{pending.desc}</p>
              {pending.danger && (
                <p className="m-0 text-xs text-[var(--color-danger)] mt-1">이 작업은 되돌릴 수 없습니다.</p>
              )}
            </div>
            {error && <p className="m-0 text-xs text-[var(--color-danger)]">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 h-11 rounded-full text-sm border border-[var(--color-icon-inactive)] bg-[var(--color-bg)] text-[var(--color-fg)] cursor-pointer disabled:opacity-40"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={[
                  'flex-1 h-11 rounded-full text-sm border-none cursor-pointer disabled:opacity-40',
                  pending.danger
                    ? 'bg-[var(--color-danger)] text-white'
                    : 'bg-[var(--color-accent)] text-[var(--color-bg)]',
                ].join(' ')}
              >
                {isLoading ? '처리 중...' : pending.confirmLabel}
              </button>
            </div>
          </div>
        ) : (
          /* 액션 버튼 목록 */
          <div className="flex flex-col gap-2">
            {ACTIONS.map((def) => (
              <button
                key={def.action}
                onClick={() => handleActionClick(def)}
                className={[
                  'w-full h-12 rounded-xl text-sm text-left px-4 border cursor-pointer flex items-center justify-between',
                  def.danger
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-fg)]',
                ].join(' ')}
              >
                <span>{def.label}</span>
                <span className="text-xs text-[var(--color-muted)]">›</span>
              </button>
            ))}

            <button
              onClick={() => { setPending(null); onClose(); }}
              className="w-full h-11 rounded-full text-sm border-none bg-transparent text-[var(--color-muted)] cursor-pointer mt-1"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
