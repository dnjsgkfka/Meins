import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/client';
import { postTransferOwnership } from '../api/tags';
import { setToken } from '../lib/ownerToken';
import PageHeader from '../components/PageHeader';
import StickyBottomBar from '../components/StickyBottomBar';
import CodeInputField from '../components/verify/CodeInputField';
import LockedScreen from '../components/verify/LockedScreen';

type PageState =
  | { type: 'idle' }
  | { type: 'submitting' }
  | { type: 'mismatch'; remainingAttempts: number }
  | { type: 'locked'; lockedUntil: string };

export default function TransferPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [state, setState] = useState<PageState>({ type: 'idle' });

  async function submit(codeToSubmit: string) {
    if (state.type === 'submitting' || codeToSubmit.length !== 12) return;

    setState({ type: 'submitting' });

    try {
      const res = await postTransferOwnership(tagCode!, { code: codeToSubmit });
      setToken(tagCode!, res.token);
      navigate(`/t/${tagCode}/home`, { replace: true });
    } catch (err) {
      if (!(err instanceof ApiError)) {
        setState({ type: 'idle' });
        return;
      }
      switch (err.code) {
        case 'CODE_MISMATCH':
          setCode('');
          setState({ type: 'mismatch', remainingAttempts: err.payload.remainingAttempts ?? 0 });
          break;
        case 'CODE_LOCKED':
          setState({ type: 'locked', lockedUntil: err.payload.lockedUntil! });
          break;
        case 'TAG_NOT_FOUND':
          navigate(`/t/${tagCode}`, { replace: true });
          break;
        default:
          setState({ type: 'idle' });
      }
    }
  }

  if (state.type === 'locked') {
    return <LockedScreen lockedUntil={state.lockedUntil} tagCode={tagCode!} />;
  }

  const isSubmitting = state.type === 'submitting';
  const isMismatch = state.type === 'mismatch';
  const canSubmit = code.length === 12 && !isSubmitting;

  return (
    <div
      className="min-h-dvh"
      style={{ backgroundColor: 'var(--color-tint)' }}
    >
      <PageHeader title="소유권 이전" onBack={() => navigate(-1)} />

      <div
        className="flex flex-col gap-8 px-2"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 68px)',
          paddingBottom: 'calc(max(16px, env(safe-area-inset-bottom)) + 120px)',
        }}
      >
        <div className="flex flex-col gap-2" style={{ width: 285 }}>
          <h1 className="m-0 text-2xl font-normal text-[var(--color-fg)]">양도 코드 입력</h1>
          <p className="m-0 text-xs text-[var(--color-muted)] leading-relaxed tracking-[0.04em]">
            판매자에게 전달받은 양도 코드 12자리를 입력하세요.{'\n'}
            이전이 완료되면 기존 소유자의 권한은 즉시 해제됩니다.{'\n'}
            5회 실패 시 24시간 동안 입력이 제한됩니다.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <CodeInputField
            value={code}
            onChange={(v) => {
              if (isMismatch) setState({ type: 'idle' });
              setCode(v);
            }}
            onComplete={submit}
            disabled={isSubmitting}
            hasError={isMismatch}
          />

          {isMismatch && (
            <p className="m-0 text-xs text-[var(--color-danger)] leading-[1.4em] tracking-[0.04em] whitespace-pre-line">
              {`코드가 일치하지 않습니다. 다시 입력해주세요.\n남은 시도 ${state.remainingAttempts}회`}
            </p>
          )}
        </div>
      </div>

      <StickyBottomBar>
        <button
          onClick={() => submit(code)}
          disabled={!canSubmit}
          className={[
            'w-full h-11 rounded-full text-sm border-none transition-colors',
            canSubmit
              ? 'bg-[var(--color-accent)] text-[var(--color-bg)] cursor-pointer'
              : 'bg-[var(--color-icon-inactive)] text-[var(--color-bg)] cursor-not-allowed',
          ].join(' ')}
        >
          {isSubmitting ? '확인 중...' : '소유권 이전받기'}
        </button>
      </StickyBottomBar>
    </div>
  );
}
