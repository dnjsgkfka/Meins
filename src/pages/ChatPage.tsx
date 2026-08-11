import { useOutletContext, useParams } from 'react-router';
import type { OwnerMeResponse } from '../types/api';
import BottomTabBar from '../components/BottomTabBar';

export default function ChatPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  useOutletContext<OwnerMeResponse>();

  return (
    <div className="pb-20">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <p className="m-0 text-xs text-[var(--color-muted)] tracking-widest">{tagCode}</p>
      </div>
      <div className="p-8">
        <p className="text-sm text-[var(--color-muted)]">챗 화면 — Stage 5에서 구현 예정</p>
      </div>
      <BottomTabBar tagCode={tagCode!} />
    </div>
  );
}
