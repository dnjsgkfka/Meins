import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/client';
import { fetchOwnerMe } from '../api/tags';
import { clearToken, getToken } from '../lib/ownerToken';
import { useToast } from '../lib/toast';
import type { OwnerMeResponse } from '../types/api';
import LoadingSpinner from './LoadingSpinner';

export default function RequireOwner() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [data, setData] = useState<OwnerMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tagCode) return;

    const token = getToken(tagCode);
    if (!token) {
      navigate(`/t/${tagCode}`, { replace: true });
      return;
    }

    let cancelled = false;

    async function verify(showNetworkError = true) {
      try {
        const result = await fetchOwnerMe(tagCode!, token!);
        if (!cancelled) setData(result);
      } catch (err) {
        if (cancelled) return;
        if (
          err instanceof ApiError &&
          (err.code === 'TOKEN_INVALID' || err.code === 'TAG_NOT_FOUND')
        ) {
          clearToken(tagCode!);
          navigate(`/t/${tagCode}`, { replace: true });
        } else if (showNetworkError) {
          showToast('네트워크 연결을 확인해 주세요.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    verify();

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') verify(false);
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [tagCode, navigate, showToast]);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  return <Outlet context={data} />;
}
