import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/client';
import { fetchOwnerMe } from '../api/tags';
import { clearToken, getToken } from '../lib/ownerToken';
import type { OwnerMeResponse } from '../types/api';
import LoadingSpinner from './LoadingSpinner';

export default function RequireOwner() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const navigate = useNavigate();
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

    async function verify() {
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
        }
        // 네트워크 실패: 화면 유지 + 토스트 (Stage 2 item 6에서 연결 예정)
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [tagCode, navigate]);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  return <Outlet context={data} />;
}
