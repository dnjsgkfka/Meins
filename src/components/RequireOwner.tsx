import { Outlet } from 'react-router';

// 보호 라우트 래퍼 — Stage 2에서 토큰 검사 로직 추가 예정
export default function RequireOwner() {
  return <Outlet />;
}
