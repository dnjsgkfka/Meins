import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/client';
import { postVerifyOwnership } from '../api/tags';
import { setToken } from '../lib/ownerToken';
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
        case 'TAG_NOT_FOUND':
          navigate(`/t/${tagCode}`, { replace: true });
          break;
        default:
          setState({ type: 'idle' });
      }
    }
  }

  if (state.type === 'locked') {
    return <LockedScreen lockedUntil={state.lockedUntil} />;
  }

  const isSubmitting = state.type === 'submitting';
  const isMismatch = state.type === 'mismatch';

  return (
    <div className="flex flex-col gap-6 px-4 pt-8 pb-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-2xl font-semibold text-[var(--color-fg)]">소유자 등록</h1>
        <p className="m-0 text-sm text-[var(--color-muted)] leading-relaxed">
          제품에 동봉된 인증 카드의 코드를 입력해 주세요.
        </p>
      </div>

      {/* 코드 입력 */}
      <div className="flex flex-col gap-3">
        <CodeInputField
          value={code}
          onChange={(v) => {
            // 오류 상태에서 다시 입력 시작하면 에러 클리어
            if (isMismatch) setState({ type: 'idle' });
            setCode(v);
          }}
          onComplete={submit}
          disabled={isSubmitting}
          hasError={isMismatch}
        />

        {/* 오류 메시지 — CODE_MISMATCH */}
        {isMismatch && (
          <div className="flex flex-col gap-1">
            <p className="m-0 text-sm text-[var(--color-danger)]">
              인증 코드가 올바르지 않습니다.
            </p>
            <p className="m-0 text-sm text-[var(--color-muted)]">
              남은 시도 {state.remainingAttempts}회
            </p>
          </div>
        )}
      </div>

      {/* "코드를 찾을 수 없나요?" 링크 */}
      <button
        onClick={() => setSheetOpen(true)}
        className="text-sm text-[var(--color-muted)] underline self-start bg-transparent border-none p-0 cursor-pointer"
      >
        코드를 찾을 수 없나요?
      </button>

      {/* 제출 버튼 */}
      <button
        onClick={() => submit(code)}
        disabled={code.length !== 12 || isSubmitting}
        className={[
          'w-full py-3.5 rounded-lg text-sm font-medium transition-colors',
          code.length === 12 && !isSubmitting
            ? 'bg-[var(--color-accent)] text-[var(--color-bg)] cursor-pointer'
            : 'bg-[var(--color-border)] text-[var(--color-muted)] cursor-not-allowed',
        ].join(' ')}
      >
        {isSubmitting ? '확인 중...' : '확인'}
      </button>

      {/* 코드 분실 안내 바텀시트 */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="flex flex-col gap-4 px-4 pt-2 pb-6">
          <h2 className="m-0 text-base font-semibold text-[var(--color-fg)]">코드를 찾을 수 없나요?</h2>
          <p className="m-0 text-sm text-[var(--color-muted)] leading-relaxed">
            구매 시 등록한 이메일을 확인해 주세요.
          </p>
          <a
            href="#"
            className="block w-full py-3.5 rounded-lg text-sm font-medium text-center border border-[var(--color-border)] text-[var(--color-fg)] no-underline"
          >
            고객센터 문의하기
          </a>
        </div>
      </BottomSheet>
    </div>
  );
}
