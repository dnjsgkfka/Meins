import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router';
import type { ChatCredits, ChatMessage, OwnerMeResponse } from '../types/api';
import { fetchChatHistory } from '../api/tags';
import { getToken } from '../lib/ownerToken';
import { useToast } from '../lib/toast';
import BottomTabBar from '../components/BottomTabBar';

type LoadState =
  | { type: 'loading' }
  | { type: 'loaded'; messages: ChatMessage[]; credits: ChatCredits };

export default function ChatPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  useOutletContext<OwnerMeResponse>();
  const { showToast } = useToast();
  const [state, setState] = useState<LoadState>({ type: 'loading' });

  useEffect(() => {
    if (!tagCode) return;
    const token = getToken(tagCode) ?? '';
    let cancelled = false;

    fetchChatHistory(tagCode, token)
      .then((res) => {
        if (!cancelled) setState({ type: 'loaded', messages: res.messages, credits: res.credits });
      })
      .catch(() => {
        if (!cancelled) {
          showToast('대화 내역을 불러올 수 없습니다.');
          setState({ type: 'loaded', messages: [], credits: { remaining: 0, limit: 30 } });
        }
      });

    return () => { cancelled = true; };
  }, [tagCode, showToast]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-[var(--color-border)] shrink-0">
        <p className="m-0 text-xs text-[var(--color-muted)] tracking-widest uppercase">{tagCode}</p>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-6 flex flex-col gap-3">
        {state.type === 'loading' ? (
          <>
            <SkeletonBubble side="left" width="w-3/5" />
            <SkeletonBubble side="right" width="w-2/5" />
            <SkeletonBubble side="left" width="w-4/5" />
          </>
        ) : (
          state.messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))
        )}
      </div>

      {/* 하단 — 입력창/칩 (추후 구현 예정) */}
      <div className="shrink-0 border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom)]">
        <div className="h-16" />
      </div>

      <BottomTabBar tagCode={tagCode!} />
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-[var(--color-accent)] text-[var(--color-bg)] rounded-br-sm'
            : 'bg-[var(--color-border)] text-[var(--color-fg)] rounded-bl-sm',
        ].join(' ')}
      >
        {message.content}
      </div>
    </div>
  );
}

function SkeletonBubble({ side, width }: { side: 'left' | 'right'; width: string }) {
  return (
    <div className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className={`${width} h-10 rounded-2xl shimmer`} />
    </div>
  );
}
