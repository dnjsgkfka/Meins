import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/client';
import { clearToken } from './ownerToken';
import { useToast } from './toast';

export function useOwnerRedirectOnInvalid() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  return useCallback(
    (err: unknown): boolean => {
      if (
        err instanceof ApiError &&
        (err.code === 'TOKEN_INVALID' || err.code === 'TAG_NOT_FOUND')
      ) {
        clearToken(tagCode!);
        showToast('소유권이 이전되었습니다.');
        navigate(`/t/${tagCode}`, { replace: true });
        return true;
      }
      return false;
    },
    [tagCode, navigate, showToast],
  );
}
