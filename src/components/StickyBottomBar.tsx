interface Props {
  children: React.ReactNode;
}

export default function StickyBottomBar({ children }: Props) {
  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-20 flex flex-col items-stretch gap-2 px-2"
      style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, var(--color-tint) 40%)',
        backdropFilter: 'blur(1.5px)',
        WebkitBackdropFilter: 'blur(1.5px)',
        paddingTop: 16,
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      }}
    >
      {children}
    </div>
  );
}
