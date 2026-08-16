import { useState, useEffect, createContext, useContext } from 'react';
import { getAdminKey, setAdminKey, clearAdminKey } from '../../lib/adminKey';
import { listAdminTags, AdminApiError } from '../../api/admin';

interface Props {
  children: React.ReactNode;
}

type Status = 'validating' | 'authed' | 'unauthed' | 'network_error';

export default function AdminKeyGate({ children }: Props) {
  const [status, setStatus] = useState<Status>(() =>
    getAdminKey() ? 'validating' : 'unauthed'
  );
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status !== 'validating') return;
    listAdminTags()
      .then(() => setStatus('authed'))
      .catch((err) => {
        if (err instanceof AdminApiError && err.status === 401) {
          clearAdminKey();
          setStatus('unauthed');
        } else if (err instanceof AdminApiError) {
          // 백엔드 5xx — 키는 맞을 수 있으므로 통과
          setStatus('authed');
        } else {
          // 네트워크 오류 — 재시도
          setStatus('network_error');
        }
      });
  }, [status]);

  if (status === 'network_error') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: 'var(--color-tint)' }}>
        <p className="m-0 text-sm text-[var(--color-muted)]">연결 오류가 발생했습니다.</p>
        <button
          onClick={() => setStatus('validating')}
          className="h-11 px-6 rounded-full text-sm bg-[var(--color-accent)] text-[var(--color-bg)] border-none cursor-pointer"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (status === 'validating') {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ backgroundColor: 'var(--color-tint)' }}>
        <span className="text-sm text-[var(--color-muted)]">확인 중...</span>
      </div>
    );
  }

  if (status === 'unauthed') {
    function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) { setError('관리자 키를 입력해주세요.'); return; }
      setAdminKey(trimmed);
      setError('');
      setInput('');
      setStatus('validating');
    }

    return (
      <div className="min-h-dvh flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-tint)' }}>
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
          <h1 className="m-0 text-xl font-normal text-[var(--color-fg)]">관리자 인증</h1>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="관리자 키 입력"
            autoComplete="off"
            className="w-full h-11 px-3 rounded-lg border border-[var(--color-icon-inactive)] bg-[var(--color-bg)] text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-accent)]"
          />
          {error && <p className="m-0 text-xs text-[var(--color-danger)]">{error}</p>}
          <button type="submit" className="h-11 rounded-full text-sm bg-[var(--color-accent)] text-[var(--color-bg)] border-none cursor-pointer">
            확인
          </button>
        </form>
      </div>
    );
  }

  return (
    <AdminKeyContext.Provider value={{ resetKey: () => { clearAdminKey(); setStatus('unauthed'); } }}>
      {children}
    </AdminKeyContext.Provider>
  );
}

interface AdminKeyContextValue {
  resetKey: () => void;
}

const AdminKeyContext = createContext<AdminKeyContextValue>({ resetKey: () => {} });

export function useAdminKeyReset() {
  return useContext(AdminKeyContext).resetKey;
}
