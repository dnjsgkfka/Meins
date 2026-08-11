import { Outlet } from 'react-router';

export default function Layout() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        maxWidth: '480px',
        margin: '0 auto',
        paddingBottom: 'env(safe-area-inset-bottom)',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <Outlet />
    </div>
  );
}
