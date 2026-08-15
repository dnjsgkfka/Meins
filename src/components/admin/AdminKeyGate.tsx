import { useState } from 'react';
import { getAdminKey, setAdminKey } from '../../lib/adminKey';

interface Props {
  children: React.ReactNode;
}

export default function AdminKeyGate({ children }: Props) {
  const [hasKey, setHasKey] = useState(() => !!getAdminKey());
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  // 401로 clearAdminKey()가 호출되면 다시 폼으로 돌아오도록 외부에서 호출
  if (!hasKey) {
    function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) {
        setError('관리자 키를 입력해주세요.');
        return;
      }
      setAdminKey(trimmed);
      setError('');
      setInput('');
      setHasKey(true);
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
          <button
            type="submit"
            className="h-11 rounded-full text-sm bg-[var(--color-accent)] text-[var(--color-bg)] border-none cursor-pointer"
          >
            확인
          </button>
        </form>
      </div>
    );
  }

  return (
    <AdminKeyContext.Provider value={{ resetKey: () => setHasKey(false) }}>
      {children}
    </AdminKeyContext.Provider>
  );
}

import { createContext, useContext } from 'react';

interface AdminKeyContextValue {
  resetKey: () => void;
}

const AdminKeyContext = createContext<AdminKeyContextValue>({ resetKey: () => {} });

export function useAdminKeyReset() {
  return useContext(AdminKeyContext).resetKey;
}
