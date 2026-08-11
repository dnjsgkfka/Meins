import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import TagEntryPage from './pages/TagEntryPage';
import VerifyPage from './pages/VerifyPage';
import OwnerHomePage from './pages/OwnerHomePage';
import OwnershipPage from './pages/OwnershipPage';
import ChatPage from './pages/ChatPage';
import RequireOwner from './components/RequireOwner';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
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
