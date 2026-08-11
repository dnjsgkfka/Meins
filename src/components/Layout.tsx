import { Outlet } from 'react-router';

export default function Layout() {
  return (
    <div className="min-h-[100dvh] max-w-[480px] mx-auto relative box-border pb-[env(safe-area-inset-bottom)]">
      <Outlet />
    </div>
  );
}
