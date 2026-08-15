import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import ScanPage from './pages/ScanPage';
import LandingPage from './pages/LandingPage';
import TagEntryPage from './pages/TagEntryPage';
import VerifyPage from './pages/VerifyPage';
import OwnerHomePage from './pages/OwnerHomePage';
import OwnershipPage from './pages/OwnershipPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import RequireOwner from './components/RequireOwner';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <ScanPage />,
      },
      {
        path: '/dev',
        element: <LandingPage />,
      },
      {
        path: '/admin',
        element: <AdminPage />,
      },
      {
        path: '/t/:tagCode',
        children: [
          {
            index: true,
            element: <TagEntryPage />,
          },
          {
            path: 'verify',
            element: <VerifyPage />,
          },
          {
            element: <RequireOwner />,
            children: [
              { path: 'home', element: <OwnerHomePage /> },
              { path: 'ownership', element: <OwnershipPage /> },
              { path: 'chat', element: <ChatPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
