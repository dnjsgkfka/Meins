import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/client';
import { fetchOwnerMe, fetchTagDetail } from '../api/tags';
import { isValidTagCode } from '../lib/tagCode';
import { clearToken, getToken } from '../lib/ownerToken';
import { useMinDelay } from '../lib/useMinDelay';
import type { TagDetailResponse } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';
import TagNotFoundScreen from '../components/error/TagNotFoundScreen';
import NetworkErrorScreen from '../components/error/NetworkErrorScreen';
import GuestViewPage from './GuestViewPage';

type PageState =
  | { type: 'loading' }
  | { type: 'guest'; data: TagDetailResponse }
  | { type: 'not_found' }
  | { type: 'network_error' };

export default function TagEntryPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<PageState>({ type: 'loading' });
  const [retryKey, setRetryKey] = useState(0);
  const showLoading = useMinDelay(state.type === 'loading');

  useEffect(() => {
    if (!tagCode || !isValidTagCode(tagCode)) {
      setState({ type: 'not_found' });
      return;
    }

    setState({ type: 'loading' });
    let cancelled = false;

    async function run() {
      const token = getToken(tagCode!);

      if (token) {
        try {
          await fetchOwnerMe(tagCode!, token);
          if (!cancelled) navigate(`/t/${tagCode}/home`, { replace: true });
          return;
        } catch (err) {
          if (cancelled) return;
          if (
            err instanceof ApiError &&
            (err.code === 'TOKEN_INVALID' || err.code === 'TAG_NOT_FOUND')
          ) {
            clearToken(tagCode!);
          }
          // 그 외 에러(네트워크 등)는 무시하고 태그 조회로 계속 진행
        }
      }

      if (cancelled) return;

      try {
        const data = await fetchTagDetail(tagCode!);
        if (!cancelled) setState({ type: 'guest', data });
      } catch (err) {
        if (cancelled) return;
        if (
          err instanceof ApiError &&
          (err.code === 'TAG_NOT_FOUND' || err.code === 'TAG_INVALID_FORMAT')
        ) {
          setState({ type: 'not_found' });
        } else {
          setState({ type: 'network_error' });
        }
      }
    }

    run();
    return () => { cancelled = true; };
  }, [tagCode, navigate, retryKey]);

  if (showLoading) return <LoadingSpinner tagCode={tagCode} />;

  switch (state.type) {
    case 'loading':
      return <LoadingSpinner tagCode={tagCode} />;
    case 'not_found':
      return (
        <TagNotFoundScreen
          onRetry={() => {
            setState({ type: 'loading' });
            setRetryKey((k) => k + 1);
          }}
        />
      );
    case 'network_error':
      return (
        <NetworkErrorScreen
          onRetry={() => {
            setState({ type: 'loading' });
            setRetryKey((k) => k + 1);
          }}
        />
      );
    case 'guest':
      return <GuestViewPage tagCode={tagCode!} data={state.data} />;
  }
}
