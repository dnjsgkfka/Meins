import { useEffect, useRef, useState } from 'react';
import { useOutletContext, useParams } from 'react-router';
import type { ChatCredits, ChatMessage, OwnerMeResponse } from '../types/api';
import { fetchChatHistory } from '../api/tags';
import { getToken } from '../lib/ownerToken';
import { useToast } from '../lib/toast';
import BottomTabBar from '../components/BottomTabBar';

export default function ChatPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  useOutletContext<OwnerMeResponse>();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [credits, setCredits] = useState<ChatCredits>({ remaining: 10, limit: 30 });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  useEffect(() => {
    if (!tagCode) return;
    const token = getToken(tagCode) ?? '';
    let cancelled = false;

    fetchChatHistory(tagCode, token)
      .then((res) => {
        if (!cancelled) {
          setMessages(res.messages);
          setCredits(res.credits);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          showToast('대화 내역을 불러올 수 없습니다.');
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [tagCode, showToast]);

  // 메시지 변경 시 바닥 근처 자동 스크롤
  useEffect(() => {
    if (isNearBottomRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-[var(--color-border)] shrink-0">
        <p className="m-0 text-xs text-[var(--color-muted)] tracking-widest uppercase">{tagCode}</p>
      </div>

      {/* 메시지 영역 */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 pb-6 flex flex-col gap-3"
      >
        {isLoading ? (
          <>
            <SkeletonBubble side="left" width="w-3/5" />
            <SkeletonBubble side="right" width="w-2/5" />
            <SkeletonBubble side="left" width="w-4/5" />
          </>
        ) : (
          messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
        )}
      </div>

      {/* 하단 — 입력창/칩 (추후 구현 예정) */}
      <div className="shrink-0 border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom)]">
        {/* 잔여 크레딧 안내 (item 7에서 확장) */}
        {!isLoading && credits.remaining <= 2 && (
          <p className="m-0 px-4 pt-3 text-xs text-[var(--color-muted)]">
            오늘 남은 대화: {credits.remaining}회
          </p>
        )}
        <div className="h-16" />
      </div>

      <BottomTabBar tagCode={tagCode!} />
    </div>
  );
}

export function MessageBubble({
  message,
  aborted,
}: {
  message: ChatMessage;
  aborted?: boolean;
}) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
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
      {aborted && (
        <span className="text-[10px] text-[var(--color-muted)] px-1">중단됨</span>
      )}
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
