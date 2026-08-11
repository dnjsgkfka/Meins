import { useEffect, useRef, useState } from 'react';
import { useOutletContext, useParams } from 'react-router';
import type { ChatCredits, ChatMessage, ChatPresetType, OwnerMeResponse } from '../types/api';
import { fetchChatHistory } from '../api/tags';
import { streamChat } from '../api/streaming';
import { getToken } from '../lib/ownerToken';
import { useToast } from '../lib/toast';
import BottomTabBar from '../components/BottomTabBar';

type LocalMessage = ChatMessage & { aborted?: boolean };

const PRESETS: { type: ChatPresetType; label: string; text: string }[] = [
  { type: 'care',     label: '케어',    text: '이 제품을 관리하는 방법을 알려주세요.' },
  { type: 'style',    label: '스타일',  text: '이 제품을 어떻게 스타일링하면 좋을까요?' },
  { type: 'heritage', label: '헤리티지', text: '이 제품에 담긴 이야기가 궁금해요.' },
];

export default function ChatPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  useOutletContext<OwnerMeResponse>();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [credits, setCredits] = useState<ChatCredits>({ remaining: 10, limit: 30 });
  const [isStreaming, setIsStreaming] = useState(false);
  const [activePreset, setActivePreset] = useState<ChatPresetType | null>(null);
  const [inputText, setInputText] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  function handleStop() {
    abortControllerRef.current?.abort();
  }

  async function handleSend(text: string, preset?: ChatPresetType) {
    if (!text.trim() || isStreaming || credits.remaining === 0) return;

    const token = getToken(tagCode!) ?? '';
    const now = new Date().toISOString();
    const userMsg: LocalMessage = { role: 'user', content: text, createdAt: now };
    const assistantMsg: LocalMessage = { role: 'assistant', content: '', createdAt: now };

    // 사용자 버블 + 빈 어시스턴트 버블 즉시 추가
    const prevMessages = messages;
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInputText('');
    setIsStreaming(true);
    isNearBottomRef.current = true;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const body = preset ? { preset } : { message: text };
      for await (const chunk of streamChat(tagCode!, token, body, controller.signal)) {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, content: last.content + chunk };
          return updated;
        });
      }
      // 정상 완료 — 크레딧 차감
      setCredits((prev) => ({ ...prev, remaining: Math.max(0, prev.remaining - 1) }));
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // 중단 — 버블 유지, "중단됨" 표시, 크레딧 차감
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], aborted: true };
          return updated;
        });
        setCredits((prev) => ({ ...prev, remaining: Math.max(0, prev.remaining - 1) }));
      } else {
        // 네트워크 실패 — 버블 제거, 입력 복원, 크레딧 미차감
        showToast('메시지 전송에 실패했습니다.');
        setMessages(prevMessages);
        if (!preset) setInputText(text);
      }
    } finally {
      setIsStreaming(false);
      setActivePreset(null);
      abortControllerRef.current = null;
    }
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
          messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} aborted={msg.aborted} />
          ))
        )}
      </div>

      {/* 하단 — 프리셋 칩 + 입력창 */}
      <div className="shrink-0 border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom)]">
        {/* 잔여 크레딧 안내 (item 7에서 확장) */}
        {!isLoading && credits.remaining <= 2 && (
          <p className="m-0 px-4 pt-3 text-xs text-[var(--color-muted)]">
            오늘 남은 대화: {credits.remaining}회
          </p>
        )}

        {/* 프리셋 칩 */}
        <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto">
          {PRESETS.map((preset) => {
            const isActive = isStreaming && activePreset === preset.type;
            const isDisabled = credits.remaining === 0 || (isStreaming && activePreset !== preset.type);
            return (
              <button
                key={preset.type}
                disabled={isDisabled}
                onClick={() => {
                  setActivePreset(preset.type);
                  handleSend(preset.text, preset.type);
                }}
                className={[
                  'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  isActive
                    ? 'bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-accent)]'
                    : isDisabled
                    ? 'border-[var(--color-border)] text-[var(--color-muted)] opacity-40 cursor-not-allowed'
                    : 'border-[var(--color-border)] text-[var(--color-fg)] cursor-pointer',
                ].join(' ')}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* 입력창 + 전송/중단 버튼 */}
        <div className="flex items-end gap-2 px-4 py-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend(inputText);
              }
            }}
            disabled={isStreaming || credits.remaining === 0}
            rows={1}
            placeholder={credits.remaining === 0 ? '오늘 대화 한도에 도달했습니다.' : '메시지를 입력하세요...'}
            className={[
              'flex-1 resize-none rounded-2xl border px-4 py-2.5 text-sm leading-relaxed',
              'bg-[var(--color-bg)] text-[var(--color-fg)] placeholder:text-[var(--color-muted)]',
              'border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]',
              'transition-colors max-h-32 overflow-y-auto',
              (isStreaming || credits.remaining === 0) ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
          />
          {isStreaming ? (
            <button
              onClick={handleStop}
              className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-accent)] text-[var(--color-bg)] flex items-center justify-center cursor-pointer"
              aria-label="중단"
            >
              <span className="block w-3 h-3 rounded-sm bg-current" />
            </button>
          ) : (
            <button
              onClick={() => handleSend(inputText)}
              disabled={!inputText.trim() || credits.remaining === 0}
              className={[
                'shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                inputText.trim() && credits.remaining > 0
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg)] cursor-pointer'
                  : 'bg-[var(--color-border)] text-[var(--color-muted)] cursor-not-allowed',
              ].join(' ')}
              aria-label="전송"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 14V2M2 8l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
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
