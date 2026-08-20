import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/client';
import { setToken } from './ownerToken';
import { useToast } from './toast';

type PageState =
  | { type: 'idle' }
  | { type: 'submitting' }
  | { type: 'mismatch'; remainingAttempts: number }
  | { type: 'locked'; lockedUntil: string };

type SubmitFn = (tagCode: string, code: string) => Promise<{ token: string }>;

interface Options {
  onAlreadyRegistered?: () => void;
}

export function useCodeSubmit(submitFn: SubmitFn, options: Options = {}) {
  const { tagCode } = useParams<{ tagCode: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [state, setState] = useState<PageState>({ type: 'idle' });

  async function submit(codeToSubmit: string) {
    if (state.type === 'submitting' || codeToSubmit.length !== 12) return;
    setState({ type: 'submitting' });

    try {
      const res = await submitFn(tagCode!, codeToSubmit);
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
          setState({ type: 'locked', lockedUntil: err.payload.lockedUntil ?? '' });
          break;
        case 'ALREADY_REGISTERED':
          showToast('소유권이 이미 등록된 제품입니다.');
          navigate(`/t/${tagCode}`, { replace: true });
          break;
        case 'TAG_NOT_FOUND':
          options.onAlreadyRegistered?.();
          navigate(`/t/${tagCode}`, { replace: true });
          break;
        default:
          setState({ type: 'idle' });
      }
    }
  }

  return { tagCode: tagCode!, code, setCode, state, setState, submit };
}
