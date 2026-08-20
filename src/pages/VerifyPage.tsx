import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/client';
import { postVerifyOwnership } from '../api/tags';
import { setToken } from '../lib/ownerToken';
import { useToast } from '../lib/toast';
import PageHeader from '../components/PageHeader';
import CodeInputField from '../components/verify/CodeInputField';
import LockedScreen from '../components/verify/LockedScreen';
import BottomSheet from '../components/BottomSheet';

type PageState =
  | { type: 'idle' }
  | { type: 'submitting' }
  | { type: 'mismatch'; remainingAttempts: number }
  | { type: 'locked'; lockedUntil: string };

export default function VerifyPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [state, setState] = useState<PageState>({ type: 'idle' });
  const [sheetOpen, setSheetOpen] = useState(false);

  async function submit(codeToSubmit: string) {
    if (state.type === 'submitting' || codeToSubmit.length !== 12) return;

    setState({ type: 'submitting' });

    try {
      const res = await postVerifyOwnership(tagCode!, { code: codeToSubmit });
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
        case 'ALREADY_REGISTERED':
          showToast('소유권이 이미 등록된 제품입니다.');
          navigate(`/t/${tagCode}`, { replace: true });
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
      <PageHeader title="소유자 등록" onBack={() => navigate(-1)} />

      {/* 스크롤 콘텐츠 */}
      <div
        className="flex flex-col gap-8 px-2"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 68px)',
          paddingBottom: 'calc(max(16px, env(safe-area-inset-bottom)) + 120px)',
        }}
      >
        {/* 제목 + 설명 */}
        <div className="flex flex-col gap-2" style={{ width: 285 }}>
          <h1 className="m-0 text-2xl font-normal text-[var(--color-fg)]">인증 코드 입력</h1>
          <p className="m-0 text-xs text-[var(--color-muted)] leading-relaxed tracking-[0.04em]">
            이메일로 발송된 코드 12자리를 입력하세요.{'\n'}
            등록을 마치면 바로 내 제품 화면으로 이동합니다.{'\n'}
            5회 실패 시 24시간 동안 입력이 제한됩니다.
          </p>
        </div>

        {/* 코드 입력 블록 */}
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

      {/* 하단 고정 영역 */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-20 flex flex-col items-stretch gap-2 px-2"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, var(--color-tint) 40%)',
          backdropFilter: 'blur(1.5px)',
          WebkitBackdropFilter: 'blur(1.5px)',
          paddingTop: 16,
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}
      >
        <button
          onClick={() => setSheetOpen(true)}
          className="text-left text-xs text-[var(--color-fg)] underline bg-transparent border-none cursor-pointer tracking-[0.04em]"
        >
          코드를 찾을 수 없나요?
        </button>
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
          {isSubmitting ? '확인 중...' : '소유자 등록하기'}
        </button>
      </div>

      {/* 코드 분실 바텀시트 */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="flex flex-col gap-4 px-4 pt-2 pb-6">
          <h2 className="m-0 text-base font-semibold text-[var(--color-fg)]">코드를 찾을 수 없나요?</h2>
          <p className="m-0 text-sm text-[var(--color-muted)] leading-relaxed">
            구매 시 등록한 이메일을 확인해 주세요.
          </p>
          <a
            href="#"
            className="flex items-center justify-center w-full h-11 rounded-full text-sm border border-[var(--color-border)] text-[var(--color-fg)] no-underline"
          >
            고객센터 문의하기
          </a>
        </div>
      </BottomSheet>
    </div>
  );
}
