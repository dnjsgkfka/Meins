import { useRef, useState } from 'react';

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

  const activeBlock = value.length >= 12 ? -1 : Math.floor(value.length / 4);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const filtered = filterString(e.target.value).slice(0, 12);
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

      {/* 표시용 블록 3개 */}
      <div className="flex gap-1 pointer-events-none">
        {[0, 1, 2].map((blockIdx) => {
          const chars = value.slice(blockIdx * 4, blockIdx * 4 + 4);
          const isActive = focused && activeBlock === blockIdx && !disabled;
          const isFilled = chars.length > 0;

          const bgClass = hasError
            ? 'bg-[var(--color-bg)] border border-[var(--color-danger)]'
            : isActive || isFilled
            ? 'bg-[var(--color-bg)]'
            : 'bg-[var(--color-icon-inactive)]';

          return (
            <div
              key={blockIdx}
              className={[
                'flex-1 h-12 flex items-center justify-center rounded transition-colors',
                bgClass,
                disabled ? 'opacity-40' : '',
              ].join(' ')}
            >
              <span className="text-2xl" style={{ letterSpacing: '0.2em' }}>
                {Array.from({ length: 4 }, (_, charIdx) => {
                  const char = chars[charIdx];
                  return (
                    <span
                      key={charIdx}
                      style={{ color: char ? 'var(--color-fg)' : 'var(--color-muted)' }}
                    >
                      {char || '0'}
                    </span>
                  );
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
