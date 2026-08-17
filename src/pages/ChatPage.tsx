import { useEffect, useRef, useState } from 'react';
import { useOutletContext, useParams } from 'react-router';
import type { ChatCredits, ChatMessage, ChatPresetType, OwnerMeResponse } from '../types/api';
import { fetchChatHistory } from '../api/tags';
import { streamChat } from '../api/streaming';
import { getToken } from '../lib/ownerToken';
import { useToast } from '../lib/toast';
import PageHeader from '../components/PageHeader';
import BottomTabBar from '../components/BottomTabBar';

type LocalMessage = ChatMessage & { aborted?: boolean };

const PRESETS: { type: ChatPresetType; label: string; text: string }[] = [
  { type: 'care',     label: '케어',    text: '이 제품을 관리하는 방법을 알려주세요.' },
  { type: 'style',    label: '스타일',  text: '이 제품을 어떻게 스타일링하면 좋을까요?' },
  { type: 'heritage', label: '헤리티지', text: '이 제품에 담긴 이야기가 궁금해요.' },
];

export default function ChatPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const data = useOutletContext<OwnerMeResponse>();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [credits, setCredits] = useState<ChatCredits>({ remaining: 10, limit: 30 });
  const [isStreaming, setIsStreaming] = useState(false);
  const [activePreset, setActivePreset] = useState<ChatPresetType | null>(null);
  const [inputText, setInputText] = useState('');
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // BottomTabBar 높이: paddingTop(16) + tabbar(~55) + paddingBottom(16) ≈ 87px
  const TAB_BAR_HEIGHT = 87;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isNearBottomRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // body1 (14px * 1.4em) * 4줄 + py-3(24px) = 102.4px
  const TEXTAREA_MAX_HEIGHT = 104;

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

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    function onResize() {
      setKeyboardOffset(Math.max(0, window.innerHeight - vv!.height - vv!.offsetTop));
    }
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isNearBottomRef.current) return;
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    });
  }, [messages]);

  // 텍스트 지워지면 textarea 높이 초기화
  useEffect(() => {
    if (!inputText && textareaRef.current) {
      textareaRef.current.style.height = '';
    }
  }, [inputText]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
  }

  function handleStop() {
    abortControllerRef.current?.abort();
  }

  function chargeCredit() {
    const newRemaining = Math.max(0, credits.remaining - 1);
    setCredits((prev) => ({ ...prev, remaining: newRemaining }));
    if (newRemaining === 0) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant' as const, content: '오늘 나눌 수 있는 대화는 여기까지입니다.', createdAt: new Date().toISOString() },
      ]);
    }
  }

  async function handleSend(text: string, preset?: ChatPresetType) {
    if (!text.trim() || isStreaming || credits.remaining === 0) return;

    const token = getToken(tagCode!) ?? '';
    const now = new Date().toISOString();
    const userMsg: LocalMessage = { role: 'user', content: text, createdAt: now };
    const assistantMsg: LocalMessage = { role: 'assistant', content: '', createdAt: now };

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
      chargeCredit();
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], aborted: true };
          return updated;
        });
        chargeCredit();
      } else {
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

  const keyboardOpen = keyboardOffset > 0;
  const productName = data?.product?.name ?? '';

  return (
    <div
      className="flex flex-col"
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--color-tint)',
        height: `calc(100dvh - ${keyboardOffset}px)`,
      }}
    >
      <PageHeader title="챗" />

      {/* 메시지 스크롤 영역 */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-2 px-2"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 56px)',
          paddingBottom: keyboardOpen ? 180 : 200,
        }}
      >
        {isLoading ? (
          <>
            <SkeletonBubble side="left" />
            <SkeletonBubble side="right" />
            <SkeletonBubble side="left" />
          </>
        ) : (
          <>
            {/* 웰컴 메시지 - 항상 첫 번째로 표시 */}
            <MessageBubble
              message={{
                role: 'assistant',
                content: `안녕하세요, 당신의 MCM AI 어시스턴트입니다.\n${productName}에 대해 궁금한 점이 있다면 무엇이든 물어보세요.`,
                createdAt: '',
              }}
            />
            {messages
              .filter((msg, i, arr) => {
                if (msg.role === 'user') {
                  const next = arr[i + 1];
                  const hasResponse = next?.role === 'assistant' && !!next.content.trim();
                  if (!hasResponse) {
                    return isStreaming && i === arr.length - 2;
                  }
                }
                if (msg.role === 'assistant' && !msg.content.trim()) {
                  return isStreaming && i === arr.length - 1;
                }
                return true;
              })
              .map((msg, i) => (
                <MessageBubble
                  key={i}
                  message={msg}
                  aborted={msg.aborted}
                  isStreaming={isStreaming && msg === messages[messages.length - 1] && msg.role === 'assistant'}
                />
              ))}
          </>
        )}
      </div>

      {/* 입력 고정 영역 (탭바 제외) */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-20 flex flex-col gap-4 px-2"
        style={{
          background: 'linear-gradient(180deg, rgba(240,240,240,0) 0%, rgba(240,240,240,1) 100%)',
          backdropFilter: 'blur(1.5px)',
          WebkitBackdropFilter: 'blur(1.5px)',
          paddingTop: 36,
          paddingBottom: keyboardOpen
            ? 'max(8px, env(safe-area-inset-bottom))'
            : TAB_BAR_HEIGHT,
        }}
      >
        {/* 크레딧 안내 */}
        {!isLoading && credits.remaining <= 2 && (
          <p className="m-0 text-xs text-[var(--color-muted)]">
            오늘 남은 대화: {credits.remaining}회
            {credits.resetAt && ` · ${formatResetIn(credits.resetAt)}`}
          </p>
        )}

        {/* 프리셋 칩 */}
        <div className="flex gap-1">
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
                  'flex-1 py-1.5 px-[10px] rounded-full text-sm border-none transition-colors',
                  'shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)]',
                  isActive
                    ? 'bg-[var(--color-accent)] text-[var(--color-bg)] cursor-pointer'
                    : isDisabled
                    ? 'text-white cursor-not-allowed opacity-50'
                    : 'text-white cursor-pointer',
                ].join(' ')}
                style={!isActive ? { backgroundColor: '#BFBFBF' } : {}}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* 입력창 + 전송/중단 */}
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              const el = e.target;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend(inputText);
              }
            }}
            disabled={isStreaming || credits.remaining === 0}
            rows={1}
            placeholder={credits.remaining === 0 ? '오늘 대화 한도에 도달했습니다.' : '무엇이든 물어보세요.'}
            className={[
              'flex-1 resize-none rounded-[24px] px-2 py-3 text-sm leading-[1.4em] tracking-[0.04em] border-none outline-none',
              'bg-[var(--color-bg)] text-[var(--color-fg)] placeholder:text-[var(--color-muted)]',
              'shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)]',
              'overflow-y-auto no-scrollbar transition-opacity',
              (isStreaming || credits.remaining === 0) ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
          />
          {isStreaming ? (
            <button
              onClick={handleStop}
              className="shrink-0 w-11 h-11 rounded-full text-white flex items-center justify-center cursor-pointer border-none shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)]"
              style={{ backgroundColor: '#2D2D2D' }}
              aria-label="중단"
            >
              <span className="block w-3 h-3 rounded-sm bg-current" />
            </button>
          ) : (
            <button
              onClick={() => handleSend(inputText)}
              disabled={!inputText.trim() || credits.remaining === 0}
              className={[
                'shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-colors border-none',
                'shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)]',
                inputText.trim() && credits.remaining > 0
                  ? 'cursor-pointer text-white'
                  : 'cursor-not-allowed text-white',
              ].join(' ')}
              style={{ backgroundColor: inputText.trim() && credits.remaining > 0 ? '#2D2D2D' : '#BFBFBF' }}
              aria-label="전송"
            >
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true">
                <path d="M1 11L6 6L1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 탭바 - 홈/소유권과 동일한 컴포넌트, 키보드 열릴 때 숨김 */}
      {!keyboardOpen && <BottomTabBar tagCode={tagCode!} />}
    </div>
  );
}

export function MessageBubble({
  message,
  aborted,
  isStreaming,
}: {
  message: ChatMessage;
  aborted?: boolean;
  isStreaming?: boolean;
}) {
  const isUser = message.role === 'user';
  return (
    <div className="flex flex-col gap-0.5">
      {isUser ? (
        <div className="w-full p-2 rounded-lg" style={{ backgroundColor: '#2D2D2D' }}>
          <p className="m-0 text-sm text-white leading-[1.4em] tracking-[0.04em] whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      ) : (
        <div className="w-full p-2 rounded-lg bg-[var(--color-bg)] flex flex-col gap-0.5">
          <p className="m-0 text-xs text-[var(--color-muted)] leading-[1.4em] tracking-[0.04em]">
            Meins Collection Manager
          </p>
          <p
            className="m-0 text-sm leading-[1.4em] tracking-[0.04em] whitespace-pre-wrap"
            style={{ color: '#111111' }}
          >
            {message.content || (isStreaming ? '답변을 생성하고 있습니다...' : '')}
          </p>
        </div>
      )}
      {aborted && (
        <span className="text-[10px] text-[var(--color-muted)] px-1">중단됨</span>
      )}
    </div>
  );
}

function formatResetIn(resetAt: string): string {
  const diff = new Date(resetAt).getTime() - Date.now();
  if (diff <= 0) return '곧 회복됩니다';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `${h}시간 ${m}분 후 회복`;
  return `${m}분 후 회복`;
}

function SkeletonBubble({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className={`${side === 'right' ? 'w-2/5' : 'w-3/5'} h-10 rounded-lg shimmer`} />
    </div>
  );
}
