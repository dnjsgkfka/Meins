interface Props {
  registered: boolean;
  registeredAt: string | null;
}

export default function StatusCard({ registered, registeredAt }: Props) {
  if (!registered) {
    return (
      <div className="p-4 bg-[var(--color-border)] rounded-lg">
        <p className="m-0 font-medium text-[var(--color-fg)]">아직 등록된 소유자 없음</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[var(--color-border)] rounded-lg">
      <p className="m-0 mb-1 font-medium text-[var(--color-fg)]">
        등록된 제품{registeredAt ? ` / ${registeredAt} 등록` : ''}
      </p>
      <p className="m-0 text-xs text-[var(--color-muted)]">
        소유자 정보는 공개되지 않습니다
      </p>
    </div>
  );
}
