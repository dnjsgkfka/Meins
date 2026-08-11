interface Props {
  registered: boolean;
  registeredAt: string | null;
}

export default function StatusCard({ registered, registeredAt }: Props) {
  if (!registered) {
    return (
      <div style={{ padding: '1rem', background: 'var(--color-border)', borderRadius: '0.5rem' }}>
        <p style={{ margin: 0, fontWeight: 500 }}>아직 등록된 소유자 없음</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', background: 'var(--color-border)', borderRadius: '0.5rem' }}>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 500 }}>
        등록된 제품{registeredAt ? ` / ${registeredAt} 등록` : ''}
      </p>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted)' }}>
        소유자 정보는 공개되지 않습니다
      </p>
    </div>
  );
}
