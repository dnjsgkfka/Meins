import { useRef, useState } from 'react';

// 0, O, 1, I 제외한 허용 문자
const ALLOWED = /^[A-HJ-NP-Z2-9]$/;

function filterString(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/-/g, '')
    .split('')
    .filter((ch) => ALLOWED.test(ch))
    .join('');
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onComplete: (code: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export default function CodeInputField({
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  // 입력값 길이로 활성 블록 인덱스 결정 (0-3: 첫 블록, 4-7: 둘째, 8-11: 셋째)
  const activeBlock = value.length >= 12 ? -1 : Math.floor(value.length / 4);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const filtered = filterString(e.target.value).slice(0, 12);
    // 브라우저 input value 직접 보정 (IME 등 우회)
    e.target.value = filtered;
    onChange(filtered);
    if (filtered.length === 12) onComplete(filtered);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const filtered = filterString(e.clipboardData.getData('text')).slice(0, 12);
    onChange(filtered);
    if (filtered.length === 12) onComplete(filtered);
  }

  return (
    <div
      className="relative select-none"
      onClick={() => !disabled && inputRef.current?.focus()}
    >
      {/* 실제 입력 input */}
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        maxLength={12}
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        aria-label="인증 코드 입력"
        className="absolute opacity-0 w-full h-full top-0 left-0 cursor-default"
        style={{ caretColor: 'transparent' }}
      />

      {/* 표시용 박스 */}
      <div className="flex gap-3 pointer-events-none">
        {[0, 1, 2].map((blockIdx) => {
          const chars = value.slice(blockIdx * 4, blockIdx * 4 + 4);
          const isActive = focused && activeBlock === blockIdx && !disabled;

          return (
            <div
              key={blockIdx}
              className={[
                'flex-1 h-14 flex items-center justify-center rounded-lg border-2 transition-colors',
                hasError
                  ? 'border-[var(--color-danger)] bg-[var(--color-danger)]/10'
                  : isActive
                  ? 'border-[var(--color-accent)]'
                  : 'border-[var(--color-border)]',
                disabled ? 'opacity-40' : '',
              ].join(' ')}
            >
              {chars ? (
                <span className="text-base font-mono font-semibold tracking-[0.3em] text-[var(--color-fg)]">
                  {chars}
                </span>
              ) : (
                <span className="text-lg font-mono text-[var(--color-muted)] tracking-[0.4em]">
                  ····
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
